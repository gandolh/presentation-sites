// Chapter 5's parts list, under the figure: every labelled part as a toggle, in the order the parts come off. Pressing
// one chooses it (the figure's `data-pick`, lib/figure.ts): the 3D view lights it, ghosts the rest and, on a phone,
// frames it with its label; the drawing lights it the same way when the drawing is what shows. Pressing it again lets
// it go. A phone shows the list in place of the desktop's labels; a desktop shows it only where the drawing stays.
// While a part is lit, its name lights in the prose too.

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { onFigureChange, pickOf, setPick } from "../../lib/figure";
import { LABELLED } from "../../three/labelled";
import { Toggle } from "../ui/Toggle";

interface Props {
  /** The figure's id. */
  figure: string;
}

export function PartsList({ figure }: Props) {
  const subscribe = useCallback(
    (listener: () => void) => {
      const el = document.getElementById(figure);
      return el ? onFigureChange(el, listener) : () => undefined;
    },
    [figure],
  );
  const picked = useSyncExternalStore(
    subscribe,
    () => {
      const el = document.getElementById(figure);
      return el ? pickOf(el) : null;
    },
    () => null,
  );

  // The lit part's name in the chapter's prose, marked as the list marks it.
  useEffect(() => {
    const el = document.getElementById(figure);
    const chapter = el?.closest("section");
    if (!el || !chapter) return;
    const mark = () => {
      const lit = el.dataset.focus;
      for (const name of chapter.querySelectorAll<HTMLElement>(".part-name[data-part]"))
        name.classList.toggle("is-lit", lit !== undefined && name.dataset.part === lit);
    };
    mark();
    return onFigureChange(el, mark);
  }, [figure]);

  return (
    <div className="parts-list no-js:hidden" role="group" aria-label="The parts: choose one to light it">
      {LABELLED.map((part) => (
        <Toggle
          key={part.id}
          className="part-chip"
          data-chip={part.id}
          pressed={picked === part.id}
          onPressedChange={(pressed) => {
            const el = document.getElementById(figure);
            if (el) setPick(el, pressed ? part.id : null);
          }}
        >
          {part.label}
        </Toggle>
      ))}
    </div>
  );
}
