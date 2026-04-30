import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AgentReminderRow {
  id: string;
  title: string;
  body: string | null;
  remind_at: string;
  entity_type: string;
  dismissed: boolean;
}

export function useAgentReminders(agentId: string | undefined) {
  const [reminders, setReminders] = useState<AgentReminderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!agentId) {
      setReminders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("agent_reminders")
      .select("id, title, body, remind_at, entity_type, dismissed")
      .eq("agent_id", agentId)
      .eq("dismissed", false)
      .order("remind_at", { ascending: false });
    if (!error) setReminders((data as AgentReminderRow[]) || []);
    setLoading(false);
  }, [agentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const dismiss = async (id: string) => {
    const { error } = await supabase.from("agent_reminders").update({ dismissed: true }).eq("id", id);
    if (!error) setReminders((r) => r.filter((x) => x.id !== id));
    return !error;
  };

  return { reminders, loading, refresh, dismiss };
}
