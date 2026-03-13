import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, LogOut, Loader2, Mail, Phone } from "lucide-react";
import remaxLogo from "@/assets/remax-excellence-logo.png";

const PendingActivation = () => {
  const navigate = useNavigate();
  const { user, agent, loading, isActive, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && user && isActive) {
      navigate("/dashboard");
    }
  }, [user, loading, isActive, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
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

  return (
    <div className="min-h-screen bg-primary flex flex-col relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90" />

      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between">
        <img
          src={remaxLogo}
          alt="REMAX Excellence"
          className="h-10 w-auto object-contain brightness-0 invert"
        />
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="text-primary-foreground hover:bg-primary-foreground/10 gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg text-center space-y-8">
          {/* Avatar */}
          <div className="flex justify-center">
            <Avatar className="h-24 w-24 border-4 border-primary-foreground/20">
              <AvatarImage src={agent?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary-foreground text-primary text-2xl font-semibold">
                {getInitials(agent?.full_name)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Welcome Message */}
          <div className="space-y-3">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground">
              Welcome, {agent?.full_name || "Agent"}
            </h1>
            <p className="text-primary-foreground/70 text-lg">
              RECO #{agent?.reco_number}
            </p>
          </div>

          {/* Status Card */}
          <Card className="border-0 shadow-2xl">
            <CardContent className="pt-8 pb-8 px-8 space-y-6">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Account Pending Activation
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your account has been created successfully. An administrator needs to review and activate your account before you can access the portal resources.
                </p>
              </div>

              <div className="border-t border-border pt-6 space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  What happens next?
                </h3>
                <ul className="text-sm text-muted-foreground space-y-3 text-left">
                  <li className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">1</span>
                    </span>
                    An administrator will review your registration
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">2</span>
                    </span>
                    Once approved, you'll receive a notification
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">3</span>
                    </span>
                    Log in again to access all portal resources
                  </li>
                </ul>
              </div>

              <div className="border-t border-border pt-6">
                <p className="text-sm text-muted-foreground">
                  Need help? Contact your office administrator.
                </p>
                <div className="flex justify-center gap-4 mt-3">
                  <a href="mailto:admin@remaxexcellence.ca" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                    <Mail className="h-4 w-4" />
                    Email Support
                  </a>
                  <a href="tel:+1234567890" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                    <Phone className="h-4 w-4" />
                    Call Office
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center">
        <p className="text-sm text-primary-foreground/50">
          © 2024 REMAX Excellence. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default PendingActivation;
