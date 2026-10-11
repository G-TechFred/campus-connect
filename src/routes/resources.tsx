import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RESOURCES } from "@/lib/mentorship-data";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resource Hub · Meridian Peer Mentorship Network" },
      { name: "description", content: "Academic, wellbeing, financial and belonging resources for first-year students." },
      { property: "og:title", content: "First-Year Resource Hub" },
      { property: "og:description", content: "Every campus support office for first-year students in one place." },
    ],
  }),
  component: Resources,
});

function Resources() {
  const cats = ["All", ...new Set(RESOURCES.map((r) => r.cat))];
  const [cat, setCat] = useState("All");
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Campus Support</p>
        <h1 className="font-display text-3xl text-primary">Resource Hub</h1>
      </header>
      <div className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-4 py-1.5 text-sm transition ${cat === c ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/40"}`}>{c}</button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {RESOURCES.filter((r) => cat === "All" || r.cat === cat).map((r) => (
          <article key={r.title} className="animate-rise flex flex-col rounded-xl border bg-card p-5 shadow-card transition hover:shadow-lift">
            <Badge variant="secondary" className="w-fit bg-teal-soft text-teal">{r.cat}</Badge>
            <h3 className="mt-3 font-semibold">{r.title}</h3>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{r.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">Learn more <ExternalLink className="h-3.5 w-3.5" /></span>
          </article>
        ))}
      </div>
    </div>
  );
}
