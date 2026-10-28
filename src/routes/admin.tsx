import { createFileRoute } from "@tanstack/react-router";
import { Admin } from "@/components/admin-portal";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal · Fred Peer Mentorship Network" },
      {
        name: "description",
        content:
          "Program overview for HESA staff: match rates, advisor capacity and retention indicators.",
      },
      { property: "og:title", content: "Mentorship Program Admin Portal" },
      { property: "og:description", content: "Program-level metrics for student affairs staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Admin,
});
