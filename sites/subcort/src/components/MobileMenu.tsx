// The phone menu: the five places as 52 px rows on a paper panel, the current one marked by a signal bar.
// A React island: the panel is the drawer in ui/Drawer.tsx (the focus trap,
// Esc, the swipe, the scroll lock and focus back on the button are Base UI's;
// the entrance is CSS on its state attributes), and each sheet's link rises in
// turn through `group-data-starting-style:`.

import { useState } from "react";
import { Drawer } from "./ui/Drawer";

export interface MenuLink {
  href: string;
  label: string;
}
interface Props {
  links: MenuLink[];
  current?: string;
}

// Each sheet rises and fades in after the panel, staggered by its index (--i).
const bar =
  "block h-[2px] bg-current motion-safe:[transition:translate_240ms_cubic-bezier(0.16,1,0.3,1),rotate_240ms_cubic-bezier(0.16,1,0.3,1),opacity_160ms_ease-out]";
const rise =
  "motion-safe:[transition:opacity_380ms_cubic-bezier(0.16,1,0.3,1)_calc(40ms+var(--i)*40ms),translate_380ms_cubic-bezier(0.16,1,0.3,1)_calc(40ms+var(--i)*40ms)] group-data-starting-style:translate-y-[7px] group-data-starting-style:opacity-0";

export default function MobileMenu({ links, current = "/" }: Props) {
  const [open, setOpen] = useState(false);
  // The panel hangs under the header and is placed by it: the header is sticky
  // under the note banner and `contain: layout` makes it the containing block
  // of a fixed child. So the panel is mounted in the header.
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
          className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-edge bg-paper text-ink active:bg-fill-2 min-[801px]:hidden"
        >
          <span className="sr-only">{open ? "Închide meniul" : "Deschide meniul"}</span>
          <span className="group grid w-[22px] gap-[5px]" data-open={open || undefined} aria-hidden="true">
            <i className={`${bar} group-data-open:translate-y-[7px] group-data-open:rotate-45`} />
            <i className={`${bar} group-data-open:opacity-0`} />
            <i className={`${bar} group-data-open:-translate-y-[7px] group-data-open:-rotate-45`} />
          </span>
        </button>
      }
      container={header}
      backdropClassName="fixed inset-x-0 top-[var(--nav-h)] z-54 h-dvh"
      // Placed against the header (its containing block): its bottom edge.
      // The clip keeps a swipe up from painting over the header.
      viewportClassName="fixed inset-x-0 top-[var(--nav-h)] z-55 [clip-path:inset(0)]"
      popupClassName="bg-paper border-b-[1.5px] border-ink motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]"
    >
      <nav aria-label="Navigare principală (mobil)" className="grid">
        {links.map((l, i) => (
          <a
            key={l.href}
            href={l.href}
            className={`${rise} flex min-h-[52px] items-center border-b border-hair px-4 text-[1.125rem] font-medium text-ink last:border-b-0 aria-[current=page]:font-bold aria-[current=page]:shadow-[inset_3px_0_0_var(--color-signal)]`}
            aria-current={current === l.href ? "page" : undefined}
            style={{ "--i": i } as React.CSSProperties}
          >
            {l.label}
          </a>
        ))}
      </nav>
    </Drawer>
  );
}
