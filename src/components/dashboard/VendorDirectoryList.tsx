import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Copy, ExternalLink, Phone, Mail } from "lucide-react";
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
    <Accordion type="multiple" defaultValue={categories.slice(0, 3)} className="space-y-2">
      {categories.map((cat) => (
        <AccordionItem key={cat} value={cat} className="rounded-xl border border-border/80 bg-card/50 px-2">
          <AccordionTrigger className="px-3 py-3 font-display text-base font-semibold hover:no-underline">
            {cat}
            <span className="ml-2 text-xs font-normal text-muted-foreground">({grouped.get(cat)?.length ?? 0})</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 pt-0">
            <div className="grid gap-3 sm:grid-cols-2">
              {grouped.get(cat)?.map((v) => (
                <Card key={v.id} className="border-border/70 shadow-sm">
                  <CardContent className="p-4">
                    <p className="font-display text-base font-semibold text-foreground">{v.business_name}</p>
                    {v.contact_name && <p className="mt-1 text-sm text-muted-foreground">{v.contact_name}</p>}
                    <div className="mt-3 space-y-2 text-sm">
                      {v.phone && (
                        <div className="flex flex-wrap items-center gap-2">
                          <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <a href={`tel:${v.phone.replace(/\s/g, "")}`} className="text-primary underline-offset-4 hover:underline">
                            {v.phone}
                          </a>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => copyText("Phone number", v.phone!)}
                            aria-label="Copy phone"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                      {v.email && (
                        <div className="flex flex-wrap items-center gap-2">
                          <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <a href={`mailto:${v.email}`} className="break-all text-primary underline-offset-4 hover:underline">
                            {v.email}
                          </a>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => copyText("Email", v.email!)}
                            aria-label="Copy email"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                      {v.website && (
                        <div className="flex items-center gap-2 pt-1">
                          <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <a
                            href={v.website.startsWith("http") ? v.website : `https://${v.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all text-primary underline-offset-4 hover:underline"
                          >
                            {v.website.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 border-t border-border/60 pt-4">
                      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Share</p>
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
