import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import type { MatchBreakdown as B, Mentor } from "@/lib/mentorship-data";

export function MatchBreakdownDialog({ mentor, score, breakdown, children }: { mentor: Mentor; score: number; breakdown: B[]; children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Match breakdown · {mentor.name}</DialogTitle>
          <DialogDescription>
            Overall compatibility <span className="font-semibold text-primary">{score}%</span>. Scores weigh academic fit
            and shared lived experience, which research links to stronger belonging in the first year.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {breakdown.map((b) => (
            <div key={b.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium">{b.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {b.points}/{b.max}
                </span>
              </div>
              <Progress value={(b.points / b.max) * 100} className="h-2" />
              <p className="mt-1 text-xs text-muted-foreground">{b.detail}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
