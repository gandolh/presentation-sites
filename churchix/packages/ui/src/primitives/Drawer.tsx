import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import type { ComponentProps, ReactElement, ReactNode } from "react";

type PopupProps = ComponentProps<typeof BaseDrawer.Popup>;

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The panel's name for a screen reader; it is not shown. */
  title: string;
  /** The menu button, passed through `render`. */
  trigger: ReactElement;
  /** The way the panel is swiped shut: `up` for a panel hanging from the top, `down` for one rising from the bottom. */
  swipeDirection?: "up" | "down";
  initialFocus?: PopupProps["initialFocus"];
  finalFocus?: PopupProps["finalFocus"];
  /** Where the panel is mounted; the page's body when left out. */
  container?: ComponentProps<typeof BaseDrawer.Portal>["container"];
  /** When set, the title is shown (with these classes) instead of read by a screen reader only. */
  titleClassName?: string;
  /** When set, a close button with this accessible name sits beside the title, with the classes in `closeClassName`. */
  closeLabel?: string;
  closeClassName?: string;
  closeIcon?: ReactNode;
  /** An invisible layer behind the panel that catches a tap outside it. */
  backdropClassName?: string;
  /** Where the panel sits: its box and its z-index. */
  viewportClassName: string;
  /** The panel's own look: background, border, shadow, padding. */
  popupClassName: string;
  children: ReactNode;
}

/**
 * The phone menu's panel. It closes on a swipe away from its edge (up for a panel
 * hanging from the top, down for one rising from the bottom bar), a tap outside,
 * its toggle (a press outside, since the page behind a modal drawer is inert) or
 * Esc. It fades in and drifts a few pixels, under `motion-safe:`. Controlled, so a link can close it as it navigates.
 */
export function Drawer({
  open,
  onOpenChange,
  title,
  trigger,
  swipeDirection = "up",
  initialFocus,
  finalFocus,
  container,
  titleClassName = "sr-only",
  closeLabel,
  closeClassName,
  closeIcon,
  backdropClassName,
  viewportClassName,
  popupClassName,
  children,
}: DrawerProps) {
  return (
    <BaseDrawer.Root open={open} onOpenChange={onOpenChange} swipeDirection={swipeDirection}>
      <BaseDrawer.Trigger render={trigger} />
      <BaseDrawer.Portal container={container}>
        {backdropClassName && <BaseDrawer.Backdrop className={backdropClassName} />}
        <BaseDrawer.Viewport className={viewportClassName}>
          <BaseDrawer.Popup
            initialFocus={initialFocus}
            finalFocus={finalFocus}
            className={
              "outline-none [transform:translateY(var(--drawer-swipe-movement-y))] motion-safe:transition-[opacity,transform] motion-safe:duration-200 data-swiping:duration-0 data-starting-style:opacity-0 data-ending-style:opacity-0 " +
              (swipeDirection === "up"
                ? "data-starting-style:[transform:translateY(-8px)] data-ending-style:[transform:translateY(-8px)] "
                : "data-starting-style:[transform:translateY(8px)] data-ending-style:[transform:translateY(8px)] ") +
              popupClassName
            }
          >
            {closeLabel ? (
              <div className="mb-2 flex items-center justify-between">
                <BaseDrawer.Title className={titleClassName}>{title}</BaseDrawer.Title>
                <BaseDrawer.Close aria-label={closeLabel} className={closeClassName}>
                  {closeIcon}
                </BaseDrawer.Close>
              </div>
            ) : (
              <BaseDrawer.Title className={titleClassName}>{title}</BaseDrawer.Title>
            )}
            <BaseDrawer.Content render={<nav aria-label="Meniu navigare" />} className="flex flex-col gap-1">
              {children}
            </BaseDrawer.Content>
          </BaseDrawer.Popup>
        </BaseDrawer.Viewport>
      </BaseDrawer.Portal>
    </BaseDrawer.Root>
  );
}
