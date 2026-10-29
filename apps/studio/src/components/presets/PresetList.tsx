import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePresets } from "../../hooks/usePresets.js";
import { useStudioStore } from "../../store/studio-store.js";
import type { PresetItem } from "../../services/preset-service.js";
import { Trash2, ArrowRight, Plus } from "lucide-react";

export const PresetList: React.FC = () => {
  const { presets, isLoading, savePreset, deletePreset } = usePresets();
  const { cards, theme, overrides, loadPreset } = useStudioStore();
  const navigate = useNavigate();
  const [newPresetName, setNewPresetName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSaveCurrent = async () => {
    if (!newPresetName.trim()) return;
    await savePreset({
      name: newPresetName.trim(),
      preset: {
        theme,
        overrides,
        cards: cards.map((c) => ({ card: c.card, params: c.params })),
      },
    });
    setNewPresetName("");
    setIsCreating(false);
  };

  const handleLoad = (preset: PresetItem) => {
    loadPreset(preset.preset);
    navigate("/studio");
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-line bg-panel p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-semibold text-ink">Saved Pack Presets</h3>
          <p className="text-xs text-ink-muted">
            Quickly switch between card combinations and configurations
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1 rounded-md border border-line bg-raised px-3 py-1.5 text-xs font-medium text-ink hover:border-ember transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Save Current Pack</span>
        </button>
      </div>

      {isCreating && (
        <div className="flex items-center gap-2 rounded-lg border border-ember/40 bg-obsidian/80 p-3">
          <input
            type="text"
            placeholder="Preset Name (e.g. Minimalist Dark)"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            className="flex-1 rounded border border-line bg-raised px-3 py-1.5 text-xs text-ink placeholder:text-ink-faint focus:border-ember focus:outline-none"
          />
          <button
            onClick={handleSaveCurrent}
            className="rounded bg-ember px-3 py-1.5 text-xs font-medium text-obsidian shadow-glow hover:bg-ember-glow"
          >
            Save
          </button>
          <button
            onClick={() => setIsCreating(false)}
            className="rounded px-2 py-1.5 text-xs text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {presets.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-lg border border-line bg-obsidian/60 p-4 transition-all hover:border-line-strong"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-semibold text-ink">{item.name}</span>
                <span className="rounded bg-raised px-1.5 py-0.5 text-[9px] font-mono text-ember">
                  {item.preset.theme}
                </span>
              </div>
              <p className="mt-2 text-[11px] font-mono text-ink-faint">
                {item.preset.cards.map((c) => c.card).join(" · ")}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3">
              <button
                onClick={() => deletePreset(item.id)}
                className="text-ink-faint hover:text-crimson transition-colors"
                title="Delete preset"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => handleLoad(item)}
                className="flex items-center gap-1 text-xs font-medium text-ember hover:text-ember-glow transition-colors"
              >
                <span>Load in Studio</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
