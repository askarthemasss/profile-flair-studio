import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ThemeSchema, type Theme } from "@sigil/core";
import { submitTheme } from "../../services/theme-service.js";
import { PlusCircle, X, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  open: boolean;
  onClose(): void;
}

export const ThemeSubmitDialog: React.FC<Props> = ({ open, onClose }) => {
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Theme>({
    resolver: zodResolver(ThemeSchema),
    defaultValues: {
      id: "my-custom-theme",
      name: "My Custom Theme",
      author: "octocat",
      version: 1,
      mode: "dark",
      colors: {
        bg: "#0b0a0c",
        bgAlt: "#16151a",
        border: "#2e2a33",
        text: "#f3efe8",
        textMuted: "#7c766d",
        accent: "#ff6a2b",
        accent2: "#ffb04a",
        success: "#34d399",
        warning: "#fbbf24",
        danger: "#f87171",
      },
      heat: ["#16151a", "#3d1f14", "#7c2d12", "#c2410c", "#ff6a2b"],
      font: "mono",
      radius: 12,
      effects: { glow: true, grain: true },
    },
  });

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const getFocusable = () =>
      dialog
        ? Array.from(
            dialog.querySelectorAll<HTMLElement>(
              'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          )
        : [];

    // Start on the first field so keyboard users can fill the form immediately.
    const initial =
      dialog?.querySelector<HTMLElement>("input, select, textarea") ?? getFocusable()[0];
    initial?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const onSubmit = async (data: Theme) => {
    try {
      const res = await submitTheme(data);
      setResult(res);
      if (res.success) {
        setTimeout(() => {
          onClose();
          reset();
          setResult(null);
        }, 2000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit theme.";
      setResult({ success: false, message });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-[var(--scrim)] p-4 backdrop-blur-[6px]"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-submit-title"
        className="notebook-card relative max-h-[90vh] w-full max-w-lg overflow-y-auto bg-warm-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-terracotta" />
            <h2
              id="theme-submit-title"
              className="font-display text-2xl font-light tracking-[0.03em] text-charcoal"
            >
              Submit Community Theme
            </h2>
          </div>
          <button
            onClick={onClose}
            className="notebook-btn notebook-btn--ghost notebook-btn--icon shrink-0"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {result ? (
          <div className="my-8 flex flex-col items-center justify-center text-center">
            {result.success ? (
              <CheckCircle className="h-10 w-10 text-verdigris" />
            ) : (
              <AlertCircle className="h-10 w-10 text-crimson" />
            )}
            <p className="mt-3 font-display text-lg text-charcoal">{result.message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="notebook-label">Theme ID (kebab)</label>
                <input {...register("id")} className="notebook-field mt-1 font-mono text-xs" />
                {errors.id ? (
                  <span className="text-[10px] text-crimson">{errors.id.message}</span>
                ) : null}
              </div>

              <div>
                <label className="notebook-label">Display Name</label>
                <input {...register("name")} className="notebook-field mt-1 text-xs" />
                {errors.name ? (
                  <span className="text-[10px] text-crimson">{errors.name.message}</span>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="notebook-label">Author (GitHub login)</label>
                <input {...register("author")} className="notebook-field mt-1 font-mono text-xs" />
                {errors.author ? (
                  <span className="text-[10px] text-crimson">{errors.author.message}</span>
                ) : null}
              </div>

              <div>
                <label className="notebook-label">Mode</label>
                <select {...register("mode")} className="notebook-field mt-1 text-xs">
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-line pt-3">
              <div>
                <label className="text-[10px] text-warm-grey">Background</label>
                <input
                  {...register("colors.bg")}
                  className="notebook-field mt-1 px-2 py-1 font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="text-[10px] text-warm-grey">Accent</label>
                <input
                  {...register("colors.accent")}
                  className="notebook-field mt-1 px-2 py-1 font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="text-[10px] text-warm-grey">Text</label>
                <input
                  {...register("colors.text")}
                  className="notebook-field mt-1 px-2 py-1 font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="mt-2 flex justify-end gap-2 border-t border-line pt-3">
              <button
                type="button"
                onClick={onClose}
                className="notebook-btn notebook-btn--ghost notebook-btn--sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="notebook-btn notebook-btn--primary notebook-btn--sm"
              >
                {isSubmitting ? "Validating..." : "Submit Theme"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
