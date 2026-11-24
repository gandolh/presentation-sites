import { Slider as BaseSlider } from "@base-ui/react/slider";
import type { ReactNode } from "react";

/** What moved the value: a drag, a press on the track, a key, or the hidden range input. */
export type SliderChangeReason = BaseSlider.Root.ChangeEventReason;

export interface SliderProps {
  /** The slider's name, shown above its track and read with its value. */
  label: string;
  value: number;
  /** The readout beside the name, set in Plex Mono. */
  readout: ReactNode;
  /** What a screen reader hears for a value, in words. */
  getAriaValueText: (value: number) => string;
  onValueChange: (value: number, reason: SliderChangeReason) => void;
  /** Called when a drag ends, or after each key or track press. */
  onValueCommitted?: (value: number) => void;
  min?: number;
  max?: number;
  /** The step for Page Up and Page Down (and Shift with an arrow). */
  largeStep?: number;
}

/**
 * A value on a scale, drawn as the sketch's slider: the name and its readout over a hairline track with a tick every
 * tenth (inset by half the thumb, where the thumb's centre stops), the travelled part in blued steel, and a round
 * thumb in blued steel ringed with the card's white. The arrow
 * keys step by one, Page Up and Page Down by `largeStep`, Home and End go to the ends. On a phone it is compact, so
 * two fit in one row of the tray.
 */
export function Slider({
  label,
  value,
  readout,
  getAriaValueText,
  onValueChange,
  onValueCommitted,
  min = 0,
  max = 100,
  largeStep = 10,
}: SliderProps) {
  return (
    <BaseSlider.Root
      value={value}
      min={min}
      max={max}
      largeStep={largeStep}
      onValueChange={(next, details) => {
        onValueChange(next, details.reason);
      }}
      onValueCommitted={(next) => {
        onValueCommitted?.(next);
      }}
      // The thumb stays inside the track at both ends, so two sliders can sit side by side.
      thumbAlignment="edge"
      className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3"
    >
      <BaseSlider.Label className="text-sm whitespace-nowrap text-ink">{label}</BaseSlider.Label>
      <BaseSlider.Value className="fig text-right text-[0.875rem] whitespace-nowrap text-muted max-sm:text-xs">
        {() => readout}
      </BaseSlider.Value>
      <BaseSlider.Control className="col-span-full flex h-11 cursor-pointer touch-none items-center select-none max-sm:h-9">
        <BaseSlider.Track className="h-1 w-full rounded-pill bg-rule after:absolute after:inset-x-2.75 after:top-full after:h-1.25 after:bg-[repeating-linear-gradient(to_right,var(--color-rule-strong)_0_1px,transparent_1px_10%)]">
          <BaseSlider.Indicator className="rounded-pill bg-accent" />
          {/* The blued disc is painted by a pseudo-element, not the thumb's own ground: the focused element is Base UI's
              hidden range input inside the thumb, and its ring is read against the track, where the thumb's ring
              shows. The thumb is raised over the track's tick marks. */}
          <BaseSlider.Thumb
            getAriaValueText={(_formatted, current) => getAriaValueText(current)}
            className="z-(--z-raised) size-5.5 rounded-full border-3 border-surface ring-1 ring-accent before:absolute before:inset-0 before:rounded-full before:bg-accent hover:ring-ink hover:before:bg-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus data-dragging:scale-108 motion-safe:transition-[scale] motion-safe:duration-(--dur-micro) motion-safe:ease-(--ease-out)"
          />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
