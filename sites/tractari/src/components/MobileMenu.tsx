import { useRef, useState } from "react";
import { site, phones, telLink } from "../content/site";
import { Drawer, DrawerClose } from "./ui/Drawer";

type Link = { href: string; label: string };

// Each link rises and fades in after the panel, staggered by its index (--i).
const rise =
  "motion-safe:[transition:opacity_420ms_cubic-bezier(0.16,1,0.3,1)_calc(70ms+var(--i)*45ms),translate_420ms_cubic-bezier(0.16,1,0.3,1)_calc(70ms+var(--i)*45ms),color_150ms] group-data-starting-style:translate-y-[10px] group-data-starting-style:opacity-0";

export default function MobileMenu({ links }: { links: Link[] }) {
  const [open, setOpen] = useState(false);
  // The drawer traps focus, locks the page's scroll, closes on Esc and hands
  // focus back to the button. A navigation link does not get focus back: it
  // moves focus on its own, to wherever it went.
  const leftByLink = useRef(false);
  const follow = () => {
    leftByLink.current = true;
    setOpen(false);
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        leftByLink.current = false;
        setOpen(next);
      }}
      title="Meniu de navigare"
      finalFocus={() => !leftByLink.current}
      trigger={
        <button
          type="button"
          aria-label="Deschide meniul"
          className="nav-burger inline-flex items-center justify-center w-11 h-11 rounded-md text-on-surface bg-surface-container-high border border-outline-variant hover:bg-outline-variant transition-colors"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      }
      viewportClassName="fixed inset-0 z-(--z-overlay)"
      popupClassName="flex h-full flex-col text-on-surface bg-background motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]"
    >
      <div className="flex items-center justify-between px-4 h-14 border-b border-outline-variant bg-surface-container">
        <span className="wordmark text-2xl">{site.name}</span>
        <DrawerClose
          aria-label="Închide meniul"
          className="inline-flex items-center justify-center w-11 h-11 rounded-md bg-surface-container-high border border-outline-variant hover:bg-outline-variant transition-colors"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </DrawerClose>
      </div>

      <nav className="flex flex-col px-4 pt-2" aria-label="Meniu">
        {links.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            onClick={follow}
            className={`${rise} flex items-center min-h-14 border-t border-outline-variant first:border-t-0 text-xl hover:text-primary-bright`}
            style={{ "--i": i } as React.CSSProperties}
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* All three numbers: the point of the site. */}
      <div className="mt-auto px-4 pb-8 pt-2 flex flex-col">
        {phones.map((p) => (
          <a
            key={p.e164}
            href={telLink(p.e164)}
            onClick={follow}
            className="tnum flex items-center justify-between gap-4 min-h-14 border-t border-outline-variant"
          >
            <span className="flex items-center gap-3 text-on-surface-variant">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {p.label}
            </span>
            <span className="font-display font-extrabold text-2xl whitespace-nowrap">{p.display}</span>
          </a>
        ))}
      </div>
    </Drawer>
  );
}
