import { Dialog } from "@base-ui/react/dialog";
import { useRef, useState } from "react";
import { List, X } from "@phosphor-icons/react";

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
        className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full hover:bg-[var(--color-surface-container)] transition-colors"
      >
        <List size={22} weight="light" aria-hidden="true" />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Popup
          className="mobile-menu fixed inset-0 z-50 flex flex-col"
          aria-label="Meniu de navigare"
          finalFocus={() => !leftByLink.current}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-gold)]/30">
            <span className="wordmark text-2xl">Unghii by Ana</span>
            <Dialog.Close
              aria-label="Închide meniul"
              className="inline-flex items-center justify-center w-11 h-11 rounded-full text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-lowest)] transition-colors"
            >
              <X size={22} weight="light" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <nav className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
            {links.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={follow}
                className="mobile-menu__link font-display text-4xl text-[var(--color-on-surface)] hover:text-[var(--color-blush-deep)] transition-colors"
                style={{ "--i": i } as React.CSSProperties}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#programari"
              onClick={follow}
              className="mobile-menu__link btn btn-primary mt-6"
              style={{ "--i": links.length } as React.CSSProperties}
            >
              Programează-te
            </a>
          </nav>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
