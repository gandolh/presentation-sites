import { useEffect, useRef, useState } from "react";

const links = [
  { href: "#acasa", label: "Acasă" },
  { href: "#despre", label: "Despre" },
  { href: "#servicii", label: "Servicii" },
  { href: "#galerie", label: "Galerie" },
  { href: "#intrebari", label: "Întrebări" },
  { href: "#contact", label: "Contact" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // When the dialog opens, move focus into it and trap Tab inside it so
  // keyboard users can't reach the page behind the overlay. Esc still closes.
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
        className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full hover:bg-[var(--color-surface-container)] transition-colors"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
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
          className="mobile-menu fixed inset-0 z-50 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Meniu de navigare"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-gold)]/30">
            <span className="wordmark text-2xl">Unghii by Ana</span>
            <button
              type="button"
              aria-label="Închide meniul"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center w-11 h-11 rounded-full text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-lowest)] transition-colors"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
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
                className="mobile-menu__link font-display text-4xl text-[var(--color-on-surface)] hover:text-[var(--color-blush-deep)] transition-colors"
                style={{ "--i": i } as React.CSSProperties}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#programari"
              onClick={() => setOpen(false)}
              className="mobile-menu__link btn btn-primary mt-6"
              style={{ "--i": links.length } as React.CSSProperties}
            >
              Programează-te
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
