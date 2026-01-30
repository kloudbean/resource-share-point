import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import {
  LogOut,
  FileText,
  Megaphone,
  Home,
  Building,
  GraduationCap,
  Calendar,
  Sparkles,
  Mail,
  CalendarDays,
  BookOpen,
  HeartHandshake,
  FileCheck,
  CreditCard,
  Video,
  Users,
  MapPin,
  CalendarPlus,
  KeyRound,
  User,
  Shield,
  Loader2,
  LucideIcon,
} from "lucide-react";
import remaxLogo from "@/assets/remax-excellence-logo.png";

// Icon mapping for database resources
const iconMap: Record<string, LucideIcon> = {
  scripts: FileText,
  training: Video,
  coaching: BookOpen,
  social: Megaphone,
  resale: Home,
  preconstruction: Building,
  educational: GraduationCap,
  seasonal: Calendar,
  "personal-brand": Sparkles,
  "email-templates": Mail,
  "content-calendars": CalendarDays,
  "marketing-support": HeartHandshake,
  "deal-processing": FileCheck,
  "direct-deposit": CreditCard,
  vendors: Users,
  "office-info": MapPin,
  "meeting-room": CalendarPlus,
  "precon-portal": KeyRound,
};

interface ResourceLink {
  id: string;
  resource_key: string;
  title: string;
  description: string | null;
  category: string;
  drive_url: string | null;
  is_active: boolean;
}

const categories = ["Resources", "Marketing", "Communications", "Support", "Office"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, agent, loading, isAdmin, isActive, signOut } = useAuth();
  const [resources, setResources] = useState<ResourceLink[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data } = await supabase
        .from("resource_links")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true });

      setResources(data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoadingResources(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const trackView = async (resourceKey: string) => {
    if (!agent) return;
    try {
      await supabase.from("content_views").insert({
        agent_id: agent.id,
        resource_key: resourceKey,
      });
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  const handleButtonClick = async (resource: ResourceLink) => {
    if (!isActive) {
      toast({
        variant: "destructive",
        title: "Account Not Active",
        description: "Your account is pending activation. Contact an administrator.",
      });
      return;
    }

    // Track the view
    await trackView(resource.resource_key);

    if (resource.drive_url) {
      window.open(resource.drive_url, "_blank");
    } else {
      toast({
        title: `${resource.title}`,
        description: "Link not configured yet. Contact an administrator.",
      });
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "AG";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const agentName = agent?.full_name || `Agent ${agent?.reco_number || ""}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={remaxLogo} 
                alt="REMAX Excellence" 
                className="h-10 w-auto object-contain brightness-0 invert"
              />
              <div className="hidden sm:block border-l border-primary-foreground/20 pl-4">
                <h1 className="font-display text-lg font-bold">Agent Portal</h1>
                <p className="text-sm text-primary-foreground/70">Welcome, {agentName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/admin")}
                  className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-primary-foreground/10">
                    <Avatar className="h-10 w-10 border-2 border-primary-foreground/30">
                      <AvatarImage src={agent?.avatar_url || undefined} alt={agentName} />
                      <AvatarFallback className="bg-primary-foreground text-primary font-semibold">
                        {getInitials(agent?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{agent?.full_name || "Agent"}</p>
                      <p className="text-xs text-muted-foreground">{agent?.reco_number}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!isActive && (
          <Card className="mb-6 border-amber-500 bg-amber-50">
            <CardContent className="pt-6">
              <p className="text-amber-800 text-center font-medium">
                ⚠️ Your account is pending activation. Contact an administrator to activate your account. Some features may be restricted.
              </p>
            </CardContent>
          </Card>
        )}
        
        <div className="mb-8">
          <h2 className="font-display text-3xl font-bold text-foreground mb-2">Your Dashboard</h2>
          <p className="text-muted-foreground">Access all your resources, training materials, and marketing assets in one place.</p>
        </div>

        {loadingResources ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          categories.map((category) => {
            const categoryResources = resources.filter((r) => r.category === category);
            if (categoryResources.length === 0) return null;
            
            return (
              <section key={category} className="mb-10">
                <h3 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="h-1 w-6 bg-accent rounded-full" />
                  {category}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categoryResources.map((resource) => {
                    const IconComponent = iconMap[resource.resource_key] || FileText;
                    return (
                      <Card
                        key={resource.id}
                        className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1 border-border/50 hover:border-accent/50"
                        onClick={() => handleButtonClick(resource)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                {resource.title}
                              </h4>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {resource.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4 text-center">
          <img 
            src={remaxLogo} 
            alt="REMAX Excellence" 
            className="h-8 mx-auto mb-3 brightness-0 invert opacity-80"
          />
          <p className="text-sm text-primary-foreground/70">
            © 2024 REMAX Excellence. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
