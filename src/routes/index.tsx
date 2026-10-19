import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, HeartHandshake, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Crest } from "@/components/site-header";
import { DEMO_DESTINATIONS, useDemoPreview, type DemoRole } from "@/lib/demo-preview";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Student Affairs Portal · Fred University" },
      { name: "description", content: "Welcome to Fred University's Peer Mentorship Network. Preview the student, peer advisor, or HESA administrator portal." },
      { property: "og:title", content: "Fred University · Student Affairs Portal" },
      { property: "og:description", content: "Your university transition and peer advising journey starts here." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WelcomePage,
});

const roles = [
  { role: "mentee", label: "Sign in as First Year Mentee", icon: GraduationCap, variant: "default" },
  { role: "advisor", label: "Sign in as Senior Peer Advisor", icon: HeartHandshake, variant: "advisor" },
  { role: "administrator", label: "Sign in as HESA Administrator", icon: ShieldCheck, variant: "administrator" },
] as const;

function WelcomePage() {
  const navigate = useNavigate();
  const { setRole } = useDemoPreview();
  function enter(role: DemoRole) {
    setRole(role);
    navigate({ to: DEMO_DESTINATIONS[role] });
  }
  return (
    <div className="portal-entry flex min-h-svh flex-col bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Division of Student Affairs
      </div>
      <div className="flex flex-1 items-center justify-center py-8">
        <section className="animate-rise w-full max-w-lg overflow-hidden rounded-lg border bg-card shadow-lift" aria-labelledby="portal-title">
          <div className="h-1.5 bg-primary" />
          <div className="px-5 py-8 sm:px-10 sm:py-10">
            <div className="flex flex-col items-center text-center">
              <Crest className="h-20 w-20" />
              <p className="mt-4 font-display text-2xl text-primary">Fred University</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Peer Mentorship Network</p>
              <div className="my-6 h-px w-12 bg-accent" />
              <h1 id="portal-title" className="font-display text-2xl text-primary sm:text-3xl">Student Affairs Portal</h1>
              <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">Access your transition and advising dashboard — no account or password required.</p>
            </div>
            <div className="mt-8 space-y-3">
              {roles.map(({ role, label, icon: Icon, variant }) => (
                <Button key={role} variant={variant} onClick={() => enter(role)} className="h-auto min-h-14 w-full justify-start gap-3 whitespace-normal px-4 py-4 text-left leading-5">
                  <Icon className="size-5" />
                  <span className="flex-1">{label}</span>
                  <ArrowRight className="size-4" />
                </Button>
              ))}
            </div>
            <p className="mt-5 text-center text-xs leading-5 text-muted-foreground"><span className="font-semibold text-foreground">Demo Mode:</span> Click any role above to instantly preview the portal.</p>
          </div>
        </section>
      </div>
      <footer className="text-center text-xs leading-5 text-muted-foreground">Fred University · Office of First-Year Experience</footer>
    </div>
  );
}