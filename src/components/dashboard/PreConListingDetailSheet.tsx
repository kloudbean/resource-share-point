import { useEffect, useMemo, useState } from "react";
import { subDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PreConCoopHeaderChip } from "@/components/dashboard/PreConCoopDisplay";
import { Textarea } from "@/components/ui/textarea";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { usePreconListingNotes } from "@/hooks/usePreconListingNotes";
import { buildListingShareUrl, buildListingSharePayloadForPrecon } from "@/lib/shareLandingPayload";
import SocialShareIconRow from "@/components/share/SocialShareIconRow";
import {
  BarChart3,
  Bookmark,
  Building2,
  ExternalLink,
  FileText,
  ImageIcon,
  Layers,
  MapPin,
  Printer,
  StickyNote,
} from "lucide-react";

export interface PreconListingProject {
  id: string;
  name: string;
  developer: string | null;
  location: string | null;
  description: string | null;
  price_range: string | null;
  thumbnail_url: string | null;
  gallery_urls?: unknown;
  status: string;
  external_url: string | null;
  property_type: string;
  commission_rate_percent: number | null;
  precon_cities?: { id: string; name: string } | null;
  created_at?: string;
}

export interface PreconListingAsset {
  id: string;
  project_id: string | null;
  title: string;
  asset_type: string;
  file_url: string;
  file_name: string;
  category: string;
}

function normalizeGalleryUrls(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((u): u is string => typeof u === "string" && u.trim().length > 0);
}

function propertyTypeLabel(t: string): string {
  if (t === "condo") return "Condo";
  if (t === "home") return "Home";
  if (t === "townhome") return "Townhome";
  return "Mixed";
}

function isFloorAsset(a: PreconListingAsset): boolean {
  const c = (a.category || "").toLowerCase();
  const title = (a.title || "").toLowerCase();
  return c.includes("floor") || title.includes("floor plan") || a.asset_type === "floor_plan";
}

function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url) || url.includes("images.unsplash.com");
}

function isGalleryAsset(a: PreconListingAsset): boolean {
  if (isFloorAsset(a)) return false;
  const c = (a.category || "").toLowerCase();
  if (c.includes("floor")) return false;
  if (c.includes("gallery") || c.includes("photo") || c.includes("rendering") || c.includes("image")) return true;
  return isImageUrl(a.file_url);
}

type PreConListingDetailSheetProps = {
  project: PreconListingProject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string | undefined;
  isDemo: boolean;
  hideCommissionRates: boolean;
  projectAssets: PreconListingAsset[];
  bookmarked: boolean;
  onToggleBookmark: () => void;
};

const VIEW_KEY = (id: string) => `precon:${id}`;

