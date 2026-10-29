import React from "react";
import { useConnection } from "../../hooks/useConnection.js";
import { Github, ShieldCheck, ShieldAlert, Key } from "lucide-react";

export const ConnectionCard: React.FC = () => {
  const { status, isLoading, connect, disconnect } = useConnection();

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-line bg-panel p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-raised border border-line">
            <Github className="h-5 w-5 text-ink" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-ink">
              GitHub OAuth Connection
            </h3>
            <p className="text-xs text-ink-muted">
              Higher rate limits (5,000/hr) and private contribution badges
            </p>
          </div>
        </div>

        {status.connected ? (
          <span className="flex items-center gap-1.5 rounded-full border border-verdigris/30 bg-verdigris/10 px-3 py-1 text-xs font-medium text-verdigris">
            <ShieldCheck className="h-4 w-4" />
            Connected
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full border border-line bg-raised px-3 py-1 text-xs font-medium text-ink-muted">
            <ShieldAlert className="h-4 w-4" />
            Public Pool Only
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-lg border border-line/60 bg-obsidian/40 p-4 sm:grid-cols-3">
        <div>
          <span className="text-[10px] font-mono text-ink-faint uppercase">Granted Scopes</span>
          <p className="mt-0.5 font-mono text-xs text-ink">
            {status.scopes.length > 0 ? status.scopes.join(", ") : "None (read-only public)"}
          </p>
        </div>
        <div>
          <span className="text-[10px] font-mono text-ink-faint uppercase">Token Storage</span>
          <p className="mt-0.5 font-mono text-xs text-ink">
            {status.connected ? "AES-256-GCM encrypted" : "No token stored"}
          </p>
        </div>
        <div>
          <span className="text-[10px] font-mono text-ink-faint uppercase">Last Synced</span>
          <p className="mt-0.5 font-mono text-xs text-ink">
            {status.lastUsedAt ? new Date(status.lastUsedAt).toLocaleDateString() : "Never"}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {status.connected ? (
          <button
            onClick={() => disconnect()}
            className="rounded-md border border-crimson/30 bg-crimson/10 px-3 py-1.5 text-xs font-medium text-crimson hover:bg-crimson/20 transition-colors"
          >
            Revoke Access Token
          </button>
        ) : (
          <button
            onClick={() => connect()}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-md bg-ember px-4 py-1.5 text-xs font-medium text-obsidian shadow-glow hover:bg-ember-glow transition-colors"
          >
            <Key className="h-3.5 w-3.5" />
            <span>Connect with GitHub</span>
          </button>
        )}
      </div>
    </div>
  );
};
