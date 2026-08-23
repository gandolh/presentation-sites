import { useEffect, useRef, useState } from "react";
import { site, telLink, waLink } from "../content/site";
import { withBase } from "@sites/kit";

const links = [
  { href: "/", label: "Acasă" },
  { href: "/servicii/", label: "Servicii" },
  { href: "/despre/", label: "Despre" },
  { href: "/contact/", label: "Contact" },
];

export default function MobileMenu({ current = "/" }: { current?: string }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // On open: move focus into the dialog and trap Tab so keyboard users can't
  // reach the page behind the overlay. Esc closes.
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
        className="nav-burger lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-md hover:bg-white/10 transition-colors"
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

      {open && (
        <div
          ref={dialogRef}
          className="mobile-menu fixed inset-0 z-[var(--z-overlay)] flex flex-col text-[var(--color-inverse-on-surface)]"
          role="dialog"
          aria-modal="true"
          aria-label="Meniu de navigare"
        >
          <div className="m-stripe m-stripe--full" aria-hidden="true" />
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <span className="wordmark text-xl">{site.name}</span>
            <button
              type="button"
              aria-label="Închide meniul"
              onClick={() => setOpen(false)}
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
            </button>
          </div>
          <nav className="flex-1 flex flex-col items-center justify-center gap-5 px-6">
            {links.map((link, i) => (
              <a
                key={link.href}
                href={withBase(link.href)}
                onClick={() => setOpen(false)}
                aria-current={current === link.href ? "page" : undefined}
                className={
                  "mobile-menu__link font-display font-bold text-3xl tracking-tight transition-colors " +
                  (current === link.href
                    ? "text-[var(--color-primary-bright)]"
                    : "hover:text-[var(--color-primary-bright)]")
                }
                style={{ "--i": i } as React.CSSProperties}
              >
                {link.label}
              </a>
            ))}
            <div
              className="mobile-menu__link flex flex-col w-full max-w-xs gap-3 mt-6"
              style={{ "--i": links.length } as React.CSSProperties}
            >
              <a href={telLink()} onClick={() => setOpen(false)} className="btn btn-primary btn-lg w-full" data-cta="menu-call">
                Sună acum
              </a>
              <a
                href={waLink()}
                onClick={() => setOpen(false)}
                className="btn btn-whatsapp w-full"
                target="_blank"
                rel="noopener"
                data-cta="menu-whatsapp"
              >
                Scrie pe WhatsApp
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
