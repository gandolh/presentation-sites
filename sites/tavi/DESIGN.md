# Design: Tavi Ceasornicaru

The locked system. Every tavi brief reads this first, and every chapter shares it. Change it on purpose; the file is
the rule. It is written from the approved sketch (`design/tavi/direction.md`) and the settled calls
([decisions-tavi.md](../../corpus/wiki/decisions-tavi.md)). Brief 20 rewrites it from what shipped.

## System

- Genre: editorial.
- Shape of the first page: an explorable chapter, prose steps beside a sticky figure, seven chapters on one page.
- Theme: custom (vibe: "warm paper, exact drawing, a quiet workshop").
- Axes: light / roman serif / cool accent · posture: restrained. The part colours are material, not accent.
- Light only. There is no theme switch: `color-scheme: light` and one `theme-color`. The base-ui skill's rule 14 (a
  Light / Dark / System choice) is bent here, as the repo's other sites bend it: one look, designed for the site.
- Drawn, never photographed. English copy.

## Tokens

`src/styles/global.css` is the source of truth: Tailwind 4's `@theme`, values copied exactly from the sketch's
`:root`. Most names are the sketch's; a few tokens were renamed into Tailwind's namespaces and a few helper classes
became Tailwind's, so a sketch rule copied over must take the new name:

| In the sketch | In the site |
| --- | --- |
| `--part-<name>`, `--part-<name>-line`, `--part-<name>-ink` | `--color-part-<name>`, `--color-part-<name>-line`, `--color-part-<name>-ink` |
| `--ghost-fill`, `--ghost-line` | `--color-ghost-fill`, `--color-ghost-line` |
| `--container` | `--container-page` |
| `"Newsreader"` in `--font-display` and `--font-body` | `"Newsreader Variable"`, Fontsource's family name |
| `.needs-js` (hidden without scripting) | the `no-js:hidden` utility |
| `.i-pause`, `.i-play` (shown by `data-playing`) | none: every Pause keeps its glyph and shows pressed while paused |
| `.visually-hidden` | Tailwind's `sr-only` |
| `.site-head .wrap` | `.wrap.site-head-row` |

Tailwind's own palette, type scale and radii are reset: only the site's tokens exist. A token reaches the built CSS
once something uses it, except the part colours, which are emitted with `@theme static` because the 3D movement reads
them at runtime.

### Palette

| Token | Value | Job |
| --- | --- | --- |
| `--color-paper` | `oklch(96.6% 0.011 84)` | the page ground |
| `--color-paper-2`, `-3` | `oklch(93.4% 0.014 84)`, `oklch(90.2% 0.016 84)` | contents band, tray, footer, hovers |
| `--color-surface` | `oklch(98.8% 0.005 84)` | the header, the sticky figure's card, the Chapters panel |
| `--color-rule`, `-strong` | `oklch(85.5% 0.014 84)`, `oklch(62% 0.016 84)` | hairlines, control borders |
| `--color-ink`, `-2` | `oklch(23% 0.016 258)`, `oklch(35% 0.014 258)` | heads, body |
| `--color-muted` | `oklch(46% 0.014 70)` | captions, readout labels, chapter numbers |
| `--color-accent` | `oklch(43% 0.135 262)` | blued steel: the button, thumbs, the chosen speed, the current chapter |
| `--color-accent-ink`, `-soft` | `oklch(97.5% 0.008 84)`, `oklch(92% 0.028 262)` | text on the accent; the current chapter's ground and the selection |
| `--color-focus` | `oklch(45% 0.19 262)` | the 2px focus ring, offset 2px |

### Part colours

Each part has a flat fill, a darker outline of the same hue, and a text-safe shade for when the prose names it.
Ruby and brass are materials, never UI.

| Part | Fill | Line | In prose |
| --- | --- | --- | --- |
| plate | `--color-part-plate` | `-plate-line` | |
| bridges, cocks | `--color-part-bridge` | `-bridge-line` | |
| barrel, brass | `--color-part-brass` (and `-brass-deep`, the drum) | `-brass-line` | `-brass-ink` |
| train wheels, gilt | `--color-part-gilt` | `-gilt-line` | `-gilt-ink` |
| steel parts | `--color-part-steel` | `-steel-line` | `-steel-ink` |
| mainspring | `--color-part-spring` | `-spring-line` | `-spring-ink` |
| balance | `--color-part-balance` (and `-hair`, the hairspring) | `-balance-line` | `-balance-ink` |
| screws, blued | `--color-part-screw` (and `-screw-slot`) | `-screw-line` | |
| jewels, ruby | `--color-part-ruby` (and `-ruby-glint`, `-chaton`) | `-ruby-line` | |
| ghost, out of focus | `--color-ghost-fill` | `--color-ghost-line` | |

Focus by subtraction: a part the prose doesn't name drops to the ghost pair, so the step's parts are the only colour
in the figure.

### Type

- Newsreader for everything that reads (`--font-display`, `--font-body`), self-hosted from
  `@fontsource-variable/newsreader` 5.3.0 with its optical-size axis, roman and italic.
- IBM Plex Mono 400 (`--font-figure`) only for figures and readouts: the `.fig` class, always `tabular-nums`, so a
  ticking number keeps its width.
