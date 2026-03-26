import { useCallback, useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import type { EventClickArg, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CalendarDays, MapPin, Clock, Users, Bell, Plus, Mail } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { PORTAL_SHOWCASE } from "@/config/portalShowcase";
import { demoCalendarEvents } from "@/data/demoPortalContent";

interface OfficeEvent {
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

interface PersonalReminder {
  id: string;
  title: string;
  at: string;
  note: string;
}

interface DashboardCalendarProps {
  agentId: string | undefined;
  isAdmin: boolean;
}

const REM_KEY = (agentId: string) => `remax-portal-reminders-${agentId}`;

const typeColor = (eventType: string) => {
  const t = eventType.toLowerCase();
  if (t === "training") return "#ea580c";
  if (t === "meeting" || t === "office") return "#2563eb";
  return "#dc2626";
};

const showcaseTypeColor = (t: string) => {
  switch (t) {
    case "precon":
      return "#dc2626";
    case "office":
      return "#2563eb";
    case "training":
      return "#16a34a";
    case "deadline":
      return "#ea580c";
    case "event":
      return "#f59e0b";
    default:
      return "#64748b";
  }
};

export default function DashboardCalendar({ agentId, isAdmin }: DashboardCalendarProps) {
  const [events, setEvents] = useState<OfficeEvent[]>([]);
  const [rsvps, setRsvps] = useState<EventRsvp[]>([]);
  const [seatsLeft, setSeatsLeft] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<OfficeEvent | null>(null);
  const [notifyToggle, setNotifyToggle] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [remTitle, setRemTitle] = useState("");
  const [remAt, setRemAt] = useState("");
  const [remNote, setRemNote] = useState("");
  const [personal, setPersonal] = useState<PersonalReminder[]>([]);
  const [selectedDemo, setSelectedDemo] = useState<(typeof demoCalendarEvents)[0] | null>(null);

  const loadReminders = useCallback(() => {
    if (!agentId) return;
    try {
      const raw = localStorage.getItem(REM_KEY(agentId));
      setPersonal(raw ? JSON.parse(raw) : []);
    } catch {
      setPersonal([]);
    }
  }, [agentId]);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("is_active", true)
      .order("event_date", { ascending: true });
    setEvents(((data as OfficeEvent[]) || []) as OfficeEvent[]);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!agentId) return;
    supabase
      .from("event_rsvps")
      .select("*")
      .eq("agent_id", agentId)
      .then(({ data }) => setRsvps((data as EventRsvp[]) || []));
  }, [agentId]);

  useEffect(() => {
    if (!selected?.id) return;
    supabase
      .from("event_rsvps")
      .select("id")
      .eq("event_id", selected.id)
      .then(({ data }) => setAttendeeCount(data?.length ?? 0));
  }, [selected?.id]);

  useEffect(() => {
    if (!selected) return;
    const r = rsvps.find((x) => x.event_id === selected.id);
    setNotifyToggle(!!r?.notify_email);
  }, [selected, rsvps]);

  const isRsvped = (eventId: string) => rsvps.some((r) => r.event_id === eventId);

  const handleRsvp = async (ev: OfficeEvent, notify: boolean) => {
    if (!agentId) return;
    const existing = rsvps.find((r) => r.event_id === ev.id);
    if (existing) {
      await supabase.from("event_rsvps").delete().eq("id", existing.id);
      setRsvps((prev) => prev.filter((r) => r.id !== existing.id));
      setSeatsLeft((s) => ({ ...s, [ev.id]: (s[ev.id] ?? 24) + 1 }));
      toast({ title: "RSVP removed" });
      return;
    }
    const left = seatsLeft[ev.id] ?? 24;
    if (left <= 0) {
      toast({ variant: "destructive", title: "Event full", description: "No seats remaining." });
      return;
    }
    const { data } = await supabase
      .from("event_rsvps")
      .insert({
        event_id: ev.id,
        agent_id: agentId,
        notify_email: notify,
        status: "attending",
      })
      .select()
      .single();
    if (data) {
      setRsvps((prev) => [...prev, data as EventRsvp]);
      setSeatsLeft((s) => ({ ...s, [ev.id]: Math.max(0, (s[ev.id] ?? 24) - 1) }));
      toast({
        title: "You're registered",
        description: notify
          ? "Confirmation & reminders are simulated in this demo."
          : undefined,
      });
    }
  };

  const fcEvents: EventInput[] = useMemo(() => {
    const showcase: EventInput[] = PORTAL_SHOWCASE
      ? demoCalendarEvents.map((d) => ({
          id: d.id,
          title: d.title,
          start: d.start,
          backgroundColor: showcaseTypeColor(d.type),
          borderColor: showcaseTypeColor(d.type),
          extendedProps: { kind: "showcase" as const, demo: d },
        }))
      : [];
    const office: EventInput[] =
      PORTAL_SHOWCASE && showcase.length > 0
        ? []
        : events.map((e) => ({
            id: e.id,
            title: e.title,
            start: e.event_date,
            end: e.end_date || undefined,
            backgroundColor: typeColor(e.event_type),
            borderColor: typeColor(e.event_type),
            extendedProps: { kind: "office" as const, event: e },
          }));
    const mine: EventInput[] = personal.map((r) => ({
      id: r.id,
      title: r.title,
      start: r.at,
      backgroundColor: "#64748b",
      borderColor: "#475569",
      extendedProps: { kind: "personal" as const, reminder: r },
    }));
    return [...showcase, ...office, ...mine];
  }, [events, personal]);

  const onEventClick = (arg: EventClickArg) => {
    const ext = arg.event.extendedProps as {
      kind: "office" | "personal" | "showcase";
      event?: OfficeEvent;
      reminder?: PersonalReminder;
      demo?: (typeof demoCalendarEvents)[0];
    };
    if (ext.kind === "showcase" && ext.demo) {
      setSelected(null);
      setSelectedDemo(ext.demo);
      return;
    }
    if (ext.kind === "office" && ext.event) {
      setSelectedDemo(null);
      setSelected(ext.event);
      setNotifyToggle(isRsvped(ext.event.id));
    } else if (ext.kind === "personal" && ext.reminder) {
      toast({
        title: ext.reminder.title,
        description: ext.reminder.note || format(parseISO(ext.reminder.at), "PPp"),
      });
    }
  };

  const saveReminder = () => {
    if (!agentId || !remTitle.trim() || !remAt) return;
    const r: PersonalReminder = {
      id: crypto.randomUUID(),
      title: remTitle.trim(),
      at: new Date(remAt).toISOString(),
      note: remNote.trim(),
    };
    const next = [...personal, r];
    setPersonal(next);
    localStorage.setItem(REM_KEY(agentId), JSON.stringify(next));
    setReminderOpen(false);
    setRemTitle("");
    setRemAt("");
    setRemNote("");
    toast({ title: "Reminder added", description: "Shown on your calendar." });
  };

  return (
    <Card className="overflow-hidden border-border/80 bg-card/90 shadow-md backdrop-blur-sm">
      <CardHeader className="pb-2 flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-lg font-display">
          <CalendarDays className="h-5 w-5 text-accent" />
          Calendar &amp; Events
        </CardTitle>
        <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => setReminderOpen(true)}>
          <Plus className="h-4 w-4" /> Add Reminder
        </Button>
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        <div className="min-h-[480px] fc-theme-standard">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            initialDate={PORTAL_SHOWCASE ? "2026-04-15" : undefined}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            height="auto"
            events={fcEvents}
            eventClick={onEventClick}
            dayMaxEvents={3}
            nowIndicator
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {PORTAL_SHOWCASE ? (
            <>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-[#dc2626]" /> Pre-con
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-[#2563eb]" /> Office
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-[#16a34a]" /> Training
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-[#f59e0b]" /> Events
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-[#ea580c]" /> Deadline
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-[#dc2626]" /> Webinar / General
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-[#2563eb]" /> Office / Meeting
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-[#ea580c]" /> Training
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-[#64748b]" /> Personal reminder
              </span>
            </>
          )}
        </div>
        {PORTAL_SHOWCASE && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Sample April 2026 calendar — navigate months to explore. Live events replace this when showcase is off.
          </p>
        )}
      </CardContent>

      <Sheet open={!!selectedDemo} onOpenChange={(o) => !o && setSelectedDemo(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          {selectedDemo && (
            <>
              <SheetHeader>
                <Badge className="mb-2 w-fit capitalize">{selectedDemo.type}</Badge>
                <SheetTitle className="pr-8 font-display">{selectedDemo.title}</SheetTitle>
                <SheetDescription className="space-y-2 text-left text-sm">
                  <p className="flex items-center gap-2 text-foreground">
                    <Clock className="h-4 w-4 shrink-0" />
                    {format(parseISO(selectedDemo.start), "EEEE, MMM d, yyyy — h:mm a")}
                  </p>
                  <p className="text-muted-foreground">
                    Preview event for stakeholder review — connect your events API for production.
                  </p>
                </SheetDescription>
              </SheetHeader>
              <Button
                className="mt-6 w-full"
                onClick={() => {
                  toast({
                    title: "RSVP recorded (demo)",
                    description: "Email confirmation would be sent in production.",
                  });
                  setSelectedDemo(null);
                }}
              >
                Reserve my seat (demo)
              </Button>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display pr-8">{selected.title}</SheetTitle>
                <SheetDescription className="text-left space-y-3">
                  <Badge variant="outline" className="capitalize">
                    {selected.event_type}
                  </Badge>
                  {selected.description && <p className="text-foreground text-sm">{selected.description}</p>}
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0" />
                      {format(parseISO(selected.event_date), "EEEE, MMM d, yyyy — h:mm a")}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {selected.location?.toLowerCase().includes("virtual")
                        ? "Virtual"
                        : selected.location || "TBA"}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="h-4 w-4 shrink-0" />
                      {seatsLeft[selected.id] ?? 24} seats available
                    </p>
                  </div>
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm flex items-center gap-2">
                    <Bell className="h-4 w-4" /> Notify me (email + bell)
                  </span>
                  <Switch
                    checked={
                      isRsvped(selected.id)
                        ? !!rsvps.find((r) => r.event_id === selected.id)?.notify_email
                        : notifyToggle
                    }
                    onCheckedChange={(c) => {
                      setNotifyToggle(c);
                      const ex = rsvps.find((r) => r.event_id === selected.id);
                      if (ex && agentId) {
                        supabase
                          .from("event_rsvps")
                          .update({ notify_email: c })
                          .eq("id", ex.id)
                          .then(() => {
                            setRsvps((prev) =>
                              prev.map((r) => (r.id === ex.id ? { ...r, notify_email: c } : r))
                            );
                          });
                      }
                    }}
                  />
                </div>

                {!isRsvped(selected.id) ? (
                  <Button className="w-full" onClick={() => handleRsvp(selected, notifyToggle)}>
                    RSVP / Reserve My Seat
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" onClick={() => handleRsvp(selected, false)}>
                    Cancel RSVP
                  </Button>
                )}

                {isAdmin && (
                  <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Admin</p>
                    <p className="text-sm">Attendees: {attendeeCount}</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() =>
                        toast({
                          title: "Blast email",
                          description: "Connect Supabase Edge + email provider to send.",
                        })
                      }
                    >
                      <Mail className="h-4 w-4" /> Send blast to attendees
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={reminderOpen} onOpenChange={setReminderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Personal reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="r-title">Title</Label>
              <Input id="r-title" value={remTitle} onChange={(e) => setRemTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="r-at">Date &amp; time</Label>
              <Input
                id="r-at"
                type="datetime-local"
                value={remAt}
                onChange={(e) => setRemAt(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="r-note">Note (optional)</Label>
              <Textarea id="r-note" value={remNote} onChange={(e) => setRemNote(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReminderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveReminder} disabled={!agentId}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
