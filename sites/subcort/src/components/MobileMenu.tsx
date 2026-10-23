// The phone menu, as the drawing set's index: each sheet with its number.
// A React island animated with Motion — the one place a component library's
// motion primitives earn their hydration cost, because the panel needs
// enter/exit choreography plus a focus trap. The trap, Esc, the scroll lock
// and focus back on the button are Base UI's Dialog; Motion keeps the
// choreography, through the popup's `render` and AnimatePresence.

import { Dialog } from "@base-ui/react/dialog";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export interface MenuLink { href: string; label: string; no: string }
interface Props { links: MenuLink[]; current?: string }

export default function MobileMenu({ links, current = "/" }: Props) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  // The panel hangs under the header and is placed by it: the header's
  // backdrop-filter makes it the panel's containing block. So it is portalled
  // into the header, where it was rendered before Base UI.
  const header = useRef<HTMLElement | null>(null);
  useEffect(() => {
    header.current = triggerRef.current?.closest("header") ?? null;
  }, []);

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger ref={triggerRef} className="menu-btn">
        <span className="sr-only">{open ? "Închide meniul" : "Deschide meniul"}</span>
        <span className="menu-btn__bars" data-open={open || undefined} aria-hidden="true">
          <i /><i /><i />
        </span>
      </Dialog.Trigger>

      <AnimatePresence>
        {open && (
          // Kept mounted while Motion plays the exit; Base UI waits for its opacity.
          <Dialog.Portal keepMounted container={header}>
            <Dialog.Popup
              className="menu-panel"
              aria-label="Meniu"
              render={
                <motion.div
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
                  animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={{ duration: reduced ? 0.12 : 0.32, ease }}
                />
              }
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
            </Dialog.Popup>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
