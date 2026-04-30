import { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Building2, ExternalLink, MapPin, AlertCircle, FileText, Images, Layers, Share2 } from "lucide-react";
import { decodeShareHash, type ListingPublicDocument, type ListingSharePayload } from "@/lib/shareLandingPayload";
import ShareLandingLayout from "@/components/share/ShareLandingLayout";
import SocialShareIconRow from "@/components/share/SocialShareIconRow";
import { PreConCoopInline } from "@/components/dashboard/PreConCoopDisplay";

function statusBadgeClass(status: string) {
  const s = status.toLowerCase();
  if (s.includes("coming")) return "bg-amber-100/95 text-amber-950 dark:bg-amber-950/55 dark:text-amber-50";
  if (s.includes("sold")) return "bg-slate-200/95 text-slate-900 dark:bg-slate-800 dark:text-slate-100";
  return "bg-emerald-100/95 text-emerald-950 dark:bg-emerald-950/50 dark:text-emerald-50";
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  const sel = attr === "property" ? `meta[property="${key}"]` : `meta[name="${key}"]`;
  let el = document.querySelector(sel) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function applyListingMeta(data: ListingSharePayload) {
  const base =
    import.meta.env.VITE_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const title = `${data.name} | REMAX Excellence`;
  const desc =
    (data.description && data.description.slice(0, 158).trim()) ||
    [data.price_range, data.location].filter(Boolean).join(" · ") ||
    "Pre-construction listing shared by your REMAX Excellence agent.";
  const image =
    data.thumbnail_url && /^https?:\/\//i.test(data.thumbnail_url) ? data.thumbnail_url : `${base}/favicon.png`;
  const url = typeof window !== "undefined" ? window.location.href : `${base}/share/listing`;

  document.title = title;
  upsertMeta("name", "description", desc);
  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", desc);
  upsertMeta("property", "og:type", "article");
  upsertMeta("property", "og:image", image);
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:site_name", "REMAX Excellence Canada");
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", title);
  upsertMeta("name", "twitter:description", desc);
  upsertMeta("name", "twitter:image", image);
}

export default function ShareListingLanding() {
  const [hash, setHash] = useState(() => (typeof window !== "undefined" ? window.location.hash : ""));

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const data = useMemo(() => decodeShareHash(hash) as ListingSharePayload | null, [hash]);
  const valid = data?.k === "listing";

  useEffect(() => {
    if (valid && data) applyListingMeta(data);
  }, [valid, data]);

  const gallery = useMemo(() => {
    if (!data || !valid) return [];
    const raw = [...(data.gallery_urls || [])].filter((u) => /^https?:\/\//i.test(u));
    const t = data.thumbnail_url?.trim();
    const ordered: string[] = [];
    if (t && /^https?:\/\//i.test(t)) ordered.push(t);
    for (const u of raw) {
      if (!ordered.includes(u)) ordered.push(u);
    }
    return ordered;
  }, [data, valid]);

  const { floorPlans, otherFiles } = useMemo(() => {
    const empty: ListingPublicDocument[] = [];
    if (!valid || !data) return { floorPlans: empty, otherFiles: empty };
    const docs = data.public_documents || [];
    if (!docs.length) return { floorPlans: empty, otherFiles: empty };
    const floor = docs.filter(
      (d) => /\.pdf(\?|$)/i.test(d.url) || d.title.toLowerCase().includes("floor") || d.title.toLowerCase().includes("plan")
    );
    const floorSet = new Set(floor);
    const other = docs.filter((d) => !floorSet.has(d));
    return { floorPlans: floor, otherFiles: other };
  }, [valid, data]);

  const shareHref = typeof window !== "undefined" ? window.location.href : "";

  return (
    <ShareLandingLayout mainClassName="max-w-4xl">
      {!valid || !data ? (
        <div className="rounded-3xl border border-border/70 bg-card/90 p-8 text-center shadow-[0_20px_40px_-16px_rgba(15,23,42,0.15)] dark:shadow-none">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
            <AlertCircle className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="mt-5 font-display text-xl font-semibold tracking-tight">This listing link didn&apos;t open</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The link may be truncated. Ask your agent to send the project again.
          </p>
        </div>
      ) : (
        <article className="overflow-hidden rounded-3xl border border-border/50 bg-card shadow-[0_32px_64px_-28px_rgba(15,23,42,0.25)] dark:border-border dark:shadow-2xl">
          {/* Hero */}
          <div className="relative bg-[hsl(220_45%_12%)]">
            {gallery.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {gallery.map((src, i) => (
                    <CarouselItem key={`${src}-${i}`} className="pl-0">
                      <div className="relative aspect-[16/10] max-h-[min(52vh,520px)] w-full md:aspect-[21/9]">
                        <img src={src} alt="" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220_45%_8%)]/95 via-transparent to-transparent" aria-hidden />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {gallery.length > 1 && (
                  <>
                    <CarouselPrevious className="left-3 border-white/20 bg-black/30 text-white hover:bg-black/50" />
                    <CarouselNext className="right-3 border-white/20 bg-black/30 text-white hover:bg-black/50" />
                  </>
                )}
              </Carousel>
            ) : (
              <div className="flex aspect-[16/10] max-h-72 items-center justify-center bg-gradient-to-br from-primary/25 to-primary/5">
                <Building2 className="h-24 w-24 text-primary/30" strokeWidth={1} />
              </div>
            )}
            <div className="absolute left-0 right-0 top-0 flex flex-wrap items-start justify-between gap-2 p-4 md:p-6">
              {data.status && (
                <Badge className={`border-0 px-3 py-1 text-xs font-semibold shadow-md ${statusBadgeClass(data.status)}`}>
                  {data.status}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid gap-8 p-6 md:grid-cols-3 md:gap-10 md:p-10">
            <div className="space-y-8 md:col-span-2">
              <div>
                <div className="h-1 w-14 rounded-full bg-[hsl(4_80%_56%)]" aria-hidden />
                {data.developer && (
                  <p className="mt-4 font-display text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{data.developer}</p>
                )}
                <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">{data.name}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
                  {data.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 shrink-0 opacity-80" />
                      {data.location}
                    </span>
                  )}
                  {(data.city_label || data.property_label) && (
                    <span className="rounded-full bg-muted/80 px-3 py-1 text-xs font-medium text-foreground/90">
                      {[data.city_label, data.property_label].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </div>
              </div>

              {data.price_range && (
                <p className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-[2rem]">{data.price_range}</p>
              )}

              {data.commission_percent != null && !Number.isNaN(Number(data.commission_percent)) && (
                <PreConCoopInline percent={Number(data.commission_percent)} className="mt-3" />
              )}

              {data.description && (
                <div className="rounded-2xl border border-border/60 bg-muted/15 p-5 md:p-6">
                  <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-primary">About this project</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{data.description}</p>
                </div>
              )}

              {gallery.length > 1 && (
                <section>
                  <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                    <Images className="h-5 w-5 text-primary" />
                    Gallery
                  </h2>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {gallery.map((src, i) => (
                      <a
                        key={`g-${i}`}
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group overflow-hidden rounded-xl border border-border/50 bg-muted/20"
                      >
                        <img src={src} alt="" className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {floorPlans.length > 0 && (
                <section>
                  <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                    <Layers className="h-5 w-5 text-primary" />
                    Floor plans &amp; drawings
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {floorPlans.map((d, i) => (
                      <a
                        key={`fp-${i}`}
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 text-left shadow-sm transition hover:border-primary/30 hover:shadow-md"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <span className="min-w-0 font-medium text-foreground">{d.title}</span>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {otherFiles.length > 0 && (
                <section>
                  <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                    <FileText className="h-5 w-5 text-primary" />
                    Brochures &amp; documents
                  </h2>
                  <ul className="space-y-2">
                    {otherFiles.map((d, i) => (
                      <li key={`doc-${i}`}>
                        <a
                          href={d.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/10 px-4 py-3 text-sm font-medium text-primary hover:bg-muted/25 hover:underline"
                        >
                          <span className="min-w-0 text-foreground">{d.title}</span>
                          <ExternalLink className="h-4 w-4 shrink-0 opacity-60" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <aside className="space-y-6 md:col-span-1">
              <Card className="border-border/60 shadow-md">
                <CardContent className="space-y-4 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Share with your network</p>
                  <SocialShareIconRow
                    className="justify-start"
                    preface={`${data.name}${data.price_range ? ` — ${data.price_range}` : ""}`}
                    linkUrl={shareHref}
                  />
                </CardContent>
              </Card>

              {data.external_url && (
                <Button className="h-12 w-full rounded-xl text-base font-semibold shadow-md" size="lg" asChild>
                  <a href={data.external_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit builder site
                  </a>
                </Button>
              )}

              <div className="rounded-2xl border border-dashed border-border/80 bg-muted/10 p-4">
                <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                  <Share2 className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                  Information is shared by your REMAX Excellence agent from materials the brokerage makes available. Pricing, incentives, and
                  availability can change — confirm with your agent or the builder before you buy.
                </p>
              </div>
            </aside>
          </div>
        </article>
      )}
    </ShareLandingLayout>
  );
}
