import React from "react";

interface SigilMarkProps {
  className?: string;
}

/**
 * Inline mark so the ink and gold can follow the active UI theme.
 * The favicon in public/logo.svg carries the same silhouette.
 */
export const SigilMark: React.FC<SigilMarkProps> = ({ className = "h-7 w-7" }) => {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true" focusable="false">
      <circle cx="16" cy="16" r="14.1" stroke="var(--gold)" strokeWidth="1.1" opacity="0.72" />
      <path
        d="M21.2 9.4c-1.2-1.5-3-2.4-5-2.4-3.1 0-5.3 1.8-5.3 4.2 0 2.4 2.1 3.5 5.2 4.2 3.4.8 5.6 2 5.6 4.7 0 2.7-2.5 4.7-5.8 4.7-2.2 0-4.4-1-5.7-2.6"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        opacity="0.92"
      />
      <path
        d="M8.1 5.5 8.8 6.8 10.1 7.5 8.8 8.2 8.1 9.5 7.4 8.2 6.1 7.5 7.4 6.8Z"
        fill="var(--terracotta)"
        opacity="0.85"
      />
    </svg>
  );
};
