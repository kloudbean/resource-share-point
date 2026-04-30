-- Cities for pre-con filters (admin-managed; agents see active cities used in listings)
CREATE TABLE public.precon_cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (name)
);
ALTER TABLE public.precon_cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage precon cities" ON public.precon_cities
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated view active precon cities" ON public.precon_cities
  FOR SELECT TO authenticated USING (is_active = true);

-- Pre-con project extensions
ALTER TABLE public.precon_projects
  ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES public.precon_cities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS property_type text NOT NULL DEFAULT 'condo',
  ADD COLUMN IF NOT EXISTS commission_rate_percent numeric(5,2);
ALTER TABLE public.precon_projects DROP CONSTRAINT IF EXISTS precon_projects_property_type_check;
ALTER TABLE public.precon_projects ADD CONSTRAINT precon_projects_property_type_check
  CHECK (property_type IN ('condo', 'home', 'townhome', 'all'));

COMMENT ON COLUMN public.precon_projects.commission_rate_percent IS 'Optional co-op % shown to agents unless they hide commission in portal settings.';

-- Agent UI preference: hide commission when showing portal to clients
CREATE TABLE public.agent_portal_settings (
  agent_id uuid PRIMARY KEY REFERENCES public.agents(id) ON DELETE CASCADE,
  hide_commission_rates boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.agent_portal_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents manage own portal settings" ON public.agent_portal_settings
  FOR ALL TO authenticated
  USING (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()))
  WITH CHECK (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));
CREATE POLICY "Admins view all portal settings" ON public.agent_portal_settings
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_agent_portal_settings_updated_at
  BEFORE UPDATE ON public.agent_portal_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Admin assigns courses to agents (optional due date / note)
CREATE TABLE public.course_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  assigned_by uuid NOT NULL,
  note text,
  due_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (course_id, agent_id)
);
ALTER TABLE public.course_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage course assignments" ON public.course_assignments
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Agents view own assignments" ON public.course_assignments
  FOR SELECT TO authenticated USING (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));

-- Reminders (admin creates for agents; agents dismiss)
CREATE TABLE public.agent_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  remind_at timestamp with time zone NOT NULL DEFAULT now(),
  entity_type text NOT NULL DEFAULT 'general',
  entity_id uuid,
  created_by uuid NOT NULL,
  dismissed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.agent_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage agent reminders" ON public.agent_reminders
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Agents view own reminders" ON public.agent_reminders
  FOR SELECT TO authenticated USING (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));
CREATE POLICY "Agents dismiss own reminders" ON public.agent_reminders
  FOR UPDATE TO authenticated
  USING (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()))
  WITH CHECK (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));

CREATE INDEX idx_agent_reminders_agent_dismissed ON public.agent_reminders (agent_id, dismissed, remind_at DESC);
CREATE INDEX idx_precon_projects_city_status ON public.precon_projects (city_id, status) WHERE is_active = true;
