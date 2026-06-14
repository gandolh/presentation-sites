import { useEffect, useRef, useState } from "react";
import { site, phones, telLink } from "../content/site";

type Link = { href: string; label: string };

export default function MobileMenu({ links }: { links: Link[] }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // On open: move focus into the dialog and trap Tab. Esc closes.
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

    focusable()[0]?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Deschide meniul"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="nav-burger inline-flex items-center justify-center w-11 h-11 rounded-md text-[var(--color-on-surface)] hover:bg-white/10 transition-colors"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      {open && (
        <div
          ref={dialogRef}
          className="mobile-menu fixed inset-0 z-[var(--z-overlay)] flex flex-col text-[var(--color-on-surface)]"
          role="dialog"
          aria-modal="true"
          aria-label="Meniu de navigare"
        >
          <div className="roadline roadline--full" aria-hidden="true" />
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <span className="wordmark text-xl">{site.name}</span>
            <button
              type="button"
              aria-label="Închide meniul"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center w-11 h-11 rounded-md hover:bg-white/10 transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
            {links.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
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
                onClick={() => setOpen(false)}
                className="btn btn-call w-full justify-between"
              >
                <span className="text-[0.8rem] font-semibold opacity-80">{p.label}</span>
                <span className="tnum text-[1.05rem]">{p.display}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
