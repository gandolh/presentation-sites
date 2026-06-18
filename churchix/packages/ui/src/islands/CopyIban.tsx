import { useState } from 'react';

interface Props {
  /** The IBAN string to copy to the clipboard. */
  iban: string;
  /** Accessible label for the copy button (e.g. "Copiază IBAN Cont RON"). */
  label?: string;
  /** Tailwind classes appended to the button (token-driven; never raw hex). */
  className?: string;
}

/**
 * `<CopyIban>` — tiny clipboard island for the Donează / IBAN block.
 *
 * Single keyboard-accessible button (`content_copy` glyph) that writes the IBAN to
 * the clipboard via `navigator.clipboard.writeText` and shows a transient "Copiat!"
 * confirmation (announced via `aria-live`). No per-church value lives here — the IBAN
 * arrives as a prop from the church's `site.giving.ibans`. Styling is token-driven.
 *
 * Mount with `client:visible`. React is a peerDependency of `@churchix/ui`.
 */
export default function CopyIban({ iban, label = 'Copiază IBAN', className = '' }: Props) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(iban);
    } catch {
      // Older browsers / insecure contexts: fall back to a hidden textarea.
      const ta = document.createElement('textarea');
      ta.value = iban;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        /* give up silently */
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={label}
      title={label}
      className={
        'inline-flex items-center gap-1 shrink-0 rounded-full px-3 py-2 min-h-[44px] ' +
        'font-label-md text-caption uppercase tracking-wide text-primary ' +
        'transition-colors duration-200 hover:bg-surface-container-high ' +
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ' +
        'focus-visible:ring-offset-2 focus-visible:ring-offset-surface ' +
        className
      }
    >
      {/* Material Symbol path, inlined to keep the island self-contained. */}
      <svg
        width={18}
        height={18}
        viewBox="0 -960 960 960"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        style={{ flexShrink: 0 }}
      >
        <path d="M300-200q-24 0-42-18t-18-42v-560q0-24 18-42t42-18h440q24 0 42 18t18 42v560q0 24-18 42t-42 18H300Zm0-60h440v-560H300v560ZM180-80q-24 0-42-18t-18-42v-620h60v620h500v60H180Zm120-180v-560 560Z" />
      </svg>
      <span aria-live="polite">{copied ? 'Copiat!' : 'Copiază'}</span>
    </button>
  );
}
