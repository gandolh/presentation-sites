import { useState } from 'react';

interface Props {
  /** Where to POST the pomelnic (a form service, or the church's own endpoint).
   *  If omitted, the form runs in demo mode and just shows a confirmation. */
  endpoint?: string;
  /** ISO currency for the offering (money is integer minor units + explicit currency). */
  currency?: string;
}

type Status = 'idle' | 'sending' | 'done' | 'error';

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
 * Look mirrors the item-05 .astro primitives (Card / Field / Button) using the same M3
 * Tailwind utilities — those primitives are .astro and cannot be imported into a React
 * island, so their class patterns are replicated here.
 */
export default function PomelnicForm({ endpoint, currency = 'RON' }: Props) {
  const [numeVii, setNumeVii] = useState('');
  const [numeAdormiti, setNumeAdormiti] = useState('');
  const [preset, setPreset] = useState<number | 'custom' | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);

  const money = new Intl.NumberFormat('ro-RO', { style: 'currency', currency });

  // Selected offering in MAJOR units, or null if none chosen / invalid.
  const offeringMajor = (() => {
    if (preset === 'custom') {
      const n = Number.parseFloat(customAmount.replace(',', '.'));
      return Number.isFinite(n) && n > 0 ? n : null;
    }
    return typeof preset === 'number' ? preset : null;
  })();

  const hasName = Boolean(numeVii.trim() || numeAdormiti.trim());

  const reset = () => {
    setNumeVii('');
    setNumeAdormiti('');
    setPreset(null);
    setCustomAmount('');
    setContactName('');
    setContactEmail('');
    setValidationError(null);
    setStatus('idle');
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasName) {
      setValidationError(
        'Adăugați cel puțin un nume în pomelnicul de vii sau în cel pentru adormiți.',
      );
      return;
    }
    setValidationError(null);

    const offering =
      offeringMajor != null
        ? { amountMinor: Math.round(offeringMajor * 100), currency }
        : null;

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
      if (import.meta.env.DEV) setStatus('done');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div
        className="mx-auto w-full max-w-2xl rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-md shadow-sm md:p-lg"
        role="status"
      >
        <div className="flex items-start gap-sm rounded-lg border border-secondary/30 bg-secondary-container/30 p-md font-body-md text-body-md text-on-secondary-container">
          <Glyph d={ICON.diversity_1} className="mt-0.5 text-secondary" size={22} />
          <div>
            <p className="font-label-md text-label-md font-semibold">Pomelnicul a fost trimis</p>
            <p>Numele vor fi pomenite la Sfânta Liturghie. Dumnezeu să vă ajute!</p>
          </div>
        </div>
        <div className="mt-md flex justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-xs rounded-full border border-secondary bg-transparent px-6 py-3 font-label-md text-label-md uppercase text-primary transition-[color,background-color,box-shadow,transform,border-color] duration-200 hover:bg-secondary-container/20 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:scale-[0.98]"
          >
            Trimite alt pomelnic
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="mx-auto w-full max-w-4xl space-y-lg" onSubmit={onSubmit} noValidate>
      {/* ── Lists grid (bento): vii + adormiți ─────────────────────────────── */}
      <div className="grid grid-cols-1 gap-md md:grid-cols-2 md:gap-lg">
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
        />
      </div>

      {/* ── Ofrandă (Donație) ──────────────────────────────────────────────── */}
      <div className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-md shadow-sm md:p-lg">
        <div className="mb-md flex items-center gap-3">
          <Glyph d={ICON.payments} className="text-secondary" size={28} />
          <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg">
            Ofrandă (Donație)
          </h2>
        </div>
        <p className="mb-6 max-w-2xl font-body-md text-body-md text-on-surface-variant">
          Ofranda dumneavoastră este opțională și susține lucrarea pastorală și social-filantropică
          a parohiei, precum și întreținerea lăcașului de cult.
        </p>

        <fieldset className="mb-md grid grid-cols-2 gap-4 md:grid-cols-4">
          <legend className="sr-only">Sumă ofrandă</legend>
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
                    setCustomAmount('');
                  }}
                />
                <span
                  className={
                    'block w-full rounded border px-4 py-3 text-center font-label-md text-label-md transition-[color,background-color,box-shadow,border-color] ' +
                    'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary ' +
                    (active
                      ? 'border-secondary bg-secondary-container/20 font-bold text-primary'
                      : 'border-outline-variant/50 text-on-surface-variant hover:border-secondary hover:bg-surface-container')
                  }
                >
                  {money.format(amount)}
                </span>
              </label>
            );
          })}

          {/* Custom amount */}
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 font-body-md text-body-md text-on-surface-variant">
              {currency}
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              name="suma_custom"
              aria-label={`Altă sumă (${currency})`}
              placeholder="Altă sumă"
              value={customAmount}
              onFocus={() => setPreset('custom')}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setPreset('custom');
              }}
              className="w-full rounded border border-outline-variant/50 bg-transparent py-3 pl-14 pr-4 font-body-md text-body-md text-on-surface transition-[color,box-shadow,border-color] focus:border-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </fieldset>

        {/* ── Contact details (optional, for receipts) ─────────────────────── */}
        <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low/40 p-md">
          <h3 className="mb-4 font-headline-md text-headline-md text-on-surface">
            Date de contact (opțional)
          </h3>
          <div className="grid grid-cols-1 gap-md md:grid-cols-2">
            <TextField
              id="pf-nume-solicitant"
              label="Nume și prenume"
              name="nume_solicitant"
              autoComplete="name"
              value={contactName}
              onChange={setContactName}
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
            />
          </div>
        </div>
      </div>

      {/* ── Errors ─────────────────────────────────────────────────────────── */}
      <div aria-live="assertive">
        {validationError && (
          <div
            role="alert"
            className="flex items-start gap-sm rounded-lg border border-error/30 bg-error-container p-md font-body-md text-body-md text-on-error-container"
          >
            <Glyph d={ICON.campaign} className="mt-0.5" size={20} />
            <p>{validationError}</p>
          </div>
        )}
        {status === 'error' && (
          <div
            role="alert"
            className="flex items-start gap-sm rounded-lg border border-error/30 bg-error-container p-md font-body-md text-body-md text-on-error-container"
          >
            <Glyph d={ICON.campaign} className="mt-0.5" size={20} />
            <p>A apărut o eroare la trimitere. Vă rugăm încercați din nou.</p>
          </div>
        )}
      </div>

      {/* ── Submit ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-sm pt-md">
        {/* When online submission isn't set up, don't show a button that does nothing.
            Show a calm, plain-Romanian way to deliver the pomelnic in person / by phone —
            the audience skews older and a silent no-op would read as broken. */}
        {!endpoint && !import.meta.env.DEV ? (
          <div
            className="mx-auto w-full max-w-2xl rounded-lg border border-outline-variant/30 bg-surface-container-low p-md text-center font-body-md text-body-md text-on-surface"
            role="note"
          >
            <p>
              Trimiterea pomelnicului online nu este încă disponibilă pe acest site.
              Vă rugăm să aduceți pomelnicul la biserică sau să sunați la parohie, iar
              numele vor fi pomenite la Sfânta Liturghie.
            </p>
          </div>
        ) : (
          <>
            <button
              type="submit"
              disabled={!hasName || status === 'sending'}
              aria-describedby={!hasName ? 'pf-submit-hint' : undefined}
              className="inline-flex items-center justify-center gap-xs rounded-full bg-primary px-8 py-4 font-label-md text-body-md uppercase tracking-wide text-on-primary transition-[color,background-color,box-shadow,transform,border-color] duration-200 hover:bg-primary-container hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              <Glyph d={ICON.send} size={20} />
              {status === 'sending' ? 'Se trimite…' : 'Trimite Pomelnicul'}
            </button>
            {!hasName && (
              <p id="pf-submit-hint" className="font-body-md text-body-md text-on-surface-variant text-center">
                Adăugați cel puțin un nume pentru a putea trimite pomelnicul.
              </p>
            )}
          </>
        )}
        {!endpoint && import.meta.env.DEV && (
          <p className="font-caption text-caption text-on-surface-variant">
            (Doar dezvoltare) Niciun endpoint configurat — setați{' '}
            <code>giving.pomelniceEndpoint</code> în site.json.
          </p>
        )}
      </div>
    </form>
  );
}

