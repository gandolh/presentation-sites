// A moving figure's tray: its own Pause and its Speed, with room for a chapter's own controls (`children`). A React
// island, hydrated when it scrolls into view. Nothing lives in React: the Pause is the page's play state
// (lib/playback.ts) and the figure's hold, the speed is the figure's `--slow` (lib/figure.ts), so the header's Pause and
// the steps' script stay in step with it, both ways. While a step holds the figure still, its Pause shows pressed;
// un-pressing it lets the figure run, and plays the page if it was paused.

import { useCallback, useSyncExternalStore, type ReactNode } from "react";
import { heldAt, onFigureChange, release, setSpeed, speedOf, type Speed } from "../../lib/figure";
import { isPlaying, setPlaying, subscribe } from "../../lib/playback";
import { RadioGroup } from "../ui/RadioGroup";
import { Toggle } from "../ui/Toggle";

const SPEEDS = [
  { value: "1", label: <span className="fig">1×</span> },
  { value: "10", label: <span className="fig">1/10</span> },
  { value: "100", label: <span className="fig">1/100</span> },
] as const;

type SpeedValue = (typeof SPEEDS)[number]["value"];

interface Props {
  /** The figure's id: the element whose speed the tray sets. */
  figure: string;
  /** The speed the figure opens at, for the server's render. */
  speed?: Speed;
  children?: ReactNode;
}

export default function FigureTray({ figure, speed: opening = 1, children }: Props) {
  const playing = useSyncExternalStore(subscribe, isPlaying, () => true);
  const element = () => document.getElementById(figure);
  const subscribeToFigure = useCallback(
    (listener: () => void) => {
      const el = document.getElementById(figure);
      return el ? onFigureChange(el, listener) : () => undefined;
    },
    [figure],
  );
  const speed = useSyncExternalStore(
    subscribeToFigure,
    () => {
      const el = element();
      return el ? speedOf(el) : opening;
    },
    () => opening,
  );
  const held = useSyncExternalStore(
    subscribeToFigure,
    () => {
      const el = element();
      return el ? heldAt(el) !== null : false;
    },
    () => false,
  );

  // The Pause and the Speed share the tray's first row; a chapter's own controls take the cells under it, or the
  // cells beside it where the tray is one row (`.tray` and `.tray-row` in the stylesheet).
  return (
    <>
      <div className="tray-row flex flex-wrap items-center gap-x-6 gap-y-3 max-sm:gap-x-3 max-sm:gap-y-2">
        <Toggle
          pressed={!playing || held}
          onPressedChange={(pressed) => {
            if (pressed) {
              setPlaying(false);
              return;
            }
            const el = element();
            if (el) release(el);
            setPlaying(true);
          }}
          // Before the island hydrates, the page's play state and the figure's hold already show the pressed look.
          className="in-data-hold:border-accent in-data-hold:bg-accent-soft in-data-hold:text-accent in-data-[playing=false]:border-accent in-data-[playing=false]:bg-accent-soft in-data-[playing=false]:text-accent"
        >
          <svg className="size-3.5 shrink-0 fill-current" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M3 2h3v10H3zM8 2h3v10H8z" />
          </svg>
          <span>Pause</span>
        </Toggle>
        <RadioGroup<SpeedValue>
          label="Speed"
          labelClassName="max-sm:sr-only"
          options={SPEEDS}
          value={String(speed) as SpeedValue}
          onValueChange={(value) => {
            const el = element();
            if (el) setSpeed(el, Number(value) as Speed);
          }}
        />
      </div>
      {children}
    </>
  );
}
