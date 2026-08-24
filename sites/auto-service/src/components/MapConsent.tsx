import { useState } from "react";

interface Props {
  lat: number;
  lng: number;
  label: string;
}

// GDPR-friendly map: nothing is requested from Google until the visitor clicks
// "Încarcă harta". Before that we show a static, self-contained placeholder, so
// no Google cookie is set and no IP is sent (see corpus/LEGAL.md, Legea
// 506/2004). After consent we load the standard Maps embed in an iframe.
export default function MapConsent({ lat, lng, label }: Props) {
  const [loaded, setLoaded] = useState(false);

  const embedSrc = `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  if (loaded) {
    return (
      <iframe
        title={`Hartă — ${label}`}
        src={embedSrc}
        className="h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    );
  }

  return (
    // This placeholder sits in the aluminium trim panel (Contact) as a well
    // recessed INTO it, so it reads a step darker than the trim rather than
    // lighter. Ink is the light-panel inversion set; consent flow unchanged.
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center"
      style={{ backgroundColor: "oklch(81% 0.005 250)" }}>
      {/* faux map grid, pure CSS — zero external requests */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0% 0 0 / 0.11) 1px, transparent 1px), linear-gradient(90deg, oklch(0% 0 0 / 0.11) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative flex flex-col items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <p className="max-w-xs text-sm text-[var(--color-inverse-on-surface-variant)]">
          Harta Google nu se încarcă automat, ca să-ți protejăm
          confidențialitatea. Apasă mai jos pentru a o încărca.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button type="button" onClick={() => setLoaded(true)} className="btn btn-primary">
            Încarcă harta
          </button>
          <a href={directionsHref} target="_blank" rel="noopener" className="btn btn-outline-inverse">
            Deschide în Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}