- Italic only in the wordmark, Tavi's signature. Every head is roman, one weight (400).
- Scale: `--text-xs` 13px, `--text-sm` 15px, `--text-md` 17px (the body, line height 1.6), `--text-lg` 20px,
  `--text-xl` 24px, `--text-step` 19px (a step's prose, 1.62), `--text-lead`
  `clamp(1.1875rem, 0.4vw + 1.05rem, 1.375rem)`, `--text-section` `clamp(2.125rem, 2.2vw + 1.25rem, 3.25rem)` and
  `--text-display` `clamp(2.75rem, 4.2vw + 1rem, 5.25rem)`. The section and display heads set
  `font-variation-settings: "opsz" 72`.
- Labels are the body face a step smaller, sentence case, never tracked capitals.

### Spacing, radii, layout

- Spacing `--space-3xs` to `--space-4xl`: 2, 4, 8, 12, 16, 24, 40, 64, 96 and 144px. Not `--spacing-*`: in Tailwind 4
  those names would also size `max-w-lg` and the like. In class names, Tailwind's 4px scale gives the same steps
  (`p-6` is 24px).
- Radii by nesting level: `--radius-control` 6px, `--radius-inner` 8px, `--radius-card` 14px; `--radius-pill` 999px.
- The column: `.wrap`, at most `--container-page` (1360px), with `--gutter` `clamp(16px, 4vw, 56px)` either side.
- `:root` holds what changes on a phone (at 40rem and under): `--header-h` 64 to 56px, `--section-gap` 144 to 72px,
  `--gap-columns` 32 to 16px.
- The z scale: `--z-raised` 10, `--z-dropdown` 100, `--z-sticky` 200, `--z-sticky-nav` 300 (the header).

## Controls

- Primary: blued steel (`accent`) fill, `accent-ink` text · radius 6px · 48px tall.
- Quiet: `surface` with a 1px `rule-strong` border · radius 6px · 44px tall. The global Pause and the figures' trays.
- The header: the wordmark, seven numbered chapter links and the global Pause; sticky, static at 40rem and under.
  Below 64rem the links fold into the Chapters drawer (`ChaptersMenu.tsx`), which hangs under the header and closes on
  a swipe up, a tap outside, its X or Esc.
- Links and buttons are at least 44px tall. Two exceptions come from the sketch: a part name inside a running sentence
  keeps the line's height (its waiver: a 44px box would split the paragraph), and the speed segments are 42px.

## Motion

- Character: calm and exact. One clock runs at 21,600 vph: a beat is 1/6 s (`--beat`, 166.667ms). The balance
  swings, the fork flips, the escape wheel steps 12° a beat, and every other wheel follows by its tooth ratio.
- Moving things animate `transform` and `opacity` only; hovers fade colour, ground and border. Durations
  `--dur-micro` 120ms, `--dur-short` 220ms, `--dur-long` 420ms, on `--ease-out` `cubic-bezier(0.16, 1, 0.3, 1)`
  (`--ease-in-out` and `--ease-swing` for the balance).
- Under reduced motion the page starts paused on a still frame; releasing a Pause still runs it. Explode, step changes and hovers
  jump instead of easing.
- The WebGL loop renders only while something moves: not when paused, off screen or in a hidden tab.

### Play and speed: the islands' contract

- **Play** is one state for the page: `data-playing` on `<html>`. The head script in `Base.astro` sets it before the
  first paint (`"false"` under `prefers-reduced-motion: reduce`, else `"true"`) and adds the `js` class. Every Pause
  changes it through `src/lib/playback.ts` (`isPlaying()`, `setPlaying(on)`, `subscribe(listener)`, one
  `tavi:playing` event); islands read it with `useSyncExternalStore(subscribe, isPlaying, () => true)`. Motion runs
  only under `.js` and `[data-playing="true"]`.
- Every Pause is a toggle: it keeps the word "Pause", the pause glyph and one name, and shows pressed (blued steel,
  `aria-pressed`) while the page is paused. The header's follows `data-playing` in CSS from the first paint.
- **Speed** belongs to each figure: `--slow` (1, 10 or 100) on the figure stretches every duration. Chapter 3 opens
  at 1/10.
- **A hold** is a figure's own still frame, asked for by a step: `data-hold` on the figure, released by un-pressing
  its tray's Pause. It never changes the page's `data-playing`.
- One dev hook, `window.taviPose(figure, pose)`, keyed by the figure's id, in development builds only.
- Without scripting, a control that only works with it is hidden: `no-js:hidden`.

## The fallback ladder

One part table, two renderers. The SVG drawing is always the first paint; the 3D movement replaces it only in
chapter 5, in the same box.

1. Desktop with WebGL 2: the island loads as chapter 5 nears and opens on the poster's flat top view, tilting only on
   the first drag, so the swap doesn't jump.
2. Phones (narrow, coarse pointer): the drawing stays, ticking in CSS; "Turn it in 3D" loads the island on demand.
3. No WebGL, or a lost context: the drawing, taken apart through its lift groups.
4. Reduced motion: whichever figure shows starts paused on a still frame until its Pause is released.
5. No scripting: the still drawing, all the prose, and every chapter link (the contents band carries them).

## Exports

`src/styles/global.css` in this site. Nothing else exports the tokens; the 3D island reads the part colours from the
page at runtime.
