import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  role: null as "mentee" | "advisor" | "administrator" | null,
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (_options: unknown) => ({}),
  Link: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/lib/demo-preview", () => ({
  useDemoPreview: () => ({
    role: mocks.role,
    guestProfile: { full_name: "Kwame Mensah" },
    connections: [],
    updateConnection: vi.fn(),
  }),
}));

vi.mock("@/lib/use-mentorship", () => ({
  useConnections: () => ({ data: [] }),
  useRankedMentors: () => ({ ranked: [] }),
  useRequestConnection: () => ({ request: vi.fn(), isPending: false }),
}));

vi.mock("@/routes/admin", () => ({
  Admin: () => <div>Administrator analytics workspace</div>,
}));

vi.mock("@/routes/advisor", () => ({
  AdvisorPreview: () => <div>Peer advisor caseload workspace</div>,
}));

import { Dashboard } from "@/routes/dashboard";

describe("role-isolated dashboard route", () => {
  beforeEach(() => {
    mocks.role = null;
  });

  it("renders the mentee dashboard when the active role is mentee or unset", () => {
    const { rerender } = render(<Dashboard />);
    expect(screen.getByRole("heading", { name: /Welcome to Campus/ })).toBeInTheDocument();

    mocks.role = "mentee";
    rerender(<Dashboard />);
    expect(screen.getByRole("heading", { name: /Welcome to Campus/ })).toBeInTheDocument();
  });

  it("renders the advisor workspace for the advisor role", () => {
    mocks.role = "advisor";
    render(<Dashboard />);
    expect(screen.getByText("Peer advisor caseload workspace")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Welcome to Campus/ })).not.toBeInTheDocument();
  });

  it("renders the administrator workspace for the administrator role", () => {
    mocks.role = "administrator";
    render(<Dashboard />);
    expect(screen.getByText("Administrator analytics workspace")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Welcome to Campus/ })).not.toBeInTheDocument();
  });
});
