import React, { useMemo } from "react";
import { CARD_RENDERERS } from "@sigil/core";
import type { CardPreviewProps } from "../../types.js";

export const CardPreview: React.FC<CardPreviewProps> = ({ card, snapshot, theme }) => {
  const svgOutput = useMemo(() => {
    const renderer = CARD_RENDERERS[card.card];
    if (!renderer) {
      return `<svg width="400" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#16151a"/><text x="20" y="50" fill="#f87171" font-family="monospace" font-size="12">Unknown card: ${card.card}</text></svg>`;
    }

    try {
      return renderer({
        snapshot,
        theme,
        params: {
          user: snapshot.login,
          theme: theme.id,
          animate: "1",
          hide_border: "0",
          ...card.params,
        },
        now: new Date(),
      });
    } catch (err) {
      console.error(`Error rendering card ${card.card}:`, err);
      return `<svg width="400" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#16151a"/><text x="20" y="50" fill="#f87171" font-family="monospace" font-size="12">Rendering error</text></svg>`;
    }
  }, [card.card, card.params, snapshot, theme]);

  return (
    <div
      className="card-preview-wrapper flex w-full items-center justify-center overflow-x-auto p-2"
      dangerouslySetInnerHTML={{ __html: svgOutput }}
    />
  );
};
