// The phone menu, as the drawing set's index: each sheet with its number.
// A React island animated with Motion — the one place a component library's
// motion primitives earn their hydration cost, because the panel needs
// enter/exit choreography plus a focus trap.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export interface MenuLink { href: string; label: string; no: string }
interface Props { links: MenuLink[]; current?: string }

export default function MobileMenu({ links, current = "/" }: Props) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const f = panelRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (!f?.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="menu-btn"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">{open ? "Închide meniul" : "Deschide meniul"}</span>
        <span className="menu-btn__bars" data-open={open || undefined} aria-hidden="true">
          <i /><i /><i />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            ref={panelRef}
            className="menu-panel"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduced ? 0.12 : 0.32, ease }}
          >
            <nav aria-label="Navigare principală (mobil)">
              {links.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  className="menu-panel__link"
                  data-current={current === l.href || undefined}
                  aria-current={current === l.href ? "page" : undefined}
                  initial={reduced ? false : { opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduced ? 0 : 0.38, delay: reduced ? 0 : 0.04 + i * 0.04, ease }}
                >
                  <span aria-hidden="true">{l.no}</span>
                  {l.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
