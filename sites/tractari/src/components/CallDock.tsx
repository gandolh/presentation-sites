import { useState } from "react";
import { phones, primaryPhone, telLink } from "../content/site";

// Phone-only bottom dock: the call, one tap from any scroll position once the
// dispatcher's plate has left the screen (the observer in Contact.astro sets
// `data-plate`; with no script the dock stays visible). Tapping the main bar
// calls the dispatcher; the toggle opens the other two lines. The stylesheet
// shows it at 760 px and under.
function Phone({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export default function CallDock() {
  const [open, setOpen] = useState(false);
  const others = phones.slice(1);

  return (
    <div className="call-dock" role="region" aria-label="Sună AXA Tractări">
      {open && others.length > 0 && (
        <ul className="call-dock__more">
          {others.map((p) => (
            <li key={p.e164}>
              <a href={telLink(p.e164)} className="call-dock__more-link">
                <span className="call-dock__who">
                  <Phone size={20} />
                  <span>{p.label}</span>
                </span>
                <span className="tnum">{p.display}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
      <div className="call-dock__bar">
        <a
          href={telLink(primaryPhone.e164)}
          className="call-dock__main"
          aria-label={`Sună acum, dispecerat, ${primaryPhone.display}`}
        >
          <span className="call-dock__icon">
            <Phone />
          </span>
          <span className="call-dock__text">
            <span className="call-dock__label">Sună acum, non-stop</span>
            <span className="call-dock__num">{primaryPhone.display}</span>
          </span>
        </a>
        {others.length > 0 && (
          <button
            type="button"
            className="call-dock__toggle"
            aria-expanded={open}
            aria-label={open ? "Ascunde celelalte numere" : "Arată celelalte numere"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="m18 15-6-6-6 6" />}
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
