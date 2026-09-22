export const SVG_HEADERS = {
  "content-type": "image/svg+xml; charset=utf-8",
  "cache-control": "public, max-age=300, stale-while-revalidate=86400",
  "x-content-type-options": "nosniff",
} as const;

export const JSON_HEADERS = {
  "cache-control": "public, max-age=300, stale-while-revalidate=86400",
  "access-control-allow-origin": "*",
} as const;

export function svgResponse(body: string, status = 200, extra?: Record<string, string>): Response {
  return new Response(body, {
    status,
    headers: { ...SVG_HEADERS, ...extra },
  });
}

export function noticeSvg(message: string): string {
  const safe = message.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="495" height="195" viewBox="0 0 495 195" role="img">
<rect width="495" height="195" rx="12" fill="#0B0A0C" stroke="#2E2A33"/>
<text x="24" y="100" fill="#F3EFE8" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16">${safe}</text>
</svg>`;
}
