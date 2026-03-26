import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { MapPin, Users, DoorOpen, Clock, CalendarDays, Video, CheckCircle2 } from "lucide-react";
import { format, isSameDay, parseISO, addHours, setHours, setMinutes } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Location {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
}

interface Room {
  id: string;
  location_id: string;
  name: string;
  capacity: number | null;
  amenities: string | null;
  is_virtual: boolean;
}

interface Booking {
  id: string;
  room_id: string;
  agent_id: string;
  title: string;
  start_time: string;
  end_time: string;
  is_virtual: boolean;
  status: string;
}

interface RoomBookingProps {
  agentId: string | undefined;
}

const timeSlots = Array.from({ length: 20 }, (_, i) => {
  const h = 8 + Math.floor(i / 2);
  const m = (i % 2) * 30;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
});

const RoomBooking = ({ agentId }: RoomBookingProps) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookingDialog, setBookingDialog] = useState<Room | null>(null);
  const [bookTitle, setBookTitle] = useState("");
  const [bookStart, setBookStart] = useState("09:00");
  const [bookEnd, setBookEnd] = useState("10:00");
  const [bookVirtual, setBookVirtual] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [selectedDate]);

  const fetchData = async () => {
    const { data: locData } = await supabase.from("office_locations").select("*").eq("is_active", true).order("sort_order");
    setLocations((locData as Location[]) || []);
    const { data: roomData } = await supabase.from("meeting_rooms").select("*").eq("is_active", true);
    setRooms((roomData as Room[]) || []);
  };

  const fetchBookings = async () => {
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);
    const { data } = await supabase
      .from("room_bookings")
      .select("*")
      .gte("start_time", dayStart.toISOString())
      .lte("start_time", dayEnd.toISOString());
    setBookings((data as Booking[]) || []);
  };

  const getRoomBookings = (roomId: string) => bookings.filter((b) => b.room_id === roomId);

  const isSlotBooked = (roomId: string, time: string) => {
    const [h, m] = time.split(":").map(Number);
    const slotTime = new Date(selectedDate);
    slotTime.setHours(h, m, 0, 0);
    return bookings.some((b) => {
      if (b.room_id !== roomId) return false;
      const start = new Date(b.start_time);
      const end = new Date(b.end_time);
      return slotTime >= start && slotTime < end;
    });
  };

  const handleBook = async () => {
    if (!agentId || !bookingDialog || !bookTitle.trim()) return;
    const [sh, sm] = bookStart.split(":").map(Number);
    const [eh, em] = bookEnd.split(":").map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(sh, sm, 0, 0);
    const endTime = new Date(selectedDate);
    endTime.setHours(eh, em, 0, 0);

    const { error } = await supabase.from("room_bookings").insert({
      room_id: bookingDialog.id,
      agent_id: agentId,
      title: bookTitle,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      is_virtual: bookVirtual,
    });

    if (!error) {
      toast({ title: "Room booked!", description: `${bookingDialog.name} on ${format(selectedDate, "MMM d")} ${bookStart}-${bookEnd}` });
      setBookingDialog(null);
      setBookTitle("");
      fetchBookings();
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <DoorOpen className="h-6 w-6 text-accent" />
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Office & Meeting Rooms</h2>
          <p className="text-sm text-muted-foreground">Book rooms for in-person or virtual meetings</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 w-full md:w-auto">
              <CalendarDays className="h-4 w-4" />
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {locations.length > 0 ? (
        <Tabs defaultValue={locations[0]?.id} className="w-full">
          <TabsList className="mb-4">
            {locations.map((loc) => (
              <TabsTrigger key={loc.id} value={loc.id} className="gap-2">
                <MapPin className="h-3 w-3" /> {loc.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {locations.map((loc) => (
            <TabsContent key={loc.id} value={loc.id}>
              {loc.address && (
                <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {loc.address}
                  {loc.phone && <span className="ml-3">📞 {loc.phone}</span>}
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {rooms
                  .filter((r) => r.location_id === loc.id)
                  .map((room) => {
                    const roomBookings = getRoomBookings(room.id);
                    return (
                      <Card key={room.id} className="border-border">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                              {room.is_virtual ? <Video className="h-4 w-4 text-blue-500" /> : <DoorOpen className="h-4 w-4 text-accent" />}
                              {room.name}
                            </CardTitle>
                            {room.capacity && (
                              <Badge variant="outline" className="text-xs">
                                <Users className="h-3 w-3 mr-1" /> {room.capacity}
                              </Badge>
                            )}
                          </div>
                          {room.amenities && <p className="text-xs text-muted-foreground">{room.amenities}</p>}
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-4 gap-1 mb-3">
                            {timeSlots.slice(0, 12).map((slot) => {
                              const booked = isSlotBooked(room.id, slot);
                              return (
                                <div
                                  key={slot}
                                  className={`text-xs text-center py-1 rounded ${
                                    booked ? "bg-destructive/20 text-destructive line-through" : "bg-green-50 text-green-700"
                                  }`}
                                >
                                  {slot}
                                </div>
                              );
                            })}
                          </div>
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setBookingDialog(room);
                              setBookVirtual(room.is_virtual);
                            }}
                          >
                            Book This Room
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                {rooms.filter((r) => r.location_id === loc.id).length === 0 && (
                  <p className="col-span-full text-center py-8 text-muted-foreground text-sm">No rooms configured for this location</p>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <DoorOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No office locations configured yet</p>
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={!!bookingDialog} onOpenChange={() => setBookingDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book {bookingDialog?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
            <Input placeholder="Meeting title" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Time</label>
                <Select value={bookStart} onValueChange={setBookStart}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{timeSlots.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">End Time</label>
                <Select value={bookEnd} onValueChange={setBookEnd}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{timeSlots.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleBook} className="w-full">Confirm Booking</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomBooking;
