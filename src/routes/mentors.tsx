import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MentorCard } from "@/components/mentor-card";
import { useRankedMentors } from "@/lib/use-mentorship";
import { BACKGROUNDS, COLLEGES } from "@/lib/mentorship-data";

export const Route = createFileRoute("/mentors")({
  head: () => ({
    meta: [
      { title: "Find a Mentor · Meridian Peer Mentorship Network" },
      { name: "description", content: "Browse peer advisors by college, major, language and lived background." },
      { property: "og:title", content: "Find a Peer Mentor" },
      { property: "og:description", content: "Filter peer advisors by college, major, languages and background." },
    ],
  }),
  component: MentorsPage,
});

const ALL = "all";

function MentorsPage() {
  const { ranked, isLoading } = useRankedMentors();
  const [q, setQ] = useState("");
  const [college, setCollege] = useState(ALL);
  const [major, setMajor] = useState(ALL);
  const [lang, setLang] = useState(ALL);
  const [bgs, setBgs] = useState<string[]>([]);

  const majors = useMemo(() => [...new Set(ranked.map((r) => r.mentor.major))].sort(), [ranked]);
  const langs = useMemo(() => [...new Set(ranked.flatMap((r) => r.mentor.languages))].sort(), [ranked]);

  const list = ranked.filter(({ mentor: m }) =>
    (college === ALL || m.college === college) &&
    (major === ALL || m.major === major) &&
    (lang === ALL || m.languages.includes(lang)) &&
    bgs.every((b) => m.backgrounds.includes(b)) &&
    (!q || `${m.name} ${m.bio} ${m.interests.join(" ")}`.toLowerCase().includes(q.toLowerCase())),
  );
  const reset = () => { setQ(""); setCollege(ALL); setMajor(ALL); setLang(ALL); setBgs([]); };

  const Pick = ({ value, set, items, label }: { value: string; set: (v: string) => void; items: string[]; label: string }) => (
    <Select value={value} onValueChange={set}>
      <SelectTrigger className="bg-card"><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All {label.toLowerCase()}</SelectItem>
        {items.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Peer Advisor Directory</p>
        <h1 className="font-display text-3xl text-primary">Find a Mentor</h1>
        <p className="mt-1 text-muted-foreground">Sorted by compatibility with your profile.</p>
      </header>

      <div className="rounded-xl border bg-card p-4 shadow-card">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, interest or keyword" className="pl-9" />
          </div>
          <Pick value={college} set={setCollege} items={COLLEGES} label="Colleges" />
          <Pick value={major} set={setMajor} items={majors} label="Majors" />
          <Pick value={lang} set={setLang} items={langs} label="Languages" />
          <Button variant="ghost" onClick={reset}><X className="h-4 w-4" /> Clear filters</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {BACKGROUNDS.map((b) => {
            const on = bgs.includes(b);
            return (
              <button
                key={b}
                onClick={() => setBgs(on ? bgs.filter((x) => x !== b) : [...bgs, b])}
                className={`rounded-full border px-3 py-1 text-xs transition ${on ? "border-accent bg-accent text-accent-foreground" : "bg-card hover:border-accent/60"}`}
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{isLoading ? "Loading advisors…" : `${list.length} peer advisors`}</p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((r) => <MentorCard key={r.mentor.key} {...r} />)}
      </div>
      {!isLoading && list.length === 0 && (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">No advisors match these filters.</div>
      )}
    </div>
  );
}
