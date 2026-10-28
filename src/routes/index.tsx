import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap, HeartHandshake, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Crest } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DEMO_DESTINATIONS, useDemoPreview } from "@/lib/demo-preview";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Student Affairs Portal · Fred Campus Connect" },
      { name: "description", content: "Welcome to Fred Campus Connect's Peer Mentorship Network. Preview the student, peer advisor, or HESA administrator portal." },
      { property: "og:title", content: "Fred Campus Connect · Student Affairs Portal" },
      { property: "og:description", content: "Your university transition and peer advising journey starts here." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WelcomePage,
});

const roles = [
  { role: "mentee", label: "First-Year Mentee", email: "mentee@freduniversity.edu", icon: GraduationCap, variant: "default", accent: "text-primary", iconStyle: "bg-primary/10 text-primary", notice: "Student workspace: mentor matching, transition milestones, and campus resources." },
  { role: "advisor", label: "Senior Peer Advisor", email: "advisor@freduniversity.edu", icon: HeartHandshake, variant: "advisor", accent: "text-teal", iconStyle: "bg-teal-soft text-teal", notice: "Advisor workspace: mentee requests, assigned students, check-ins, and session notes." },
  { role: "administrator", label: "HESA Administrator", email: "admin@freduniversity.edu", icon: ShieldCheck, variant: "administrator", accent: "text-accent", iconStyle: "bg-accent-soft text-accent", notice: "Program workspace: aggregate metrics, advisor capacity, resources, and settings." },
] as const;

type AuthView = "sign-in" | "create-account" | "forgot-password";

