import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, LogOut, Menu, UserRound, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useDemoPreview } from "@/lib/demo-preview";
import { getRoleNavigation } from "@/lib/role-navigation";

const TABS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/advisor", label: "Mentor Management" },
  { to: "/mentors", label: "Find a Mentor" },
  { to: "/matches", label: "My Matches" },
  { to: "/resources", label: "Resource Hub" },
  { to: "/admin", label: "Admin Portal" },
] as const;

export function Crest({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 46" className={className} aria-hidden>
      <path d="M20 1 L38 7 V22 C38 34 30 41 20 45 C10 41 2 34 2 22 V7 Z" className="fill-accent" />
      <path d="M20 4 L35 9 V22 C35 32 28 38 20 41.5 C12 38 5 32 5 22 V9 Z" className="fill-primary-deep" />
      <path d="M11 17 L20 13 L29 17 L20 21 Z" className="fill-accent" />
      <path d="M14 20 V26 C17 28 23 28 26 26 V20 L20 23 Z" className="fill-primary-foreground" />
      <circle cx="20" cy="33" r="2" className="fill-accent" />
    </svg>
  );
}

export function SiteHeader() {
  const { role: demoRole, setRole, guestProfile } = useDemoPreview();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const roleLabel = demoRole
    ? ({ mentee: "First-Year Student · Demo", advisor: "Senior Mentor · Demo", administrator: "Administrator · Demo" })[demoRole]
    : "Guest · Preview";
  const name = demoRole === "advisor"
    ? "Ama Owusu"
    : demoRole === "administrator"
      ? "HESA Staff"
      : guestProfile.full_name;
  const allowedPaths = getRoleNavigation(demoRole);
  const tabs = TABS.filter((tab) => allowedPaths.includes(tab.to));

  return (
    <header className="sticky top-0 z-40 bg-gradient-navy text-primary-foreground shadow-lift">
      <div className="border-b border-primary-foreground/10 bg-primary-deep/60 text-[11px] tracking-[0.18em] uppercase">
        <div className="mx-auto flex max-w-7xl justify-between px-4 py-1.5 sm:px-6">
          <span className="opacity-80">Division of Student Affairs · Office of First-Year Experience</span>
          <span className="hidden opacity-60 sm:inline">Fall Semester 2026</span>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <Crest />
          <div className="leading-tight">
            <div className="font-display text-lg">Fred Campus Connect</div>
            <div className="text-xs text-primary-foreground/70">Peer Mentorship Network</div>
          </div>
        </Link>
        <nav className="ml-4 hidden flex-1 items-center gap-1 lg:flex">
          {tabs.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              activeOptions={{ exact: true }}
              className="relative rounded-md px-3 py-2 text-sm text-primary-foreground/75 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground data-[status=active]:text-primary-foreground data-[status=active]:after:absolute data-[status=active]:after:inset-x-3 data-[status=active]:after:-bottom-[13px] data-[status=active]:after:h-[3px] data-[status=active]:after:rounded-full data-[status=active]:after:bg-accent"
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-primary-foreground/20 py-1 pl-1 pr-3 text-left transition hover:bg-primary-foreground/10">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                {(name ?? "G").slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden text-xs leading-tight sm:block">
                <span className="block max-w-36 truncate font-medium">{name}</span>
                <span className="block text-primary-foreground/65">Role: {roleLabel}</span>
              </span>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>
                <div className="text-sm">{name}</div>
                <div className="text-xs font-normal text-muted-foreground">Role: {roleLabel}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setRole(null); navigate({ to: "/" }); }}>
                <LogOut className="mr-2 h-4 w-4" /> Return to role selection
              </DropdownMenuItem>
              {demoRole !== "administrator" && (
                <DropdownMenuItem onClick={() => navigate({ to: "/matches" })}>
                  <UserRound className="mr-2 h-4 w-4" /> Matching profile
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-primary-foreground/10 hover:text-primary-foreground"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open && (
        <nav className="grid gap-1 border-t border-primary-foreground/10 px-4 py-3 lg:hidden">
          {tabs.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: true }}
              className="rounded-md px-3 py-2 text-sm data-[status=active]:bg-primary-foreground/10 data-[status=active]:text-accent"
            >
              {t.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
