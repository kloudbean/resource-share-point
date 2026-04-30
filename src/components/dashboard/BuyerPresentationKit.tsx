import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, FileText, ImageIcon, Mic, Presentation } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PORTAL_SHOWCASE } from "@/config/portalShowcase";

const showcaseItems = [
  {
    icon: Presentation,
    title: "Buyer consultation deck",
    desc: "Slide outline: needs, financing, search criteria, offer process.",
    action: "demo" as const,
  },
  {
    icon: FileText,
    title: "Buyer agency & forms",
    desc: "RECO-compliant buyer rep checklist and signable PDFs.",
    action: "demo" as const,
  },
  {
    icon: ImageIcon,
    title: "Neighbourhood one-pagers",
    desc: "Schools, transit, and amenities templates per district.",
    action: "demo" as const,
  },
  {
    icon: Mic,
    title: "Objection handlers",
    desc: "Scripts for price, timing, and competing offers.",
    action: "demo" as const,
  },
];

export default function BuyerPresentationKit() {
  return (
    <section id="buyer-kit" className="scroll-mt-28 space-y-4">
      <div className="flex items-center gap-3">
        <Briefcase className="h-7 w-7 text-accent" />
        <div>
          <div className="mb-1 h-1 w-8 rounded-sm bg-[hsl(4_80%_56%)]" aria-hidden />
          <h2 className="font-display text-2xl font-bold text-foreground">Buyer presentation kit</h2>
          <p className="text-sm text-muted-foreground">
            Templates and talking points for buyer meetings — wire to Drive or your document library in admin.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {showcaseItems.map(({ icon: Icon, title, desc, action }) => (
          <Card key={title} className="border-border/80 bg-card/90 shadow-sm transition hover:border-primary/20">
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-auto w-full"
                onClick={() =>
                  toast({
                    title: title,
                    description:
                      action === "demo" && PORTAL_SHOWCASE
                        ? "Sample tile — link each resource to Google Drive or PDFs in production."
                        : "Connect resource_links or shared_documents in admin.",
                  })
                }
              >
                Open resource
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
