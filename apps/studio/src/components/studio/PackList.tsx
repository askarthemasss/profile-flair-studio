import React from "react";
import { CARD_IDS, type CardId } from "@sigil/core";
import { useStudioStore } from "../../store/studio-store.js";
import { Plus, Trash2, ArrowUp, ArrowDown, GripVertical } from "lucide-react";

export const PackList: React.FC = () => {
  const { cards, selectedUid, setSelectedUid, addCard, removeCard, moveCard } = useStudioStore();

  const handleAdd = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as CardId;
    if (val) {
      addCard(val);
      e.target.value = "";
    }
  };

  return (
    <div className="notebook-card flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-charcoal">
            Active Cards ({cards.length})
          </h3>
          <p className="mt-0.5 font-display text-xs italic text-warm-grey">
            Arrange and configure your flair stack.
          </p>
        </div>

        <select
          defaultValue=""
          onChange={handleAdd}
          aria-label="Add a card to the pack"
          className="notebook-field h-8 w-auto shrink-0 px-2.5 text-xs"
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

      <div className="mt-1 flex flex-col gap-2">
        {cards.length === 0 ? (
          <div className="rounded-md border border-dashed border-line p-6 text-center">
            <p className="font-display text-base italic text-warm-grey">
              No cards in this pack yet.
            </p>
            <p className="mt-1 text-[11px] text-warm-grey">Select a card above to begin.</p>
          </div>
        ) : (
          cards.map((card, idx) => {
            const isSelected = card.uid === selectedUid;
            return (
              <div
                key={card.uid}
                onClick={() => setSelectedUid(card.uid)}
                data-selected={isSelected}
                className="pack-item"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <GripVertical className="h-3.5 w-3.5 shrink-0 text-light-grey" />
                  <span className="truncate font-mono text-[11px] font-medium">
                    {idx + 1}. {card.card.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-0.5">
                  <button
                    disabled={idx === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveCard(idx, idx - 1);
                    }}
                    className="rounded-full p-1 text-warm-grey transition-colors hover:text-charcoal disabled:opacity-30"
                    title="Move up"
                    aria-label={`Move ${card.card} up`}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    disabled={idx === cards.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveCard(idx, idx + 1);
                    }}
                    className="rounded-full p-1 text-warm-grey transition-colors hover:text-charcoal disabled:opacity-30"
                    title="Move down"
                    aria-label={`Move ${card.card} down`}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCard(card.uid);
                    }}
                    className="rounded-full p-1 text-warm-grey transition-colors hover:text-crimson"
                    title="Remove card"
                    aria-label={`Remove ${card.card}`}
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
