import { useRef, useState } from "react";
import { site, telLink, waLink } from "../content/site";
import { withBase } from "@sites/kit";
import { Drawer, DrawerClose } from "./ui/Drawer";

const links = [
  { href: "/", label: "Acasă" },
  { href: "/servicii/", label: "Servicii" },
  { href: "/despre/", label: "Atelier" },
  { href: "/contact/", label: "Contact" },
];

// Pictograms from the closed set (Icon.astro cannot cross into an island, so
// the two glyphs this island needs are inlined at the same 1.75 stroke).
const BURGER = "M3.6 7.2h16.8 M3.6 12h16.8 M3.6 16.8h16.8";
const CLOSE = "M5.6 5.6l12.8 12.8 M18.4 5.6 5.6 18.4";

// Each link rises and fades in after the panel, staggered by its index (--i).
const rise =
  "motion-safe:[transition:opacity_400ms_var(--ease-out)_calc(60ms+var(--i)*42ms),translate_400ms_var(--ease-out)_calc(60ms+var(--i)*42ms)] group-data-starting-style:translate-y-[9px] group-data-starting-style:opacity-0";

export default function MobileMenu({ current = "/" }: { current?: string }) {
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
        <button type="button" aria-label="Deschide meniul" className="menu">
          <svg
            className="ic"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={BURGER} />
          </svg>
        </button>
      }
      viewportClassName="fixed inset-0 z-(--z-overlay)"
      popupClassName="flex h-full flex-col bg-background px-6 pb-6 text-on-surface motion-safe:ease-out"
    >
      <div className="flex items-center justify-between border-b border-outline-variant py-3">
        <span className="mark text-lg">{site.name}</span>
        <DrawerClose
          aria-label="Închide meniul"
          className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-outline"
        >
          <svg
            className="ic"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={CLOSE} />
          </svg>
        </DrawerClose>
      </div>
      <nav className="flex flex-1 flex-col overflow-y-auto">
        {links.map((link, i) => (
          <a
            key={link.href}
            href={withBase(link.href)}
            onClick={follow}
            aria-current={current === link.href ? "page" : undefined}
            className={`${rise} flex min-h-14 items-center border-b border-outline-variant text-number font-bold no-underline aria-[current=page]:underline aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8`}
            style={{ "--i": i } as React.CSSProperties}
          >
            {link.label}
          </a>
        ))}
        <div className={`${rise} mt-6 grid gap-3`} style={{ "--i": links.length } as React.CSSProperties}>
          <a href={telLink()} onClick={follow} className="call !min-h-12" data-cta="menu-call">
            <span className="text-title font-bold">Sună acum: {site.phone}</span>
          </a>
          <a
            href={waLink()}
            onClick={follow}
            className="btn ol"
            target="_blank"
            rel="noopener"
            data-cta="menu-whatsapp"
          >
            Scrie pe WhatsApp
          </a>
        </div>
      </nav>
    </Drawer>
  );
}
