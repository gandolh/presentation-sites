// The phone menu, as the drawing set's index: each sheet with its number.
// A React island: the panel is the drawer in ui/Drawer.tsx (the focus trap,
// Esc, the swipe, the scroll lock and focus back on the button are Base UI's;
// the entrance is CSS on its state attributes), and each sheet's link rises in
// turn through `group-data-starting-style:`.

import { useState } from "react";
import { Drawer } from "./ui/Drawer";

export interface MenuLink {
  href: string;
  label: string;
  no: string;
}
interface Props {
  links: MenuLink[];
  current?: string;
}

// Each sheet rises and fades in after the panel, staggered by its index (--i).
const bar =
  "block h-[1.5px] bg-current motion-safe:[transition:translate_240ms_cubic-bezier(0.16,1,0.3,1),rotate_240ms_cubic-bezier(0.16,1,0.3,1),opacity_160ms_ease-out]";
const rise =
  "motion-safe:[transition:opacity_380ms_cubic-bezier(0.16,1,0.3,1)_calc(40ms+var(--i)*40ms),translate_380ms_cubic-bezier(0.16,1,0.3,1)_calc(40ms+var(--i)*40ms)] group-data-starting-style:translate-y-[7px] group-data-starting-style:opacity-0";

export default function MobileMenu({ links, current = "/" }: Props) {
  const [open, setOpen] = useState(false);
  // The panel hangs under the header and is placed by it: the header is sticky
  // under a banner on some pages and has a backdrop-filter, which makes it the
  // containing block of a fixed child. So the panel is mounted in the header.
  const [header, setHeader] = useState<HTMLElement | null>(null);

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      title="Meniu"
      trigger={
        <button
          type="button"
          ref={(el) => setHeader(el?.closest("header") ?? null)}
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-ink min-[880px]:hidden"
        >
          <span className="sr-only">{open ? "Închide meniul" : "Deschide meniul"}</span>
          <span className="group grid w-[22px] gap-[5px]" data-open={open || undefined} aria-hidden="true">
            <i className={`${bar} group-data-open:translate-y-[6.5px] group-data-open:rotate-45`} />
            <i className={`${bar} group-data-open:opacity-0`} />
            <i className={`${bar} group-data-open:-translate-y-[6.5px] group-data-open:-rotate-45`} />
          </span>
        </button>
      }
      container={header}
      backdropClassName="fixed inset-x-0 top-[var(--nav-h,4.25rem)] z-54 h-dvh"
      // Placed against the header (its containing block): its bottom edge.
      // The clip keeps a swipe up from painting over the header, and lets the
      // panel's shadow fall below.
      viewportClassName="fixed inset-x-0 top-[var(--nav-h,4.25rem)] z-55 [clip-path:inset(0_0_-40px_0)]"
      popupClassName="bg-sheet border-b-[1.5px] border-ink px-(--sheet-pad) pt-1 pb-5 shadow-[0_18px_40px_-26px_oklch(29%_0.028_234/0.5)] motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]"
    >
      <nav aria-label="Navigare principală (mobil)" className="grid">
        {links.map((l, i) => (
          <a
            key={l.href}
            href={l.href}
            className={`${rise} flex items-baseline gap-[0.9rem] border-b border-hair py-[0.9rem] text-[1.2rem] font-semibold tracking-[-0.02em] text-ink last:border-b-0 aria-[current=page]:text-signal`}
            aria-current={current === l.href ? "page" : undefined}
            style={{ "--i": i } as React.CSSProperties}
          >
            <span
              className={`font-mono text-[0.72rem] font-medium ${current === l.href ? "text-signal" : "text-line"}`}
              aria-hidden="true"
            >
              {l.no}
            </span>
            {l.label}
          </a>
        ))}
      </nav>
    </Drawer>
  );
}
