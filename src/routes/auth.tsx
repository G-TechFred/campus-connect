import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Crest } from "@/components/site-header";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Portal Access · Fred Campus Connect" },
      { name: "description", content: "Choose your role and continue to the Fred Campus Connect demo portal." },
    ],
  }),
  component: PortalAccess,
});

function PortalAccess() {
  return (
    <section className="mx-auto max-w-lg space-y-5 rounded-2xl border bg-card p-8 text-center shadow-card">
      <Crest className="mx-auto h-16 w-16" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">Fred Campus Connect</p>
        <h1 className="mt-2 font-display text-2xl text-primary">Role-based portal access</h1>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">Sign-in and account creation are simulated in this client-only preview. No password is verified, stored, or sent.</p>
      <Button asChild className="w-full"><Link to="/"><KeyRound className="mr-2 h-4 w-4" />Choose a role to continue</Link></Button>
      <Button asChild variant="ghost" className="w-full"><Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Return to welcome page</Link></Button>
    </section>
  );
}
