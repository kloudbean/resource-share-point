import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import HeroBanner from "@/components/dashboard/HeroBanner";
import DashboardCalendar from "@/components/dashboard/DashboardCalendar";
import TrainingProgressSummary from "@/components/dashboard/TrainingProgressSummary";
import TrainingCourses from "@/components/dashboard/TrainingCourses";
import PreConSection from "@/components/dashboard/PreConSection";
import VendorDirectory from "@/components/dashboard/VendorDirectory";
import SupportChat from "@/components/dashboard/SupportChat";
import RoomBooking from "@/components/dashboard/RoomBooking";
import PortalFooter from "@/components/dashboard/PortalFooter";
import AdminPortalFeaturesOverview from "@/components/dashboard/AdminPortalFeaturesOverview";
import { PORTAL_SHOWCASE } from "@/config/portalShowcase";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Presentation } from "lucide-react";

const PREVIEW_NAME = "Alex Morgan";
const PREVIEW_RECO = "5050123";
const PREVIEW_JOINED = "2025-11-01T12:00:00.000Z";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Password-free dashboard for stakeholder demos. Uses the same rich UI as /dashboard when
 * VITE_PORTAL_SHOWCASE is not set to "false" (default: demo content on).
 */
const ClientPreview = () => {
  const navigate = useNavigate();
  const [hideCommissionRates, setHideCommissionRates] = useState(false);

  return (
    <div id="top" className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border/80 bg-muted/40 px-4 py-3">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Presentation className="h-4 w-4 text-primary shrink-0" />
            <span className="font-medium text-foreground">Stakeholder preview</span>
            <span className="text-muted-foreground hidden sm:inline">
              Sample data for today&apos;s review — no login required.
            </span>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Button>
        </div>
      </div>

      <DashboardHeader
        agentName={PREVIEW_NAME}
        fullName={PREVIEW_NAME}
        recoNumber={PREVIEW_RECO}
        avatarUrl={null}
        initials={getInitials(PREVIEW_NAME)}
        isAdmin={false}
        hideCommissionRates={hideCommissionRates}
        onHideCommissionChange={(hide) => {
          setHideCommissionRates(hide);
          toast({
            title: hide ? "Co-op % hidden (demo)" : "Co-op % visible (demo)",
            description: "Preview-only toggle — production uses saved agent setting.",
          });
        }}
        onLogout={() => navigate("/")}
      />

      <main className="flex-1 container mx-auto px-4 py-6 space-y-16">
        {!PORTAL_SHOWCASE && (
          <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/30">
            <CardContent className="pt-6">
              <p className="text-amber-900 dark:text-amber-100 text-center text-sm font-medium">
                For the full visual demo, set{" "}
                <code className="rounded bg-background/80 px-1">VITE_PORTAL_SHOWCASE=true</code> (or remove{" "}
                <code className="rounded bg-background/80 px-1">VITE_PORTAL_SHOWCASE=false</code>) and rebuild.
              </p>
            </CardContent>
          </Card>
        )}

        <HeroBanner
          agentName={PREVIEW_NAME}
          avatarUrl={null}
          initials={getInitials(PREVIEW_NAME)}
          recoNumber={PREVIEW_RECO}
          joinedAt={PREVIEW_JOINED}
        />

        <AdminPortalFeaturesOverview isAdmin={false} />

        {PORTAL_SHOWCASE && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
              Client review build
            </span>
            <span className="text-muted-foreground">
              Calendar, training, pre-con, vendors, and support are populated with sample content.
            </span>
          </div>
        )}

        <section
          id="dashboard"
          className="scroll-mt-28 space-y-6 rounded-3xl border border-border/50 bg-card/40 p-5 shadow-sm backdrop-blur-sm md:p-8"
        >
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Dashboard</h2>
            <p className="text-sm text-muted-foreground">Calendar and training at a glance</p>
          </div>
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <DashboardCalendar agentId={undefined} isAdmin={false} />
            <TrainingProgressSummary agentId={undefined} />
          </div>
        </section>

        <Separator className="opacity-60" />

        <section id="courses" className="scroll-mt-28 rounded-3xl border border-border/40 bg-muted/15 p-5 md:p-8">
          <TrainingCourses agentId={undefined} agentName={PREVIEW_NAME} recoNumber={PREVIEW_RECO} />
        </section>

        <Separator className="opacity-60" />

        <div className="rounded-3xl border border-border/40 bg-card/30 p-5 md:p-8">
          <PreConSection agentId={undefined} hideCommissionRates={hideCommissionRates} />
        </div>

        <Separator className="opacity-60" />

        <section id="vendors" className="scroll-mt-28 rounded-3xl border border-border/50 bg-card/30 p-5 md:p-8">
          <VendorDirectory />
        </section>

        <Separator className="opacity-60" />

        <section id="support" className="scroll-mt-28 rounded-3xl border border-border/50 bg-muted/10 p-5 md:p-8">
          <SupportChat agentId={undefined} userId={undefined} isAdmin={false} />
        </section>

        <Separator className="opacity-60" />

        <section id="offices" className="scroll-mt-28 rounded-3xl border border-border/40 bg-card/40 p-5 md:p-8">
          <RoomBooking agentId={undefined} />
        </section>
      </main>

      <PortalFooter />
    </div>
  );
};

export default ClientPreview;
