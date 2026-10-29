import React, { useState } from "react";
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
    } catch (err: any) {
      setResult({ success: false, message: err.message || "Failed to submit theme." });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl border border-line bg-panel p-6 shadow-elevated">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-ember" />
            <h2 className="font-display text-base font-semibold text-ink">
              Submit Community Theme
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-ink-muted hover:text-ink transition-colors"
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
            <p className="mt-3 text-sm font-medium text-ink">{result.message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-ink-muted">Theme ID (kebab)</label>
                <input
                  {...register("id")}
                  className="mt-1 w-full rounded border border-line bg-raised px-2.5 py-1.5 font-mono text-xs text-ink"
                />
                {errors.id && <span className="text-[10px] text-crimson">{errors.id.message}</span>}
              </div>

              <div>
                <label className="text-[11px] font-medium text-ink-muted">Display Name</label>
                <input
                  {...register("name")}
                  className="mt-1 w-full rounded border border-line bg-raised px-2.5 py-1.5 text-xs text-ink"
                />
                {errors.name && <span className="text-[10px] text-crimson">{errors.name.message}</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-ink-muted">Author (GitHub login)</label>
                <input
                  {...register("author")}
                  className="mt-1 w-full rounded border border-line bg-raised px-2.5 py-1.5 font-mono text-xs text-ink"
                />
                {errors.author && <span className="text-[10px] text-crimson">{errors.author.message}</span>}
              </div>

              <div>
                <label className="text-[11px] font-medium text-ink-muted">Mode</label>
                <select
                  {...register("mode")}
                  className="mt-1 w-full rounded border border-line bg-raised px-2.5 py-1.5 text-xs text-ink"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-line pt-3">
              <div>
                <label className="text-[10px] text-ink-faint">Background</label>
                <input
                  {...register("colors.bg")}
                  className="mt-1 w-full rounded border border-line bg-raised px-2 py-1 font-mono text-[11px] text-ink"
                />
              </div>
              <div>
                <label className="text-[10px] text-ink-faint">Accent</label>
                <input
                  {...register("colors.accent")}
                  className="mt-1 w-full rounded border border-line bg-raised px-2 py-1 font-mono text-[11px] text-ink"
                />
              </div>
              <div>
                <label className="text-[10px] text-ink-faint">Text</label>
                <input
                  {...register("colors.text")}
                  className="mt-1 w-full rounded border border-line bg-raised px-2 py-1 font-mono text-[11px] text-ink"
                />
              </div>
            </div>

            <div className="mt-2 flex justify-end gap-2 border-t border-line pt-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-3 py-1.5 text-xs text-ink-muted hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-ember px-4 py-1.5 text-xs font-medium text-obsidian shadow-glow transition-colors hover:bg-ember-glow"
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
