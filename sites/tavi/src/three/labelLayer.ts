// The labels over chapter 5's 3D view: HTML buttons laid over the canvas and their leaders in one SVG, written each
// frame from the pure layout (labels.ts). Nothing here measures the scene; the view passes in where each anchor is.

import type { PartId } from "../movement/parts.ts";
import type { LabelOut } from "./labels.ts";

interface Label {
  readonly id: PartId;
  readonly el: HTMLElement;
  readonly leader: SVGGElement;
  readonly path: SVGPathElement | null;
  readonly dot: SVGCircleElement | null;
  w: number;
  h: number;
  shown: boolean;
}

export interface LabelLayer {
  /** The labels' ids, in the layer's order. */
  readonly ids: readonly PartId[];
  /** Every label's width in CSS pixels, measured again after a font loads. */
  width(id: PartId): number;
  /** Measures the labels again (their text has changed size). */
  measure(): void;
  /**
   * Shows the laid-out labels at `on` (0 to 1) and hides the rest. `dim` says how far each shown label fades: behind
   * another part, or while another is lit.
   */
  place(out: readonly LabelOut[], on: number, dim: (id: PartId) => number, lit: PartId | null): void;
  hide(): void;
}

const f = (n: number) => n.toFixed(1);

export function createLabelLayer(layer: HTMLElement, leaders: SVGSVGElement): LabelLayer {
  const labels: Label[] = [];
  for (const el of layer.querySelectorAll<HTMLElement>("[data-label]")) {
    const id = el.dataset.label as PartId;
    const leader = leaders.querySelector<SVGGElement>(`[data-leader="${id}"]`);
    if (!leader) continue;
    labels.push({
      id,
      el,
      leader,
      path: leader.querySelector("path"),
      dot: leader.querySelector("circle"),
      w: 0,
      h: 0,
      shown: false,
    });
  }
  const byId = new Map(labels.map((l) => [l.id, l]));
  const measure = () => {
    for (const l of labels) {
      l.w = l.el.offsetWidth;
      l.h = l.el.offsetHeight;
    }
  };
  measure();
  const show = (l: Label, on: boolean) => {
    if (l.shown === on) return;
    l.shown = on;
    l.el.style.visibility = on ? "" : "hidden";
    l.leader.style.visibility = on ? "" : "hidden";
  };
  let layerOn = -1;
  const setLayer = (on: number) => {
    if (on === layerOn) return;
    layerOn = on;
    layer.style.opacity = f(on);
    leaders.style.opacity = f(on);
    // A hidden layer's buttons leave the tab order.
    layer.style.visibility = on > 0.01 ? "" : "hidden";
  };
  for (const l of labels) {
    l.shown = true;
    show(l, false);
  }
  setLayer(0);

  return {
    ids: labels.map((l) => l.id),
    width: (id) => byId.get(id)?.w ?? 0,
    measure,
    place(out, on, dim, lit) {
      setLayer(on);
      const placed = new Set<PartId>();
      for (const o of out) {
        const l = byId.get(o.id as PartId);
        if (!l) continue;
        placed.add(l.id);
        show(l, true);
        l.el.style.transform = `translate(${f(o.x)}px, ${f(o.y - l.h / 2)}px)`;
        const fade = f(dim(l.id));
        l.el.style.opacity = fade;
        l.leader.style.opacity = fade;
        l.el.classList.toggle("is-lit", l.id === lit);
        l.leader.classList.toggle("is-lit", l.id === lit);
        const [a, e, end] = o.leader;
        l.path?.setAttribute("d", `M${f(a[0])} ${f(a[1])}L${f(e[0])} ${f(e[1])}L${f(end[0])} ${f(end[1])}`);
        l.dot?.setAttribute("cx", f(a[0]));
        l.dot?.setAttribute("cy", f(a[1]));
      }
      for (const l of labels) if (!placed.has(l.id)) show(l, false);
    },
    hide() {
      setLayer(0);
      for (const l of labels) show(l, false);
    },
  };
}
