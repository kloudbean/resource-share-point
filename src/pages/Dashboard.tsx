import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import remaxLogo from "@/assets/remax-excellence-logo.png";

interface DashboardButton {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: string;
  driveLink: string;
}

const dashboardButtons: DashboardButton[] = [
  // Resources
  {
    id: "scripts",
    title: "Scripts Library",
    description: "Mike Ferry, Buyer/Seller, Objections & more",
    icon: FileText,
    category: "Resources",
    driveLink: "#scripts-library",
  },
  {
    id: "training",
    title: "Training Videos",
    description: "Video tutorials and training content",
    icon: Video,
    category: "Resources",
    driveLink: "#training-videos",
  },
  {
    id: "coaching",
    title: "Coaching Materials",
    description: "KN's worksheets – PDF & Excel",
    icon: BookOpen,
    category: "Resources",
    driveLink: "#coaching-materials",
  },

  // Marketing
  {
    id: "social",
    title: "Social & Marketing",
    description: "Social media assets and marketing materials",
    icon: Megaphone,
    category: "Marketing",
    driveLink: "#social-marketing",
  },
  {
    id: "resale",
    title: "Resale",
    description: "Resale property marketing materials",
    icon: Home,
    category: "Marketing",
    driveLink: "#resale",
  },
  {
    id: "preconstruction",
    title: "Pre-Construction",
    description: "Pre-construction project materials",
    icon: Building,
    category: "Marketing",
    driveLink: "#preconstruction",
  },
  {
    id: "educational",
    title: "Educational",
    description: "Educational content and guides",
    icon: GraduationCap,
    category: "Marketing",
    driveLink: "#educational",
  },
  {
    id: "seasonal",
    title: "Seasonal",
    description: "Holiday and seasonal marketing content",
    icon: Calendar,
    category: "Marketing",
    driveLink: "#seasonal",
  },
  {
    id: "personal-brand",
    title: "Daily Life / Personal Brand",
    description: "Personal branding and lifestyle content",
    icon: Sparkles,
    category: "Marketing",
    driveLink: "#personal-brand",
  },

  // Communications
  {
    id: "email-templates",
    title: "Email Templates",
    description: "Pre-written email templates",
    icon: Mail,
    category: "Communications",
    driveLink: "#email-templates",
  },
  {
    id: "content-calendars",
    title: "Content Calendars",
    description: "Monthly content planning calendars",
    icon: CalendarDays,
    category: "Communications",
    driveLink: "#content-calendars",
  },

  // Support
  {
    id: "marketing-support",
    title: "Marketing Support",
    description: "Request marketing assistance",
    icon: HeartHandshake,
    category: "Support",
    driveLink: "#marketing-support",
  },
  {
    id: "deal-processing",
    title: "Deal Processing",
    description: "How to submit a deal & required documents",
    icon: FileCheck,
    category: "Support",
    driveLink: "#deal-processing",
  },
  {
    id: "direct-deposit",
    title: "Direct Deposit Info",
    description: "Information required & process explained",
    icon: CreditCard,
    category: "Support",
    driveLink: "#direct-deposit",
  },
  {
    id: "vendors",
    title: "Vendors",
    description: "Approved vendor list and contacts",
    icon: Users,
    category: "Support",
    driveLink: "#vendors",
  },

  // Office
  {
    id: "office-info",
    title: "Office Information",
    description: "Hours, address & contact details",
    icon: MapPin,
    category: "Office",
    driveLink: "#office-info",
  },
  {
    id: "meeting-room",
    title: "Meeting Room Booking",
    description: "Reserve meeting rooms",
    icon: CalendarPlus,
    category: "Office",
    driveLink: "#meeting-room",
  },
  {
    id: "precon-portal",
    title: "Pre-Construction Portal",
    description: "Access the pre-con portal",
    icon: KeyRound,
    category: "Office",
    driveLink: "#precon-portal",
  },
];

const categories = ["Resources", "Marketing", "Communications", "Support", "Office"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, agent, loading, isAdmin, isActive, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleButtonClick = (button: DashboardButton) => {
    if (!isActive) {
      toast({
        variant: "destructive",
        title: "Account Not Active",
        description: "Your account is pending activation. Contact an administrator.",
      });
      return;
    }
    // In production, these would link to actual Google Drive folders
    toast({
      title: `Opening ${button.title}`,
      description: "This would redirect to the Google Drive folder in production.",
    });
    // window.open(button.driveLink, '_blank');
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

        {categories.map((category) => {
          const categoryButtons = dashboardButtons.filter((b) => b.category === category);
          return (
            <section key={category} className="mb-10">
              <h3 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="h-1 w-6 bg-accent rounded-full" />
                {category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoryButtons.map((button) => {
                  const IconComponent = button.icon;
                  return (
                    <Card
                      key={button.id}
                      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1 border-border/50 hover:border-accent/50"
                      onClick={() => handleButtonClick(button)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {button.title}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {button.description}
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
        })}
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
