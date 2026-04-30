import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Headphones, Plus, Calendar, Send } from "lucide-react";
import { demoSupportTickets, demoChatMessages } from "@/data/demoPortalContent";
import SupportResourceCards from "@/components/dashboard/SupportResourceCards";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function SupportChatShowcase() {
  const [active, setActive] = useState(0);
  const [msg, setMsg] = useState("");
  const [bookOpen, setBookOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const ticket = demoSupportTickets[active];
  const titles = [
    "#TKT-1042 — Email signature issue",
    "#TKT-1038 — Caivan social post",
    "#TKT-1031 — Mobile Safari login",
  ];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active]);

  const statusClass = (s: string) => {
    if (s === "open") return "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200";
    if (s === "in-progress") return "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200";
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200";
  };

  return (
    <div>
      <SupportResourceCards />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Headphones className="h-7 w-7 text-primary" />
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Marketing &amp; tech support</h2>
            <p className="text-sm text-muted-foreground">Sample conversation — for feedback on layout &amp; flow</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setBookOpen(true)}>
            <Calendar className="h-4 w-4" /> Book a meeting
          </Button>
          <Button size="sm" className="gap-2" onClick={() => toast({ title: "New ticket", description: "Form opens in production." })}>
            <Plus className="h-4 w-4" /> New ticket
          </Button>
        </div>
      </div>

      <div id="support-tickets" className="scroll-mt-28 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,340px)_1fr]">
        <Card className="overflow-hidden border-border/80 shadow-sm">
          <CardHeader className="border-b border-border py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-base">Your tickets</CardTitle>
              <span className="text-xs text-muted-foreground">3 sample</span>
            </div>
          </CardHeader>
          <CardContent className="max-h-[420px] space-y-0 overflow-y-auto p-0">
            {demoSupportTickets.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(i)}
                className={`w-full border-b border-border px-4 py-3 text-left transition hover:bg-muted/50 ${
                  active === i ? "border-l-2 border-l-primary bg-muted/30" : ""
                }`}
              >
                <p className="font-mono text-[10px] font-bold text-muted-foreground">#{t.shortId}</p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">{t.subject}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className={statusClass(t.status)}>
                    {t.status}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{t.time}</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="flex min-h-[420px] flex-col overflow-hidden border-border/80 shadow-sm">
          <div className="flex items-start justify-between border-b border-border px-4 py-3">
            <div>
              <h3 className="font-display text-base font-semibold">{titles[active]}</h3>
              <p className="text-xs text-muted-foreground">Support · Mike R. · Marketing &amp; tech</p>
            </div>
            <Badge className={statusClass(ticket.status)}>{ticket.status}</Badge>
          </div>
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            {demoChatMessages.map((m) => (
              <div
                key={m.id}
                className={`flex items-end gap-2 ${m.from === "agent" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                    m.from === "agent" ? "bg-destructive" : "bg-primary"
                  }`}
                >
                  {m.initials}
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.from === "agent"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground"
                  }`}
                >
                  {m.text}
                  <p className={`mt-1 text-[10px] ${m.from === "agent" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {m.time}
                  </p>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="flex gap-2 border-t border-border p-3">
            <Input
              placeholder="Type a message (demo)..."
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setMsg("");
                  toast({ title: "Demo mode", description: "Live chat connects to your helpdesk in production." });
                }
              }}
            />
            <Button size="icon" variant="secondary">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-border/80 bg-muted/20 p-4 sm:flex-row sm:items-center">
        <span className="text-2xl">📅</span>
        <div className="flex-1 text-sm">
          <p className="font-semibold text-foreground">Need a deeper conversation?</p>
          <p className="text-muted-foreground">Book a 30-minute video call — sample CTA for stakeholder review.</p>
        </div>
        <Button onClick={() => setBookOpen(true)}>Book a meeting</Button>
      </div>

      <Dialog open={bookOpen} onOpenChange={setBookOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book a meeting (demo)</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Embed Calendly, Microsoft Bookings, or your scheduling tool here.
          </p>
          <Button className="w-full" onClick={() => { setBookOpen(false); toast({ title: "Slot selected (demo)" }); }}>
            Continue
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
