import { useMemo } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, ArrowRight } from "lucide-react";
import { useTrainingCoursesData } from "@/hooks/useTrainingCoursesData";
import { cn } from "@/lib/utils";
import { PORTAL_SHOWCASE } from "@/config/portalShowcase";
import { demoProgressCourses, demoWelcomeStats } from "@/data/demoPortalContent";

interface TrainingProgressSummaryProps {
  agentId: string | undefined;
}

function Ring({
  pct,
  strokeColor,
  size = 56,
}: {
  pct: number;
  strokeColor: string;
  size?: number;
}) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const vb = size;
  const cx = vb / 2;
  const cy = vb / 2;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${vb} ${vb}`} aria-hidden>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E2E8F0" strokeWidth="5" className="dark:stroke-white/10" />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground"
        style={{ color: pct === 0 ? "hsl(var(--muted-foreground))" : undefined }}
      >
        {pct}%
      </span>
    </div>
  );
}

export default function TrainingProgressSummary({ agentId }: TrainingProgressSummaryProps) {
  const { courses, loading, getCourseProgress, getCourseModules, progress } = useTrainingCoursesData(agentId);

  const streakDays = useMemo(() => {
    if (PORTAL_SHOWCASE) return demoWelcomeStats.streakDays;
    if (!progress.length) return 0;
    const recent = progress.filter((p) => p.completed).length;
    return Math.min(14, Math.max(1, Math.floor(recent / 2) + 1));
  }, [progress]);

  const active = useMemo(() => {
    return courses
      .map((c) => ({
        course: c,
        pct: getCourseProgress(c.id),
        modCount: getCourseModules(c.id).length,
      }))
      .filter((x) => x.pct < 100)
      .slice(0, 4);
  }, [courses, getCourseProgress, getCourseModules]);

  const statusLabel = (pct: number) => {
    if (pct === 0) return "Not started";
    if (pct === 100) return "Completed";
    return "In progress";
  };

  const statusClass = (pct: number) =>
    pct === 0
      ? "bg-muted text-muted-foreground border border-border"
      : pct === 100
        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
        : "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100";

  const showShowcase = PORTAL_SHOWCASE;

  return (
    <Card className="flex h-full flex-col overflow-hidden border-border/80 bg-card/90 shadow-md backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="font-display text-lg text-foreground">My course progress</CardTitle>
            <p className="text-sm text-muted-foreground">Pick up where you left off</p>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-200">
            <Flame className="h-3.5 w-3.5" />
            {streakDays}-day streak
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {loading && !showShowcase && (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading courses…</p>
        )}

        {showShowcase &&
          demoProgressCourses.map((row) => (
            <button
              key={row.id}
              type="button"
              className="group flex w-full items-center gap-3 rounded-2xl border border-border/80 bg-background/50 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
              onClick={() => document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Ring pct={row.pct} strokeColor={row.ringColor} />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-semibold leading-snug text-foreground">{row.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {row.provider} · {row.modules} modules · {row.lastWatch}
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all", row.barColor)}
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", statusClass(row.pct))}>
                  {statusLabel(row.pct)}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-[10px] opacity-90 group-hover:opacity-100"
                  asChild
                >
                  <a href="#courses" onClick={(e) => e.stopPropagation()}>
                    Continue <ArrowRight className="ml-0.5 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </button>
          ))}

        {!showShowcase && !loading && active.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            You&apos;re all caught up — explore new courses below.
          </p>
        )}

        {!showShowcase &&
          active.map(({ course, pct }) => (
            <div
              key={course.id}
              className="flex gap-3 rounded-2xl border border-border/80 bg-background/50 p-3 transition hover:bg-muted/30"
            >
              <Ring pct={pct} strokeColor="hsl(var(--accent))" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-medium leading-snug text-foreground">{course.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Last activity — {format(new Date(), "MMM d, yyyy")}
                </p>
                <Badge variant="outline" className="mt-2 text-[10px]">
                  {statusLabel(pct)}
                </Badge>
                <Button variant="link" className="h-auto gap-1 p-0 text-accent" asChild>
                  <a href="#courses">
                    Continue learning
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
