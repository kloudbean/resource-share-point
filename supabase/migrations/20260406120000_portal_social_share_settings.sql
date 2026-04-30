-- Brokerage-wide toggles for which share destinations appear (icons) on listings, vendors, certificates.
CREATE TABLE public.portal_social_share_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  share_whatsapp_enabled boolean NOT NULL DEFAULT true,
  share_facebook_enabled boolean NOT NULL DEFAULT true,
  share_linkedin_enabled boolean NOT NULL DEFAULT true,
  share_x_enabled boolean NOT NULL DEFAULT false,
  share_email_enabled boolean NOT NULL DEFAULT true,
  share_copy_link_enabled boolean NOT NULL DEFAULT true,
  share_native_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

INSERT INTO public.portal_social_share_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.portal_social_share_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portal_social_share_settings_select"
  ON public.portal_social_share_settings FOR SELECT
  USING (true);

CREATE POLICY "portal_social_share_settings_admin_update"
  ON public.portal_social_share_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_portal_social_share_settings_updated_at
  BEFORE UPDATE ON public.portal_social_share_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT ON public.portal_social_share_settings TO anon, authenticated;
GRANT UPDATE ON public.portal_social_share_settings TO authenticated;
