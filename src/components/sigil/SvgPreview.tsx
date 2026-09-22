import type { CardTheme } from "@sigil/core/themes";
import { cardImagePath } from "@sigil/core/markdown";
import { renderCardSvg } from "@sigil/core/render/svg";
import type { CardKind, SigilProfile } from "@/lib/studio-data";

/**
 * The SVG a profile README actually loads.
 * The built-in demo is drawn in the browser. Any other username is requested
 * from `/c/:kind/:username`.
 */
export function SvgPreview({
  kinds,
  profile,
  theme,
  animate,
  live,
}: {
  kinds: CardKind[];
  profile: SigilProfile;
  theme: CardTheme;
  animate: boolean;
  live: boolean;
}) {
  const mono = { fontFamily: "var(--font-mono)" } as const;

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-ink-faint" style={mono}>
        {live
          ? `Loaded from /c/…/${profile.username}. This is the image GitHub will request.`
          : "Demo pack, drawn with the same SVG renderer the card URL uses."}
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {kinds.map((kind) =>
          live ? (
            <img
              key={kind}
              src={cardImagePath({
                kind,
                username: profile.username,
                themeId: theme.id,
                animate,
                baseUrl: "",
              })}
              alt={`Sigil ${kind} card for @${profile.username}`}
              className="h-auto w-full"
              style={{ background: theme.bg, borderRadius: 12 }}
            />
          ) : (
            <div
              key={kind}
              className="[&_svg]:h-auto [&_svg]:w-full"
              dangerouslySetInnerHTML={{
                __html: renderCardSvg({ kind, profile, theme, animate }),
              }}
            />
          ),
        )}
      </div>
    </div>
  );
}
