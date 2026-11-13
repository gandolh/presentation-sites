import { useState } from "react";

interface Props {
  /** Where to POST the pomelnic (a form service, or the church's own endpoint).
   *  If omitted, the form runs in demo mode and just shows a confirmation. */
  endpoint?: string;
  /** ISO currency for the offering (money is integer minor units + explicit currency). */
  currency?: string;
}

type Status = "idle" | "sending" | "done" | "error";

/** Preset offering amounts, in MAJOR units of `currency` (rendered as minor units on submit). */
const PRESETS = [20, 50, 100] as const;

/**
 * Orthodox pomelnice submission: names of the living (`pomelnic de vii`) and the
 * departed (`pentru cei adormiți`) for prayer at the Holy Liturgy — both lists are
 * filled together. An optional offering (ofrandă) and contact details (for receipts)
 * may accompany them.
 *
 * Submission contract (unchanged shape of behavior):
 *   - no `endpoint`  → demo mode: show the styled confirmation, never fetch.
 *   - with `endpoint`→ POST JSON; `res.ok` → success, otherwise error.
 *
 * The form is valid as long as there is at least one name in EITHER list. The offering
 * is entirely optional. Money is carried as integer minor units + an explicit currency.
 *
 * Look (the porch notice, approved 2026-11-13): raised white cards over the page band's edge. With no endpoint set
 * the page opens on a note, word for word, that sending is off, and there is no submit button (in the dev server the
 * demo path keeps its submit, so the errors and the sent state can be seen). The two name cards have tinted heads
 * (`surface-container`, and `surface-highlight` for the departed), then the offering chips beside the optional
 * contact card. The primitives (Card / Field / Button) are .astro and cannot be imported into a React island, so
 * their class patterns are replicated here.
 */
