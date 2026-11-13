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
      <div className="map live">
        <iframe
          title={`Hartă: ${label}`}
          src={embedSrc}
          className="h-full min-h-[360px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="map">
      <div className="mapin">
        <svg
          className="ic"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <p>
          Harta Google nu se încarcă automat, ca să-ți protejăm confidențialitatea. Apasă mai jos pentru a o încărca.
        </p>
        <div className="mapb">
          <button type="button" onClick={() => setLoaded(true)} className="btn">
            Încarcă harta
          </button>
          <a href={directionsHref} target="_blank" rel="noopener" className="btn ol">
            Deschide în Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}
