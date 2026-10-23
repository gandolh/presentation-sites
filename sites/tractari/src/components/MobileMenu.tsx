import { Dialog } from "@base-ui/react/dialog";
import { useRef, useState } from "react";
import { site, phones, telLink } from "../content/site";

type Link = { href: string; label: string };

export default function MobileMenu({ links }: { links: Link[] }) {
  const [open, setOpen] = useState(false);
  // Base UI's Dialog traps focus, locks the page's scroll, closes on Esc and
  // hands focus back to the button. A navigation link does not get focus
  // back: it moves focus on its own, to wherever it went.
  const leftByLink = useRef(false);
  const follow = () => {
    leftByLink.current = true;
    setOpen(false);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        leftByLink.current = false;
        setOpen(next);
      }}
    >
      <Dialog.Trigger
        aria-label="Deschide meniul"
        className="nav-burger inline-flex items-center justify-center w-11 h-11 rounded-md text-[var(--color-on-surface)] hover:bg-white/10 transition-colors"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Popup
          className="mobile-menu fixed inset-0 z-[var(--z-overlay)] flex flex-col text-[var(--color-on-surface)]"
          aria-label="Meniu de navigare"
          finalFocus={() => !leftByLink.current}
        >
          <div className="roadline roadline--full" aria-hidden="true" />
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <span className="wordmark text-xl">{site.name}</span>
            <Dialog.Close
              aria-label="Închide meniul"
              className="inline-flex items-center justify-center w-11 h-11 rounded-md hover:bg-white/10 transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </Dialog.Close>
          </div>

          <nav className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
            {links.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={follow}
                className="mobile-menu__link font-display font-extrabold uppercase text-3xl tracking-wide transition-colors hover:text-[var(--color-primary)]"
                style={{ "--i": i } as React.CSSProperties}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* All three numbers — the point of the site. */}
          <div className="px-6 pb-8 pt-4 border-t border-white/10 flex flex-col gap-3">
            {phones.map((p) => (
              <a
                key={p.e164}
                href={telLink(p.e164)}
                onClick={follow}
                className="btn btn-call w-full justify-between"
              >
                <span className="text-[0.8rem] font-semibold opacity-80">{p.label}</span>
                <span className="tnum text-[1.05rem]">{p.display}</span>
              </a>
            ))}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
