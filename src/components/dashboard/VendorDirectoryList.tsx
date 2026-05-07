import { useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Phone, Mail, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { buildContactShareUrl } from "@/lib/shareLandingPayload";
import SocialShareIconRow from "@/components/share/SocialShareIconRow";

export type VendorListItem = {
  id: string;
  category: string;
  business_name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  sort_order: number;
};

const CATEGORY_ORDER = [
  "Plumber",
  "Electrician",
  "HVAC",
  "Home Inspector",
  "Lawyer",
  "Mortgage",
  "Insurance",
  "General",
  "Other",
];

const CATEGORY_COLORS = [
  "from-[#dbeafe] to-[#f0f9ff] border-[#93c5fd] dark:from-[#1e3a5f]/50 dark:to-[#0f2744]/50 dark:border-[#2e6a99]/50",
  "from-[#fee2e2] to-[#fff1f2] border-[#fda4af] dark:from-[#5a2230]/45 dark:to-[#3a1822]/45 dark:border-[#c15a72]/50",
  "from-[#dcfce7] to-[#f0fdf4] border-[#86efac] dark:from-[#1f4a3b]/45 dark:to-[#16392e]/45 dark:border-[#4ea983]/50",
  "from-[#fef3c7] to-[#fffbeb] border-[#fcd34d] dark:from-[#5b431a]/45 dark:to-[#3f2f12]/45 dark:border-[#c59a3f]/50",
  "from-[#ede9fe] to-[#f5f3ff] border-[#c4b5fd] dark:from-[#362b62]/45 dark:to-[#281f49]/45 dark:border-[#7c6ad3]/50",
];

function sortCategoryKeys(categories: string[]): string[] {
  return [...categories].sort((a, b) => {
    const ia = CATEGORY_ORDER.findIndex((c) => c.toLowerCase() === a.toLowerCase());
    const ib = CATEGORY_ORDER.findIndex((c) => c.toLowerCase() === b.toLowerCase());
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

function groupByCategory(vendors: VendorListItem[]): Map<string, VendorListItem[]> {
  const map = new Map<string, VendorListItem[]>();
  for (const v of vendors) {
    const key = v.category.trim() || "Other";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(v);
  }
  for (const [, list] of map) {
    list.sort((a, b) => a.sort_order - b.sort_order || a.business_name.localeCompare(b.business_name));
  }
  return map;
}

function initialsFromCategory(category: string): string {
  return category
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function categoryColorClasses(index: number): string {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

async function copyText(label: string, value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast({ title: "Copied", description: `${label} copied to clipboard.` });
  } catch {
    toast({ variant: "destructive", title: "Copy failed", description: "Could not access clipboard." });
  }
}

export function VendorDirectoryInner({
  vendors,
  loading,
  emptyMessage,
}: {
  vendors: VendorListItem[];
  loading: boolean;
  emptyMessage: string;
}) {
  const grouped = useMemo(() => groupByCategory(vendors), [vendors]);
  const categories = useMemo(() => sortCategoryKeys([...grouped.keys()]), [grouped]);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollCategory = (category: string, direction: "left" | "right") => {
    const row = rowRefs.current[category];
    if (!row) return;
    const amount = Math.max(160, Math.round(row.clientWidth * 0.75));
    row.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground" role="status">
        {emptyMessage}
      </p>
    );
  }

  return (
    <Accordion type="multiple" defaultValue={categories.slice(0, 3)} className="space-y-3">
      {categories.map((cat, catIdx) => (
        <AccordionItem
          key={cat}
          value={cat}
          className="overflow-hidden rounded-xl border border-[#003865]/20 bg-gradient-to-br from-white via-white to-[#f8fbff] px-2.5 shadow-sm dark:border-[#003865]/35 dark:from-card dark:via-card dark:to-[#0f2744]/[0.04]"
        >
          <AccordionTrigger className="px-1.5 py-2.5 font-display text-sm font-semibold text-[#0f2744] hover:no-underline sm:px-2 sm:py-3 dark:text-foreground">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#003865]/10 text-[10px] font-bold uppercase tracking-wide text-[#003865] sm:h-7 sm:w-7 dark:bg-[#003865]/20 dark:text-[#7fb1db]">
                {initialsFromCategory(cat)}
              </div>
              <span className="truncate text-[13px] sm:text-sm">{cat}</span>
              <Badge
                variant="secondary"
                className="ml-1 shrink-0 rounded-full border border-[#003865]/20 bg-[#003865]/8 px-2.5 py-0.5 text-[10px] font-semibold text-[#003865] dark:text-[#7fb1db]"
              >
                {grouped.get(cat)?.length ?? 0} {(grouped.get(cat)?.length ?? 0) === 1 ? "contact" : "contacts"}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="border-t border-[#003865]/10 pb-3 pt-3 dark:border-[#003865]/20">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-6 bg-gradient-to-r from-background/85 to-transparent lg:block" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-6 bg-gradient-to-l from-background/85 to-transparent lg:block" />
              <button
                type="button"
                onClick={() => scrollCategory(cat, "left")}
                className="absolute left-1 top-1/2 z-20 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/95 text-foreground shadow-sm transition hover:bg-background lg:inline-flex"
                aria-label={`Scroll ${cat} vendors left`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollCategory(cat, "right")}
                className="absolute right-1 top-1/2 z-20 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/95 text-foreground shadow-sm transition hover:bg-background lg:inline-flex"
                aria-label={`Scroll ${cat} vendors right`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            <div
              ref={(el) => {
                rowRefs.current[cat] = el;
              }}
              className="-mx-1 overflow-x-auto px-1 pb-1 lg:px-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex min-w-max snap-x snap-mandatory gap-2 touch-pan-x">
              {grouped.get(cat)?.map((v) => (
                <Card
                  key={v.id}
                  className={`group relative h-[154px] w-[188px] shrink-0 snap-start overflow-hidden rounded-xl border bg-gradient-to-br shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:h-[156px] sm:w-[206px] md:h-[160px] md:w-[220px] dark:border-opacity-50 ${categoryColorClasses(catIdx)}`}
                >
                  <CardContent className="flex h-full flex-col gap-2 p-2.5">
                    <div className="min-w-0">
                      <p className="truncate font-display text-xs font-semibold leading-tight text-[#0f2744] sm:text-[13px] dark:text-foreground">
                        {v.business_name}
                      </p>
                      {v.contact_name && <p className="truncate text-[10px] sm:text-[11px] text-muted-foreground">{v.contact_name}</p>}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {v.phone && (
                        <Button asChild size="sm" className="h-6 rounded-full px-2 text-[10px] shadow-sm">
                          <a href={`tel:${v.phone.replace(/\s/g, "")}`}>
                            <Phone className="mr-1 h-2.5 w-2.5" />
                            Call
                          </a>
                        </Button>
                      )}
                      {v.email && (
                        <Button asChild variant="secondary" size="sm" className="h-6 rounded-full border border-border/70 bg-background/80 px-2 text-[10px]">
                          <a href={`mailto:${v.email}`}>
                            <Mail className="mr-1 h-2.5 w-2.5" />
                            Email
                          </a>
                        </Button>
                      )}
                      {v.website && (
                        <Button asChild variant="ghost" size="icon" className="h-6 w-6 rounded-full" aria-label="Open website">
                          <a href={v.website.startsWith("http") ? v.website : `https://${v.website}`} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>

                    <div className="mt-auto border-t border-white/70 pt-2 dark:border-[#003865]/20">
                      <div className="flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
                      {v.phone && (
                          <button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => copyText("Phone number", v.phone!)}>
                            <Phone className="h-2.5 w-2.5" />
                            copy phone
                          </button>
                      )}
                      {v.email && (
                          <button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => copyText("Email", v.email!)}>
                            <Mail className="h-2.5 w-2.5" />
                            copy email
                          </button>
                      )}
                      </div>
                      <div className="mt-1">
                        <SocialShareIconRow
                          compact
                          preface={`Recommended partner — ${v.business_name} (${v.category})`}
                          linkUrl={buildContactShareUrl({
                            category: v.category,
                            business_name: v.business_name,
                            contact_name: v.contact_name,
                            phone: v.phone,
                            email: v.email,
                            website: v.website,
                          })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
