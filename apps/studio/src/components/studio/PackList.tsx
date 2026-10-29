import React from "react";
import { CARD_IDS, type CardId } from "@sigil/core";
import { useStudioStore } from "../../store/studio-store.js";
import { Plus, Trash2, ArrowUp, ArrowDown, GripVertical } from "lucide-react";

export const PackList: React.FC = () => {
  const { cards, selectedUid, setSelectedUid, addCard, removeCard, moveCard } =
    useStudioStore();

  const handleAdd = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as CardId;
    if (val) {
      addCard(val);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-panel p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">
            Active Cards ({cards.length})
          </h3>
          <p className="text-[11px] text-ink-muted">Arrange and configure your flair stack</p>
        </div>

        {/* Add Card dropdown */}
        <div className="relative">
          <select
            defaultValue=""
            onChange={handleAdd}
            className="flex h-8 items-center gap-1 rounded border border-line bg-raised px-2.5 text-xs text-ink transition-colors hover:border-ember focus:border-ember focus:outline-none"
          >
            <option value="" disabled>
              + Add Card...
            </option>
            {CARD_IDS.map((id: CardId) => (
              <option key={id} value={id}>
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        {cards.length === 0 ? (
          <div className="rounded border border-dashed border-line p-6 text-center text-xs text-ink-faint">
            No cards in this pack yet. Select a card above to begin.
          </div>
        ) : (
          cards.map((card, idx) => {
            const isSelected = card.uid === selectedUid;
            return (
              <div
                key={card.uid}
                onClick={() => setSelectedUid(card.uid)}
                className={`flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 transition-all ${
                  isSelected
                    ? "border-ember bg-raised/90 text-ink shadow-sm"
                    : "border-line bg-obsidian/40 text-ink-muted hover:border-line-strong hover:text-ink"
                }`}
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="h-3.5 w-3.5 text-ink-faint" />
                  <span className="font-mono text-xs font-medium">
                    {idx + 1}. {card.card.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveCard(idx, idx - 1);
                    }}
                    className="p-1 text-ink-faint hover:text-ink disabled:opacity-30"
                    title="Move up"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    disabled={idx === cards.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveCard(idx, idx + 1);
                    }}
                    className="p-1 text-ink-faint hover:text-ink disabled:opacity-30"
                    title="Move down"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCard(card.uid);
                    }}
                    className="p-1 text-ink-faint hover:text-crimson transition-colors"
                    title="Remove card"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
