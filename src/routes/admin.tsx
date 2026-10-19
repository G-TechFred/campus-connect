import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SAMPLE_MENTORS } from "@/lib/mentorship-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal · Fred Peer Mentorship Network" },
      { name: "description", content: "Program overview for HESA staff: match rates, advisor capacity and retention indicators." },
      { property: "og:title", content: "Mentorship Program Admin Portal" },
      { property: "og:description", content: "Program-level metrics for student affairs staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Admin,
});

const STATS = [
  { label: "Mentees enrolled", value: "1,248" },
  { label: "Active peer advisors", value: "186" },
  { label: "Match rate", value: "92%" },
  { label: "Fall-to-spring persistence", value: "+7.4 pts" },
];

function Admin() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Staff View</p>
          <h1 className="font-display text-3xl text-primary">Admin Portal</h1>
        </div>
        <Badge variant="outline">Sample program data</Badge>
      </header>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-5 shadow-card">
            <div className="text-3xl font-bold text-primary">{s.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="font-display text-xl text-primary">Advisor capacity</h2>
        <Table className="mt-3">
          <TableHeader>
            <TableRow><TableHead>Advisor</TableHead><TableHead>College</TableHead><TableHead>Focus</TableHead><TableHead className="w-48">Load</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {SAMPLE_MENTORS.map((m, i) => {
              const load = Math.min(m.capacity, (i % 3) + 1);
              return (
                <TableRow key={m.key}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="text-muted-foreground">{m.college}</TableCell>
                  <TableCell>{m.backgrounds[0]}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2"><Progress value={(load / m.capacity) * 100} className="h-2" /><span className="text-xs tabular-nums">{load}/{m.capacity}</span></div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