export function WelcomePage() {
  const navigate = useNavigate();
  const { setRole } = useDemoPreview();
  const [selectedRole, setSelectedRole] = useState<(typeof roles)[number] | null>(null);
  const [authView, setAuthView] = useState<AuthView>("sign-in");
  const [rememberRole, setRememberRole] = useState(true);
  const [recoverySent, setRecoverySent] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const currentRole = selectedRole ?? roles[0]!;
  const RoleIcon = currentRole.icon;

  function chooseRole(role: (typeof roles)[number]) {
    setSelectedRole(role);
    setAuthView("sign-in");
    setRecoverySent(false);
    setSignInEmail("");
    setSignInPassword("");
  }

  function enterDashboard(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setRole(currentRole.role, rememberRole);
    navigate({ to: DEMO_DESTINATIONS[currentRole.role] });
  }

  function reviewerQuickLogin() {
    setSignInEmail(currentRole.email);
    setSignInPassword("Demopassword");
    setRole(currentRole.role, rememberRole);
    navigate({ to: DEMO_DESTINATIONS[currentRole.role] });
  }

  function submitRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRecoverySent(true);
  }

  function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmPassword") ?? "");
    if (password.length < 8 || password.length > 15) {
      toast.error("Password must be between 8 and 15 characters.");
      return;
    }
    if (password !== confirmation) {
      toast.error("The passwords do not match.");
      return;
    }
    toast.success("Demo profile ready. No account or password was saved.");
    enterDashboard();
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
              <p className="mt-4 font-display text-2xl text-primary">Fred Campus Connect</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Peer Mentorship Network</p>
              <div className="my-6 h-px w-12 bg-accent" />
              <h1 id="portal-title" className="font-display text-2xl text-primary sm:text-3xl">Student Affairs Portal</h1>
              <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">Select your role to continue to your campus workspace.</p>
            </div>
            <div className="mt-7 space-y-3">
              {roles.map(({ role, label, icon: Icon, variant }) => (
                <Button
                  key={role}
                  variant={variant}
                  onClick={() => chooseRole(roles.find((item) => item.role === role)!)}
                  className="h-auto min-h-14 w-full justify-start gap-3 whitespace-normal px-4 py-3 text-left leading-5"
                >
                  <Icon className="size-5 shrink-0" />
                  <span className="flex-1">Sign in as {label}</span>
                  <ArrowRight className="size-4 shrink-0" />
                </Button>
              ))}
            </div>
            <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
              Demo Mode: Choose a role to instantly preview its dashboard.
            </p>
          </div>
        </section>
      </div>
      <footer className="text-center text-xs leading-5 text-muted-foreground">Fred Campus Connect · Office of First-Year Experience</footer>

      <Dialog open={!!selectedRole} onOpenChange={(open) => { if (!open) setSelectedRole(null); }}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          <div className={`-mx-6 -mt-6 flex items-center gap-3 border-b px-6 py-5 ${currentRole.iconStyle}`}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-background/80"><RoleIcon className="h-5 w-5" /></span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider">Fred Campus Connect</p>
              <p className="font-display text-lg">{currentRole.label} Portal</p>
            </div>
          </div>
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-xl text-primary">
              {authView === "sign-in" ? "Sign in to your workspace" : authView === "create-account" ? "Create your demo profile" : "Reset your password"}
            </DialogTitle>
            <DialogDescription>
              {authView === "sign-in"
                ? "Enter any details to continue to your role dashboard."
                : authView === "create-account"
                  ? "Set up a profile preview for your campus role."
                  : "Enter your institutional email to preview account recovery."}
            </DialogDescription>
          </DialogHeader>

          <p className="rounded-lg border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
            {currentRole.notice} This is a local demo: credentials are not verified, stored, or sent.
          </p>

          {authView !== "forgot-password" && currentRole.role !== "administrator" && (
            <div className="grid grid-cols-2 rounded-lg bg-muted p-1" role="tablist" aria-label="Authentication options">
              <button type="button" role="tab" aria-selected={authView === "sign-in"} onClick={() => setAuthView("sign-in")} className={`rounded-md px-3 py-2 text-sm font-medium ${authView === "sign-in" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>Sign In</button>
              <button type="button" role="tab" aria-selected={authView === "create-account"} onClick={() => setAuthView("create-account")} className={`rounded-md px-3 py-2 text-sm font-medium ${authView === "create-account" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>Create Account</button>
            </div>
          )}

          {authView === "sign-in" && (
            <form onSubmit={enterDashboard} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Institutional email</Label>
                <Input id="signin-email" name="email" type="text" inputMode="email" autoComplete="email" placeholder="name@university.edu" value={signInEmail} onChange={(event) => setSignInEmail(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input id="signin-password" name="password" type="password" autoComplete="current-password" value={signInPassword} onChange={(event) => setSignInPassword(event.target.value)} />
                <p className="text-xs text-muted-foreground">Password must be between 8 and 15 characters.</p>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <Checkbox checked={rememberRole} onCheckedChange={(checked) => setRememberRole(checked === true)} />
                Remember this demo role on this device
              </label>
              <button type="button" onClick={() => { setAuthView("forgot-password"); setRecoverySent(false); }} className="text-sm font-medium text-accent hover:underline">Forgot Password?</button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-amber-500/40 bg-amber-50 text-amber-950 shadow-sm hover:border-amber-500/70 hover:bg-amber-100 hover:text-amber-950 dark:border-amber-400/30 dark:bg-amber-950/30 dark:text-amber-100 dark:hover:bg-amber-900/50"
                onClick={reviewerQuickLogin}
              >
                <Zap className="h-4 w-4 fill-current text-amber-500" /> Quick Demo
              </Button>
              <Button type="submit" className="w-full">Continue to {currentRole.label}</Button>
            </form>
          )}

          {authView === "create-account" && (
            <form onSubmit={createAccount} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="register-first-name">First name</Label><Input id="register-first-name" name="firstName" required /></div>
                <div className="space-y-2"><Label htmlFor="register-last-name">Last name</Label><Input id="register-last-name" name="lastName" required /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="register-email">Institutional email</Label><Input id="register-email" name="email" type="email" placeholder="name@university.edu" required /></div>
              {currentRole.role === "mentee" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="register-major">Major or area of study</Label><Input id="register-major" name="major" required /></div>
                  <div className="space-y-2"><Label htmlFor="register-graduation">Expected graduation year</Label><Input id="register-graduation" name="graduationYear" type="number" min="2026" max="2040" required /></div>
                </div>
              )}
              {currentRole.role === "advisor" && (
                <>
                  <div className="space-y-2"><Label htmlFor="register-focus">College focus</Label><Input id="register-focus" name="collegeFocus" required /></div>
                  <div className="space-y-2"><Label htmlFor="register-experience">Previous mentorship experience</Label><Textarea id="register-experience" name="experience" rows={3} required /></div>
                </>
              )}
              {currentRole.role === "administrator" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="register-department">Department code</Label><Input id="register-department" name="departmentCode" required /></div>
                  <div className="space-y-2"><Label htmlFor="register-staff-id">Staff ID</Label><Input id="register-staff-id" name="staffId" required /></div>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="register-password">Password</Label><Input id="register-password" name="password" type="password" minLength={8} maxLength={15} required /><p className="text-xs text-muted-foreground">Password must be between 8 and 15 characters.</p></div>
                <div className="space-y-2"><Label htmlFor="register-confirm-password">Confirm password</Label><Input id="register-confirm-password" name="confirmPassword" type="password" minLength={8} maxLength={15} required /></div>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <Checkbox checked={rememberRole} onCheckedChange={(checked) => setRememberRole(checked === true)} />
                Remember this demo role on this device
              </label>
              <Button type="submit" className="w-full">Create Demo Profile</Button>
            </form>
          )}

          {authView === "forgot-password" && (
            recoverySent ? (
              <div className="space-y-4 rounded-lg border border-teal/20 bg-teal-soft/40 p-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
                  <div><p className="font-medium text-primary">Recovery request received</p><p className="mt-1 text-sm text-muted-foreground">This is a demo only; no reset email was sent.</p></div>
                </div>
                <Button type="button" variant="outline" className="w-full" onClick={() => setAuthView("sign-in")}><ArrowLeft className="mr-2 h-4 w-4" />Back to Sign In</Button>
              </div>
            ) : (
              <form onSubmit={submitRecovery} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="recovery-email">Institutional email</Label><Input id="recovery-email" name="recoveryEmail" type="email" placeholder="name@university.edu" required /></div>
                <Button type="submit" className="w-full">Send Recovery Link</Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setAuthView("sign-in")}><ArrowLeft className="mr-2 h-4 w-4" />Back to Sign In</Button>
              </form>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
