import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import type { ComponentProps } from "react";

type ToggleProps = Omit<ComponentProps<typeof BaseToggle>, "className"> & { className?: string };

// The quiet bordered button (the header's Pause, `.quiet` in the stylesheet), drawn on the part itself; pressed, it
// takes the blued-steel ground the current chapter wears.
const look =
  "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-control border border-rule-strong bg-surface px-3 text-sm whitespace-nowrap text-ink select-none hover:border-ink-2 hover:bg-paper-2 active:bg-paper-3 data-pressed:border-accent data-pressed:bg-accent-soft data-pressed:text-accent motion-safe:transition-colors motion-safe:duration-(--dur-short) motion-safe:ease-(--ease-out)";

/**
 * A two-state button. Its name stays the same whichever state it is in; `aria-pressed` says the state, so a
 * screen reader hears "Pause, pressed" rather than a label that changes under the user.
 */
export function Toggle({ className = "", ...props }: ToggleProps) {
  return <BaseToggle {...props} className={`${look} ${className}`} />;
}