export default function PomelnicForm({ endpoint, currency = "RON" }: Props) {
  const [numeVii, setNumeVii] = useState("");
  const [numeAdormiti, setNumeAdormiti] = useState("");
  const [preset, setPreset] = useState<number | "custom" | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [validationError, setValidationError] = useState<string | null>(null);

  const money = new Intl.NumberFormat("ro-RO", { style: "currency", currency });

  // Selected offering in MAJOR units, or null if none chosen / invalid.
  const offeringMajor = (() => {
    if (preset === "custom") {
      const n = Number.parseFloat(customAmount.replace(",", "."));
      return Number.isFinite(n) && n > 0 ? n : null;
    }
    return typeof preset === "number" ? preset : null;
  })();

  const hasName = Boolean(numeVii.trim() || numeAdormiti.trim());

  const reset = () => {
    setNumeVii("");
    setNumeAdormiti("");
    setPreset(null);
    setCustomAmount("");
    setContactName("");
    setContactEmail("");
    setValidationError(null);
    setStatus("idle");
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasName) {
      setValidationError("Adăugați cel puțin un nume în pomelnicul de vii sau în cel pentru adormiți.");
      return;
    }
    setValidationError(null);

    const offering = offeringMajor != null ? { amountMinor: Math.round(offeringMajor * 100), currency } : null;

    const payload = {
      nume_vii: numeVii.trim(),
      nume_adormiti: numeAdormiti.trim(),
      offering,
      contact: { name: contactName.trim(), email: contactEmail.trim() },
    };

    if (!endpoint) {
      // No online submission configured. In dev, show the styled confirmation so the
      // flow can be previewed; in production, never pretend the button worked — the
      // submit is disabled and a warm fallback notice is shown instead (see render).
      if (import.meta.env.DEV) setStatus("done");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  const card = "rounded-lg border border-outline-variant bg-surface-container-lowest shadow-board";
  const noEndpoint = !endpoint;
  const showSubmit = !noEndpoint || import.meta.env.DEV;

  if (status === "done") {
    return (
      <div className={`${card} mx-auto w-full max-w-2xl p-5 min-[960px]:p-8`} role="status">
        <div className="flex items-start gap-3 rounded bg-secondary-container p-4 font-body-md text-body-md text-on-secondary-container">
          <Stroke d={STROKE.check} size={20} className="mt-0.5 shrink-0" strokeWidth={2} />
          <div>
            <p className="m-0 font-semibold">Pomelnicul a fost trimis</p>
            <p className="m-0">Numele vor fi pomenite la Sfânta Liturghie. Dumnezeu să vă ajute!</p>
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 items-center justify-center rounded border border-outline bg-transparent px-5 font-body-md text-body-md font-semibold text-primary transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest"
          >
            Trimite alt pomelnic
          </button>
        </div>
      </div>
    );
  }

  const input =
    "w-full min-h-12 rounded border border-outline bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-lowest";

  return (
    <form className="grid w-full gap-4 min-[960px]:gap-6" onSubmit={(event) => void onSubmit(event)} noValidate>
      {/* ── The note: online sending is off. It comes first, before anyone types a name. ─────────── */}
      {noEndpoint && (
        <div
          className={`${card} flex items-start gap-3 px-5 py-4 font-body-md text-body-md text-on-surface min-[960px]:px-7 min-[960px]:py-5`}
          role="note"
        >
          <Stroke d={STROKE.info} size={22} className="mt-0.5 text-primary" />
          <p className="m-0">
            Trimiterea pomelnicului online nu este încă disponibilă pe acest site. Vă rugăm să aduceți pomelnicul la
            biserică sau să sunați la parohie, iar numele vor fi pomenite la Sfânta Liturghie.
          </p>
        </div>
      )}

      {/* ── Lists: vii + adormiți ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 min-[960px]:grid-cols-2 min-[960px]:gap-6">
        <NameCard
          tone="vii"
          icon={ICON.person}
          iconFilled
          title="Pomelnic de Vii"
          description="Scrieți numele de botez ale celor vii, pentru sănătate, mântuire și ajutor."
          placeholder="ex: Ioan, Maria, pr. Vasile (câte un nume pe rând)"
          name="nume_vii"
          value={numeVii}
          onChange={setNumeVii}
          card={card}
        />
        <NameCard
          tone="adormiti"
          icon={ICON.candle}
          title="Pentru Adormiți"
          description="Scrieți numele de botez ale celor trecuți la Domnul, pentru iertarea păcatelor și odihnă veșnică."
          placeholder="ex: Vasile, Elena, Gheorghe (câte un nume pe rând)"
          name="nume_adormiti"
          value={numeAdormiti}
          onChange={setNumeAdormiti}
          card={card}
        />
      </div>

      {/* ── Ofrandă + contact ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 min-[960px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] min-[960px]:gap-6">
        <section className={`${card} p-5 min-[960px]:px-8 min-[960px]:py-7`}>
          <h2 className="m-0 font-headline-md text-headline-md text-primary">Ofrandă (Donație)</h2>
          <p className="m-0 mt-2 max-w-[62ch] font-body-md text-body-md text-on-surface-variant">
            Ofranda dumneavoastră este opțională și susține lucrarea pastorală și social-filantropică a parohiei, precum
            și întreținerea lăcașului de cult.
          </p>
          <fieldset className="m-0 mt-5 min-w-0 border-0 p-0">
            <legend className="p-0 font-label-md text-label-md text-on-surface">Sumă ofrandă</legend>
            <div className="mt-3 flex flex-wrap gap-2 min-[960px]:gap-3">
              {PRESETS.map((amount) => {
                const active = preset === amount;
                return (
                  <label key={amount} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="suma_ofranda"
                      className="peer sr-only"
                      checked={active}
                      onChange={() => {
                        setPreset(amount);
                        setCustomAmount("");
                      }}
                    />
                    <span
                      className={
                        "inline-flex min-h-12 items-center justify-center rounded border px-4 font-body-md text-body-md font-semibold tabular-nums transition-colors min-[960px]:px-5 " +
                        "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface-container-lowest " +
                        (active
                          ? "border-primary bg-primary text-on-primary"
                          : "border-outline bg-surface-container-lowest text-on-surface hover:bg-surface-container")
                      }
                    >
                      {money.format(amount)}
                    </span>
                  </label>
                );
              })}
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                name="suma_custom"
                aria-label={`Altă sumă (${currency})`}
                placeholder="Altă sumă"
                value={customAmount}
                onFocus={() => setPreset("custom")}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setPreset("custom");
                }}
                className={`${input} min-w-[160px] flex-1 max-[959px]:basis-full min-[960px]:flex-none min-[960px]:basis-40`}
              />
            </div>
          </fieldset>
        </section>

        <section className={`${card} p-5 min-[960px]:px-8 min-[960px]:py-7`}>
          <h2 className="m-0 font-headline-md text-headline-md text-primary">Date de contact (opțional)</h2>
          <div className="mt-4 grid gap-4">
            <TextField
              id="pf-nume-solicitant"
              label="Nume și prenume"
              name="nume_solicitant"
              autoComplete="name"
              value={contactName}
              onChange={setContactName}
              inputClass={input}
            />
            <TextField
              id="pf-email-solicitant"
              label="Adresă de email"
              name="email_solicitant"
              type="email"
              autoComplete="email"
              hint="Pentru a primi o confirmare."
              value={contactEmail}
              onChange={setContactEmail}
              inputClass={input}
            />
          </div>
        </section>
      </div>

      {/* ── Errors ─────────────────────────────────────────────────────────── */}
      <div aria-live="assertive" className="grid gap-4 empty:hidden">
        {validationError && <ErrorAlert>{validationError}</ErrorAlert>}
        {status === "error" && <ErrorAlert>A apărut o eroare la trimitere. Vă rugăm încercați din nou.</ErrorAlert>}
      </div>

      {/* ── Submit: only with an endpoint (or the dev server's demo path) ───── */}
      {showSubmit && (
        <div className="flex flex-col items-center gap-3">
          <button
            type="submit"
            disabled={!hasName || status === "sending"}
            aria-describedby={!hasName ? "pf-submit-hint" : undefined}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded border border-transparent bg-primary px-8 font-body-md text-body-md font-semibold text-on-primary transition-colors hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:border-surface-container-high disabled:bg-surface-container-high disabled:text-on-surface-variant"
          >
            <Glyph d={ICON.send} size={20} />
            {status === "sending" ? "Se trimite…" : "Trimite Pomelnicul"}
          </button>
          {!hasName && (
            <p id="pf-submit-hint" className="m-0 text-center font-body-md text-body-md text-on-surface-variant">
              Adăugați cel puțin un nume pentru a putea trimite pomelnicul.
            </p>
          )}
          {noEndpoint && (
            <p className="m-0 font-label-md text-label-md font-normal text-on-surface-variant">
              (Doar dezvoltare) Niciun endpoint configurat — setați <code>giving.pomelniceEndpoint</code> în site.json.
            </p>
          )}
        </div>
      )}
    </form>
  );
}

function ErrorAlert({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded bg-error-container px-5 py-4 font-body-md text-body-md text-on-error-container"
    >
      <Stroke d={STROKE.alert} size={20} className="mt-0.5 shrink-0" strokeWidth={2} />
      <p className="m-0">{children}</p>
    </div>
  );
}

/* ─────────────────────────── Sub-components ─────────────────────────── */

interface NameCardProps {
  tone: "vii" | "adormiti";
  icon: { o: string; f: string };
  iconFilled?: boolean;
  title: string;
  description: string;
  placeholder: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  card: string;
}

/** One name card: a tinted head (`surface-container`; `surface-highlight` for the departed) over its textarea. */
function NameCard({
  tone,
  icon,
  iconFilled,
  title,
  description,
  placeholder,
  name,
  value,
  onChange,
  card,
}: NameCardProps) {
  const textareaId = `pf-${name}`;
  return (
    <div className={`${card} flex flex-col overflow-hidden`}>
      <div
        className={`flex items-center gap-3 border-b border-outline-variant px-5 py-4 min-[960px]:px-7 min-[960px]:py-5 ${tone === "vii" ? "bg-surface-container" : "bg-surface-highlight"}`}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest text-primary">
          <Glyph d={icon} filled={iconFilled} size={22} />
        </span>
        <h2 className="m-0 font-headline-md text-headline-md text-on-surface">{title}</h2>
      </div>
      <div className="flex flex-grow flex-col px-5 pb-5 pt-4 min-[960px]:px-7 min-[960px]:pb-7 min-[960px]:pt-5">
        <label htmlFor={textareaId} className="font-body-md text-body-md text-on-surface-variant">
          {description}
        </label>
        <textarea
          id={textareaId}
          name={name}
          rows={8}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-5 min-h-[200px] w-full flex-grow resize-y rounded border border-outline bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-lowest"
        />
      </div>
    </div>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  name: string;
  type?: string;
  value: string;
  hint?: string;
  autoComplete?: string;
  onChange: (v: string) => void;
  inputClass: string;
}

/** Labeled input mirroring the .astro `<Field>` look. */
function TextField({
  id,
  label,
  name,
  type = "text",
  value,
  hint,
  autoComplete,
  onChange,
  inputClass,
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-label-md text-label-md text-on-surface">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-describedby={hintId}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
      {hint && (
        <p id={hintId} className="m-0 font-label-md text-label-md font-normal text-on-surface-variant">
          {hint}
        </p>
      )}
    </div>
  );
}

/** The stroke glyphs of the porch notice (info, alert, check), drawn on a 24 px grid. */
const STROKE = {
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5v.01",
  alert: "M12 3l10 18H2zM12 10v5M12 18v.01",
  check: "M5 12.5l4.5 4.5L19 7.5",
} as const;

function Stroke({
  d,
  size = 20,
  className,
  strokeWidth = 1.75,
}: {
  d: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ flexShrink: 0 }}
    >
      <path d={d} />
    </svg>
  );
}

