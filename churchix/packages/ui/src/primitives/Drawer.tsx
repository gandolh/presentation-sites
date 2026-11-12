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
  initialFocus?: PopupProps["initialFocus"];
  finalFocus?: PopupProps["finalFocus"];
  /** Where the panel is mounted; the page's body when left out. */
  container?: ComponentProps<typeof BaseDrawer.Portal>["container"];
  /** An invisible layer behind the panel that catches a tap outside it. */
  backdropClassName?: string;
  /** Where the panel sits: its box and its z-index. */
  viewportClassName: string;
  /** The panel's own look: background, border, shadow, padding. */
  popupClassName: string;
  children: ReactNode;
}

/**
 * The phone menu's panel. It hangs from the top edge and closes on a swipe
 * up, a tap outside, its toggle (a press outside, since the page behind a
 * modal drawer is inert) or Esc. It fades in and drifts down a few pixels,
 * under `motion-safe:`. Controlled, so a link can close it as it navigates.
 */
export function Drawer({
  open,
  onOpenChange,
  title,
  trigger,
  initialFocus,
  finalFocus,
  container,
  backdropClassName,
  viewportClassName,
  popupClassName,
  children,
}: DrawerProps) {
  return (
    <BaseDrawer.Root open={open} onOpenChange={onOpenChange} swipeDirection="up">
      <BaseDrawer.Trigger render={trigger} />
      <BaseDrawer.Portal container={container}>
        {backdropClassName && <BaseDrawer.Backdrop className={backdropClassName} />}
        <BaseDrawer.Viewport className={viewportClassName}>
          <BaseDrawer.Popup
            initialFocus={initialFocus}
            finalFocus={finalFocus}
            className={
              "outline-none [transform:translateY(var(--drawer-swipe-movement-y))] motion-safe:transition-[opacity,transform] motion-safe:duration-200 data-swiping:duration-0 data-starting-style:opacity-0 data-starting-style:[transform:translateY(-8px)] data-ending-style:opacity-0 data-ending-style:[transform:translateY(-8px)] " +
              popupClassName
            }
          >
            <BaseDrawer.Title className="sr-only">{title}</BaseDrawer.Title>
            <BaseDrawer.Content render={<nav aria-label="Meniu navigare" />} className="flex flex-col gap-1">
              {children}
            </BaseDrawer.Content>
          </BaseDrawer.Popup>
        </BaseDrawer.Viewport>
      </BaseDrawer.Portal>
    </BaseDrawer.Root>
  );
}
