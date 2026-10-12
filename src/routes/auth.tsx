import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { GraduationCap, HeartHandshake } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crest } from "@/components/site-header";
import { COLLEGES } from "@/lib/mentorship-data";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · Meridian Peer Mentorship Network" },
      { name: "description", content: "Register as a first-year mentee or peer advisor." },
      { property: "og:title", content: "Join the Meridian Peer Mentorship Network" },
      { property: "og:description", content: "Register as a first-year mentee or a peer advisor." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState<"mentee" | "mentor">("mentee");
  const [college, setCollege] = useState<string>(COLLEGES[0]!);

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: String(f.get("email")), password: String(f.get("password")) });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Welcome back!");
    navigate({ to: "/" });
  }

  async function signUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: String(f.get("email")),
      password: String(f.get("password")),
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: String(f.get("name")), account_type: role, college, major: String(f.get("major")) },
      },
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    if (data.session) navigate({ to: "/matches" });
    else toast.success("Check your inbox to confirm your university email, then sign in.");
  }

  return (
    <div className="mx-auto grid max-w-4xl overflow-hidden rounded-2xl border bg-card shadow-lift md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-navy p-8 text-primary-foreground md:flex">
        <Crest className="h-14 w-14" />
        <div>
          <h1 className="font-display text-3xl">Every first-year deserves a guide.</h1>
          <p className="mt-3 text-primary-foreground/75">Join 1,200+ students in the Meridian Peer Mentorship Network.</p>
        </div>
        <p className="text-xs text-primary-foreground/60">Office of First-Year Experience</p>
      </div>
      <div className="p-6 sm:p-8">
        <Tabs defaultValue="up">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="up">Register</TabsTrigger>
            <TabsTrigger value="in">Sign in</TabsTrigger>
          </TabsList>
          <TabsContent value="up">
            <form onSubmit={signUp} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {([
                  { v: "mentee", label: "First-Year Mentee", icon: GraduationCap },
                  { v: "mentor", label: "Peer Advisor", icon: HeartHandshake },
                ] as const).map((o) => (
                  <button
                    type="button"
                    key={o.v}
                    onClick={() => setRole(o.v)}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition ${role === o.v ? "border-accent bg-accent-soft font-semibold text-primary" : "hover:border-accent/50"}`}
                  >
                    <o.icon className="h-6 w-6" />
                    {o.label}
                  </button>
                ))}
              </div>
              <div className="space-y-1.5"><Label>Full name</Label><Input name="name" required /></div>
              <div className="space-y-1.5"><Label>University email</Label><Input name="email" type="email" required /></div>
              <div className="space-y-1.5"><Label>Password</Label><Input name="password" type="password" minLength={6} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>College</Label>
                  <Select value={college} onValueChange={setCollege}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{COLLEGES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Major</Label><Input name="major" placeholder="Business Administration" required /></div>
              </div>
              <Button className="w-full" disabled={busy}>Create {role === "mentor" ? "advisor" : "mentee"} account</Button>
            </form>
          </TabsContent>
          <TabsContent value="in">
            <form onSubmit={signIn} className="mt-4 space-y-4">
              <div className="space-y-1.5"><Label>University email</Label><Input name="email" type="email" required /></div>
              <div className="space-y-1.5"><Label>Password</Label><Input name="password" type="password" required /></div>
              <Button className="w-full" disabled={busy}>Sign in</Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
