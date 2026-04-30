import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useInvalidateSocialShareSettings } from "@/hooks/usePortalSocialShareSettings";
import { ArrowLeft, Loader2, Save, Share2 } from "lucide-react";
import remaxLogo from "@/assets/remax-excellence-logo.png";

type Form = {
  share_whatsapp_enabled: boolean;
  share_facebook_enabled: boolean;
  share_linkedin_enabled: boolean;
  share_x_enabled: boolean;
  share_email_enabled: boolean;
  share_copy_link_enabled: boolean;
  share_native_enabled: boolean;
};

const labels: { key: keyof Form; title: string; description: string }[] = [
  { key: "share_whatsapp_enabled", title: "WhatsApp", description: "Green icon; opens chat with prefilled text and link." },
  { key: "share_facebook_enabled", title: "Facebook", description: "Web share dialog with page URL." },
  { key: "share_linkedin_enabled", title: "LinkedIn", description: "Share-offsite with listing or page URL." },
  { key: "share_x_enabled", title: "X (Twitter)", description: "Compose tweet with text and link." },
  { key: "share_email_enabled", title: "Email", description: "Opens default mail app with subject and body." },
  { key: "share_copy_link_enabled", title: "Copy", description: "Copies combined message + link to clipboard." },
  { key: "share_native_enabled", title: "System share", description: "Mobile / desktop share sheet when available." },
];

export default function AdminSocialShare() {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const invalidate = useInvalidateSocialShareSettings();
  const [form, setForm] = useState<Form | null>(null);
  const [loadingRow, setLoadingRow] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) navigate("/auth");
      else if (!isAdmin) {
        navigate("/dashboard");
        toast({ variant: "destructive", title: "Access denied" });
      }
    }
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      setLoadingRow(true);
      const { data, error } = await supabase.from("portal_social_share_settings").select("*").eq("id", 1).maybeSingle();
      if (error) {
        toast({ variant: "destructive", title: "Could not load settings", description: error.message });
        setForm(null);
      } else if (data) {
        setForm({
          share_whatsapp_enabled: data.share_whatsapp_enabled,
          share_facebook_enabled: data.share_facebook_enabled,
          share_linkedin_enabled: data.share_linkedin_enabled,
          share_x_enabled: data.share_x_enabled,
          share_email_enabled: data.share_email_enabled,
          share_copy_link_enabled: data.share_copy_link_enabled,
          share_native_enabled: data.share_native_enabled,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Missing row",
          description: "Run the latest database migration (portal_social_share_settings).",
        });
        setForm(null);
      }
      setLoadingRow(false);
    })();
  }, [isAdmin]);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("portal_social_share_settings").update(form).eq("id", 1);
      if (error) throw error;
      invalidate();
      toast({ title: "Saved", description: "Share icons update for all agents on next page load." });
    } catch (e: unknown) {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || (!isAdmin && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} className="text-primary-foreground hover:bg-primary-foreground/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={remaxLogo} alt="" className="h-9 w-auto brightness-0 invert object-contain" />
          </div>
          <h1 className="font-display text-lg font-semibold">Social share icons</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Share2 className="h-5 w-5 text-primary" />
              Which icons appear
            </CardTitle>
            <CardDescription>
              Controls the circular share buttons on pre-con listings, approved vendors, and training certificates. Agents see only what you enable here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingRow || !form ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="space-y-5">
                  {labels.map(({ key, title, description }) => (
                    <div key={key} className="flex items-start justify-between gap-4 rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
                      <div>
                        <Label htmlFor={key} className="text-base font-medium">
                          {title}
                        </Label>
                        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                      </div>
                      <Switch
                        id={key}
                        checked={form[key]}
                        onCheckedChange={(v) => setForm((f) => (f ? { ...f, [key]: v } : f))}
                        className="shrink-0"
                      />
                    </div>
                  ))}
                </div>
                <Button className="w-full sm:w-auto" onClick={() => void save()} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save changes
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
