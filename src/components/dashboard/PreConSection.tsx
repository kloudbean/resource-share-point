import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Building2,
  ExternalLink,
  Image,
  FileText,
  Share2,
  MapPin,
  Bookmark,
  LayoutGrid,
  FolderOpen,
  FileSpreadsheet,
  ChevronRight,
} from "lucide-react";
import { parseISO, differenceInDays } from "date-fns";
import HSTCalculator from "@/components/dashboard/HSTCalculator";
import { toast } from "@/hooks/use-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { PORTAL_SHOWCASE } from "@/config/portalShowcase";
import { demoListings, demoAssetTiles, demoDocuments } from "@/data/demoPortalContent";

interface PreconProject {
  id: string;
  name: string;
  developer: string | null;
  location: string | null;
  description: string | null;
  price_range: string | null;
  thumbnail_url: string | null;
  status: string;
  external_url: string | null;
  created_at?: string;
}

interface PreconAsset {
  id: string;
  project_id: string | null;
  title: string;
  asset_type: string;
  file_url: string;
  file_name: string;
  category: string;
}

const BM_KEY = (agentId: string) => `remax-precon-bookmarks-${agentId}`;

const docLabels = [
  { key: "showing", title: "Showing Instructions", tint: "from-blue-600/90 to-blue-800" },
  { key: "offer", title: "Offer Data Sheet", tint: "from-slate-600/90 to-slate-800" },
  { key: "clauses", title: "Clauses", tint: "from-red-600/90 to-red-800" },
  { key: "schedule", title: "Schedule B", tint: "from-blue-700/90 to-blue-900" },
  { key: "deal", title: "Deal Sheet", tint: "from-red-700/90 to-red-900" },
];

interface PreConSectionProps {
  agentId: string | undefined;
}

