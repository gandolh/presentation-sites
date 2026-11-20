# churchix tokens: the map to the template's own names

The board's token names are the template's names with a `--color-` prefix (the Tailwind names in `theme.css`), so there is almost nothing to rename. The deliverable is `churchix.tokens.css`, in two parts: Part A goes into `tokens.css` under `:where(:root)`, Part B into the `@theme` block of `theme.css`. There is no dark block: a parish has one look and no theme switch. Every value derives from the four seeds in `site.json` `brand` (`primary`, `secondary`, `surface`, `onPrimary`).

## Renamed or remapped (board role → app token; same name, new derivation unless noted)

- ground, page → `surface` and `background` (seed, unchanged)
- card, header, bottom bar → `surface-container-lowest` (unchanged, `#ffffff`)
- edge → `outline-variant` (unchanged: primary 18 % into surface). It is now drawn at full strength on every card and the header; the code stops using it at 30-40 % alpha (`border-outline-variant/30` and similar).
- field and ghost-button edge → `outline` (unchanged)
- tray → `surface-container`: **derivation changed**, from surface 93 % with black to primary 7 % into surface. Anything else that uses it changes tone.
- footer, progress track → `surface-container-high` (unchanged)
- ink → `on-surface` and `on-background`: **derivation changed**, from fixed `#1c1c19` to primary 12 % into `#161412`
- muted → `on-surface-variant`: **derivation changed**, from fixed `#544243` to primary 22 % into `#5b5552`
- action and band → `primary` / `on-primary` (seeds)
- hover, pressed, the arch fill → **`primary-strong` (new)**: primary 80 % with black. `primary-container` is **kept as today** (primary 80 % with white); the four components that use it (`Badge`, `Alert`, `PomelnicForm`'s no-endpoint note, `MobileNav`'s ring offset) and `on-primary-container` and `surface-container-low` do not change.
- gold → `secondary` (seed) for rules, the arch line and the logo cross on the primary; light gold on the band → `secondary-fixed` (unchanged); icons and marks on light surfaces → **`secondary-strong` (new)**, so the blue-and-silver parish's icons are pewter blue at 3:1 or more, not grey
- badge → `secondary-container`: 35 % → 30 % into white; badge text → `on-secondary-container` (unchanged)
- focus ring → `primary` on light surfaces, `on-primary` on the band (no new token)
- the callout numbers on the board → `inverse-surface` / `inverse-on-surface` (unchanged; board only)
- label style → `--text-label-md`: tracking 0.05em → 0, weight 500 → 600, and no `uppercase` anywhere

## New tokens (with the component that needs them)

- `--primary-strong` / `--color-primary-strong`: hover and pressed on filled buttons, the arch fill.
- `--secondary-strong` / `--color-secondary-strong`: the bank, church and download icons, the current-place underline, and the base of `surface-highlight`.
- `--on-primary-variant` / `--color-on-primary-variant`: the lede line under the name on the band (`Hero`, and the page heads of Program, Pomelnice, Donații).
- `--surface-highlight` / `--color-surface-highlight`: the Sunday row, now secondary-strong 18 % into white (tinted by both seeds) (`ServiceSchedule`, and the week list on the Home board).
- `--shadow-sm`: the news cards (`AnnouncementList`). `--shadow-board`: the Home board, the giving card, the page-head cards, the Drawer.
- `--text-display-md` (52/60 from 960 px) with `--font-display-md`: the Home name on the band. Below 960 px and on page heads the name uses 40/48 and then 28/34 (the fixed mobile display size), set with the existing headline sizes.
- `--text-display-sm` (36/44) with `--font-display-sm`: the next service's name.
- `--text-time` (48/52, 600) and `--text-time-mobile` (40/44), with `--font-time`: the time of the next service and of each service on Program.
- `--text-wordmark` (22/28) and `--text-wordmark-mobile` (20/24), with `--font-wordmark`: `Header` and `Footer` wordmark.
- Layout, not tokens: the arch is a 5:6 shape with a top radius of half its width; the bottom bar is 64 px (a `BottomBar` component beside `MobileNav`, whose Drawer stays behind `Meniu`).

## App tokens the design no longer uses (keep or drop is the code brief's call)

- `--text-overline` and `--font-overline`: eyebrows and tracked capitals are gone (kickers like `Rânduiala liturgică`, `Dania ta` and `Pomenire la Sfânta Liturghie` are dropped from the page heads).
- `--text-display-xl` and `--font-display-xl`, and `--text-display-lg` (48/56): the parish name is 40/48 now.
- The `Rail` component and its markers, the hero's radial washes and the `cx-pomelnice-pattern` dots.
- `--primary-fixed`, `--primary-fixed-dim`, `--on-primary-fixed`, `--on-primary-fixed-variant`, `--surface-tint`, `--inverse-primary`, `--surface-dim`, `--surface-container-highest`, `--surface-variant`, `--surface-bright`: not used by the four screens or the comps (check the others before dropping).
- The `--brand-*`, `--ink`, `--ink-soft`, `--line`, `--bg` and `--space` legacy aliases, if no page outside the comps still reads them.
- The tertiary set: unused.
- `--font-label-md` tracking and the `0.05em` note in `theme.css`.

## Props and strings the code brief removes or keeps

- The `kicker` prop of `PageShell` goes, on every page that uses it (Floor 9: no eyebrows). Before and after: Program `Rânduiala liturgică`, Pomelnice `Pomenire la Sfânta Liturghie` (and the disabled state's `Pomenire`), Donații `Dania ta`, Despre `Istoric și hram`, Contact `Vino la biserică`: all dropped; check that `hram` on Despre is still carried by its title or lede.
- Title Case strings kept verbatim from the content, flagged against the sentence-case ruling: `Proiect Special`, `Descarcă Formularul`, `Pomelnic de Vii`, `Pentru Adormiți`, `Termeni și Condiții`, `Politică de Confidențialitate`, `IBAN Donații`, `Contact Preot`.
