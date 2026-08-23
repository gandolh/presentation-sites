import { useState } from "react";
import { phones, primaryPhone, telLink } from "../content/site";

// Mobile-only persistent bottom dock. The load-bearing call action, thumb-
// reachable at every scroll position. Tapping the main bar calls the dispatcher;
// the chevron expands the other two lines. Hidden on lg+ (the nav button covers
// desktop).
function Phone() {
  return (
    <svg className="w-[1.15rem] h-[1.15rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export default function CallDock() {
  const [open, setOpen] = useState(false);
  const others = phones.slice(1);

  return (
    <div className="call-dock lg:hidden" role="region" aria-label="Sună AXA Tractări">
      {open && others.length > 0 && (
        <ul className="call-dock__more">
          {others.map((p) => (
            <li key={p.e164}>
              <a href={telLink(p.e164)} className="call-dock__more-link">
                <span className="text-[0.72rem] uppercase tracking-wider opacity-70">{p.label}</span>
                <span className="tnum font-semibold">{p.display}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
      <div className="call-dock__bar">
        <a href={telLink(primaryPhone.e164)} className="call-dock__main" aria-label={`Sună acum, dispecerat, ${primaryPhone.display}`}>
          <span className="call-dock__icon"><Phone /></span>
          <span className="flex flex-col leading-tight">
            <span className="text-[0.68rem] uppercase tracking-[0.16em] opacity-85">Sună acum · non-stop</span>
            <span className="tnum text-[1.05rem] font-extrabold">{primaryPhone.display}</span>
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
            <svg className={"w-5 h-5 transition-transform " + (open ? "rotate-180" : "")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