export default function PreConSection({ agentId }: PreConSectionProps) {
  const [projects, setProjects] = useState<PreconProject[]>([]);
  const [assets, setAssets] = useState<PreconAsset[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [detail, setDetail] = useState<PreconProject | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: projData } = await supabase.from("precon_projects").select("*").eq("is_active", true);
      setProjects((projData as PreconProject[]) || []);
      const { data: assetData } = await supabase.from("precon_assets").select("*").eq("is_active", true);
      setAssets((assetData as PreconAsset[]) || []);
    };
    load();
  }, []);

  useEffect(() => {
    if (!agentId) return;
    try {
      const raw = localStorage.getItem(BM_KEY(agentId));
      setBookmarks(raw ? JSON.parse(raw) : []);
    } catch {
      setBookmarks([]);
    }
  }, [agentId]);

  const toggleBookmark = (id: string) => {
    if (!agentId) return;
    const next = bookmarks.includes(id) ? bookmarks.filter((x) => x !== id) : [...bookmarks, id];
    setBookmarks(next);
    localStorage.setItem(BM_KEY(agentId), JSON.stringify(next));
    toast({ title: bookmarks.includes(id) ? "Removed from bookmarks" : "Saved to bookmarks" });
  };

  const isNew = (p: PreconProject) => {
    if (!p.created_at) return false;
    return differenceInDays(new Date(), parseISO(p.created_at)) <= 7;
  };

  const statusColors: Record<string, string> = {
    selling: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
    active: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
    "coming soon": "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
    "sold out": "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  };

  const assetCategories = [...new Set(assets.map((a) => a.category))];

  return (
    <>
      <section id="listings" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-3">
          <Building2 className="h-7 w-7 text-accent" />
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Pre-construction listings</h2>
            <p className="text-sm text-muted-foreground">Projects, pricing, and client registration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PORTAL_SHOWCASE &&
            demoListings.map((l) => (
              <Card
                key={l.id}
                className="group overflow-hidden border-border/80 bg-card/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <button type="button" className="relative block w-full text-left" onClick={() => toast({ title: l.title })}>
                  <div className="relative h-44 overflow-hidden">
                    <img src={l.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    {l.isNew && (
                      <Badge className="absolute left-3 top-3 bg-destructive text-destructive-foreground">New</Badge>
                    )}
                    <Badge
                      className={
                        l.status === "Active"
                          ? "absolute right-3 top-3 border-0 bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100"
                          : "absolute right-3 top-3 border-0 bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-100"
                      }
                    >
                      {l.status}
                    </Badge>
                  </div>
                </button>
                <CardContent className="pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{l.builder}</p>
                  <h3 className="mt-1 font-semibold text-foreground">{l.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" /> {l.location}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-primary">{l.price}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Sample listing for visual review — connect CRM for live inventory.
                  </p>
                </CardContent>
              </Card>
            ))}

          {!PORTAL_SHOWCASE &&
            projects.map((project) => (
            <Card
              key={project.id}
              className="border-border hover:shadow-lg transition-all overflow-hidden group"
            >
              <button
                type="button"
                className="text-left w-full"
                onClick={() => setDetail(project)}
              >
                <div className="h-40 bg-gradient-to-br from-primary/60 to-primary/90 flex items-center justify-center relative">
                  {project.thumbnail_url ? (
                    <img src={project.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="h-14 w-14 text-primary-foreground/40" />
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className={statusColors[project.status.toLowerCase()] || "bg-muted"}>
                      {project.status}
                    </Badge>
                    {isNew(project) && (
                      <Badge className="bg-accent text-accent-foreground">New</Badge>
                    )}
                  </div>
                  {project.developer && (
                    <span className="absolute bottom-2 right-2 rounded bg-background/85 px-2 py-0.5 text-[10px] font-semibold">
                      {project.developer}
                    </span>
                  )}
                </div>
              </button>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground text-lg group-hover:text-accent transition-colors line-clamp-1">
                      {project.name}
                    </h3>
                    {project.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 shrink-0" /> {project.location}
                      </p>
                    )}
                    {project.price_range && (
                      <p className="text-sm font-semibold text-accent mt-2">{project.price_range}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant={bookmarks.includes(project.id) ? "default" : "outline"}
                    className="shrink-0"
                    onClick={() => toggleBookmark(project.id)}
                    aria-label="Bookmark"
                  >
                    <Bookmark className={`h-4 w-4 ${bookmarks.includes(project.id) ? "fill-current" : ""}`} />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{project.description}</p>
                {project.external_url && (
                  <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                    <a href={project.external_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-2" /> View details
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
          {!PORTAL_SHOWCASE && projects.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No pre-construction projects listed yet</p>
            </div>
          )}
        </div>
      </section>

      <section id="assets" className="scroll-mt-24 space-y-10 pt-16 border-t border-border">
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-7 w-7 text-accent" />
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Pre-con assets</h2>
            <p className="text-sm text-muted-foreground">Tools, documents, and marketing</p>
          </div>
        </div>

        {PORTAL_SHOWCASE ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {demoAssetTiles.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    if (t.href) {
                      document.querySelector(t.href)?.scrollIntoView({ behavior: "smooth" });
                    } else if (t.action === "hst") {
                      document.getElementById("hst-calculator-anchor")?.scrollIntoView({ behavior: "smooth" });
                    } else {
                      toast({ title: t.title, description: "Link your asset library in admin." });
                    }
                  }}
                  className="group rounded-2xl border border-border/80 bg-card/90 p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
                >
                  <span className="text-3xl">{t.icon}</span>
                  <p className="mt-3 font-display text-base font-bold text-foreground">{t.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.sub}</p>
                  <ChevronRight className="mt-4 h-4 w-4 text-muted-foreground transition group-hover:translate-x-1" />
                </button>
              ))}
            </div>
            <div id="hst-calculator-anchor" className="mt-8 max-w-lg scroll-mt-28">
              <HSTCalculator />
            </div>
            <div className="mt-10">
              <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Pre-con documents</h3>
              <ScrollArea className="w-full pb-2">
                <div className="flex gap-3 pb-1">
                  {demoDocuments.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toast({ title: d.name, description: "PDF preview can open in a modal or Drive." })}
                      className="flex min-w-[150px] shrink-0 flex-col items-center rounded-xl border border-border/80 bg-card/90 p-4 text-center shadow-sm transition hover:border-primary/30"
                    >
                      <span className="text-3xl">{d.icon}</span>
                      <span className="mt-2 text-xs font-semibold text-foreground">{d.name}</span>
                      <span className="mt-2 text-[10px] font-semibold text-primary">Download PDF</span>
                    </button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <a
                href="#listings"
                className="group flex min-h-[140px] flex-col justify-between rounded-xl border-2 border-border bg-gradient-to-br from-sky-500/15 to-sky-600/5 p-6 transition-all hover:shadow-md"
              >
                <Building2 className="h-8 w-8 text-sky-600" />
                <div>
                  <p className="font-display text-lg font-semibold">Pre-con projects</p>
                  <p className="mt-1 text-xs text-muted-foreground">Jump to listings above</p>
                </div>
                <ChevronRight className="h-5 w-5 self-end text-muted-foreground transition-transform group-hover:translate-x-1" />
              </a>

              <div className="min-h-[140px] rounded-xl border-2 border-border bg-gradient-to-br from-primary/15 to-primary/5 p-2">
                <HSTCalculator />
              </div>

              <div className="flex min-h-[140px] flex-col justify-center rounded-xl border-2 border-border bg-gradient-to-br from-destructive/15 to-destructive/5 p-6">
                <FolderOpen className="mb-2 h-8 w-8 text-destructive" />
                <p className="font-display text-lg font-semibold">Pre-con documents</p>
                <p className="mt-1 text-xs text-muted-foreground">Download templates below</p>
              </div>

              <button
                type="button"
                className="group flex min-h-[140px] flex-col justify-between rounded-xl border-2 border-border bg-gradient-to-br from-red-900/20 to-red-950/10 p-6 text-left transition-all hover:shadow-md"
                onClick={() => toast({ title: "Worksheet", description: "Link your branded Excel/PDF in admin storage." })}
              >
                <FileSpreadsheet className="h-8 w-8 text-red-700 dark:text-red-400" />
                <div>
                  <p className="font-display text-lg font-semibold">Pre-con worksheet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Download branded worksheet</p>
                </div>
                <ChevronRight className="h-5 w-5 self-end text-muted-foreground" />
              </button>
            </div>

            <div>
              <h3 className="mb-3 font-display text-lg font-semibold text-foreground">Pre-con document library</h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {docLabels.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() =>
                      toast({ title: d.title, description: "Preview/download can link to Drive or Supabase storage." })
                    }
                    className={`flex min-h-[120px] flex-col justify-between rounded-lg bg-gradient-to-br ${d.tint} p-4 text-left text-primary-foreground shadow-md transition-opacity hover:opacity-95`}
                  >
                    <FileText className="h-6 w-6 opacity-90" />
                    <span className="text-xs font-semibold leading-tight">{d.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {!PORTAL_SHOWCASE && assetCategories.length > 0 && (
          <div>
            <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
              <Share2 className="h-5 w-5 text-accent" />
              Social &amp; floor assets
            </h3>
            <Tabs defaultValue={assetCategories[0]} className="w-full">
              <TabsList className="mb-4 flex flex-wrap h-auto gap-1">
                {assetCategories.map((cat) => (
                  <TabsTrigger key={cat} value={cat}>
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
              {assetCategories.map((cat) => (
                <TabsContent key={cat} value={cat}>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {assets
                      .filter((a) => a.category === cat)
                      .map((asset) => {
                        const Icon = asset.asset_type === "social_media" ? Share2 : Image;
                        return (
                          <Card key={asset.id} className="border-border hover:shadow-md transition-all">
                            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                                <Icon className="h-6 w-6 text-accent" />
                              </div>
                              <p className="text-sm font-medium text-foreground line-clamp-2">{asset.title}</p>
                              <Button variant="outline" size="sm" className="w-full" asChild>
                                <a href={asset.file_url} target="_blank" rel="noopener noreferrer">
                                  Download
                                </a>
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}

        {!PORTAL_SHOWCASE && assetCategories.length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            <Image className="mx-auto mb-2 h-8 w-8 opacity-30" />
            No additional marketing assets yet — admins can upload per project.
          </div>
        )}
      </section>

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display">{detail.name}</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-4 text-sm">
                {detail.thumbnail_url && (
                  <Carousel className="w-full">
                    <CarouselContent>
                      <CarouselItem>
                        <img src={detail.thumbnail_url} alt="" className="rounded-lg w-full object-cover max-h-48" />
                      </CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </Carousel>
                )}
                <p className="text-muted-foreground">{detail.description}</p>
                <ul className="space-y-1 text-xs">
                  <li>
                    <strong>Location:</strong> {detail.location || "—"}
                  </li>
                  <li>
                    <strong>Price range:</strong> {detail.price_range || "—"}
                  </li>
                  <li>
                    <strong>Status:</strong> {detail.status}
                  </li>
                </ul>
                <Button
                  className="w-full"
                  onClick={() => toast({ title: "Interest registered", description: "CRM integration can be added here." })}
                >
                  Register client interest
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
