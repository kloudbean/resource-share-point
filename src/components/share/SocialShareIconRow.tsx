import type { MouseEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { usePortalSocialShareSettings } from "@/hooks/usePortalSocialShareSettings";
import { Facebook, Link2, Linkedin, Mail, MessageCircle, Share2, X } from "lucide-react";

export type SocialShareIconRowProps = {
  /** Primary line(s) of the share (e.g. intro or certificate text). */
  preface: string;
  /** Public page URL to include; certificate flows can pass site origin only. */
  linkUrl?: string;
  compact?: boolean;
  className?: string;
  /** Stops card click handlers when used inside clickable cards */
  onIconClick?: (e: MouseEvent) => void;
};

function buildBody(preface: string, linkUrl: string) {
  const p = preface.trim();
  const u = linkUrl.trim();
  if (!p) return u;
  if (!u) return p;
  return `${p}\n\n${u}`;
}

function mailSubject(preface: string) {
  const line = preface.split("\n")[0]?.trim() || "Shared from REMAX Excellence";
  return line.length > 78 ? `${line.slice(0, 75)}…` : line;
}

export default function SocialShareIconRow({
  preface,
  linkUrl = "",
  compact = false,
  className = "",
  onIconClick,
}: SocialShareIconRowProps) {
  const { settings } = usePortalSocialShareSettings();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const pageUrl = (linkUrl || origin).trim() || origin;
  const body = buildBody(preface, linkUrl);

  const size = compact ? "h-8 w-8" : "h-9 w-9";
  const iconSize = compact ? "h-3.5 w-3.5" : "h-4 w-4";

  const baseBtn = `${size} shrink-0 rounded-full border border-border/80 bg-background shadow-sm transition-colors hover:bg-muted/80`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      toast({ title: "Copied", description: "Ready to paste anywhere." });
    } catch {
      toast({ variant: "destructive", title: "Copy failed" });
    }
  };

  const native = async () => {
    if (!navigator.share) {
      copy();
      return;
    }
    try {
      await navigator.share({ title: "REMAX Excellence", text: body, url: pageUrl });
    } catch (e) {
      if ((e as Error).name !== "AbortError") copy();
    }
  };

  const stop = onIconClick ?? ((e: MouseEvent) => e.stopPropagation());

  const nodes: ReactNode[] = [];

  if (settings.whatsapp) {
    nodes.push(
      <Tooltip key="wa">
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={`${baseBtn} border-[#25D366]/45 text-[#128C7E] hover:bg-[#25D366]/12`}
            asChild
          >
            <a
              href={`https://wa.me/?text=${encodeURIComponent(body)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on WhatsApp"
              onClick={stop}
            >
              <MessageCircle className={iconSize} strokeWidth={2} />
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">WhatsApp</TooltipContent>
      </Tooltip>
    );
  }

  if (settings.facebook) {
    const quote = preface.trim().slice(0, 500);
    nodes.push(
      <Tooltip key="fb">
        <TooltipTrigger asChild>
          <Button type="button" variant="outline" size="icon" className={`${baseBtn} text-[#1877F2] hover:bg-[#1877F2]/10`} asChild>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}&quote=${encodeURIComponent(quote)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Facebook"
              onClick={stop}
            >
              <Facebook className={iconSize} strokeWidth={1.75} />
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Facebook</TooltipContent>
      </Tooltip>
    );
  }

  if (settings.linkedin) {
    nodes.push(
      <Tooltip key="li">
        <TooltipTrigger asChild>
          <Button type="button" variant="outline" size="icon" className={`${baseBtn} text-[#0A66C2] hover:bg-[#0A66C2]/10`} asChild>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on LinkedIn"
              onClick={stop}
            >
              <Linkedin className={iconSize} strokeWidth={1.75} />
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">LinkedIn</TooltipContent>
      </Tooltip>
    );
  }

  if (settings.x) {
    nodes.push(
      <Tooltip key="x">
        <TooltipTrigger asChild>
          <Button type="button" variant="outline" size="icon" className={`${baseBtn} hover:bg-foreground/5`} asChild>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(body)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on X"
              onClick={stop}
            >
              <X className={iconSize} strokeWidth={2} />
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">X</TooltipContent>
      </Tooltip>
    );
  }

  if (settings.email) {
    nodes.push(
      <Tooltip key="email">
        <TooltipTrigger asChild>
          <Button type="button" variant="outline" size="icon" className={baseBtn} asChild>
            <a
              href={`mailto:?subject=${encodeURIComponent(mailSubject(preface))}&body=${encodeURIComponent(body)}`}
              aria-label="Share by email"
              onClick={stop}
            >
              <Mail className={iconSize} strokeWidth={1.75} />
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Email</TooltipContent>
      </Tooltip>
    );
  }

  if (settings.copyLink) {
    nodes.push(
      <Tooltip key="copy">
        <TooltipTrigger asChild>
          <Button type="button" variant="outline" size="icon" className={baseBtn} aria-label="Copy share text" onClick={(e) => { stop(e); void copy(); }}>
            <Link2 className={iconSize} strokeWidth={1.75} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Copy</TooltipContent>
      </Tooltip>
    );
  }

  if (settings.native) {
    nodes.push(
      <Tooltip key="native">
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={baseBtn}
            aria-label="More share options"
            onClick={(e) => {
              stop(e);
              void native();
            }}
          >
            <Share2 className={iconSize} strokeWidth={1.75} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Share…</TooltipContent>
      </Tooltip>
    );
  }

  if (nodes.length === 0) return null;

  return <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>{nodes}</div>;
}
