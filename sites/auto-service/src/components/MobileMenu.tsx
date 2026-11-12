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
  "motion-safe:[transition:opacity_400ms_var(--ease-out)_calc(60ms+var(--i)*42ms),translate_400ms_var(--ease-out)_calc(60ms+var(--i)*42ms),color_150ms] group-data-starting-style:translate-y-[9px] group-data-starting-style:opacity-0";

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
        <button
          type="button"
          aria-label="Deschide meniul"
          className="nav-burger lg:hidden inline-flex items-center justify-center w-11 h-11 rounded transition-colors hover:bg-white/8"
        >
          <svg
            width="22"
            height="22"
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
      popupClassName="flex h-full flex-col text-on-surface bg-surface-menu bg-[radial-gradient(130%_92%_at_100%_0%,oklch(72%_0.17_58/0.16)_0%,oklch(72%_0.17_58/0)_62%)] shadow-[0_10px_54px_-14px_oklch(0%_0_0/0.85)] motion-safe:ease-out"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
        <span className="flex items-center gap-2.5">
          <span
            className="w-[9px] h-[9px] rounded-full bg-primary shadow-[0_0_10px_oklch(72%_0.17_58/0.9)]"
            aria-hidden="true"
          />
          <span className="wordmark text-lg uppercase">{site.name}</span>
        </span>
        <DrawerClose
          aria-label="Închide meniul"
          className="inline-flex items-center justify-center w-11 h-11 rounded transition-colors hover:bg-white/8"
        >
          <svg
            width="22"
            height="22"
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

      <nav className="flex-1 flex flex-col justify-center gap-1 px-6">
        {links.map((link, i) => (
          <a
            key={link.href}
            href={withBase(link.href)}
            onClick={follow}
            aria-current={current === link.href ? "page" : undefined}
            className={
              `${rise} flex items-baseline gap-4 py-3 border-b border-outline-variant ` +
              (current === link.href ? "text-primary-bright" : "hover:text-primary-bright")
            }
            style={{ "--i": i } as React.CSSProperties}
          >
            <span className="reading text-[0.66rem] text-outline">{String(i + 1).padStart(2, "0")}</span>
            <span className="heading-lg !text-[1.6rem]">{link.label}</span>
          </a>
        ))}

        <div className={`${rise} flex flex-col gap-3 mt-8`} style={{ "--i": links.length } as React.CSSProperties}>
          <a href={telLink()} onClick={follow} className="btn btn-primary btn-lg w-full" data-cta="menu-call">
            Sună acum · {site.phone}
          </a>
          <a
            href={waLink()}
            onClick={follow}
            className="btn btn-whatsapp w-full"
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
