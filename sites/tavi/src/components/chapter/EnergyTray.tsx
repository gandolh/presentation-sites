// Chapter 1's tray: the figure's Pause and Speed, then its own two controls. Wind coils the mainspring and turns the
// arbor with it; Take apart lifts the barrel bridge, the ratchet wheel, the crown wheel and the click off along their
// axis. A React island, hydrated when it scrolls into view. The drawing is Astro's: the island writes to it.

import { useCallback, useState, useSyncExternalStore } from "react";
import { onFigureChange, setPose, type Pose } from "../../lib/figure";
import { springPath } from "../../movement/svg/pieces";
import { Slider } from "../ui/Slider";
import FigureTray from "./FigureTray";

/** The mainspring's power reserve when fully wound, in hours (the NH35's "more than 41 hours"). */
const RESERVE = 41;
/** How far the drawing's spring is wound as it is built, in percent; the stylesheet turns the arbor to match. */
const BUILT_WIND = 62;

const hoursAt = (wind: number) => Math.round((wind / 100) * RESERVE);

interface ControlProps {
  /** The figure's id. */
  figure: string;
}

/** Wind, 0 to 100: redraws the spring at that wind and turns the arbor and the ratchet wheel (`--wind`). */
function Wind({ figure }: ControlProps) {
  const [wind, setWind] = useState(BUILT_WIND);
  return (
    <Slider
      label="Wind"
      value={wind}
      readout={`${hoursAt(wind)} of ${RESERVE} h`}
      getAriaValueText={(value) => `Wound to ${hoursAt(value)} of ${RESERVE} hours`}
      onValueChange={(value) => {
        setWind(value);
        const el = document.getElementById(figure);
        if (!el) return;
        const path = springPath(value / 100);
        for (const coil of el.querySelectorAll(".p-spring path")) coil.setAttribute("d", path);
        el.style.setProperty("--wind", String(value / 100));
      }}
    />
  );
}

/**
 * Take apart, 0 to 100%: the figure's `--e`, through its pose. Each step sets it as it reaches the reading line; a
 * drag sets it until the next step arrives. While a thumb is dragged the lifted parts follow it without easing.
 */
function TakeApart({ figure, opening }: ControlProps & { opening: number }) {
  const subscribe = useCallback(
    (listener: () => void) => {
      const el = document.getElementById(figure);
      return el ? onFigureChange(el, listener) : () => undefined;
    },
    [figure],
  );
  const apart = useSyncExternalStore(
    subscribe,
    () => {
      const e = document.getElementById(figure)?.style.getPropertyValue("--e");
      return e ? Math.round(Number(e) * 100) : opening;
    },
    () => opening,
  );
  return (
    <Slider
      label="Take apart"
      value={apart}
      readout={`${apart}%`}
      getAriaValueText={(value) => `${value}% apart`}
      onValueChange={(value, reason) => {
        const el = document.getElementById(figure);
        if (!el) return;
        el.classList.toggle("dragging", reason === "drag");
        setPose(el, el.dataset.step ?? "", { e: value / 100 });
      }}
      onValueCommitted={() => {
        document.getElementById(figure)?.classList.remove("dragging");
      }}
    />
  );
}

interface Props {
  /** The figure's id. */
  figure: string;
  /** The pose the figure opens in (the chapter's first step), for the server's render. */
  opening: Pose;
}

export default function EnergyTray({ figure, opening }: Props) {
  return (
    <FigureTray figure={figure}>
      <Wind figure={figure} />
      <TakeApart figure={figure} opening={Math.round(opening.e * 100)} />
    </FigureTray>
  );
}
