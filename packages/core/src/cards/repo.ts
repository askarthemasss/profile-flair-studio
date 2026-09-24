import { z } from "zod";
import { esc } from "../svg/esc";
import { formatNumber, relativeTime, wrapText } from "../svg/format";
import { defineCard } from "./types";
import { icon, languageColor, mono, notice } from "./shared";

export const repo = defineCard({
  id: "repo",
  size: { w: 480, h: 150 },
  paramsSchema: z.object({
    repo: z
      .string()
      .regex(/^[A-Za-z0-9-]{1,39}\/[A-Za-z0-9._-]{1,100}$/)
      .optional(),
  }),
  meta: {
    name: "Repo card",
    description: "One of your top repositories: description, language, stars, forks, and last push.",
    defaults: { repo: "owner/name" },
  },
  render: ({ snapshot, params, theme, now }) => {
    const wanted = params.repo?.toLowerCase();
    const found = wanted ? snapshot.topRepos.find((entry) => entry.name.toLowerCase() === wanted) : undefined;
    if (!found) {
      const name = params.repo ?? "owner/name";
      return {
        title: `${name} — repository`,
        desc: params.repo ? `${name} is not in @${snapshot.login}'s top repositories.` : "No repository chosen.",
        body: `${icon.diamond(24, 24)}${mono(42, 34, name, "ac", 13)}${notice(
          240,
          86,
          params.repo ? "Not in top repositories" : "Choose a repository",
          params.repo ? "Repo cards show one of the 30 most-starred repos" : "Add ?repo=owner/name to the card URL",
        )}`,
      };
    }

    const lines = wrapText(found.description || "No description", 58, 2);
    const color = languageColor(found.language, theme);
    const pushed = found.pushedAt ? `pushed ${relativeTime(found.pushedAt, now)}` : "";
    return {
      title: `${found.name} — repository`,
      desc: `${found.description || "No description"}. ${found.stars} stars, ${found.forks} forks, ${found.language}.`,
      body: `${icon.diamond(24, 24)}${mono(42, 34, found.name, "ac", 13)}${lines
        .map((line, i) => `<text x="24" y="${66 + i * 18}" class="tx" font-size="12" font-family="ui-sans-serif,system-ui,sans-serif">${esc(line)}</text>`)
        .join("")}<circle cx="29" cy="122" r="5" fill="${color}"/>${mono(40, 126, found.language || "—", "mu", 11)}${icon.star(
        150,
        117,
      )}${mono(166, 126, formatNumber(found.stars), "mu", 11)}${icon.fork(224, 117)}${mono(
        240,
        126,
        formatNumber(found.forks),
        "mu",
        11,
      )}${pushed ? mono(456, 126, pushed, "mu", 11, "end") : ""}`,
    };
  },
});
