// The phone's Chapters menu: the seven chapters as rows on a paper panel that hangs under the header. A React
// island, hydrated only below 64rem; the panel is the drawer in ui/Drawer.tsx (Base UI does the focus trap, Esc,
// the swipe up, the scroll lock and focus back on the button), and each row rises in turn through
// `group-data-starting-style:`.

import { useRef, useState, type CSSProperties } from "react";
import { Drawer, DrawerClose } from "./ui/Drawer";

export interface ChapterLink {
  href: string;
  n: number;
  label: string;
}

// Each row rises and fades in after the panel, staggered by its index (--i).
const rise =
  "motion-safe:[transition:opacity_var(--dur-long)_var(--ease-out)_calc(60ms+var(--i)*35ms),translate_var(--dur-long)_var(--ease-out)_calc(60ms+var(--i)*35ms),background-color_var(--dur-short)_var(--ease-out)] group-data-starting-style:translate-y-2 group-data-starting-style:opacity-0";

export default function ChaptersMenu({ links }: { links: ChapterLink[] }) {
  const [open, setOpen] = useState(false);
  // A chapter link does not get focus back on the button: it moves focus on its own, to the chapter it went to.
  const leftByLink = useRef(false);
  const follow = () => {
    leftByLink.current = true;
    setOpen(false);
  };
  // The panel hangs under the header and is placed by it: the header is sticky on wider screens and scrolls away on
  // a phone, and `contain: layout` makes it the containing block of a fixed child. So the panel is mounted in it.
  const [header, setHeader] = useState<HTMLElement | null>(null);

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        leftByLink.current = false;
        setOpen(next);
      }}
      title="Chapters"
      titleClassName="self-center px-3 text-sm text-muted"
      finalFocus={() => !leftByLink.current}
      trigger={
        <button
          type="button"
          ref={(el) => {
            setHeader(el?.closest("header") ?? null);
          }}
          className="inline-flex min-h-11 items-center rounded-control border border-rule-strong bg-surface px-3 text-sm text-ink hover:bg-paper-2 data-popup-open:bg-paper-2 motion-safe:transition-colors motion-safe:duration-(--dur-short) motion-safe:ease-(--ease-out)"
        >
          Chapters
        </button>
      }
      container={header}
      // Placed against the header (its containing block), under its bottom rule. The clip keeps a swipe up from
      // painting over the header; the transparent backdrop below catches a tap outside.
      backdropClassName="fixed inset-x-0 top-[calc(100%+1px)] z-(--z-raised) h-dvh"
      viewportClassName="fixed inset-x-0 top-[calc(100%+1px)] z-(--z-dropdown) [clip-path:inset(0)]"
      popupClassName="grid grid-cols-[minmax(0,1fr)_auto] border-b border-rule-strong bg-surface px-(--gutter) pt-1 pb-3 text-ink motion-safe:ease-(--ease-out)"
    >
      <DrawerClose
        aria-label="Close the chapters"
        className="inline-flex size-11 items-center justify-center rounded-control text-ink-2 hover:bg-paper-2 motion-safe:transition-colors motion-safe:duration-(--dur-short)"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </DrawerClose>
      <nav aria-label="Chapters" className="col-span-2">
        <ol className="grid">
          {links.map((link, i) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={follow}
                className={`${rise} flex min-h-12 items-center gap-3 rounded-control px-3 text-md text-ink-2 no-underline hover:bg-paper-2 hover:text-ink`}
                style={{ "--i": i } as CSSProperties}
              >
                <span className="min-w-[1ch] text-muted">{link.n}</span> {link.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </Drawer>
  );
}
