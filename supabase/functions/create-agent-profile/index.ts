import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CreateProfileRequest {
  userId: string;
  recoNumber: string;
  fullName: string;
  email: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { userId, recoNumber, fullName, email }: CreateProfileRequest = await req.json();

    if (!userId || !recoNumber) {
      throw new Error("Missing required fields: userId and recoNumber");
    }

    // Check if profile already exists
    const { data: existingAgent } = await supabase
      .from("agents")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existingAgent) {
      return new Response(
        JSON.stringify({ success: true, message: "Profile already exists" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create agent profile
    const { error: insertError } = await supabase.from("agents").insert({
      user_id: userId,
      reco_number: recoNumber,
      full_name: fullName || null,
      email: email || null,
      is_active: false, // Requires admin activation
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(`Failed to create profile: ${insertError.message}`);
    }

    // Also assign the 'agent' role
    await supabase.from("user_roles").insert({
      user_id: userId,
      role: "agent",
    });

    console.log(`Profile created for user ${userId} with RECO ${recoNumber}`);

    return new Response(
      JSON.stringify({ success: true, message: "Profile created successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in create-agent-profile:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
