import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Building2, ArrowRight, Shield, Clock, FileText } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          navigate("/dashboard");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground mb-6">
              <Shield className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Secure Agent Access</span>
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Your Complete{" "}
              <span className="text-primary">Real Estate</span>{" "}
              Resource Hub
            </h1>
            
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Access scripts, marketing assets, training videos, and all the tools you need 
              to succeed—all in one secure portal designed exclusively for our agents.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="h-12 px-8 text-base font-semibold gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                Agent Login
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate("/auth")}
                className="h-12 px-8 text-base font-semibold"
              >
                New Agent? Register
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              One portal, all your essential resources organized and ready to go.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Scripts & Templates
              </h3>
              <p className="text-sm text-muted-foreground">
                Mike Ferry scripts, objection handlers, email templates, and more.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/30 text-accent-foreground mb-4">
                <Building2 className="h-7 w-7" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Marketing Assets
              </h3>
              <p className="text-sm text-muted-foreground">
                Social media content, seasonal campaigns, and personal branding materials.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                <Clock className="h-7 w-7" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Always Updated
              </h3>
              <p className="text-sm text-muted-foreground">
                Content managed and updated regularly through Google Drive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="font-display font-semibold text-foreground">Agent Portal</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Agent Portal. Secure access for authorized agents only.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
