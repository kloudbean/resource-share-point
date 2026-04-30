import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function demoNotesKey(agentId: string, projectId: string) {
  return `remax-precon-notes-demo-${agentId}-${projectId}`;
}

export function usePreconListingNotes(agentId: string | undefined, projectId: string | undefined, isDemo: boolean) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const agentKey = agentId ?? "preview";

  useEffect(() => {
    if (!projectId) {
      setNotes("");
      return;
    }
    if (isDemo) {
      setNotes(localStorage.getItem(demoNotesKey(agentKey, projectId)) ?? "");
      return;
    }
    if (!agentId) {
      setNotes("");
      return;
    }
    setLoading(true);
    void supabase
      .from("precon_agent_project_notes")
      .select("notes")
      .eq("agent_id", agentId)
      .eq("project_id", projectId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error) setNotes(data?.notes ?? "");
        setLoading(false);
      });
  }, [projectId, agentId, agentKey, isDemo]);

  const save = useCallback(
    async (value: string) => {
      if (!projectId) return;
      if (isDemo) {
        localStorage.setItem(demoNotesKey(agentKey, projectId), value);
        return;
      }
      if (!agentId) return;
      setSaving(true);
      const { error } = await supabase.from("precon_agent_project_notes").upsert(
        { agent_id: agentId, project_id: projectId, notes: value },
        { onConflict: "agent_id,project_id" }
      );
      setSaving(false);
      if (error) throw error;
    },
    [projectId, agentId, agentKey, isDemo]
  );

  return { notes, setNotes, save, loading, saving };
}
