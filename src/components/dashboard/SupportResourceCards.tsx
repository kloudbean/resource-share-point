import { HeartHandshake, Users, FileCheck, CreditCard } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const cards = [
  {
    title: "Marketing support",
    subtitle: "Request marketing assistance",
    Icon: HeartHandshake,
    action: "scroll-tickets" as const,
  },
  {
    title: "Vendors",
    subtitle: "Approved vendor list and contacts",
    Icon: Users,
    action: "vendors" as const,
  },
  {
    title: "Deal processing",
    subtitle: "How to submit a deal & required documents",
    Icon: FileCheck,
    action: "toast-deal" as const,
  },
  {
    title: "Direct deposit info",
    subtitle: "Information required & process explained",
    Icon: CreditCard,
    action: "toast-deposit" as const,
  },
];

export default function SupportResourceCards() {
  const onCard = (action: (typeof cards)[number]["action"]) => {
    if (action === "vendors") {
      document.getElementById("vendors")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (action === "scroll-tickets") {
      document.getElementById("support-tickets")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (action === "toast-deal") {
      toast({
        title: "Deal processing",
        description: "Brokerage checklist & document links can be attached here (Drive, PDFs, or internal wiki).",
      });
      return;
    }
    toast({
      title: "Direct deposit",
      description: "Void cheque / banking form instructions — replace this toast with your live policy page or PDF.",
    });
  };

  return (
    <div className="mb-8">
      <div className="mb-2 h-1 w-8 rounded-sm bg-[hsl(4_80%_56%)]" aria-hidden />
      <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Support</h2>
      <p className="mt-1 text-sm text-muted-foreground">Quick links for common brokerage resources</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, subtitle, Icon, action }) => (
          <button
            key={title}
            type="button"
            onClick={() => onCard(action)}
            className="flex w-full gap-3 rounded-2xl border border-border/80 bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted">
              <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-base font-semibold text-foreground">{title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
