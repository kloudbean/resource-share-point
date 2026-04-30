import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PORTAL_SHOWCASE } from "@/config/portalShowcase";

export type SocialShareSettings = {
  whatsapp: boolean;
  facebook: boolean;
  linkedin: boolean;
  x: boolean;
  email: boolean;
  copyLink: boolean;
  native: boolean;
};

export const DEFAULT_SOCIAL_SHARE_SETTINGS: SocialShareSettings = {
  whatsapp: true,
  facebook: true,
  linkedin: true,
  x: false,
  email: true,
  copyLink: true,
  native: true,
};

function mapRow(row: {
  share_whatsapp_enabled: boolean;
  share_facebook_enabled: boolean;
  share_linkedin_enabled: boolean;
  share_x_enabled: boolean;
  share_email_enabled: boolean;
  share_copy_link_enabled: boolean;
  share_native_enabled: boolean;
}): SocialShareSettings {
  return {
    whatsapp: row.share_whatsapp_enabled,
    facebook: row.share_facebook_enabled,
    linkedin: row.share_linkedin_enabled,
    x: row.share_x_enabled,
    email: row.share_email_enabled,
    copyLink: row.share_copy_link_enabled,
    native: row.share_native_enabled,
  };
}

export function usePortalSocialShareSettings() {
  const showcase = PORTAL_SHOWCASE;

  const query = useQuery({
    queryKey: ["portal_social_share_settings"],
    enabled: !showcase,
    queryFn: async () => {
      const { data, error } = await supabase.from("portal_social_share_settings").select("*").eq("id", 1).maybeSingle();
      if (error || !data) return DEFAULT_SOCIAL_SHARE_SETTINGS;
      return mapRow(data);
    },
    staleTime: 5 * 60_000,
  });

  return {
    settings: showcase ? DEFAULT_SOCIAL_SHARE_SETTINGS : (query.data ?? DEFAULT_SOCIAL_SHARE_SETTINGS),
    isLoading: !showcase && query.isLoading,
  };
}

export function useInvalidateSocialShareSettings() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["portal_social_share_settings"] });
}
