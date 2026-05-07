-- Listing contact phone + per-listing visibility of co-op % for agents
ALTER TABLE public.precon_projects
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS commission_public boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.precon_projects.contact_phone IS 'Project / sales office phone agents can dial (tel: link on cards).';
COMMENT ON COLUMN public.precon_projects.commission_public IS 'When false, co-op % is hidden from agents on this listing only.';