/* ─────────────────────────── Sub-components ─────────────────────────── */

interface NameCardProps {
  tone: 'vii' | 'adormiti';
  icon: string;
  iconFilled?: boolean;
  title: string;
  description: string;
  placeholder: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
}

/** One bento name card: tinted header (primary for vii, tertiary for adormiți) + textarea. */
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
}: NameCardProps) {
  const textareaId = `pf-${name}`;
  // Header tint per tone. AA: header text uses on-* roles, never gold on cream.
  const header =
    tone === 'vii'
      ? { bar: 'bg-surface-container', dot: 'bg-primary/10 text-primary', title: 'text-primary' }
      : {
          bar: 'bg-tertiary-fixed',
          dot: 'bg-on-tertiary-fixed/10 text-on-tertiary-fixed',
          title: 'text-on-tertiary-fixed',
        };
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container-lowest shadow-sm transition-colors duration-300 focus-within:border-secondary">
      <div
        className={`flex items-center gap-3 border-b border-outline-variant/20 px-md py-sm ${header.bar}`}
      >
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full ${header.dot}`}
        >
          <Glyph d={icon} filled={iconFilled} size={20} />
        </span>
        <h2 className={`font-headline-md text-headline-md ${header.title}`}>{title}</h2>
      </div>
      <div className="flex flex-grow flex-col p-md">
        <label htmlFor={textareaId} className="mb-2 font-body-md text-sm text-on-surface-variant">
          {description}
        </label>
        <textarea
          id={textareaId}
          name={name}
          rows={8}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[200px] w-full flex-grow resize-y rounded border border-outline-variant/50 bg-transparent px-3 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/75 transition-[color,background-color,box-shadow,transform,border-color] duration-200 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-primary"
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
}

/** Labeled input mirroring the .astro `<Field>` look (focus → secondary). */
function TextField({
  id,
  label,
  name,
  type = 'text',
  value,
  hint,
  autoComplete,
  onChange,
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1">
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
        className="w-full rounded border border-outline-variant/50 bg-transparent px-3 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/75 transition-[color,background-color,box-shadow,transform,border-color] duration-200 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {hint && (
        <p id={hintId} className="font-caption text-caption text-on-surface-variant">
          {hint}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────── Inline icons ───────────────────────────
 * The shared <Icon> primitive is .astro and cannot render inside a React island,
 * so the few glyphs used here are inlined as SVG path data (same Material Symbols
 * geometry, Apache-2.0). Color inherits via currentColor → re-skins by token.
 */
const ICON = {
  person: {
    o: 'M372-523q-42-42-42-108t42-108q42-42 108-42t108 42q42 42 42 108t-42 108q-42 42-108 42t-108-42ZM160-160v-94q0-38 19-65t49-41q67-30 128.5-45T480-420q62 0 123 15.5T731-360q31 14 50 41t19 65v94H160Z',
    f: 'M372-523q-42-42-42-108t42-108q42-42 108-42t108 42q42 42 42 108t-42 108q-42 42-108 42t-108-42ZM160-160v-94q0-38 19-65t49-41q67-30 128.5-45T480-420q62 0 123 15.5T731-360q31 14 50 41t19 65v94H160Z',
  },
  candle: {
    o: 'M401.5-672.5Q370-705 370-751q0-54 34.5-94t75.5-75q37 38 73.5 77t36.5 92q0 46-32.5 78.5T479-640q-46 0-77.5-32.5ZM419-280h121v-260H419v260ZM240-140h480q25.5 0 42.75-17.25T780-200v-20H180v19q0 25.93 17.25 43.46Q214.5-140 240-140Zm480 60H240q-50 0-85-35t-35-86v-79h239v-260q0-24.75 17.63-42.38Q394.25-600 419-600h121q24.75 0 42.38 17.62Q600-564.75 600-540v260h239v79q0 51-35 86t-85 35Z',
    f: 'M401.5-672.5Q370-705 370-751q0-54 34.5-94t75.5-75q37 38 73.5 77t36.5 92q0 46-32.5 78.5T479-640q-46 0-77.5-32.5ZM720-80H240q-50 0-85-35t-35-86v-79h239v-260q0-25 17.5-42.5T419-600h121q25 0 42.5 17.5T600-540v260h239v79q0 51-35 86t-85 35Z',
  },
  payments: {
    o: 'M540-420q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM220-280q-24.75 0-42.37-17.63Q160-315.25 160-340v-400q0-24.75 17.63-42.38Q195.25-800 220-800h640q24.75 0 42.38 17.62Q920-764.75 920-740v400q0 24.75-17.62 42.37Q884.75-280 860-280H220Zm480 180H100q-24.75 0-42.37-17.63Q40-195.25 40-220v-460h60v460h700v60Z',
    f: 'M100-160q-24.75 0-42.37-17.63Q40-195.25 40-220v-460h60v460h700v60H100Zm120-120q-24.75 0-42.37-17.63Q160-315.25 160-340v-400q0-24.75 17.63-42.38Q195.25-800 220-800h640q24.75 0 42.38 17.62Q920-764.75 920-740v400q0 24.75-17.62 42.37Q884.75-280 860-280H220Zm320-140q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Z',
  },
  send: {
    o: 'M120-160v-640l760 320-760 320Zm60-93 544-227-544-230v168l242 62-242 60v167Z',
    f: 'M120-160v-245l302-75-302-77v-243l760 320-760 320Z',
  },
  diversity_1: {
    o: 'M480-560q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM200-200q-33 0-56.5-23.5T120-280q0-33 23.5-56.5T200-360q33 0 56.5 23.5T280-280q0 33-23.5 56.5T200-200Zm560 0q-33 0-56.5-23.5T680-280q0-33 23.5-56.5T760-360q33 0 56.5 23.5T840-280q0 33-23.5 56.5T760-200Z',
    f: 'M480-560q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM200-200q-33 0-56.5-23.5T120-280q0-33 23.5-56.5T200-360q33 0 56.5 23.5T280-280q0 33-23.5 56.5T200-200Zm560 0q-33 0-56.5-23.5T680-280q0-33 23.5-56.5T760-360q33 0 56.5 23.5T840-280q0 33-23.5 56.5T760-200Z',
  },
  campaign: {
    o: 'M720-440v-80h160v80H720Zm48 280-128-96 48-64 128 96-48 64Zm-80-480-48-64 128-96 48 64-128 96ZM200-200v-160h-40q-33 0-56.5-23.5T80-440v-80q0-33 23.5-56.5T160-600h160l200-120v480L320-360h-40v160h-80Zm240-182v-196l-98 58H160v80h182l98 58Z',
    f: 'M720-440v-80h160v80H720Zm48 280-128-96 48-64 128 96-48 64Zm-80-480-48-64 128-96 48 64-128 96ZM200-200v-160h-40q-33 0-56.5-23.5T80-440v-80q0-33 23.5-56.5T160-600h160l200-120v480L320-360h-40v160h-80Z',
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
      style={{ display: 'inline-block', flexShrink: 0, verticalAlign: '-0.125em' }}
    >
      <path d={filled ? d.f : d.o} />
    </svg>
  );
}
