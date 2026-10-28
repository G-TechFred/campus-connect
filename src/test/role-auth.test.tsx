import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  setRole: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (_options: unknown) => ({}),
  useNavigate: () => mocks.navigate,
}));

vi.mock("@/lib/demo-preview", () => ({
  DEMO_DESTINATIONS: {
    mentee: "/dashboard",
    advisor: "/advisor",
    administrator: "/admin",
  },
  useDemoPreview: () => ({ setRole: mocks.setRole }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { WelcomePage } from "@/components/welcome-page";

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

describe("role-based demo authentication", () => {
  beforeEach(() => {
    mocks.navigate.mockReset();
    mocks.setRole.mockReset();
  });

  it.each([
    ["First-Year Mentee", "mentee", "/dashboard"],
    ["Senior Peer Advisor", "advisor", "/advisor"],
    ["HESA Administrator", "administrator", "/admin"],
  ] as const)(
    "routes %s to its dashboard with arbitrary sign-in input",
    (label, role, destination) => {
      render(<WelcomePage />);

      fireEvent.click(screen.getByRole("button", { name: `Sign in as ${label}` }));
      fireEvent.change(screen.getByLabelText("Institutional email"), {
        target: { value: "not-an-email" },
      });
      fireEvent.change(screen.getByLabelText("Password"), { target: { value: "x" } });
      fireEvent.click(screen.getByRole("button", { name: `Continue to ${label}` }));

      expect(mocks.setRole).toHaveBeenCalledWith(role, true);
      expect(mocks.navigate).toHaveBeenCalledWith({ to: destination });
    },
  );

  it.each([
    ["First-Year Mentee", "mentee", "/dashboard", "mentee@freduniversity.edu"],
    ["Senior Peer Advisor", "advisor", "/advisor", "advisor@freduniversity.edu"],
    ["HESA Administrator", "administrator", "/admin", "admin@freduniversity.edu"],
  ] as const)(
    "quick logs in the %s with reviewer demo credentials",
    (label, role, destination, email) => {
      render(<WelcomePage />);
      fireEvent.click(screen.getByRole("button", { name: `Sign in as ${label}` }));
      const quickDemoButton = screen.getByRole("button", { name: "Quick Demo" });
      const primaryButton = screen.getByRole("button", { name: `Continue to ${label}` });
      expect(
        quickDemoButton.compareDocumentPosition(primaryButton) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      fireEvent.click(quickDemoButton);

      expect(screen.getByLabelText("Institutional email")).toHaveValue(email);
      expect(screen.getByLabelText("Password")).toHaveValue("Demopassword");
      expect(mocks.setRole).toHaveBeenCalledWith(role, true);
      expect(mocks.navigate).toHaveBeenCalledWith({ to: destination });
    },
  );

  it("provides account creation, the password guidance, and recovery confirmation", () => {
    render(<WelcomePage />);
    fireEvent.click(screen.getByRole("button", { name: "Sign in as First-Year Mentee" }));

    expect(
      screen.getAllByText("Password must be between 8 and 15 characters.").length,
    ).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("tab", { name: "Create Account" }));
    expect(screen.getByLabelText("Major or area of study")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Sign In" }));
    fireEvent.click(screen.getByRole("button", { name: "Forgot Password?" }));
    fireEvent.change(screen.getByLabelText("Institutional email"), {
      target: { value: "student@university.edu" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Recovery Link" }));
    expect(screen.getByText("This is a demo only; no reset email was sent.")).toBeInTheDocument();
  });

  it("does not offer account creation in the HESA administrator sign-in view", () => {
    render(<WelcomePage />);
    fireEvent.click(screen.getByRole("button", { name: "Sign in as HESA Administrator" }));

    expect(screen.getByRole("heading", { name: "Sign in to your workspace" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Create Account" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("tablist", { name: "Authentication options" }),
    ).not.toBeInTheDocument();
  });
});
