import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Plain-language hint: "broker co-op" = commission to the buyer's side. */
export const COOP_COMMISSION_TOOLTIP =
  "Co-op is the commission the builder offers to your buyer's brokerage when you bring a client who buys here.";

/** One place on cards — small type, optional help icon (no duplicate hero strip). */
export function PreConCoopInline({ percent, className }: { percent: number; className?: string }) {
  const p = Number(percent);
  if (Number.isNaN(p)) return null;
  return (
    <div className={cn("mt-2 flex flex-wrap items-center gap-1.5", className)}>
      <span className="text-sm font-semibold tabular-nums text-foreground">Co-op {p}%</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex shrink-0 rounded-full text-muted-foreground outline-none ring-offset-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="What does co-op mean?"
          >
            <HelpCircle className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[260px] text-xs leading-relaxed">
          {COOP_COMMISSION_TOOLTIP}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

/** Toolbar / sheet header — compact, same tooltip. */
export function PreConCoopHeaderChip({ percent }: { percent: number }) {
  const p = Number(percent);
  if (Number.isNaN(p)) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="inline-flex h-8 shrink-0 cursor-help items-center gap-1 rounded-md border border-border/80 bg-muted/40 px-2.5 text-sm font-semibold tabular-nums text-foreground"
          tabIndex={0}
        >
          Co-op {p}%
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[260px] text-xs leading-relaxed">
        {COOP_COMMISSION_TOOLTIP}
      </TooltipContent>
    </Tooltip>
  );
}
