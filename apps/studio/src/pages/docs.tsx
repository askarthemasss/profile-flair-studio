import React from "react";
import { AppShell } from "../components/layout/AppShell.js";
import { BookOpen, Terminal, Layers, Code, Check } from "lucide-react";

export const DocsPage: React.FC = () => {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 border-b border-line pb-6">
          <div className="flex items-center gap-2 text-ember">
            <BookOpen className="h-5 w-5" />
            <h1 className="font-display text-3xl font-bold text-ink">Documentation</h1>
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            Developer guide for embedding Sigil flair, customizing query params, and GitHub Actions.
          </p>
        </div>

        <div className="flex flex-col gap-10">
          {/* Section 1: Endpoints */}
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-xl font-semibold text-ink flex items-center gap-2">
              <Terminal className="h-5 w-5 text-ember" />
              <span>Card Image Endpoints</span>
            </h2>
            <p className="text-xs text-ink-muted leading-relaxed">
              Cards are delivered as native SVG images directly through Cloudflare Workers. You can
              embed them into any Markdown, HTML, or static site.
            </p>

            <div className="rounded-lg border border-line bg-panel p-4 font-mono text-xs">
              <div className="text-ember font-semibold">GET /c/:kind/:username</div>
              <div className="mt-2 text-ink-muted">
                Available kinds:{" "}
                <span className="text-ink">
                  overview, streak, languages, heatmap, skyline, activity, achievements, repo,
                  banner
                </span>
              </div>
            </div>
          </section>

          {/* Section 2: Parameters */}
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-xl font-semibold text-ink flex items-center gap-2">
              <Layers className="h-5 w-5 text-ember" />
              <span>Common Query Parameters</span>
            </h2>

            <div className="overflow-x-auto rounded-lg border border-line">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-line bg-raised font-mono text-ink">
                  <tr>
                    <th className="p-3">Param</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Default</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60 bg-panel text-ink-muted font-mono">
                  <tr>
                    <td className="p-3 text-ember">theme</td>
                    <td className="p-3">string</td>
                    <td className="p-3">"obsidian"</td>
                    <td className="p-3 font-sans">
                      Theme identifier (obsidian, monolith, verdigris, etc.)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-ember">animate</td>
                    <td className="p-3">0 | 1</td>
                    <td className="p-3">1</td>
                    <td className="p-3 font-sans">
                      Enable or disable CSS animations and hover transitions
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-ember">hide_border</td>
                    <td className="p-3">0 | 1</td>
                    <td className="p-3">0</td>
                    <td className="p-3 font-sans">Hide the outer 1px card border</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-ember">radius</td>
                    <td className="p-3">number (0..24)</td>
                    <td className="p-3">Theme default</td>
                    <td className="p-3 font-sans">Custom corner border radius in pixels</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-ember">accent</td>
                    <td className="p-3">hex (no #)</td>
                    <td className="p-3">Theme default</td>
                    <td className="p-3 font-sans">Override primary accent color (e.g. ff6a2b)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-ember">bg</td>
                    <td className="p-3">hex (no #)</td>
                    <td className="p-3">Theme default</td>
                    <td className="p-3 font-sans">Override card background color (e.g. 0b0a0c)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Embed Example */}
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-xl font-semibold text-ink flex items-center gap-2">
              <Code className="h-5 w-5 text-ember" />
              <span>Embedding a Card</span>
            </h2>
            <p className="text-xs text-ink-muted leading-relaxed">
              Drop a themed card into any Markdown or HTML file. Available builtin themes:{" "}
              <code className="text-ink">obsidian</code>, <code className="text-ink">monolith</code>
              , and <code className="text-ink">verdigris</code>.
            </p>

            <pre className="overflow-x-auto rounded-lg border border-line bg-obsidian p-4 font-mono text-xs text-ink-muted leading-relaxed">
              {`<img
  alt="GitHub Overview"
  src="https://sigil.dev/c/overview/torvalds?theme=obsidian"
/>`}
            </pre>
          </section>
        </div>
      </div>
    </AppShell>
  );
};
