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
    <div className="notebook-card flex flex-col gap-4 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-normal tracking-[0.03em] text-charcoal">
            Saved Pack Presets
          </h2>
          <p className="mt-1 text-xs text-warm-grey">
            Quickly switch between card combinations and configurations.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="notebook-btn notebook-btn--secondary notebook-btn--sm self-start"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Save Current Pack</span>
        </button>
      </div>

      {isCreating ? (
        <div className="flex flex-col gap-2 rounded-md border border-line bg-[var(--card-item-bg)] p-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Preset Name (e.g. Minimalist Dark)"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            className="notebook-field flex-1 text-xs"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveCurrent}
              className="notebook-btn notebook-btn--primary notebook-btn--sm"
            >
              Save
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="notebook-btn notebook-btn--ghost notebook-btn--sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <p className="py-8 text-center font-display text-lg italic text-warm-grey">
          Reading the notebook...
        </p>
      ) : presets.length === 0 ? (
        <div className="rounded-md border border-dashed border-line p-8 text-center">
          <p className="font-display text-lg italic text-warm-grey">No presets saved yet.</p>
          <p className="mt-1 text-[11px] text-warm-grey">
            Arrange a pack in the studio, then save it here for later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {presets.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between gap-4 rounded-md border border-line bg-[var(--card-item-bg)] p-4 transition-colors hover:border-line-strong"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-display text-base font-normal tracking-[0.02em] text-charcoal">
                    {item.name}
                  </span>
                  <span className="notebook-chip notebook-chip--status shrink-0 px-2 py-0.5 text-[9px] text-terracotta-ink">
                    {item.preset.theme}
                  </span>
                </div>
                <p className="mt-2 font-mono text-[10px] leading-relaxed text-warm-grey">
                  {item.preset.cards.map((c) => c.card).join(" · ")}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-line pt-3">
                <button
                  onClick={() => deletePreset(item.id)}
                  className="rounded-full p-1 text-warm-grey transition-colors hover:text-crimson"
                  title="Delete preset"
                  aria-label={`Delete ${item.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => handleLoad(item)}
                  className="notebook-link inline-flex items-center gap-1 text-xs font-medium"
                >
                  <span>Load in Studio</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
