import { useRef, useState } from "react";
import { withBase } from "../lib/base.ts";
import { Drawer } from "../primitives/Drawer.tsx";

interface NavItem {
  label: string;
  href: string;
}

interface Props {
  nav: NavItem[];
  /** Current path, for the current-place mark (mirrors Header's isActive). */
  activePath?: string;
  /** Donează target + label; both present only when `features.giving` is on. */
  givingHref?: string;
  givingLabel?: string;
  /** Locales the church ships; the language list renders only when >1. */
  locales?: string[];
  defaultLocale?: string;
  /** Accessible heading for the language group. */
  localeLabel?: string;
}

const LOCALE_NAMES: Record<string, string> = {
  ro: "Română",
  en: "English",
  it: "Italiano",
  es: "Español",
  de: "Deutsch",
};

const localeHref = (loc: string, defaultLocale: string) =>
  loc === defaultLocale ? withBase("/") : withBase(`/${loc}/`);

const stroke = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

/**
 * The `Meniu` place of the phone's bottom bar, and the sheet behind it. Hydrated `client:load` inside
 * `BottomBar`, which hides it from 960 px up. The sheet is `primitives/Drawer.tsx`, a Base UI `Drawer`: it
 * rises from the bar, moves focus into the sheet on open and traps it there, locks the page's scroll, closes
 * on a swipe down, a press outside, the toggle (turned into an X), its own close button or Esc, and hands focus
 * back to the toggle. A nav or locale link closes it without that, since focus goes on to the page it opens.
 * The sheet is portalled into this island's own wrapper. All color via M3 tokens.
 */
export default function MobileNav({
  nav,
  activePath = "/",
  givingHref = "/donatii",
  givingLabel,
  locales,
  defaultLocale = "ro",
  localeLabel = "Schimbă limba",
}: Props) {
  const [open, setOpen] = useState(false);
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null);
  const leftByLink = useRef(false);
  const follow = () => {
    leftByLink.current = true;
    setOpen(false);
  };
  const isActive = (href: string) =>
    href === "/" ? activePath === "/" : activePath === href || activePath.startsWith(href + "/");
  const localeList = locales && locales.length > 1 ? locales : null;

  const linkBase =
    "flex min-h-12 items-center rounded px-3 font-body-md text-body-md no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset";

  return (
    <div ref={setWrapper} className="relative h-full">
      <Drawer
        open={open}
        onOpenChange={(next) => {
          leftByLink.current = false;
          setOpen(next);
        }}
        title="Meniu"
        swipeDirection="down"
        trigger={
          <button
            type="button"
            className="flex h-full min-h-16 w-full min-w-11 flex-col items-center justify-center gap-0.5 bg-transparent p-0 font-body-md text-label-md font-normal text-on-surface-variant transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
            aria-label={open ? "Închide meniul" : "Deschide meniul"}
          >
            <svg {...stroke}>{open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
            Meniu
          </button>
        }
        container={wrapper}
        finalFocus={() => !leftByLink.current}
        backdropClassName="fixed inset-0 z-49"
        viewportClassName="fixed bottom-[calc(4rem+env(safe-area-inset-bottom)+0.5rem)] right-3 z-50"
        popupClassName="w-[min(20rem,calc(100vw-1.5rem))] rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-board"
        titleClassName="font-headline-md text-[22px] font-bold leading-7 text-primary"
        closeLabel="Închide meniul"
        closeClassName="flex h-11 w-11 items-center justify-center rounded-full bg-transparent text-primary hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        closeIcon={
          <svg {...stroke}>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        }
      >
        {nav.map((item) => {
          const active = isActive(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={
                linkBase +
                " " +
                (active
                  ? "bg-surface-highlight font-semibold text-primary"
                  : "text-on-surface hover:bg-surface-container hover:text-primary")
              }
              onClick={follow}
            >
              {item.label}
            </a>
          );
        })}
        {givingLabel && (
          <a
            className={linkBase + " font-semibold text-primary hover:bg-surface-container"}
            href={givingHref}
            onClick={follow}
          >
            {givingLabel}
          </a>
        )}
        {localeList && (
          <div className="mt-1 border-t border-outline-variant pt-1">
            <p className="px-3 py-1 font-label-md text-label-md text-on-surface-variant">{localeLabel}</p>
            {localeList.map((loc) => (
              <a
                key={loc}
                hrefLang={loc}
                href={localeHref(loc, defaultLocale)}
                aria-current={loc === defaultLocale ? "true" : undefined}
                className={
                  linkBase +
                  " " +
                  (loc === defaultLocale
                    ? "bg-surface-highlight font-semibold text-primary"
                    : "text-on-surface hover:bg-surface-container hover:text-primary")
                }
                onClick={follow}
              >
                {LOCALE_NAMES[loc] ?? loc.toUpperCase()}
              </a>
            ))}
          </div>
        )}
      </Drawer>
    </div>
  );
}
