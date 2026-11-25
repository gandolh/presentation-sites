# Design: Tavi Ceasornicaru

The locked system, written from what shipped. Every chapter shares it. Change it on purpose; the file is the rule.
It started from the approved sketch (`design/tavi/direction.md`) and the settled calls
([decisions-tavi.md](../../corpus/wiki/decisions-tavi.md)); where the site differs from the sketch, the last section
says how and why. Where this file and the code disagree, the code wins.

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

Chapter 6's bench adds ten `--color-tool-*` tokens, a fill and a line for each of `black`, `yellow`, `red`, `grey` and
`violet`: the coloured caps of Bergeon's screwdriver set and the loupe's body. They colour tools only. The blades are
steel (`--color-part-steel`) and the holder takes the part tokens.

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

## Chapters and figures

One page, seven chapters, one movement. A chapter is prose steps beside a sticky figure (below 64rem the figure sticks
to the top and the steps run under it). The step at the reading line is the active one and poses the figure; a part
name in the prose, hovered or focused, lights its part and ghosts the rest.

| Chapter | Figure | Controls |
| --- | --- | --- |
| 1 Energy | the barrel opened, mainspring coiled inside | Pause, Speed, Wind (0 to 41 h), Take apart |
| 2 Wheels | the going train with each mesh's ratio, then the dial side: the figure turns over about its vertical axis (a cross-fade under reduced motion) | Pause, Speed |
| 3 Escapement | a close-up drawn by the clock; each of the first four steps holds one phase of a beat | Pause, Speed (opens at 1/10) |
| 4 Balance | the hairspring breathing, the lift window as a thin arc, the amplitude | Pause, Speed |
| 5 Together | the whole movement, 3D where the ladder allows, taken apart in seven steps | Pause, Speed, Take apart / Put back, Take apart, Turn, Wind |
| 6 The bench | Tavi's tools at real size on a 240 x 164 mm mat, from above; one step slides the loupe over the balance | none: nothing loops |
| 7 Repairs | the footer: the name, the repair line, Tavi's line as a dashed placeholder | none |

Chapters 3 and 4 are drawn by a frame loop, not by CSS (`lib/clockFigure.ts`): one loop per figure, which asks for
frames only while the page plays, the figure is on screen and the tab is visible, and clamps a frame's step at 0.25 s.
Chapter 5's 3D view labels parts in two columns on a desktop (leaders that never meet, laid out by a pure function in
`src/three/labels.ts`), each label a button; phones get a parts list under the figure instead. A chosen part lights and
the rest drop to the ghost pair, in 3D as in the drawings. Small seconds sits over the fourth wheel, about 8 o'clock
seen from the dial, not at 6.

## Controls

- Primary: blued steel (`accent`) fill, `accent-ink` text · radius 6px · 48px tall.
- Quiet: `surface` with a 1px `rule-strong` border · radius 6px · 44px tall. The global Pause and the figures' trays.
- The header: the wordmark, seven numbered chapter links, a Sound toggle and the global Pause; sticky, static at 40rem
  and under.
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
- **Sound** is a toggle in the header, off on every visit with nothing stored. Its first press loads `lib/sound.ts`, which
  schedules a synthesised tick (filtered noise on the audio clock) at the beat of the moving figure nearest the reading
  line, at that figure's speed. It is silent while paused, hidden, held, or with no figure in view, and the button is
  hidden where the browser has no `AudioContext`.
- **Reserve** (0 to 41 h) is the mainspring's wind. A lower reserve lowers the balance's amplitude and zero stops it.
  Chapter 5's Wind coils the 3D spring, steps the ratchet wheel a tooth at a time and lets the reserve fall in real time
  while the figure runs; its readout counts hours and minutes (chapter 1's counts whole hours).
- One dev hook, `window.taviPose(figure, pose)`, keyed by the figure's id, in development builds only (`taviSound`, a tick counter,
  is the sound's).
- Without scripting, a control that only works with it is hidden: `no-js:hidden`.

## The fallback ladder

One part table, two renderers. The SVG drawing is always the first paint; the 3D movement replaces it only in
chapter 5, in the same box.

1. WebGL 2: the island (`components/together/MovementFigure.tsx`, the scene in `src/three/`) hydrates on the hero once
   the page is idle (`client:idle`) and on chapter 5 as it nears (`client:visible`, 200px early). It opens on the
   poster's flat top view, within 2 px of the drawing, and eases to a tilt only on the first drag or arrow key, so the
   swap doesn't jump. Phones load it on the hero too.
2. Phones that reach chapter 5 before the hero has loaded three.js: the drawing stays, ticking in CSS, and "Turn it in
   3D" loads the island on demand.
3. No WebGL, or a lost context: the drawing, taken apart through its lift groups (chapter 5 says so in one line).
4. Reduced motion: whichever figure shows starts paused on a still frame until its Pause is released.
5. No scripting: the still drawing, all the prose, and every chapter link (the contents band carries them).

Three.js ships bundled, imported only by the island, and the build splits it into pieces under 500 kB that load
together with the scene. The scene's outlines come from the drawing's own builders; gear outlines are screen-width
`LineSegments2` lines, because one-pixel lines read at half the drawing's weight at device pixel ratio 2.

## Where the site differs from `design/tavi/`

The sketch and the prototype stay as approved; the site changed these, for these reasons.

- **Fonts are self-hosted** through Fontsource, not loaded from Google Fonts, and three.js is bundled, not loaded from a
  CDN: the site makes no third-party request.
- **Controls are on Base UI** (a Slider, a radio group for the speed, a Drawer for Chapters), as the repo's other sites
  do; the sketch used native inputs and a `<details>`.
- **One part table**, imported by both renderers. The prototype kept its own copy of the table and the gear functions.
- **The 3D opens flat**, not at the prototype's 34 degree tilt, and is on the hero as well as in chapter 5.
- **Labels in two columns** on desktop and a parts list on phones, where the prototype fanned them into one column
  (some leaders crossed) and labelled eight parts on a phone.
- **Every Pause is a toggle** that keeps its name and shows pressed, instead of turning into a Play button.
- **Chapter 5 takes the movement apart in a watchmaker's order**, which is the part table's lift-window order: balance,
  pallet fork and winding parts, the two big bridges, the wheels and the barrel.
- **The bench's blades are steel**, not blued steel, which no source showed.
- **Small seconds at about 8 o'clock**, over the fourth wheel, where the table puts it; the direction said 6.
- **Tokens renamed** into Tailwind's namespaces, listed under Tokens.

## Exports

`src/styles/global.css` in this site. Nothing else exports the tokens; the 3D island reads the part colours from the
page at runtime.
