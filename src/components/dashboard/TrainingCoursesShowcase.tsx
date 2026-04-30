import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GraduationCap, Award } from "lucide-react";
import { demoNewCourses, demoCompletedCourses } from "@/data/demoPortalContent";
import remaxLogo from "@/assets/remax-excellence-logo.png";
import { toast } from "@/hooks/use-toast";
import CertificateShareActions from "@/components/dashboard/CertificateShareActions";

interface Props {
  agentName?: string | null;
  recoNumber?: string | null;
}

export default function TrainingCoursesShowcase({ agentName, recoNumber }: Props) {
  const [certTitle, setCertTitle] = useState<string | null>(null);

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-3">
        <GraduationCap className="h-8 w-8 text-primary" />
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Training &amp; courses
          </h2>
          <p className="text-sm text-muted-foreground">
            Sample curriculum — imagery and copy for client feedback
          </p>
        </div>
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-semibold">New &amp; active</h3>
            <Badge className="bg-destructive text-destructive-foreground">New</Badge>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="#courses">Browse all</a>
          </Button>
        </div>
        <ScrollArea className="w-full pb-4">
          <div className="flex gap-4 pb-1">
            {demoNewCourses.map((c) => (
              <Card
                key={c.id}
                className="group min-w-[240px] max-w-[260px] shrink-0 snap-start overflow-hidden border-border/80 bg-card/90 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-32 overflow-hidden">
                  <img src={c.thumb} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 text-2xl drop-shadow-md">{c.thumbEmoji}</span>
                </div>
                <CardContent className="space-y-2 pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{c.provider}</p>
                  <p className="line-clamp-2 font-semibold leading-snug text-foreground">{c.title}</p>
                  <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{c.description}</p>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    {c.price === "free" ? (
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                        FREE
                      </span>
                    ) : (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800 dark:bg-red-950/50 dark:text-red-200">
                        {c.priceLabel}
                      </span>
                    )}
                    <Badge variant="secondary" className="text-[10px]">
                      {c.pct}%
                    </Badge>
                  </div>
                  <Progress value={c.pct} className="h-1" />
                  <Button size="sm" className="w-full" variant={c.pct > 0 ? "default" : "outline"}>
                    {c.pct > 0 ? "Continue" : "Enroll now"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h3 className="font-display text-lg font-semibold">Completed</h3>
          <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Certified ✓</Badge>
        </div>
        <ScrollArea className="w-full pb-4">
          <div className="flex gap-4 pb-1">
            {demoCompletedCourses.map((c) => (
              <Card
                key={c.id}
                className="min-w-[240px] max-w-[260px] shrink-0 snap-start overflow-hidden border-border/80 bg-card/90 shadow-sm transition hover:shadow-md"
              >
                <div className="relative h-28 overflow-hidden">
                  <img src={c.thumb} alt="" className="h-full w-full object-cover" />
                </div>
                <CardContent className="space-y-2 pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{c.provider}</p>
                  <p className="line-clamp-2 font-semibold text-foreground">{c.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Completed: {c.completed} · Score: {c.score}
                  </p>
                  <Progress value={100} className="h-1 bg-muted" />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                    onClick={() => setCertTitle(c.title)}
                  >
                    <Award className="mr-1 h-3.5 w-3.5" /> View certificate
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <Dialog open={!!certTitle} onOpenChange={() => setCertTitle(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Certificate of completion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 rounded-xl border-2 border-amber-500/40 bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] p-6 text-center text-white">
            <img src={remaxLogo} alt="" className="mx-auto h-8 object-contain brightness-0 invert" />
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Certificate of completion</p>
            <p className="font-display text-xl font-bold">{agentName || "Agent"}</p>
            <p className="text-xs text-white/50">RECO# {recoNumber || "—"}</p>
            <p className="text-sm text-amber-400/95">{certTitle}</p>
            <p className="text-[11px] text-white/45">REMAX Excellence Canada · {new Date().getFullYear()}</p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Share your achievement</p>
            <CertificateShareActions
              agentName={agentName || "Agent"}
              reco={recoNumber || "—"}
              courseTitle={certTitle || "Course"}
            />
            <Button
              className="w-full"
              variant="outline"
              onClick={() => {
                window.print();
                toast({ title: "Print dialog", description: "Save as PDF from the print dialog." });
              }}
            >
              Print / save as PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
