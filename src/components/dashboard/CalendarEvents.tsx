import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarDays, MapPin, Clock, Users, Bell, BellOff, Check } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  event_type: string;
}

interface EventRsvp {
  id: string;
  event_id: string;
  status: string;
  notify_email: boolean;
}

interface CalendarEventsProps {
  agentId: string | undefined;
}

const CalendarEvents = ({ agentId }: CalendarEventsProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvps, setRsvps] = useState<EventRsvp[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchEvents();
    if (agentId) fetchRsvps();
  }, [agentId]);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("is_active", true)
      .gte("event_date", new Date().toISOString().split("T")[0])
      .order("event_date", { ascending: true });
    setEvents((data as Event[]) || []);
  };

  const fetchRsvps = async () => {
    if (!agentId) return;
    const { data } = await supabase
      .from("event_rsvps")
      .select("*")
      .eq("agent_id", agentId);
    setRsvps((data as EventRsvp[]) || []);
  };

  const handleRsvp = async (event: Event, notify: boolean) => {
    if (!agentId) return;
    const existing = rsvps.find((r) => r.event_id === event.id);
    if (existing) {
      await supabase.from("event_rsvps").delete().eq("id", existing.id);
      setRsvps((prev) => prev.filter((r) => r.id !== existing.id));
      toast({ title: "RSVP removed" });
    } else {
      const { data } = await supabase
        .from("event_rsvps")
        .insert({ event_id: event.id, agent_id: agentId, notify_email: notify, status: "attending" })
        .select()
        .single();
      if (data) {
        setRsvps((prev) => [...prev, data as EventRsvp]);
        toast({ title: "You're attending!", description: notify ? "You'll receive email reminders." : undefined });
      }
    }
  };

  const eventDates = events.map((e) => parseISO(e.event_date));
  const dayEvents = events.filter((e) => isSameDay(parseISO(e.event_date), selectedDate));
  const isRsvped = (eventId: string) => rsvps.some((r) => r.event_id === eventId);

  const typeColors: Record<string, string> = {
    training: "bg-blue-100 text-blue-800 border-blue-200",
    meeting: "bg-green-100 text-green-800 border-green-200",
    social: "bg-purple-100 text-purple-800 border-purple-200",
    general: "bg-muted text-muted-foreground",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <CalendarDays className="h-5 w-5 text-accent" />
            Office Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => d && setSelectedDate(d)}
            className="rounded-md w-full pointer-events-auto"
            modifiers={{ event: eventDates }}
            modifiersClassNames={{ event: "bg-accent/20 text-accent font-bold rounded-full" }}
          />
        </CardContent>
      </Card>

      {/* Events List */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-display">
            {format(selectedDate, "MMMM d, yyyy")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""} scheduled
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {dayEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No events on this day</p>
            </div>
          ) : (
            dayEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={typeColors[event.event_type] || typeColors.general}>
                        {event.event_type}
                      </Badge>
                      {isRsvped(event.id) && (
                        <Badge className="bg-green-500 text-white text-xs">
                          <Check className="h-3 w-3 mr-1" /> Attending
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-foreground">{event.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(parseISO(event.event_date), "h:mm a")}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!isRsvped(event.id) ? (
                      <>
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleRsvp(event, false); }}>
                          RSVP
                        </Button>
                        <Button size="sm" variant="default" onClick={(e) => { e.stopPropagation(); handleRsvp(event, true); }} title="RSVP + Email Reminder">
                          <Bell className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleRsvp(event, false); }}>
                        <BellOff className="h-3 w-3 mr-1" /> Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Upcoming events */}
          {dayEvents.length === 0 && events.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Upcoming Events</p>
              {events.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">
                    {format(parseISO(event.event_date), "dd")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{format(parseISO(event.event_date), "MMM d, h:mm a")}</p>
                  </div>
                  {!isRsvped(event.id) && (
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => handleRsvp(event, true)}>
                      RSVP
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarEvents;
