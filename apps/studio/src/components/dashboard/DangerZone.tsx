import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useConnection } from "../../hooks/useConnection.js";
import { AlertTriangle, Trash2, CheckCircle2 } from "lucide-react";

const OptOutSchema = z.object({
  confirmUsername: z.string().min(1, "Please type CONFIRM to proceed"),
});

type OptOutForm = z.infer<typeof OptOutSchema>;

export const DangerZone: React.FC = () => {
  const { disconnect } = useConnection();
  const [optedOut, setOptedOut] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OptOutForm>({
    resolver: zodResolver(OptOutSchema),
  });

  const onConfirmOptOut = async (data: OptOutForm) => {
    if (data.confirmUsername !== "CONFIRM") return;
    await disconnect();
    setOptedOut(true);
    setShowModal(false);
    reset();
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-crimson/30 bg-panel p-6 shadow-card">
      <div className="flex items-center gap-2 text-crimson">
        <AlertTriangle className="h-5 w-5" />
        <h3 className="font-display text-base font-semibold">Danger Zone</h3>
      </div>

      <p className="text-xs text-ink-muted leading-relaxed">
        Opt out of Sigil public caching and irrevocably destroy encrypted tokens. Once
        opted out, request endpoints for your username will return an{" "}
        <code className="rounded bg-obsidian px-1 py-0.5 font-mono text-crimson">
          OPTED_OUT
        </code>{" "}
        error and no card will render.
      </p>

      {optedOut ? (
        <div className="flex items-center gap-2 rounded-lg border border-crimson/40 bg-crimson/10 p-3 text-xs text-crimson">
          <CheckCircle2 className="h-4 w-4" />
          <span>Your account has successfully opted out of Sigil rendering.</span>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-md border border-crimson/50 bg-crimson/10 px-4 py-2 text-xs font-semibold text-crimson transition-colors hover:bg-crimson hover:text-obsidian"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Opt Out & Purge Data</span>
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-crimson/40 bg-panel p-6 shadow-elevated">
            <h4 className="font-display text-base font-semibold text-crimson">
              Confirm Permanent Opt-Out
            </h4>
            <p className="mt-2 text-xs text-ink-muted leading-relaxed">
              This will purge all cached snapshots, drop your saved presets, and block future
              renders from the Sigil API. Type <strong className="text-ink">CONFIRM</strong> below
              to proceed.
            </p>

            <form onSubmit={handleSubmit(onConfirmOptOut)} className="mt-4 flex flex-col gap-3">
              <input
                {...register("confirmUsername")}
                placeholder="Type CONFIRM"
                className="w-full rounded border border-line bg-raised px-3 py-1.5 font-mono text-xs text-ink placeholder:text-ink-faint focus:border-crimson focus:outline-none"
              />
              {errors.confirmUsername && (
                <span className="text-[10px] text-crimson">
                  {errors.confirmUsername.message}
                </span>
              )}

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded px-3 py-1.5 text-xs text-ink-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded bg-crimson px-4 py-1.5 text-xs font-semibold text-obsidian transition-colors hover:opacity-90"
                >
                  {isSubmitting ? "Processing..." : "Confirm Opt Out"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
