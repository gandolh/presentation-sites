// Chapter 1's tray: the figure's Pause and Speed, then its own controls. Wind coils the mainspring and turns the arbor
// with it. A React island, hydrated when it scrolls into view. The drawing is Astro's: the island writes to it.

import { useState } from "react";
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

interface Props {
  /** The figure's id. */
  figure: string;
}

export default function EnergyTray({ figure }: Props) {
  return (
    <FigureTray figure={figure}>
      <Wind figure={figure} />
    </FigureTray>
  );
}
