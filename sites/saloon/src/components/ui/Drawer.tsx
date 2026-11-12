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
  /** An invisible layer behind the panel that catches a tap outside it. Only a panel that leaves part of the page uncovered needs one. */
  backdropClassName?: string;
  /** Where the panel sits on the screen: its box and its z-index. */
  viewportClassName: string;
  /** The panel's own look: background, shadow, layout of its content. */
  popupClassName: string;
  children: ReactNode;
}

/**
 * The phone menu's panel. It hangs from the top edge and closes on a swipe
 * up, a tap outside, its X (`DrawerClose`) or Esc. It fades in and drifts
 * down a few pixels, and its links (a `group-data-starting-style:` child)
 * can rise in turn. Controlled, so a link can close it as it navigates.
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
              "group outline-none [transform:translateY(var(--drawer-swipe-movement-y))] motion-safe:transition-[opacity,transform] motion-safe:duration-300 data-swiping:duration-0 data-starting-style:opacity-0 data-starting-style:[transform:translateY(-12px)] data-ending-style:opacity-0 data-ending-style:[transform:translateY(-8px)] " +
              popupClassName
            }
          >
            <BaseDrawer.Title className="sr-only">{title}</BaseDrawer.Title>
            {children}
          </BaseDrawer.Popup>
        </BaseDrawer.Viewport>
      </BaseDrawer.Portal>
    </BaseDrawer.Root>
  );
}

export function DrawerClose(props: ComponentProps<typeof BaseDrawer.Close>) {
  return <BaseDrawer.Close {...props} />;
}
