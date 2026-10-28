import { createFileRoute } from "@tanstack/react-router";
import { AdvisorPreview } from "@/components/advisor-preview";

export const Route = createFileRoute("/advisor")({
  head: () => ({
    meta: [
      { title: "Peer Advisor Management · Fred Campus Connect" },
      {
        name: "description",
        content:
          "Preview Fred Campus Connect's peer advisor workspace for mentee requests, advising capacity, and check-ins.",
      },
      { property: "og:title", content: "Fred Campus Connect · Peer Advisor Management" },
      {
        property: "og:description",
        content:
          "Manage first-year mentee requests and peer advising check-ins in a sample workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdvisorPreview,
});