export default function PreConListingDetailSheet({
  project,
  open,
  onOpenChange,
  agentId,
  isDemo,
  hideCommissionRates,
  projectAssets,
  bookmarked,
  onToggleBookmark,
}: PreConListingDetailSheetProps) {
  const { notes, setNotes, save, loading: notesLoading, saving: notesSaving } = usePreconListingNotes(
    agentId,
    project?.id,
    isDemo
  );
  const [views30d, setViews30d] = useState<number | null>(null);

  const galleryImages = useMemo(() => {
    if (!project) return [];
    const fromProject = normalizeGalleryUrls(project.gallery_urls);
    const thumb = project.thumbnail_url?.trim();
    const fromAssets = projectAssets.filter(isGalleryAsset).map((a) => a.file_url);
    const merged = [...(thumb ? [thumb] : []), ...fromProject, ...fromAssets];
    return [...new Set(merged)];
  }, [project, projectAssets]);

  const floorAssets = useMemo(() => projectAssets.filter(isFloorAsset), [projectAssets]);
  const docAssets = useMemo(
    () => projectAssets.filter((a) => !isGalleryAsset(a) && !isFloorAsset(a)),
    [projectAssets]
  );

  useEffect(() => {
    if (!open || !project || !agentId || isDemo) {
      setViews30d(null);
      return;
    }
    const key = VIEW_KEY(project.id);
    const since = subDays(new Date(), 30).toISOString();
    void supabase
      .from("content_views")
      .insert({ agent_id: agentId, resource_key: key })
      .then(({ error }) => {
        if (error && !error.message?.includes("duplicate") && !error.message?.includes("unique"))
          console.warn("content_views insert", error);
      });
    void supabase
      .from("content_views")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", agentId)
      .eq("resource_key", key)
      .gte("viewed_at", since)
      .then(({ count }) => setViews30d(count ?? 0));
  }, [open, project?.id, agentId, isDemo]);

  const handlePrint = () => {
    if (!project) return;
    const w = window.open("", "_blank");
    if (!w) {
      toast({ variant: "destructive", title: "Pop-up blocked", description: "Allow pop-ups to print this listing." });
      return;
    }
    const coop =
      !hideCommissionRates && project.commission_rate_percent != null && !Number.isNaN(Number(project.commission_rate_percent))
        ? `<p><strong>Co-op:</strong> ${project.commission_rate_percent}%</p>`
        : "";
    w.document.write(`<!DOCTYPE html><html><head><title>${project.name}</title>
      <style>
        body{font-family:system-ui,sans-serif;padding:24px;max-width:720px;margin:0 auto;color:#111}
        h1{font-size:1.35rem;margin:0 0 8px}
        .muted{color:#555;font-size:14px}
        img{max-width:100%;border-radius:8px;margin:12px 0}
        @media print{body{padding:12px}}
      </style></head><body>
      <h1>${project.name}</h1>
      <p class="muted">${project.developer || ""}${project.developer && project.location ? " · " : ""}${project.location || ""}</p>
      ${project.thumbnail_url ? `<img src="${project.thumbnail_url}" alt="" />` : ""}
      <p><strong>Status:</strong> ${project.status}</p>
      <p><strong>Price:</strong> ${project.price_range || "—"}</p>
      ${coop}
      <p><strong>Description</strong></p>
      <p>${(project.description || "—").replace(/\n/g, "<br/>")}</p>
      <p class="muted" style="margin-top:32px;font-size:12px">Printed from REMAX Excellence agent portal — for internal use.</p>
      </body></html>`);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  const saveNotes = async () => {
    try {
      await save(notes);
      toast({ title: "Notes saved", description: isDemo ? "Stored on this device (demo)." : "Synced to your account." });
    } catch {
      toast({ variant: "destructive", title: "Could not save notes" });
    }
  };

  if (!project) return null;

  const shareUrl = buildListingShareUrl(
    buildListingSharePayloadForPrecon(project, projectAssets, hideCommissionRates)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[100dvh] max-h-[100dvh] w-full max-w-none flex-col gap-0 overflow-hidden rounded-none border-0 p-0 shadow-none !left-0 !top-0 !translate-x-0 !translate-y-0 data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100 data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-top-0 sm:max-w-none sm:rounded-none"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogDescription className="sr-only">Listing details: {project.name}</DialogDescription>
        <DialogHeader className="space-y-0 border-b border-border px-4 py-4 text-left sm:px-6">
          <div className="flex items-start justify-between gap-3 pr-10 sm:pr-12">
            <div className="min-w-0">
              {project.developer && (
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{project.developer}</p>
              )}
              <DialogTitle className="font-display text-xl leading-tight md:text-2xl">{project.name}</DialogTitle>
              {project.location && (
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {project.location}
                  {project.precon_cities?.name && (
                    <span className="text-xs"> · {project.precon_cities.name}</span>
                  )}
                </p>
              )}
            </div>
            <Button type="button" size="icon" variant={bookmarked ? "default" : "outline"} onClick={onToggleBookmark} aria-label="Bookmark">
              <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{project.status}</Badge>
            {!hideCommissionRates &&
              project.commission_rate_percent != null &&
              !Number.isNaN(Number(project.commission_rate_percent)) && (
                <PreConCoopHeaderChip percent={Number(project.commission_rate_percent)} />
              )}
            <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
            {project.external_url && (
              <Button variant="outline" size="sm" className="h-8 gap-1" asChild>
                <a href={project.external_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Site
                </a>
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <TabsList className="mx-4 mt-3 h-auto w-auto shrink-0 flex-wrap justify-start gap-1 bg-muted/40 p-1">
            <TabsTrigger value="overview" className="gap-1 text-xs sm:text-sm">
              <Building2 className="h-3.5 w-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="media" className="gap-1 text-xs sm:text-sm">
              <ImageIcon className="h-3.5 w-3.5" />
              Gallery &amp; plans
            </TabsTrigger>
            <TabsTrigger value="files" className="gap-1 text-xs sm:text-sm">
              <FileText className="h-3.5 w-3.5" />
              Files
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-1 text-xs sm:text-sm">
              <StickyNote className="h-3.5 w-3.5" />
              My notes
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-1 text-xs sm:text-sm">
              <BarChart3 className="h-3.5 w-3.5" />
              Activity
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="min-h-0 flex-1 px-4 pb-10 pt-3 sm:px-6">
            <TabsContent value="overview" className="mt-0 space-y-4 pb-4">
              {galleryImages.length > 0 && (
                <Carousel className="w-full">
                  <CarouselContent>
                    {galleryImages.map((src, i) => (
                      <CarouselItem key={`${src}-${i}`}>
                        <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/30">
                          <img src={src} alt="" className="max-h-64 w-full object-cover md:max-h-80" />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {galleryImages.length > 1 && (
                    <>
                      <CarouselPrevious className="left-2" />
                      <CarouselNext className="right-2" />
                    </>
                  )}
                </Carousel>
              )}
              {project.price_range && <p className="font-display text-xl font-semibold text-foreground">{project.price_range}</p>}
              <p className="text-sm leading-relaxed text-muted-foreground">{project.description || "No description provided."}</p>
              <ul className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-4 text-sm">
                <li>
                  <span className="font-medium text-foreground">Property type:</span> {propertyTypeLabel(project.property_type)}
                </li>
                <li>
                  <span className="font-medium text-foreground">Sales status:</span> {project.status}
                </li>
                {project.created_at && (
                  <li>
                    <span className="font-medium text-foreground">Listed:</span>{" "}
                    {new Date(project.created_at).toLocaleDateString()}
                  </li>
                )}
              </ul>
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Share</p>
                <SocialShareIconRow className="justify-start" preface={`Pre-con project: ${project.name}`} linkUrl={shareUrl} />
              </div>
              <Button className="w-full" onClick={() => toast({ title: "Interest registered", description: "CRM hook can be added here." })}>
                Register client interest
              </Button>
            </TabsContent>

            <TabsContent value="media" className="mt-0 space-y-6 pb-4">
              <div>
                <h3 className="mb-2 flex items-center gap-2 font-display text-sm font-semibold">
                  <ImageIcon className="h-4 w-4" />
                  Photo gallery
                </h3>
                {galleryImages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No gallery images yet. Admins can add URLs in the project or upload assets tagged as gallery.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {galleryImages.map((src, i) => (
                      <a
                        key={`${src}-${i}`}
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="overflow-hidden rounded-lg border border-border/60"
                      >
                        <img src={src} alt="" className="aspect-[4/3] w-full object-cover transition hover:opacity-95" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h3 className="mb-2 flex items-center gap-2 font-display text-sm font-semibold">
                  <Layers className="h-4 w-4" />
                  Floor plans
                </h3>
                {floorAssets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No floor plans linked. In Admin → Pre-con, attach assets to this project with category &quot;Floor plans&quot; (or include
                    &quot;floor&quot; in the title).
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {floorAssets.map((a) => (
                      <li key={a.id}>
                        <a
                          href={a.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm font-medium text-primary hover:underline"
                        >
                          <FileText className="h-4 w-4 shrink-0" />
                          {a.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </TabsContent>

            <TabsContent value="files" className="mt-0 space-y-3 pb-4">
              {docAssets.length === 0 ? (
                <p className="text-sm text-muted-foreground">No additional documents for this project. Attach PDFs and files in admin (per-project assets).</p>
              ) : (
                <ul className="space-y-2">
                  {docAssets.map((a) => (
                    <li key={a.id}>
                      <a
                        href={a.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col gap-0.5 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm hover:bg-muted/40"
                      >
                        <span className="font-medium text-foreground">{a.title}</span>
                        <span className="text-xs text-muted-foreground">{a.category}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="notes" className="mt-0 space-y-3 pb-4">
              <p className="text-sm text-muted-foreground">
                Private to you{isDemo ? " on this browser (demo)" : ""}. Other agents cannot see these notes.
              </p>
              <Textarea
                placeholder="Buyer fit, deposit structure, follow-ups, builder rep contact…"
                value={notes}
                disabled={notesLoading}
                onChange={(e) => setNotes(e.target.value)}
                rows={10}
                className="min-h-[200px] resize-y"
              />
              <Button onClick={() => void saveNotes()} disabled={notesLoading || notesSaving}>
                {notesSaving ? "Saving…" : "Save notes"}
              </Button>
            </TabsContent>

            <TabsContent value="activity" className="mt-0 space-y-4 pb-4">
              {isDemo ? (
                <p className="text-sm text-muted-foreground">
                  Demo mode: view tracking and cloud notes are simulated locally. Sign in with a live project to record opens in Analytics.
                </p>
              ) : (
                <>
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                    <p className="font-medium text-foreground">Your listing opens</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">{views30d ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">Times you opened this project in the last 30 days (includes this visit).</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Admins can aggregate portal activity under <strong>Admin → Analytics</strong>. Each open logs a content view with key{" "}
                    <code className="rounded bg-muted px-1 text-xs">{VIEW_KEY(project.id)}</code>.
                  </p>
                </>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
