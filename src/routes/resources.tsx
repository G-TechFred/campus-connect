import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Clock, ListChecks, Mail, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RESOURCES, type CampusResource } from "@/lib/mentorship-data";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resource Hub · Fred Peer Mentorship Network" },
      { name: "description", content: "Academic, wellbeing, financial and belonging resources for first-year students." },
      { property: "og:title", content: "First-Year Resource Hub" },
      { property: "og:description", content: "Every campus support office for first-year students in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Resources,
});

function Resources() {
  const cats = ["All", ...new Set(RESOURCES.map((r) => r.cat))];
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<CampusResource | null>(null);
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Campus Support</p>
        <h1 className="font-display text-3xl text-primary">Resource Hub</h1>
        <p className="mt-2 text-sm text-muted-foreground">Select any office to see its location, opening hours, contact details and services.</p>
      </header>
      <div className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-4 py-1.5 text-sm transition ${cat === c ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/40"}`}>{c}</button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {RESOURCES.filter((r) => cat === "All" || r.cat === cat).map((r) => (
          <button key={r.title} onClick={() => setOpen(r)} className="animate-rise flex flex-col rounded-xl border bg-card p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lift">
            <Badge variant="secondary" className="w-fit bg-teal-soft text-teal">{r.cat}</Badge>
            <h3 className="mt-3 font-semibold">{r.title}</h3>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{r.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">View details <ChevronRight className="h-3.5 w-3.5" /></span>
          </button>
        ))}
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent>
          {open && (
            <>
              <DialogHeader>
                <Badge variant="secondary" className="w-fit bg-teal-soft text-teal">{open.cat}</Badge>
                <DialogTitle className="font-display text-xl">{open.title}</DialogTitle>
                <DialogDescription>{open.desc}</DialogDescription>
              </DialogHeader>
              <dl className="space-y-3 border-t pt-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div><dt className="font-medium">Where to find us</dt><dd className="text-muted-foreground">{open.location}</dd></div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div><dt className="font-medium">Opening hours</dt><dd className="text-muted-foreground">{open.hours}</dd></div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div><dt className="font-medium">Contact</dt><dd className="text-muted-foreground">{open.contact}</dd></div>
                </div>
                <div className="flex items-start gap-3">
                  <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <dt className="font-medium">What you can get here</dt>
                    <dd>
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-muted-foreground">
                        {open.services.map((s) => <li key={s}>{s}</li>)}
                      </ul>
                    </dd>
                  </div>
                </div>
              </dl>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
