import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  MapPin,
  GraduationCap,
  Bell,
  Share2,
  Store,
  Link as LinkIcon,
  BarChart3,
  Shield,
} from "lucide-react";

const features = [
  {
    to: "/admin",
    title: "Agents & access",
    description: "Activate agents, roles, admin privileges, and password resets.",
    icon: Users,
  },
  {
    to: "/admin/precon",
    title: "Pre-con & cities",
    description: "Projects, pricing, galleries, documents, and commission fields agents see on listings.",
    icon: MapPin,
  },
  {
    to: "/admin/course-assignments",
    title: "Training assignments",
    description: "Assign courses to agents and track completion from the portal.",
    icon: GraduationCap,
  },
  {
    to: "/admin/reminders",
    title: "Agent reminders",
    description: "Schedule nudges for courses, pre-con follow-ups, and office tasks.",
    icon: Bell,
  },
  {
    to: "/admin/social-share",
    title: "Social share",
    description: "Control which networks appear when agents share listings and certificates.",
    icon: Share2,
  },
  {
    to: "/admin/vendors",
    title: "Vendor directory",
    description: "Curate preferred vendors agents see in the portal.",
    icon: Store,
  },
  {
    to: "/admin/links",
    title: "Links & resources",
    description: "Quick links, downloads, and resources surfaced to the team.",
    icon: LinkIcon,
  },
  {
    to: "/admin/analytics",
    title: "Analytics",
    description: "Usage and engagement views for leadership (where enabled).",
    icon: BarChart3,
  },
];

interface AdminPortalFeaturesOverviewProps {
  isAdmin: boolean;
}

/** Stakeholder-facing map of brokerage admin tools — replaces one-off “what’s new” banners. */
export default function AdminPortalFeaturesOverview({ isAdmin }: AdminPortalFeaturesOverviewProps) {
  return (
    <section id="admin-features" className="scroll-mt-28 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Shield className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wide">Brokerage administration</span>
          </div>
          <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Tools that run this portal
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Everything below is managed from the Admin area. Use it on review calls to show what your team can configure
            without touching code.
          </p>
        </div>
        {isAdmin && (
          <Button variant="default" size="sm" className="shrink-0" asChild>
            <Link to="/admin">Open admin home</Link>
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {features.map(({ to, title, description, icon: Icon }) => (
          <Card key={to} className="border-border/70 bg-card/80 shadow-sm">
            <CardHeader className="space-y-1 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <CardTitle className="font-display text-base leading-snug">{title}</CardTitle>
              <CardDescription className="text-xs leading-relaxed">{description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {isAdmin ? (
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to={to}>Open</Link>
                </Button>
              ) : (
                <p className="text-[11px] text-muted-foreground">Sign in with an admin account to use this screen.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
