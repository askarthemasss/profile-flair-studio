import { renderCardSvg } from "@sigil/core/render/svg";
import type { CardTheme } from "@sigil/core/themes";
import { memo, useMemo } from "react";

import type { CardKind, SigilProfile } from "@/lib/studio-data";

/**
 * One rendered card. Memoized so a username keystroke or a sibling hover
 * does not rebuild every SVG on the page.
 */
export const CardSvg = memo(function CardSvg({
  kind,
  profile,
  theme,
  animate,
  defer = false,
}: {
  kind: CardKind;
  profile: SigilProfile;
  theme: CardTheme;
  animate: boolean;
  defer?: boolean;
}) {
  const html = useMemo(
    () => renderCardSvg({ kind, profile, theme, animate }),
    [kind, profile, theme, animate],
  );

  return (
    <div
      className={defer ? "sg-defer [&_svg]:h-auto [&_svg]:w-full" : "[&_svg]:h-auto [&_svg]:w-full"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
