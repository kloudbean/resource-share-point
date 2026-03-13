import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, Pin } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
}

const AnnouncementsFeed = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    fetchAnnouncements();

    const channel = supabase
      .channel("announcements-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, () => {
        fetchAnnouncements();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5);
    setAnnouncements(data || []);
  };

  if (announcements.length === 0) return null;

  return (
    <Card className="mb-8 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Megaphone className="h-5 w-5 text-accent" />
          Announcements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {announcements.map((a) => (
          <div
            key={a.id}
            className={`p-4 rounded-lg border transition-colors ${
              a.is_pinned ? "bg-accent/5 border-accent/20" : "bg-muted/30 border-border/30"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {a.is_pinned && <Pin className="h-3.5 w-3.5 text-accent shrink-0" />}
                  <h4 className="font-semibold text-foreground text-sm truncate">{a.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{a.content}</p>
              </div>
              <Badge variant="secondary" className="shrink-0 text-xs">
                {new Date(a.created_at).toLocaleDateString()}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AnnouncementsFeed;
