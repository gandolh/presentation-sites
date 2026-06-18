import { useEffect, useRef, useState } from 'react';
import { withBase } from '../lib/base.ts';

interface NavItem {
  label: string;
  href: string;
}

interface Props {
  nav: NavItem[];
  /** Current path, for the active-item underline (mirrors Header's isActive). */
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
  ro: 'Română',
  en: 'English',
  it: 'Italiano',
  es: 'Español',
  de: 'Deutsch',
};

const localeHref = (loc: string, defaultLocale: string) =>
  loc === defaultLocale ? withBase('/') : withBase(`/${loc}/`);

/**
 * Mobile menu toggle + sheet. Hydrated `client:load`; the wrapping `md:hidden`
 * in Header keeps it off desktop. Keyboard-accessible: `aria-expanded` on the
 * toggle, Esc closes and restores focus to the toggle, focus moves into the
 * panel on open and is trapped within it (Tab cycles). All color via M3 tokens.
 */
export default function MobileNav({
  nav,
  activePath = '/',
  givingHref = '/donatii',
  givingLabel,
  locales,
  defaultLocale = 'ro',
  localeLabel = 'Schimbă limba',
}: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const isActive = (href: string) =>
    href === '/'
      ? activePath === '/'
      : activePath === href || activePath.startsWith(href + '/');

  const showLocales = (locales?.length ?? 0) > 1;

  // Esc to close (restore focus to toggle) + focus trap while open.
  useEffect(() => {
    if (!open) return;

    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        ) ?? [],
      );

    // Move focus into the panel.
    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key === 'Tab') {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0]!;
        const last = items[items.length - 1]!;
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const linkBase =
    'block rounded px-3 py-2 font-label-md text-label-md uppercase no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset';

  return (
    <div className="relative">
      <button
        ref={toggleRef}
        type="button"
        className="flex items-center justify-center p-2.5 text-primary rounded-full hover:bg-surface-container-low transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={open ? 'Închide meniul' : 'Deschide meniul'}
        onClick={() => setOpen((v) => !v)}
      >
        {/* Material Symbols `menu` / `close` glyph paths (match @churchix/ui Icon). */}
        <svg
          width={26}
          height={26}
          viewBox="0 -960 960 960"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          {open ? (
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
          ) : (
            <path d="M120-240v-60h720v60H120Zm0-210v-60h720v60H120Zm0-210v-60h720v60H120Z" />
          )}
        </svg>
      </button>

      {open && (
        <nav
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Meniu navigare"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 flex min-w-[14rem] flex-col gap-1 rounded-lg border border-outline-variant/30 bg-surface-container-low p-2 shadow-md"
        >
          {nav.map((item) => {
            const active = isActive(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={
                  linkBase +
                  ' ' +
                  (active
                    ? 'text-primary font-bold border-b-2 border-secondary'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high')
                }
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            );
          })}

          {givingLabel && (
            <a
              className="mt-1 inline-flex items-center justify-center gap-xs rounded-full bg-primary px-6 py-3 font-label-md text-label-md uppercase text-on-primary no-underline transition-[color,background-color,box-shadow,transform] hover:bg-primary-container active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-low"
              href={givingHref}
              onClick={() => setOpen(false)}
            >
              {givingLabel}
            </a>
          )}

          {showLocales && (
            <div className="mt-1 border-t border-outline-variant/30 pt-1">
              <p className="px-3 py-1 font-caption text-caption uppercase tracking-wide text-on-surface-variant">
                {localeLabel}
              </p>
              {locales!.map((loc) => (
                <a
                  key={loc}
                  hrefLang={loc}
                  href={localeHref(loc, defaultLocale)}
                  aria-current={loc === defaultLocale ? 'true' : undefined}
                  className={
                    'block rounded px-3 py-2 font-label-md text-label-md no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ' +
                    (loc === defaultLocale
                      ? 'text-primary font-bold'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high')
                  }
                  onClick={() => setOpen(false)}
                >
                  {LOCALE_NAMES[loc] ?? loc.toUpperCase()}
                </a>
              ))}
            </div>
          )}
        </nav>
      )}
    </div>
  );
}
