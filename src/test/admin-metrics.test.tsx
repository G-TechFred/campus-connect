import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (_options: unknown) => ({}),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

import { Admin } from "@/routes/admin";

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
});

beforeEach(() => {
  window.localStorage.clear();
});

describe("administrator metric drill-downs", () => {
  it("opens the enrolled mentee roster with assignments and status", () => {
    render(<Admin />);
    fireEvent.click(screen.getByRole("button", { name: /Total Mentees Enrolled/ }));

    const dialog = within(screen.getByRole("dialog"));
    expect(dialog.getByText("Kwame Mensah")).toBeInTheDocument();
    expect(dialog.getByText("STUDENT-01")).toBeInTheDocument();
    expect(dialog.getByText("Ama Owusu")).toBeInTheDocument();
    expect(dialog.getAllByText("On Track").length).toBeGreaterThan(0);
    expect(dialog.getAllByRole("button", { name: "Close" }).length).toBeGreaterThanOrEqual(2);
  });

  it("opens the active peer advisor directory with role, load, and rating", () => {
    render(<Admin />);
    fireEvent.click(screen.getByRole("button", { name: /Active Peer Advisors/ }));

    const dialog = within(screen.getByRole("dialog"));
    expect(dialog.getByText("Peer Mentor Lead")).toBeInTheDocument();
    expect(dialog.getAllByText("4.9").length).toBeGreaterThanOrEqual(2);
    expect(dialog.getByText("Ama Owusu")).toBeInTheDocument();
  });

  it("opens matching analytics with compatibility and department distribution", () => {
    render(<Admin />);
    fireEvent.click(screen.getByRole("button", { name: /Match Success Rate/ }));

    const dialog = within(screen.getByRole("dialog"));
    expect(dialog.getByText("Cohort compatibility alignment")).toBeInTheDocument();
    expect(dialog.getByText("96.4%")).toBeInTheDocument();
    expect(dialog.getByText("Mentee department distribution")).toBeInTheDocument();
    expect(dialog.getByText(/balanced compatibility/i)).toBeInTheDocument();
  });

  it("opens the recent timestamped check-in log with completion signatures", () => {
    render(<Admin />);
    fireEvent.click(screen.getByRole("button", { name: /Completed Check-ins/ }));

    const dialog = within(screen.getByRole("dialog"));
    expect(dialog.getAllByText("Academic Advising")).toHaveLength(3);
    expect(dialog.getAllByText("Peer Mentoring Session")).toHaveLength(3);
    expect(dialog.getAllByText(/Verified/).length).toBe(6);
    expect(dialog.getByText("Reviewed weekly study blocks and course planning.")).toBeInTheDocument();
  });
});
