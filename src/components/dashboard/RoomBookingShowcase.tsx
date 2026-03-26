import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DoorOpen, MapPin } from "lucide-react";
import { demoOffices } from "@/data/demoPortalContent";
import { toast } from "@/hooks/use-toast";

const slots = ["9:00", "10:00", "11:00", "12:00", "1:00", "2:00", "3:00", "4:00"];

export default function RoomBookingShowcase() {
  const [tab, setTab] = useState(demoOffices[0].id);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <DoorOpen className="h-7 w-7 text-primary" />
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Office locations &amp; room booking</h2>
          <p className="text-sm text-muted-foreground">Sample Mississauga &amp; Brampton — maps &amp; room grid for review</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-6 h-auto flex-wrap gap-1 bg-muted/50 p-1">
          {demoOffices.map((o) => (
            <TabsTrigger key={o.id} value={o.id} className="gap-2">
              <MapPin className="h-3.5 w-3.5" />
              {o.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {demoOffices.map((o) => (
          <TabsContent key={o.id} value={o.id}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
              <Card className="overflow-hidden border-border/80 shadow-sm">
                <div className="aspect-[4/3] overflow-hidden">
                  <iframe
                    title={`Map ${o.name}`}
                    className="h-full min-h-[200px] w-full border-0"
                    loading="lazy"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(o.mapQuery)}&output=embed`}
                  />
                </div>
                <CardContent className="space-y-2 pt-4 text-sm">
                  <p className="font-display text-lg font-semibold">{o.name}</p>
                  <p className="whitespace-pre-line text-muted-foreground">{o.address}</p>
                  <a href={`tel:${o.phone.replace(/\D/g, "")}`} className="text-lg font-bold text-primary hover:underline">
                    {o.phone}
                  </a>
                  <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {o.hours.map((h) => (
                      <p key={h}>{h}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="border-border/80 shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-display text-base">Boardroom A (sample)</CardTitle>
                    <span className="text-xs text-muted-foreground">Capacity 10 · Projector · VC · Whiteboard</span>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Today&apos;s slots (demo)
                    </p>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-4">
                      {slots.map((s, i) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() =>
                            i === 1 || i === 6
                              ? undefined
                              : toast({ title: `Booked ${s}`, description: "Demo — connect booking API for production." })
                          }
                          className={`rounded-md py-2 text-[10px] font-semibold ${
                            i === 1 || i === 6
                              ? "cursor-not-allowed bg-destructive/15 text-destructive line-through"
                              : i === 4
                                ? "bg-blue-100 text-blue-900 dark:bg-blue-950/50 dark:text-blue-100"
                                : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-100"
                          }`}
                        >
                          {s}
                          {i === 4 ? " ✓" : ""}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/80 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="font-display text-base">Meeting Room B</CardTitle>
                    <Badge variant="secondary">Available</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-xs text-muted-foreground">Capacity 4 · Zoom-ready · TV</p>
                    <div className="grid grid-cols-4 gap-2">
                      {slots.map((s) => (
                        <button
                          key={`b-${s}`}
                          type="button"
                          className="rounded-md bg-emerald-100 py-2 text-[10px] font-semibold text-emerald-900 hover:bg-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-100"
                          onClick={() => toast({ title: "Room B", description: `${s} — demo booking` })}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