/* ─────────────────────────── Inline icons ───────────────────────────
 * The shared <Icon> primitive is .astro and cannot render inside a React island,
 * so the few glyphs used here are inlined as SVG path data (same Material Symbols
 * geometry, Apache-2.0). Color inherits via currentColor → re-skins by token.
 */
const ICON = {
  person: {
    o: "M372-523q-42-42-42-108t42-108q42-42 108-42t108 42q42 42 42 108t-42 108q-42 42-108 42t-108-42ZM160-160v-94q0-38 19-65t49-41q67-30 128.5-45T480-420q62 0 123 15.5T731-360q31 14 50 41t19 65v94H160Z",
    f: "M372-523q-42-42-42-108t42-108q42-42 108-42t108 42q42 42 42 108t-42 108q-42 42-108 42t-108-42ZM160-160v-94q0-38 19-65t49-41q67-30 128.5-45T480-420q62 0 123 15.5T731-360q31 14 50 41t19 65v94H160Z",
  },
  candle: {
    o: "M401.5-672.5Q370-705 370-751q0-54 34.5-94t75.5-75q37 38 73.5 77t36.5 92q0 46-32.5 78.5T479-640q-46 0-77.5-32.5ZM419-280h121v-260H419v260ZM240-140h480q25.5 0 42.75-17.25T780-200v-20H180v19q0 25.93 17.25 43.46Q214.5-140 240-140Zm480 60H240q-50 0-85-35t-35-86v-79h239v-260q0-24.75 17.63-42.38Q394.25-600 419-600h121q24.75 0 42.38 17.62Q600-564.75 600-540v260h239v79q0 51-35 86t-85 35Z",
    f: "M401.5-672.5Q370-705 370-751q0-54 34.5-94t75.5-75q37 38 73.5 77t36.5 92q0 46-32.5 78.5T479-640q-46 0-77.5-32.5ZM720-80H240q-50 0-85-35t-35-86v-79h239v-260q0-25 17.5-42.5T419-600h121q25 0 42.5 17.5T600-540v260h239v79q0 51-35 86t-85 35Z",
  },
  send: {
    o: "M120-160v-640l760 320-760 320Zm60-93 544-227-544-230v168l242 62-242 60v167Z",
    f: "M120-160v-245l302-75-302-77v-243l760 320-760 320Z",
  },
} as const;

function Glyph({
  d,
  filled = false,
  size = 20,
  className,
}: {
  d: { o: string; f: string };
  filled?: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ display: "inline-block", flexShrink: 0, verticalAlign: "-0.125em" }}
    >
      <path d={filled ? d.f : d.o} />
    </svg>
  );
}
