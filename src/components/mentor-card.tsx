import { Languages, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MatchBreakdownDialog } from "./match-breakdown";
import type { MatchBreakdown, Mentor } from "@/lib/mentorship-data";
import { useConnections, useRequestConnection } from "@/lib/use-mentorship";

export function Avatar({ initials, className = "h-12 w-12 text-sm" }: { initials: string; className?: string }) {
  return (
    <div className={`grid shrink-0 place-items-center rounded-full bg-gradient-navy font-semibold text-primary-foreground ring-2 ring-accent/60 ring-offset-2 ring-offset-card ${className}`}>
      {initials}
    </div>
  );
}

export function MentorCard({ mentor, score, breakdown }: { mentor: Mentor; score: number; breakdown: MatchBreakdown[] }) {
  const req = useRequestConnection();
  const { data: conns } = useConnections();
  const requested = conns?.some((c) => c.mentor_key === mentor.key);
  return (
    <article className="animate-rise flex flex-col rounded-xl border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start gap-3">
        <Avatar initials={mentor.initials} />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">{mentor.name}</h3>
          <p className="text-xs text-muted-foreground">
            {mentor.year} · {mentor.major}
          </p>
          <p className="text-xs text-muted-foreground">{mentor.college}</p>
        </div>
        <div className="rounded-lg bg-accent-soft px-2 py-1 text-center">
          <div className="text-lg font-bold leading-none text-accent">{score}%</div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">match</div>
        </div>
      </div>
      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{mentor.bio}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {mentor.backgrounds.map((b) => (
          <Badge key={b} variant="secondary" className="bg-teal-soft text-teal">
            {b}
          </Badge>
        ))}
        {mentor.id && <Badge className="bg-accent text-accent-foreground">Registered</Badge>}
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Languages className="h-3.5 w-3.5" /> {mentor.languages.join(" · ")}
      </p>
      <div className="mt-auto flex gap-2 pt-4">
        <MatchBreakdownDialog mentor={mentor} score={score} breakdown={breakdown}>
          <Button variant="outline" size="sm" className="flex-1">
            <Sparkles className="h-4 w-4" /> Breakdown
          </Button>
        </MatchBreakdownDialog>
        <Button size="sm" className="flex-1" disabled={requested || req.isPending} onClick={() => req.request(mentor, score)}>
          {requested ? "Requested" : "Request"}
        </Button>
      </div>
    </article>
  );
}
