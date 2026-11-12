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
          className="nav-burger inline-flex items-center justify-center w-11 h-11 rounded-md text-on-surface hover:bg-white/10 transition-colors"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
      }
      viewportClassName="fixed inset-0 z-(--z-overlay)"
      popupClassName="flex h-full flex-col text-on-surface bg-surface-container-lowest bg-[radial-gradient(120%_90%_at_100%_0%,oklch(80%_0.16_80/0.18)_0%,oklch(80%_0.16_80/0)_58%)] shadow-[0_8px_50px_-12px_oklch(0%_0_0/0.7)] motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]"
    >
      <div className="roadline roadline--full" aria-hidden="true" />
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <span className="wordmark text-xl">{site.name}</span>
        <DrawerClose
          aria-label="Închide meniul"
          className="inline-flex items-center justify-center w-11 h-11 rounded-md hover:bg-white/10 transition-colors"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </DrawerClose>
      </div>

      <nav className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        {links.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            onClick={follow}
            className={`${rise} font-display font-extrabold uppercase text-3xl tracking-wide hover:text-primary`}
            style={{ "--i": i } as React.CSSProperties}
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* All three numbers — the point of the site. */}
      <div className="px-6 pb-8 pt-4 border-t border-white/10 flex flex-col gap-3">
        {phones.map((p) => (
          <a key={p.e164} href={telLink(p.e164)} onClick={follow} className="btn btn-call w-full justify-between">
            <span className="text-[0.8rem] font-semibold opacity-80">{p.label}</span>
            <span className="tnum text-[1.05rem]">{p.display}</span>
          </a>
        ))}
      </div>
    </Drawer>
  );
}
