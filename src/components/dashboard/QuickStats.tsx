import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Calendar, TrendingUp, FileText } from "lucide-react";

interface QuickStatsProps {
  agentId: string | undefined;
}

const QuickStats = ({ agentId }: QuickStatsProps) => {
  const [totalViews, setTotalViews] = useState(0);
  const [thisMonthViews, setThisMonthViews] = useState(0);
  const [resourceCount, setResourceCount] = useState(0);
  const [lastActive, setLastActive] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId) return;
    fetchStats();
  }, [agentId]);

  const fetchStats = async () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [viewsRes, monthRes, resourcesRes, lastRes] = await Promise.all([
      supabase.from("content_views").select("id", { count: "exact", head: true }).eq("agent_id", agentId!),
      supabase.from("content_views").select("id", { count: "exact", head: true }).eq("agent_id", agentId!).gte("viewed_at", startOfMonth.toISOString()),
      supabase.from("resource_links").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("content_views").select("viewed_at").eq("agent_id", agentId!).order("viewed_at", { ascending: false }).limit(1),
    ]);

    setTotalViews(viewsRes.count ?? 0);
    setThisMonthViews(monthRes.count ?? 0);
    setResourceCount(resourcesRes.count ?? 0);
    if (lastRes.data?.[0]) {
      setLastActive(new Date(lastRes.data[0].viewed_at).toLocaleDateString());
    }
  };

  const stats = [
    { label: "Resources Accessed", value: totalViews, icon: Eye, color: "text-primary" },
    { label: "This Month", value: thisMonthViews, icon: TrendingUp, color: "text-accent" },
    { label: "Available Resources", value: resourceCount, icon: FileText, color: "text-primary" },
    { label: "Last Active", value: lastActive || "—", icon: Calendar, color: "text-muted-foreground" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/50 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-muted ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuickStats;
