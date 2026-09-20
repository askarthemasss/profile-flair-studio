import { createFileRoute } from "@tanstack/react-router";
import { Studio } from "@/components/sigil/Studio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sigil — Nine living cards for your GitHub profile" },
      {
        name: "description",
        content:
          "Turn any GitHub username into a matching set of animated stat cards. Paste one line of Markdown — no rate-limit errors. Free, open-source, MIT.",
      },
      { property: "og:title", content: "Sigil — Your developer sigil" },
      {
        property: "og:description",
        content: "Nine living cards for your GitHub profile, one line to install.",
      },
    ],
  }),
  component: Studio,
});
