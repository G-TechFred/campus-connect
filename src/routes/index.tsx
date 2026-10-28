import { createFileRoute } from "@tanstack/react-router";
import { WelcomePage } from "@/components/welcome-page";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Student Affairs Portal · Fred Campus Connect" },
      {
        name: "description",
        content:
          "Welcome to Fred Campus Connect's Peer Mentorship Network. Preview the student, peer advisor, or HESA administrator portal.",
      },
      { property: "og:title", content: "Fred Campus Connect · Student Affairs Portal" },
      {
        property: "og:description",
        content: "Your university transition and peer advising journey starts here.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WelcomePage,
});
