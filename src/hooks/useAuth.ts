import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface Agent {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  reco_number: string;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  agent: Agent | null;
  roles: AppRole[];
  isAdmin: boolean;
  isActive: boolean;
  loading: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    agent: null,
    roles: [],
    isAdmin: false,
    isActive: false,
    loading: true,
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));

        // Defer Supabase calls with setTimeout to prevent deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setState(prev => ({
            ...prev,
            agent: null,
            roles: [],
            isAdmin: false,
            isActive: false,
            loading: false,
          }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
      }));

      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch agent profile
      const { data: agentData } = await supabase
        .from("agents")
        .select("*")
        .eq("user_id", userId)
        .single();

      // Fetch user roles
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      const roles = rolesData?.map(r => r.role) ?? [];
      const isAdmin = roles.includes("admin");

      setState(prev => ({
        ...prev,
        agent: agentData,
        roles,
        isAdmin,
        isActive: agentData?.is_active ?? false,
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching user data:", error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshUserData = async () => {
    if (state.user) {
      await fetchUserData(state.user.id);
    }
  };

  return {
    ...state,
    signOut,
    refreshUserData,
  };
};
