// The scale plan — the site's one real instrument.
//
// A visitor's actual question is "how big is that on my ground?", and no table
// of square metres answers it. This draws each format's footprint to scale on a
// one-metre grid, against a parked car, and moves between them.
//
// It is not a call to action. Nothing here submits, books, or asks. It is a
// ruler you can move.
//
// Implementation note: Motion reads `x`/`y` on an element as transform
// shorthands, so animating SVG *geometry* through props silently does nothing
// (width/height never leave 0 and the rect never appears). So one spring
// carries the format index and a subscriber writes the real attributes — one
// motion value, no per-frame React render, and the geometry is always correct.

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

export interface Format {
  w: number;
  d: number;
  label: string;
  area: number;
  seated: string;
  standing: string;
  note: string;
}

interface Props {
  formats: Format[];
  initial?: number;
}

/** A number that rolls to its new value instead of snapping. */
function Rolling({ value, suffix = "" }: { value: number; suffix?: string }) {
  const reduced = useReducedMotion();
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString("ro-RO") + suffix);

  useEffect(() => {
    if (reduced) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 0.5, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [value, mv, reduced]);

  return <motion.span>{text}</motion.span>;
}

const PAD = 3.5;
const CAR_L = 4.5;
const CAR_W = 1.8;

export default function TentScale({ formats, initial = 1 }: Props) {
  const [i, setI] = useState(Math.min(initial, formats.length - 1));
  const reduced = useReducedMotion();
  const f = formats[i];

  // A plan is conventionally drawn with the long axis across the page.
  const long = (x: Format) => Math.max(x.w, x.d);
  const short = (x: Format) => Math.min(x.w, x.d);

  const MAX_L = Math.max(...formats.map(long));
  const MAX_S = Math.max(...formats.map(short));
  // extra room on the right for the depth dimension and its label
  const VB_W = MAX_L + PAD * 2 + 4.5;
  const VB_H = MAX_S + PAD * 2 + CAR_W + 1.6;
  const cx = (MAX_L + PAD * 2) / 2;
  const cy = PAD + MAX_S / 2;

  const rect = useRef<SVGRectElement>(null);
  const ridge = useRef<SVGLineElement>(null);
  const dimW = useRef<SVGLineElement>(null);
  const dimWText = useRef<SVGTextElement>(null);
  const dimD = useRef<SVGLineElement>(null);
  const dimDText = useRef<SVGTextElement>(null);

  // One spring carries the format index; everything geometric derives from it.
  const t = useSpring(i, { stiffness: 210, damping: 26, restDelta: 0.001 });

  const draw = (v: number) => {
    const clamped = Math.min(formats.length - 1, Math.max(0, v));
    const lo = Math.floor(clamped);
    const hi = Math.min(formats.length - 1, lo + 1);
    const k = clamped - lo;
    const L = long(formats[lo]) + (long(formats[hi]) - long(formats[lo])) * k;
    const S = short(formats[lo]) + (short(formats[hi]) - short(formats[lo])) * k;

    const x = cx - L / 2;
    const y = cy - S / 2;

    rect.current?.setAttribute("x", String(x));
    rect.current?.setAttribute("y", String(y));
    rect.current?.setAttribute("width", String(L));
    rect.current?.setAttribute("height", String(S));

    // the ridge, so the plan reads as a tent and not a slab
    ridge.current?.setAttribute("x1", String(x));
    ridge.current?.setAttribute("x2", String(x + L));
    ridge.current?.setAttribute("y1", String(cy));
    ridge.current?.setAttribute("y2", String(cy));

    dimW.current?.setAttribute("x1", String(x));
    dimW.current?.setAttribute("x2", String(x + L));
    dimW.current?.setAttribute("y1", String(y - 1.5));
    dimW.current?.setAttribute("y2", String(y - 1.5));
    dimWText.current?.setAttribute("x", String(cx));
    dimWText.current?.setAttribute("y", String(y - 2.1));

    dimD.current?.setAttribute("x1", String(x + L + 1.5));
    dimD.current?.setAttribute("x2", String(x + L + 1.5));
    dimD.current?.setAttribute("y1", String(y));
    dimD.current?.setAttribute("y2", String(y + S));
    dimDText.current?.setAttribute("x", String(x + L + 2.1));
    dimDText.current?.setAttribute("y", String(cy));
  };

  useMotionValueEvent(t, "change", draw);

  // Draw once on mount, and jump straight to the target when motion is off.
  useEffect(() => {
    if (reduced) t.jump(i);
    else t.set(i);
    draw(reduced ? i : t.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, reduced]);

  // Keep the hero's structure, when it is on the page, on the same format.
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("subcort:size", { detail: { size: i / (formats.length - 1) } }),
    );
  }, [i, formats.length]);

  const fLong = long(f);
  const fShort = short(f);

  return (
    <div className="scale">
      <div className="scale__plan">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="scale__svg"
          role="img"
          aria-label={`Plan la scară: cort de ${f.label}, ${f.area} metri pătrați, comparat cu o mașină de 4,5 metri`}
        >
          <defs>
            {/* the one-metre grid: warp and weft */}
            <pattern id="ts-m" width="1" height="1" patternUnits="userSpaceOnUse">
              <path d="M1 0V1M0 1H1" stroke="#DCE1E5" strokeWidth="0.05" fill="none" />
            </pattern>
            <pattern id="ts-m5" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M5 0V5M0 5H5" stroke="#BFC8CF" strokeWidth="0.09" fill="none" />
            </pattern>
          </defs>

          <rect width={VB_W} height={VB_H} fill="url(#ts-m)" />
          <rect width={VB_W} height={VB_H} fill="url(#ts-m5)" />

          {/* the footprint */}
          <rect
            ref={rect}
            fill="#22303A"
            fillOpacity={0.06}
            stroke="#22303A"
            strokeWidth={0.18}
          />
          <line ref={ridge} stroke="#C2481E" strokeWidth={0.13} strokeDasharray="0.8 0.55" />

          {/* dimensions */}
          <line ref={dimW} stroke="#22303A" strokeWidth={0.07} />
          <text
            ref={dimWText}
            fontSize="1.15"
            fontWeight="600"
            fontFamily="IBM Plex Mono, monospace"
            fill="#22303A"
            textAnchor="middle"
          >
            {fLong} m
          </text>
          <line ref={dimD} stroke="#22303A" strokeWidth={0.07} />
          <text
            ref={dimDText}
            fontSize="1.15"
            fontWeight="600"
            fontFamily="IBM Plex Mono, monospace"
            fill="#22303A"
            dominantBaseline="middle"
          >
            {fShort} m
          </text>

          {/* the car, for scale — the thing everyone can judge */}
          <g>
            <rect
              x={PAD}
              y={VB_H - CAR_W - 0.6}
              width={CAR_L}
              height={CAR_W}
              rx={0.35}
              fill="#C6CDD3"
            />
            <text
              x={PAD + CAR_L + 0.8}
              y={VB_H - CAR_W / 2 - 0.6}
              fontSize="0.95"
              fill="#5E7180"
              fontWeight="500"
              fontFamily="IBM Plex Mono, monospace"
              dominantBaseline="middle"
            >
              mașină · 4,5 m
            </text>
          </g>
        </svg>
      </div>

      <div className="scale__side">
        <div className="scale__pick" role="group" aria-label="Alege formatul cortului">
          {formats.map((x, n) => (
            <button
              key={x.label}
              type="button"
              className="scale__btn"
              data-on={n === i || undefined}
              aria-pressed={n === i}
              onClick={() => setI(n)}
            >
              {x.label}
            </button>
          ))}
        </div>

        <dl className="scale__data">
          <div>
            <dt className="datum-key">Suprafață</dt>
            <dd className="datum-value dim"><Rolling value={f.area} suffix=" m²" /></dd>
          </div>
          <div>
            <dt className="datum-key">Cu mese</dt>
            <dd className="datum-value">{f.seated}</dd>
          </div>
          <div>
            <dt className="datum-key">În picioare</dt>
            <dd className="datum-value">{f.standing}</dd>
          </div>
        </dl>

        <p className="scale__note">{f.note}</p>
      </div>
    </div>
  );
}
