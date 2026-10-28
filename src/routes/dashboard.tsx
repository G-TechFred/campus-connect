import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard-page";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Fred Campus Connect" },
      {
        name: "description",
        content: "Your peer mentor match, upcoming check-ins and transition milestones.",
      },
      { property: "og:title", content: "Fred Campus Connect" },
      { property: "og:description", content: "Your first-year student dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});
