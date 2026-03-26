import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import HeroBanner from "@/components/dashboard/HeroBanner";
import QuickStats from "@/components/dashboard/QuickStats";
import AnnouncementsFeed from "@/components/dashboard/AnnouncementsFeed";
import CalendarEvents from "@/components/dashboard/CalendarEvents";
import TrainingCourses from "@/components/dashboard/TrainingCourses";
import PreConSection from "@/components/dashboard/PreConSection";
import SupportChat from "@/components/dashboard/SupportChat";
import RoomBooking from "@/components/dashboard/RoomBooking";
import ResourceGrid from "@/components/dashboard/ResourceGrid";
import remaxLogo from "@/assets/remax-excellence-logo.png";

interface ResourceLink {
  id: string;
  resource_key: string;
  title: string;
  description: string | null;
  category: string;
  drive_url: string | null;
  is_active: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, agent, loading, isAdmin, isActive, signOut } = useAuth();
  const [resources, setResources] = useState<ResourceLink[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) navigate("/auth");
      else if (!isActive && agent !== null) navigate("/pending");
    }
  }, [user, loading, isActive, agent, navigate]);

  useEffect(() => { fetchResources(); }, []);

  const fetchResources = async () => {
    try {
      const { data } = await supabase
        .from("resource_links")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true });
      setResources(data || []);
    } catch (e) { console.error(e); }
    finally { setLoadingResources(false); }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "AG";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!user) return null;

  const agentName = agent?.full_name || `Agent ${agent?.reco_number || ""}`;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        agentName={agentName}
        fullName={agent?.full_name || null}
        recoNumber={agent?.reco_number || null}
        avatarUrl={agent?.avatar_url || null}
        initials={getInitials(agent?.full_name)}
        isAdmin={isAdmin}
        onLogout={async () => { await signOut(); navigate("/auth"); }}
      />

      <main className="container mx-auto px-4 py-6 space-y-10">
        {!isActive && (
          <Card className="border-amber-500 bg-amber-50">
            <CardContent className="pt-6">
              <p className="text-amber-800 text-center font-medium">
                ⚠️ Your account is pending activation. Some features may be restricted.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Hero Banner */}
        <HeroBanner
          agentName={agentName}
          avatarUrl={agent?.avatar_url || null}
          initials={getInitials(agent?.full_name)}
          recoNumber={agent?.reco_number || null}
        />

        {/* Section 1: Calendar + Training Courses (side by side on desktop) */}
        <section>
          <CalendarEvents agentId={agent?.id} />
        </section>

        <Separator />

        {/* Section 2: Training Courses */}
        <section>
          <TrainingCourses agentId={agent?.id} />
        </section>

        <Separator />

        {/* Section 3: Quick Stats + Announcements */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <QuickStats agentId={agent?.id} />
          </div>
          <div>
            <AnnouncementsFeed />
          </div>
        </section>

        <Separator />

        {/* Section 4: Pre-Construction */}
        <section>
          <PreConSection />
        </section>

        <Separator />

        {/* Section 5: Marketing & Tech Support */}
        <section>
          <SupportChat agentId={agent?.id} userId={user?.id} />
        </section>

        <Separator />

        {/* Section 6: Office & Meeting Rooms */}
        <section>
          <RoomBooking agentId={agent?.id} />
        </section>

        <Separator />

        {/* Section 7: Resources */}
        <section>
          <div className="mb-4">
            <h2 className="font-display text-2xl font-bold text-foreground">Your Resources</h2>
            <p className="text-muted-foreground text-sm">Access training materials, marketing assets, and more.</p>
          </div>
          <ResourceGrid
            resources={resources}
            loading={loadingResources}
            isActive={isActive}
            agentId={agent?.id}
          />
        </section>
      </main>

      <footer className="border-t border-border bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4 text-center">
          <img src={remaxLogo} alt="REMAX Excellence" className="h-8 mx-auto mb-3 brightness-0 invert opacity-80" />
          <p className="text-sm text-primary-foreground/70">© 2024 REMAX Excellence. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
