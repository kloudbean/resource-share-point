-- Extra images for listing gallery (JSON array of URL strings)
ALTER TABLE public.precon_projects
  ADD COLUMN IF NOT EXISTS gallery_urls jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.precon_projects.gallery_urls IS 'Additional image URLs for the agent listing gallery (JSON array of strings).';

-- Private notes per agent per listing (not visible to other agents)
CREATE TABLE public.precon_agent_project_notes (
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.precon_projects(id) ON DELETE CASCADE,
  notes text NOT NULL DEFAULT '',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (agent_id, project_id)
);

ALTER TABLE public.precon_agent_project_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents manage own precon listing notes"
  ON public.precon_agent_project_notes FOR ALL TO authenticated
  USING (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()))
  WITH CHECK (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));

CREATE POLICY "Admins read all precon listing notes"
  ON public.precon_agent_project_notes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_precon_agent_project_notes_updated_at
  BEFORE UPDATE ON public.precon_agent_project_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_precon_agent_notes_project ON public.precon_agent_project_notes (project_id);
