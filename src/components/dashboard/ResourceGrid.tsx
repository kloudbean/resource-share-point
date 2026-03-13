import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText, Megaphone, Home, Building, GraduationCap, Calendar,
  Sparkles, Mail, CalendarDays, BookOpen, HeartHandshake, FileCheck,
  CreditCard, Video, Users, MapPin, CalendarPlus, KeyRound, LucideIcon, Loader2, ExternalLink,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  scripts: FileText, training: Video, coaching: BookOpen, social: Megaphone,
  resale: Home, preconstruction: Building, educational: GraduationCap,
  seasonal: Calendar, "personal-brand": Sparkles, "email-templates": Mail,
  "content-calendars": CalendarDays, "marketing-support": HeartHandshake,
  "deal-processing": FileCheck, "direct-deposit": CreditCard, vendors: Users,
  "office-info": MapPin, "meeting-room": CalendarPlus, "precon-portal": KeyRound,
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

interface ResourceGridProps {
  resources: ResourceLink[];
  loading: boolean;
  isActive: boolean;
  agentId: string | undefined;
}

const categories = ["Resources", "Marketing", "Communications", "Support", "Office"];

const ResourceGrid = ({ resources, loading, isActive, agentId }: ResourceGridProps) => {
  const trackView = async (resourceKey: string) => {
    if (!agentId) return;
    try {
      await supabase.from("content_views").insert({ agent_id: agentId, resource_key: resourceKey });
    } catch (e) { console.error(e); }
  };

  const handleClick = async (resource: ResourceLink) => {
    if (!isActive) {
      toast({ variant: "destructive", title: "Account Not Active", description: "Contact an administrator." });
      return;
    }
    await trackView(resource.resource_key);
    if (resource.drive_url) {
      window.open(resource.drive_url, "_blank");
    } else {
      toast({ title: resource.title, description: "Link not configured yet." });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {categories.map((category) => {
        const items = resources.filter((r) => r.category === category);
        if (items.length === 0) return null;

        return (
          <section key={category} className="mb-10">
            <h3 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="h-1 w-6 bg-accent rounded-full" />
              {category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((resource) => {
                const Icon = iconMap[resource.resource_key] || FileText;
                return (
                  <Card
                    key={resource.id}
                    className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1 border-border/50 hover:border-accent/50"
                    onClick={() => handleClick(resource)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {resource.title}
                            </h4>
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>
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
      })}
    </>
  );
};

export default ResourceGrid;
