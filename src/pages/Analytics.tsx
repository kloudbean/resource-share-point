import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Loader2,
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Calendar,
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import remaxLogo from "@/assets/remax-excellence-logo.png";

interface Agent {
  id: string;
  full_name: string | null;
  reco_number: string;
  avatar_url: string | null;
}

interface ContentView {
  id: string;
  agent_id: string;
  resource_key: string;
  viewed_at: string;
}

interface AgentStats {
  agent: Agent;
  totalViews: number;
  uniqueResources: number;
  lastActive: string | null;
  resourceBreakdown: Record<string, number>;
}

interface ResourceStats {
  resource_key: string;
  title: string;
  totalViews: number;
  uniqueAgents: number;
}

const Analytics = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [contentViews, setContentViews] = useState<ContentView[]>([]);
  const [resourceLinks, setResourceLinks] = useState<Record<string, string>>({});
  const [loadingData, setLoadingData] = useState(true);
  const [dateRange, setDateRange] = useState("30");
  const [selectedAgent, setSelectedAgent] = useState<string>("all");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin) {
        navigate("/dashboard");
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to access analytics.",
        });
      }
    }
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, dateRange]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const startDate = startOfDay(subDays(new Date(), parseInt(dateRange)));
      const endDate = endOfDay(new Date());

      // Fetch agents
      const { data: agentsData } = await supabase
        .from("agents")
        .select("id, full_name, reco_number, avatar_url");

      // Fetch content views within date range
      const { data: viewsData } = await supabase
        .from("content_views")
        .select("*")
        .gte("viewed_at", startDate.toISOString())
        .lte("viewed_at", endDate.toISOString())
        .order("viewed_at", { ascending: false });

      // Fetch resource links for titles
      const { data: linksData } = await supabase
        .from("resource_links")
        .select("resource_key, title");

      const linksMap: Record<string, string> = {};
      linksData?.forEach((link) => {
        linksMap[link.resource_key] = link.title;
      });

      setAgents(agentsData || []);
      setContentViews(viewsData || []);
      setResourceLinks(linksMap);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch analytics data.",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const getAgentStats = (): AgentStats[] => {
    return agents.map((agent) => {
      const agentViews = contentViews.filter((v) => v.agent_id === agent.id);
      const resourceBreakdown: Record<string, number> = {};
      const uniqueResources = new Set<string>();

      agentViews.forEach((view) => {
        resourceBreakdown[view.resource_key] = (resourceBreakdown[view.resource_key] || 0) + 1;
        uniqueResources.add(view.resource_key);
      });

      const lastView = agentViews[0];

      return {
        agent,
        totalViews: agentViews.length,
        uniqueResources: uniqueResources.size,
        lastActive: lastView?.viewed_at || null,
        resourceBreakdown,
      };
    }).sort((a, b) => b.totalViews - a.totalViews);
  };

  const getResourceStats = (): ResourceStats[] => {
    const stats: Record<string, { totalViews: number; uniqueAgents: Set<string> }> = {};

    contentViews.forEach((view) => {
      if (!stats[view.resource_key]) {
        stats[view.resource_key] = { totalViews: 0, uniqueAgents: new Set() };
      }
      stats[view.resource_key].totalViews++;
      stats[view.resource_key].uniqueAgents.add(view.agent_id);
    });

    return Object.entries(stats)
      .map(([resource_key, data]) => ({
        resource_key,
        title: resourceLinks[resource_key] || resource_key,
        totalViews: data.totalViews,
        uniqueAgents: data.uniqueAgents.size,
      }))
      .sort((a, b) => b.totalViews - a.totalViews);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "AG";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const agentStats = getAgentStats();
  const resourceStats = getResourceStats();
  const totalViews = contentViews.length;
  const activeAgents = agentStats.filter((s) => s.totalViews > 0).length;
  const avgViewsPerAgent = activeAgents > 0 ? Math.round(totalViews / activeAgents) : 0;

  if (loading || (!isAdmin && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img
              src={remaxLogo}
              alt="REMAX Excellence"
              className="h-10 w-auto object-contain brightness-0 invert"
            />
          </div>
          <h1 className="font-display text-xl font-semibold">Analytics Dashboard</h1>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loadingData ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Eye className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Views</p>
                      <p className="text-3xl font-bold">{totalViews}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Agents</p>
                      <p className="text-3xl font-bold">{activeAgents}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Views/Agent</p>
                      <p className="text-3xl font-bold">{avgViewsPerAgent}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Resources Accessed</p>
                      <p className="text-3xl font-bold">{resourceStats.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Agent Activity Table */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Agent Activity
                </CardTitle>
                <CardDescription>
                  Content consumption by each agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                {agentStats.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No agent activity recorded yet.</p>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Agent</TableHead>
                          <TableHead className="text-center">Total Views</TableHead>
                          <TableHead className="text-center">Unique Resources</TableHead>
                          <TableHead>Last Active</TableHead>
                          <TableHead>Top Resources</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {agentStats.map((stat) => (
                          <TableRow key={stat.agent.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={stat.agent.avatar_url || undefined} />
                                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                    {getInitials(stat.agent.full_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{stat.agent.full_name || "Unnamed"}</p>
                                  <p className="text-xs text-muted-foreground">{stat.agent.reco_number}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-semibold">{stat.totalViews}</TableCell>
                            <TableCell className="text-center">{stat.uniqueResources}</TableCell>
                            <TableCell>
                              {stat.lastActive
                                ? format(new Date(stat.lastActive), "MMM d, yyyy h:mm a")
                                : "Never"}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(stat.resourceBreakdown)
                                  .sort((a, b) => b[1] - a[1])
                                  .slice(0, 3)
                                  .map(([key, count]) => (
                                    <span
                                      key={key}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                                    >
                                      {resourceLinks[key] || key} ({count})
                                    </span>
                                  ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Popular Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Popular Resources
                </CardTitle>
                <CardDescription>
                  Most accessed content by your agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resourceStats.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No resource views recorded yet.</p>
                ) : (
                  <div className="space-y-4">
                    {resourceStats.slice(0, 10).map((stat, index) => (
                      <div key={stat.resource_key} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{stat.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {stat.uniqueAgents} agents · {stat.totalViews} views
                          </p>
                        </div>
                        <div className="w-32 bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{
                              width: `${(stat.totalViews / (resourceStats[0]?.totalViews || 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default Analytics;
