import { useRef, useState } from "react";
import { List, X } from "@phosphor-icons/react";
import { Drawer, DrawerClose } from "./ui/Drawer";

const links = [
  { href: "#acasa", label: "Acasă" },
  { href: "#despre", label: "Despre" },
  { href: "#servicii", label: "Servicii" },
  { href: "#galerie", label: "Galerie" },
  { href: "#intrebari", label: "Întrebări" },
  { href: "#contact", label: "Contact" },
];

// Each link rises and fades in after the panel, staggered by its index (--i):
// the site's reveal language (opacity + 10px translateY, ease-out-quint).
const rise =
  "motion-safe:[transition:opacity_420ms_cubic-bezier(0.22,1,0.36,1)_calc(80ms+var(--i)*45ms),translate_420ms_cubic-bezier(0.22,1,0.36,1)_calc(80ms+var(--i)*45ms),color_150ms] group-data-starting-style:translate-y-[10px] group-data-starting-style:opacity-0";

export default function MobileMenu() {
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
          className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full hover:bg-surface-container transition-colors"
        >
          <List size={22} weight="light" aria-hidden="true" />
        </button>
      }
      viewportClassName="fixed inset-0 z-50"
      // A warm blush panel: the deeper surface-container-high, not low (the
      // latter is ~1.05:1 against the page and reads as transparent), with
      // gold-tinted edges and a faint gold glow echoing the hero accent.
      popupClassName="flex h-full flex-col bg-surface-container-high bg-[radial-gradient(120%_80%_at_100%_0%,rgba(201,169,97,0.16)_0%,rgba(201,169,97,0)_55%)] shadow-[0_8px_40px_-12px_rgba(43,31,26,0.28)] motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gold/30">
        <span className="wordmark text-2xl">Unghii by Ana</span>
        <DrawerClose
          aria-label="Închide meniul"
          className="inline-flex items-center justify-center w-11 h-11 rounded-full text-on-surface hover:bg-surface-container-lowest transition-colors"
        >
          <X size={22} weight="light" aria-hidden="true" />
        </DrawerClose>
      </div>
      <nav className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        {links.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            onClick={follow}
            className={`${rise} font-display text-4xl text-on-surface hover:text-blush-deep`}
            style={{ "--i": i } as React.CSSProperties}
          >
            {link.label}
          </a>
        ))}
        <a
          href="#programari"
          onClick={follow}
          className={`${rise} btn btn-primary mt-6`}
          style={{ "--i": links.length } as React.CSSProperties}
        >
          Programează-te
        </a>
      </nav>
    </Drawer>
  );
}
