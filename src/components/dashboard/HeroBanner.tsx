import { format, parseISO } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Flame, Sparkles } from "lucide-react";
import { PORTAL_SHOWCASE } from "@/config/portalShowcase";
import { demoWelcomeStats, DEMO_AGENT_TAGLINE } from "@/data/demoPortalContent";
import { cn } from "@/lib/utils";

interface HeroBannerProps {
  agentName: string;
  avatarUrl: string | null;
  initials: string;
  recoNumber: string | null;
  joinedAt?: string | null;
  officeLabel?: string | null;
}

const HeroBanner = ({
  agentName,
  avatarUrl,
  initials,
  recoNumber,
  joinedAt,
  officeLabel,
}: HeroBannerProps) => {
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const emoji = hour < 12 ? "☀️" : hour < 17 ? "🌤️" : "🌙";

  const joined =
    joinedAt && !PORTAL_SHOWCASE
      ? format(parseISO(joinedAt), "MMMM yyyy")
      : "January 2024";

  const office = officeLabel || (PORTAL_SHOWCASE ? DEMO_AGENT_TAGLINE : "Your office");

  const stats = PORTAL_SHOWCASE
    ? [
        { value: demoWelcomeStats.activeCourses, label: "Active courses" },
        { value: demoWelcomeStats.completed, label: "Completed" },
        { value: demoWelcomeStats.eventsThisWeek, label: "Events this week" },
        { value: `${demoWelcomeStats.avgProgress}%`, label: "Avg progress" },
      ]
    : null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#1a1f36] text-primary-foreground shadow-xl">
      {/* ambient orbs — 2026 glass aesthetic */}
      <div
        className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[hsl(4_80%_56%/0.22)] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 left-1/4 h-56 w-56 rounded-full bg-[hsl(220_60%_50%/0.15)] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[18%] top-8 text-[min(18vw,7rem)] font-display font-bold leading-none text-white/[0.04] select-none"
        aria-hidden
      >
        RE/MAX
      </div>

      <div className="relative z-10 px-5 py-8 sm:px-10 sm:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-6">
            <Avatar className="h-20 w-20 border-[3px] border-white/25 shadow-2xl ring-2 ring-white/10 sm:h-24 sm:w-24">
              <AvatarImage src={avatarUrl || undefined} alt={agentName} />
              <AvatarFallback className="bg-[hsl(4_80%_56%)] text-xl font-bold text-white sm:text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="flex items-center gap-2 text-sm text-white/65">
                <Sparkles className="h-4 w-4 text-amber-400/90" />
                {greeting}, {agentName.split(" ")[0]}! {emoji}
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
                {agentName}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">
                RECO# {recoNumber || "—"}
                <span className="mx-2 text-white/25">·</span>
                Joined {joined}
                <span className="mx-2 text-white/25">·</span>
                {office}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-200 backdrop-blur-sm",
              )}
            >
              <Flame className="h-4 w-4 text-amber-400" />
              {PORTAL_SHOWCASE ? `${demoWelcomeStats.streakDays}-day streak` : "Keep learning"}
            </div>
          </div>
        </div>

        {stats && (
          <div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-8 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-white/[0.06] px-4 py-3 text-center backdrop-blur-md transition hover:bg-white/[0.09]"
              >
                <p className="font-display text-2xl font-bold text-amber-400">{s.value}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/45">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {PORTAL_SHOWCASE && (
          <p className="mt-6 flex items-center gap-2 text-xs text-white/40">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
            Preview dataset — numbers illustrate the intended dashboard experience for stakeholder review.
          </p>
        )}
      </div>
    </div>
  );
};

export default HeroBanner;
