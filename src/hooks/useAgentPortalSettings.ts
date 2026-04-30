import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAgentPortalSettings(agentId: string | undefined) {
  const [hideCommissionRates, setHideCommissionRates] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!agentId) {
      setHideCommissionRates(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("agent_portal_settings")
      .select("hide_commission_rates")
      .eq("agent_id", agentId)
      .maybeSingle();
    setHideCommissionRates(data?.hide_commission_rates ?? false);
    setLoading(false);
  }, [agentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setHideCommission = useCallback(
    async (hide: boolean) => {
      if (!agentId) return;
      setHideCommissionRates(hide);
      const { error } = await supabase.from("agent_portal_settings").upsert(
        { agent_id: agentId, hide_commission_rates: hide, updated_at: new Date().toISOString() },
        { onConflict: "agent_id" }
      );
      if (error) {
        setHideCommissionRates(!hide);
        throw error;
      }
    },
    [agentId]
  );

  return { hideCommissionRates, setHideCommission, loading, refresh };
}
