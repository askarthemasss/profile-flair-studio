import { cn } from "@/lib/utils";

/**
 * The Sigil mark — an ember wax seal. Same artwork as the favicon
 * (`public/logo.svg` / `public/favicon.svg`).
 */
export function SigilMark({
  className,
  alt = "",
}: {
  className?: string;
  /** Leave empty when the wordmark sits beside the mark. */
  alt?: string;
}) {
  return (
    <img
      src="/logo.svg"
      alt={alt}
      width={64}
      height={64}
      draggable={false}
      className={cn("shrink-0", className)}
    />
  );
}
