import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GraduationCap, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Crest } from "@/components/site-header";
import { useDemoPreview } from "@/lib/demo-preview";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Enter the Portal · Fred University" },
    { name: "description", content: "Enter Fred University's mentee or peer advisor portal without an account or password." },
    { property: "og:title", content: "Fred University · Enter the Portal" },
    { property: "og:description", content: "Access mentor matching and advising without signing in." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: PortalAccess,
});

function PortalAccess() {
  const navigate = useNavigate();
  const { setRole } = useDemoPreview();
  return <section className="mx-auto max-w-lg space-y-6 rounded-lg border bg-card p-8 text-center shadow-card">
    <Crest className="mx-auto h-16 w-16" />
    <h1 className="font-display text-2xl text-primary">Enter the Student Affairs Portal</h1>
    <p className="text-sm text-muted-foreground">No account or password required.</p>
    <div className="space-y-3">
      <Button className="h-auto min-h-14 w-full whitespace-normal" onClick={() => { setRole("mentee"); navigate({ to: "/dashboard" }); }}><GraduationCap />Continue as First Year Mentee</Button>
      <Button variant="advisor" className="h-auto min-h-14 w-full whitespace-normal" onClick={() => { setRole("advisor"); navigate({ to: "/advisor" }); }}><HeartHandshake />Continue as Senior Peer Advisor</Button>
    </div>
  </section>;
}
