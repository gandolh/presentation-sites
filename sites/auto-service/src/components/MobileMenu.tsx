import { useEffect, useRef, useState } from "react";
import { site, telLink, waLink } from "../content/site";
import { withBase } from "@sites/kit";

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

export default function MobileMenu({ current = "/" }: { current?: string }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
        className="nav-burger lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-[var(--radius)] transition-colors hover:bg-white/8"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={BURGER} />
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
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-outline-variant)]">
            <span className="flex items-center gap-2.5">
              <span
                className="w-[9px] h-[9px] rounded-full bg-[var(--color-primary)]"
                style={{ boxShadow: "0 0 10px oklch(72% 0.17 58 / 0.9)" }}
                aria-hidden="true"
              />
              <span className="wordmark text-lg uppercase">{site.name}</span>
            </span>
            <button
              type="button"
              aria-label="Închide meniul"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center w-11 h-11 rounded-[var(--radius)] transition-colors hover:bg-white/8"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={CLOSE} />
              </svg>
            </button>
          </div>

          <nav className="flex-1 flex flex-col justify-center gap-1 px-6">
            {links.map((link, i) => (
              <a
                key={link.href}
                href={withBase(link.href)}
                onClick={() => setOpen(false)}
                aria-current={current === link.href ? "page" : undefined}
                className={
                  "mobile-menu__link flex items-baseline gap-4 py-3 border-b border-[var(--color-outline-variant)] transition-colors " +
                  (current === link.href
                    ? "text-[var(--color-primary-bright)]"
                    : "hover:text-[var(--color-primary-bright)]")
                }
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="reading text-[0.66rem] text-[var(--color-outline)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="heading-lg !text-[1.6rem]">{link.label}</span>
              </a>
            ))}

            <div
              className="mobile-menu__link flex flex-col gap-3 mt-8"
              style={{ "--i": links.length } as React.CSSProperties}
            >
              <a href={telLink()} onClick={() => setOpen(false)} className="btn btn-primary btn-lg w-full" data-cta="menu-call">
                Sună acum · {site.phone}
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
