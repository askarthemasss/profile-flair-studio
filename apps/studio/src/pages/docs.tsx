import React from "react";
import { AppShell } from "../components/layout/AppShell.js";
import { SectionTitle } from "../components/ui/SectionTitle.js";
import { renderOrigin } from "../lib/render-url.js";
import { Terminal, Layers, Code, Database } from "lucide-react";

export const DocsPage: React.FC = () => {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 border-b border-line pb-6">
          <SectionTitle
            as="h1"
            kicker="Reference"
            description="Developer guide for embedding Sigil flair, customizing query params, and GitHub Actions."
          >
            Documentation
          </SectionTitle>
        </div>

        <div className="flex flex-col gap-12">
          {/* Section 1: Endpoints */}
          <section className="flex flex-col gap-4">
            <SectionTitle as="h2" size="section">
              <span className="inline-flex items-center gap-2">
                <Terminal className="h-5 w-5 text-terracotta" />
                <span>Card Image Endpoints</span>
              </span>
            </SectionTitle>
            <p className="max-w-2xl text-xs leading-relaxed text-soft-black">
              Cards are delivered as native SVG images directly through Cloudflare Workers. You can
              embed them into any Markdown, HTML, or static site.
            </p>

            <div className="notebook-card p-4 font-mono text-xs">
              <div className="font-semibold text-terracotta-ink">GET /c/:kind/:username</div>
              <div className="mt-2 leading-relaxed text-warm-grey">
                Available kinds:{" "}
                <span className="text-charcoal">
                  overview, streak, languages, heatmap, skyline, activity, achievements, repo,
                  banner
                </span>
              </div>
            </div>
          </section>

          {/* Section 2: Parameters */}
          <section className="flex flex-col gap-4">
            <SectionTitle as="h2" size="section">
              <span className="inline-flex items-center gap-2">
                <Layers className="h-5 w-5 text-terracotta" />
                <span>Common Query Parameters</span>
              </span>
            </SectionTitle>

            <div className="notebook-table-wrap">
              <table className="notebook-table">
                <thead>
                  <tr>
                    <th>Param</th>
                    <th>Type</th>
                    <th>Default</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-mono text-terracotta-ink">theme</td>
                    <td>string</td>
                    <td>&quot;obsidian&quot;</td>
                    <td className="font-sans">
                      Theme identifier (obsidian, monolith, verdigris, paper, tidepool, sandstone)
                    </td>
                  </tr>
                  <tr>
                    <td className="font-mono text-terracotta-ink">animate</td>
                    <td>0 | 1</td>
                    <td>1</td>
                    <td className="font-sans">
                      Enable or disable CSS animations and hover transitions
                    </td>
                  </tr>
                  <tr>
                    <td className="font-mono text-terracotta-ink">hide_border</td>
                    <td>0 | 1</td>
                    <td>0</td>
                    <td className="font-sans">Hide the outer 1px card border</td>
                  </tr>
                  <tr>
                    <td className="font-mono text-terracotta-ink">radius</td>
                    <td>number (0..24)</td>
                    <td>Theme default</td>
                    <td className="font-sans">Custom corner border radius in pixels</td>
                  </tr>
                  <tr>
                    <td className="font-mono text-terracotta-ink">accent</td>
                    <td>hex (no #)</td>
                    <td>Theme default</td>
                    <td className="font-sans">Override primary accent color (e.g. ff6a2b)</td>
                  </tr>
                  <tr>
                    <td className="font-mono text-terracotta-ink">bg</td>
                    <td>hex (no #)</td>
                    <td>Theme default</td>
                    <td className="font-sans">Override card background color (e.g. 0b0a0c)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Embed Example */}
          <section className="flex flex-col gap-4">
            <SectionTitle as="h2" size="section">
              <span className="inline-flex items-center gap-2">
                <Code className="h-5 w-5 text-terracotta" />
                <span>Embedding a Card</span>
              </span>
            </SectionTitle>
            <p className="max-w-2xl text-xs leading-relaxed text-soft-black">
              Drop a themed card into any Markdown or HTML file. Available builtin themes:{" "}
              <code className="notebook-inline-code">obsidian</code>,{" "}
              <code className="notebook-inline-code">monolith</code>,{" "}
              <code className="notebook-inline-code">verdigris</code>,{" "}
              <code className="notebook-inline-code">paper</code>,{" "}
              <code className="notebook-inline-code">tidepool</code>, and{" "}
              <code className="notebook-inline-code">sandstone</code>.
            </p>

            <pre className="notebook-code">
              {`<img
  alt="GitHub Overview"
  src="${renderOrigin()}/c/overview/torvalds?theme=obsidian"
/>`}
            </pre>
          </section>

          {/* Section 4: JSON API */}
          <section className="flex flex-col gap-4">
            <SectionTitle as="h2" size="section">
              <span className="inline-flex items-center gap-2">
                <Database className="h-5 w-5 text-terracotta" />
                <span>JSON API</span>
              </span>
            </SectionTitle>
            <p className="max-w-2xl text-xs leading-relaxed text-soft-black">
              Every route is served under <code className="notebook-inline-code">/v1</code>. The
              unversioned paths are kept as aliases, so existing embeds keep working. Every response
              carries <code className="notebook-inline-code">X-Sigil-Api-Version: 1</code>; additive
              fields do not bump the version, breaking changes do.
            </p>

            <div className="notebook-table-wrap">
              <table className="notebook-table">
                <thead>
                  <tr>
                    <th>Endpoint</th>
                    <th>Returns</th>
                    <th>Cache</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="whitespace-nowrap font-mono text-terracotta-ink">
                      GET /v1/snapshot/:username
                    </td>
                    <td>Full normalized snapshot</td>
                    <td>30 min</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap font-mono text-terracotta-ink">
                      GET /v1/themes
                    </td>
                    <td>Builtin theme objects</td>
                    <td>1 hour</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap font-mono text-terracotta-ink">
                      GET /v1/c/:kind/:username
                    </td>
                    <td>SVG card</td>
                    <td>5 min</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap font-mono text-terracotta-ink">
                      GET /v1/health
                    </td>
                    <td>Status and API version</td>
                    <td>No cache</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <pre className="notebook-code">
              {`curl -s ${renderOrigin()}/v1/snapshot/torvalds | jq '{schema, login, years: (.years | length)}'

{
  "schema": 1,
  "login": "torvalds",
  "years": 3
}`}
            </pre>

            <p className="max-w-2xl text-xs leading-relaxed text-soft-black">
              The snapshot body is versioned by its{" "}
              <code className="notebook-inline-code">schema</code> field. If a field is renamed or
              removed, <code className="notebook-inline-code">schema</code> increments and a new{" "}
              <code className="notebook-inline-code">/v2</code> prefix is added.
            </p>
          </section>
        </div>
      </div>
    </AppShell>
  );
};
