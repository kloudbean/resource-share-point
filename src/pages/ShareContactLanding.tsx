import { useMemo, useState, useEffect, type ReactNode } from "react";
import { Phone, Mail, ExternalLink, Copy, ChevronRight, AlertCircle, type LucideIcon } from "lucide-react";
import { decodeShareHash, type ContactSharePayload } from "@/lib/shareLandingPayload";
import { toast } from "@/hooks/use-toast";
import ShareLandingLayout from "@/components/share/ShareLandingLayout";
import { Button } from "@/components/ui/button";

async function copyText(label: string, value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast({ title: "Copied", description: `${label} is on your clipboard.` });
  } catch {
    toast({ variant: "destructive", title: "Copy failed" });
  }
}

function ContactRow({
  icon: Icon,
  label,
  children,
  onCopy,
  copyLabel,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
  onCopy?: () => void;
  copyLabel?: string;
}) {
  return (
    <div className="group flex items-start gap-4 rounded-2xl border border-border/60 bg-card/80 px-4 py-3.5 shadow-sm transition-colors hover:border-border hover:bg-card dark:bg-card/50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/[0.07] text-primary dark:bg-primary/15">
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        <div className="mt-1 text-[15px] font-medium leading-snug text-foreground">{children}</div>
      </div>
      {onCopy && copyLabel && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mt-1 h-9 w-9 shrink-0 text-muted-foreground opacity-70 hover:opacity-100"
          onClick={onCopy}
          aria-label={`Copy ${copyLabel}`}
        >
          <Copy className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export default function ShareContactLanding() {
  const [hash, setHash] = useState(() => (typeof window !== "undefined" ? window.location.hash : ""));

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const data = useMemo(() => decodeShareHash(hash) as ContactSharePayload | null, [hash]);
  const valid = data?.k === "contact";

  return (
    <ShareLandingLayout mainClassName="max-w-lg">
      {!valid ? (
        <div className="rounded-3xl border border-border/70 bg-card/90 p-8 text-center shadow-[0_20px_40px_-16px_rgba(15,23,42,0.15)] dark:shadow-none">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
            <AlertCircle className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="mt-5 font-display text-xl font-semibold tracking-tight">This link didn&apos;t open</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The share may be incomplete. Ask your agent to send the contact again from the portal.
          </p>
        </div>
      ) : (
        <article className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[0_24px_48px_-20px_rgba(15,23,42,0.18)] dark:border-border dark:shadow-2xl">
          <div className="relative px-6 pb-8 pt-9 md:px-10 md:pt-10">
            <div className="absolute left-6 top-0 h-1 w-12 rounded-full bg-[hsl(4_80%_56%)] md:left-10" aria-hidden />
            <p className="font-display text-[13px] font-semibold tracking-wide text-[hsl(4_80%_48%)] dark:text-[hsl(4_80%_60%)]">
              {data.category}
            </p>
            <h1 className="mt-3 font-display text-[1.65rem] font-semibold leading-[1.15] tracking-tight text-foreground md:text-3xl">
              {data.business_name}
            </h1>
            {data.contact_name && (
              <p className="mt-4 text-sm text-muted-foreground">
                <span className="text-foreground/80">{data.contact_name}</span>
                <span className="mx-1.5 text-border">·</span>
                <span>Primary contact</span>
              </p>
            )}
          </div>

          <div className="space-y-3 border-t border-border/50 bg-muted/20 px-4 py-6 dark:bg-muted/10 md:px-8 md:py-8">
            {data.phone && (
              <ContactRow
                icon={Phone}
                label="Phone"
                onCopy={() => copyText("Phone number", data.phone!)}
                copyLabel="phone"
              >
                <a href={`tel:${data.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                  {data.phone}
                  <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-60" />
                </a>
              </ContactRow>
            )}
            {data.email && (
              <ContactRow
                icon={Mail}
                label="Email"
                onCopy={() => copyText("Email", data.email!)}
                copyLabel="email"
              >
                <a href={`mailto:${data.email}`} className="break-all text-primary hover:underline">
                  {data.email}
                </a>
              </ContactRow>
            )}
            {data.website && (
              <ContactRow icon={ExternalLink} label="Website">
                <a
                  href={data.website.startsWith("http") ? data.website : `https://${data.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 break-all text-primary hover:underline"
                >
                  {data.website.replace(/^https?:\/\//, "")}
                  <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
                </a>
              </ContactRow>
            )}
            {!data.phone && !data.email && !data.website && (
              <p className="rounded-2xl border border-dashed border-border/80 bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
                No phone, email, or website was attached to this share.
              </p>
            )}
          </div>

          <footer className="border-t border-border/40 px-6 py-5 md:px-10">
            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
              Referral from the REMAX Excellence agent workspace — verify details before hiring.
            </p>
          </footer>
        </article>
      )}
    </ShareLandingLayout>
  );
}
