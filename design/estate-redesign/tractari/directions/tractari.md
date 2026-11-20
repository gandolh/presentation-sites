# tractari (AXA Tractări): directions for the redesign board

Written 2026-11-13 by the art director. Repo: presentation-sites, site `sites/tractari`, brief 08 (`corpus/briefs/todo/`), which runs brief 05's shared steps. Read: the repo's `CLAUDE.md`, `corpus/wiki/decisions*.md` and `site-patterns.md`, `sites/tractari/DESIGN.md`, `PRODUCT.md`, `src/styles/global.css`, every component on `/`, `content/site.ts`; the neighbour's `directions/auto-service.md` and `judge/auto-service/RESULT.md`.

**Recorded calls that bind both directions.**
- **One dark look, no theme switch** (brief 08 context and step 5 of brief 05; owner, 2026-11-10, Q18; `decisions-ui.md`, "The phone menus on Drawer"). This replaces board-director's light and dark palettes: each direction has **one dark palette**. `.theme-light` and `.theme-dark` carry the same values, and the sketcher saves that one render under every slot name (`light-1280.png`, `light-1280-full.png`, `dark-1280.png`, `light-390.png`, `dark-390.png`, `dark-390-full.png`) and says so in `tokens.md`. Today's contestants are `light-1280-home.png` and `light-390-home.png` (the files say light; the site is dark).
- **No photographs** (brief 08 default 2). **The 3D scene can't run in a sketch:** wherever a direction places it, draw today's reduced-motion backdrop, the CSS in `Hero.astro` (`.hero-stage__backdrop`, its `::after` road wedge, `.hero-scrim`), with its colours as plate tokens. That is what today's shots show and what reduced-motion, low-GPU and pre-load visitors see, so all three contestants carry the same picture. Never a drawn truck.
- **No form** (none today). Copy and business facts stay; `src/content` is out of scope.
- **The phone menu stays the Base UI Drawer** (Q40); the burger is `Deschide meniul`.
- **Fonts:** the sketch loads `family=Big+Shoulders+Display:wght@700..900&family=Archivo:wght@400..700` from Google (both serve latin-ext); the build keeps Fontsource (`@fontsource-variable/big-shoulders-display` 5.2.5, `archivo` 5.3.0).
- **The neighbour:** auto-service's winner is warm graphite, M red, Encode Sans and a light job card pinned right. Tractari keeps today's cold asphalt (hue 250), amber and safety orange, Big Shoulders and Archivo. Neither direction pins a card beside the content or puts a light card on the page.

## 1. Today's strengths (both keep)

1. **The call is the one hot control, always one tap away:** safety orange with the number on it, in the header (desktop), the hero, after the services head and in Contact; on phones a dock with the other two lines behind a toggle.
2. **A look of its own, off the RO market:** night asphalt with a cold cast, the amber beacon, highway-signage condensed display. Nothing red on white, no stock truck.
3. **The header is its own solid band** with a hairline foot: wordmark, four anchor places, the number at the right.
4. **Services have a lead:** the real job, "Tractări pe platformă", gets the wide tile; four supporting tiles sit on raised cards. Not an equal grid.
5. **Contact ranks the three lines:** the dispatcher's number large on the orange plate, the two other owners beneath as named cells.
6. **Coverage in words and on a map:** the hero lede names the five counties; a map radiates from the Târgu-Jiu hub. Copy is short throughout.

**What today does badly (both fix).** With the scene off, the 100svh hero is an empty wash: at 1280 the upper and right two-thirds are blank, at 390 there are 200 px of nothing before the kicker. An eyebrow opens every section (the stop-labels; PRODUCT.md's own anti-reference), and the kicker, dock label, contact labels, footer heads, badge and "Derulează" are tracked capitals (Floor 9). Every head has an amber glow word (38iii). `·` joins the kicker, the hero call, the footer counties and the legal ids (Floor 10). **White on the orange call is 3.02:1, under AA, on the one control that matters.** The four supporting tiles all carry the same arrow. The process and coverage bands differ from the ground by 1.05:1, and the header by 1.04:1 (a hairline only). At 390 the first screen holds two orange calls to one number. The other two lines appear only at the page's end.

## 2. The main screen

**Home `/` with its shell, all of it:** banner, header, hero, Servicii, Cum funcționează, Acoperire, Contact, footer, plus the phone dock and menu button. That is 100 % of today's page: 3,500 px at 1280 (`light-1280-home-full.png`) and 5,099 px at 390 (`light-390-home-full.png`). The judged frames are the first screens: `light-1280-home.png` and `light-390-home.png`.

## 3. The content fixture (shared, word for word)

Values, not separators: `·` goes (a comma or a line break joins the values). Case is presentation: the stop-labels and every tracked label become body-face sentence case or go, and "NON-STOP" in the footer tagline is set "non-stop". The wordmark is exempt. Placeholders stay as shown; no other figure appears (`responseMinutes: 30` in `site.ts` is shown nowhere today and stays out: see question 2). About 330 words, 5 service tiles, 3 steps, 5 counties, 3 lines.

- **Skip link** "Sari la conținut". **Banner:** "Site demonstrativ. Firma și numerele de telefon sunt fictive (concept de prezentare)."
- **Header:** wordmark "AXA Tractări" (link, `aria-label="AXA Tractări, acasă"`, set in capitals as the logotype, with today's amber beacon mark); places "Servicii", "Cum funcționează", "Acoperire", "Contact" (`aria-label="Navigare principală"`); the call "07XX XXX XX1" (`tel:+40700000001`) with the phone icon. Phone: wordmark and the menu button (`aria-label="Deschide meniul"`).
- **Hero** (`aria-label="AXA Tractări — tractări auto pe platformă, non-stop în Oltenia"`): status "Non-stop 24/7" and "Oltenia"; h1 "Tractări auto" / "pe platformă."; lede "Ai rămas pe drum în Gorj, Dolj, Vâlcea, Olt sau Mehedinți? Venim cu platforma și ducem mașina în siguranță acolo unde ai nevoie. La orice oră."; the call "Sună acum" over "07XX XXX XX1"; "Ce facem" (`#servicii`). The scroll cue "Derulează" goes.
- **Servicii** (`#servicii`): h2 "Un singur lucru, făcut bine."; lede "Tractări auto pe platformă, non-stop. Restul sunt lucrurile care fac intervenția rapidă și fără bătăi de cap."; a call "07XX XXX XX1". Tiles (title / body / pictogram):
  - lead: "Tractări pe platformă" / "Platformă omologată pentru orice autoturism — defect, accidentat sau fără roți. Ridicăm și transportăm fără să atingem asfaltul." / truck (today's)
  - "Intervenții rapide" / "Pornim din Târgu-Jiu spre tine în câteva minute, ziua sau noaptea." / timer
  - "Asistență la fața locului" / "Pană, baterie descărcată, ai rămas fără combustibil — uneori te punem pe drum pe loc." / wrench
  - "Transport în siguranță" / "Ancorare corectă, mașina ajunge la service exact cum a plecat." / shield with a check
  - "Prețuri transparente" / "Îți spunem costul la telefon, înainte să pornim. Fără surprize." / receipt
- **Cum funcționează** (`#cum-functioneaza`): h2 "Un apel, și suntem pe drum."; an ordered list: 1 "Suni" / "Un singur apel, la orice oră. Ne spui unde ești și ce mașină ai."; 2 "Pornim spre tine" / "Confirmăm prețul pe loc și plecăm imediat cu platforma către locația ta."; 3 "Te ducem în siguranță" / "Încărcăm, ancorăm și transportăm mașina exact acolo unde ai nevoie."
- **Acoperire** (`#acoperire`): h2 "Toată Oltenia, dintr-un singur apel."; "Cu baza în Târgu-Jiu, ajungem rapid în 5 județe. Pe autostradă, pe drum național sau pe o uliță de țară — venim la tine."; the list in this order: Gorj, Vâlcea, Mehedinți, Dolj, Olt. The map (`role="img"`, `aria-label="Hartă de acoperire: Gorj, Dolj, Vâlcea, Olt, Mehedinți"`): today's SVG from `Coverage.astro` (viewBox 480×360; hub Gorj 230,150; Vâlcea 360,110; Mehedinți 110,215; Dolj 250,280; Olt 400,245; amber hub, orange nodes, amber-to-orange spokes, the faint grid), labels in sentence case, Archivo 600.
- **Contact** (`#contact`): h2 "Sună." / "Răspundem."; "Oricând, în toată Oltenia. Alege linia potrivită — sau sună la dispecerat și te direcționăm noi."; the dispatcher "Ionuț P.", "sună acum", "07XX XXX XX1"; "Andrei M." "07XX XXX XX2"; "Vasile T." "07XX XXX XX3" (each a `tel:` link); "Preferi scris? contact@axatractari.ro. Pentru urgențe, telefonul rămâne cel mai rapid." (the address a `mailto:` link).
- **Footer:** "AXA Tractări"; "Tractări auto pe platformă, non-stop, în toată Oltenia."; "Non-stop 24/7" (text, no pill, no dot); h2 "Telefon" over the three names and numbers; h2 "Acoperire" over "Gorj, Dolj, Vâlcea, Olt, Mehedinți" and "Toată regiunea Oltenia, deplasări și în afara județului."; "© 2026 AXA Tractări S.R.L. — site demonstrativ. Date fictive."; "RO00000000" and "J18/000/2026".
- **Dock** (390 only, `role="region"`, `aria-label="Sună AXA Tractări"`): the call (`aria-label="Sună acum, dispecerat, 07XX XXX XX1"`) "Sună acum, non-stop" over "07XX XXX XX1"; the toggle (`aria-label="Arată celelalte numere"`, `aria-expanded="false"`), drawn closed.

Icons: one 24 px stroke set at 2 px (today's geometry: phone, truck), Lucide-style, drawn by the sketcher. No emoji.

## 4. Floor departures (both directions, from DESIGN.md and today)

- **The call's label is asphalt ink on the orange** (`#1a0b05` on `#f76400`, 6.20:1), as on safety signage, where today's white is 3.02:1. DESIGN.md says "white text on it"; the Floor wins, and the orange stays bright.
- **Heads are one colour,** no glow, no `text-shadow`; legibility comes from the scrim. Caps heads keep line height at 0.96 or more, so the breve on "TRACTĂRI" and "PLATFORMĂ" clears the line above (`site-patterns.md`).
- **The stop-labels go** (Floor 9). The kicker's values become a status line (A) or the board's foot (B). Every other label is Archivo 14/20 600, sentence case, untracked. The beacon-pulse dots go (Floor 10). The wordmark's amber beacon stays as part of the logotype.
- **The film grain and the hover lifts aren't drawn.** **Phone, one orange call on the first screen:** each direction says how. Further down, the Servicii call and Contact are drawn as specified.

## 5. Directions

### A. Night road, lit (Evolve today)

- **Idea:** the same night drive toward a stranded driver. The plate is shorter so the page starts sooner, and every stop is a raised, lit place on one road.
- **Skeleton, 1280** (container 1200, gutters 32):
  - the banner (32 px, amber container);
  - a 64 px header band on `surface` with a `line` foot: beacon and wordmark, the four places (muted, ink on hover), the orange call.
  - **The hero:** a full-bleed night plate **about 500 px** tall, not 100svh. Copy sits lower-left, today's framing:
    - the h1, line 2 amber;
    - the lede at 42ch;
    - the actions: the call, 56 px, two lines ("Sună acum" 14/16 over the number 20/24, tabular), and "Ce facem" as an outline button with a `line-strong` edge;
    - under them one amber line: "Non-stop 24/7, Oltenia".
  - **The first frame must show the Servicii head and the top edge of its tiles** under the plate. The section opens 48 px under the plate, the h2 is 56 tall, and a 32 gap puts the tiles near 732. The empty plate is at most the upper right, where the scene drives.
  - **The lane spine:** under the hero, today's dashed amber-to-orange line in the left gutter, at 50 %, with a node at each section head (Contact's node larger and orange).
  - **Servicii:** the h2 at the left with the lede and the call beside it. Below, today's grid: the lead tile spans two of three columns with an amber edge at 40 %, then four tiles. Every tile is on `surface` with a `line` edge, radius 10, and its own pictogram in a 40 px `surface-2` well.
  - **Cum funcționează:** a full-bleed `surface` band with `line` edges top and bottom. The three steps sit on a horizontal road line with amber nodes 1 to 3.
  - **Acoperire:** on the ground. Copy and the two-column county list on the left; the map in a raised frame (`surface`, `line`, radius 12) on the right.
  - **Contact:** the h2 and copy on the left. On the right, the dispatcher plate (orange, radius 10, about 110 px: 16 padding, the label 14/20 over the number 56/54), then the two line cells (`surface`, `line`), then the mail line.
  - **The footer** on the ground under a full-width amber-to-orange rule, in three columns.
- **Skeleton, 390:**
  - the banner in two lines; a 56 px header band (beacon, wordmark, menu);
  - the plate at content height with 96 px of scene above the h1, then the lede, "Ce facem" and the status (no 200 px void);
  - **the dock is the call from the first paint** (today's), on `surface` with a `line` top, no fade; the hero repeats no call on phones;
  - the spine is not drawn below 1024;
  - the tiles, then steps, coverage and contact stack in one column; content is padded by the dock's height.
- **Type:** Big Shoulders Display 800, uppercase (today's), for the heads, wordmark and plate number; Archivo for the rest. Six sizes: h1 88/84 (48/46 at 390); h2 and the dispatcher's number 56/54 (36/36); the lead tile and step titles 32/32; the lede and the other tile titles 20/30; body 16/26; labels 14/20 at 600.
- **Palette (dark only), with contrast:**
  - `ground` #090e12 (today's);
  - `surface` #181f25 (the header, tiles, frames, band and dock; 1.16 on ground);
  - `surface-2` #252c34 (pictogram wells and the dock toggle; 1.18 on surface);
  - `line` #30363c (1.59 on ground, 1.36 on surface);
  - `line-strong` #636a71 (outline controls on ground or surface only; 3.54 / 3.04);
  - `ink` #f0eee9 (16.72 / 14.36);
  - `ink-muted` #a8afb5 (8.74 / 7.50; 6.36 on surface-2);
  - `amber` #f3b01d (the beacon, h1 line 2, nodes, pictograms, the 2 px focus ring; 10.19 / 8.75) with `on-amber` #161107 (9.88);
  - `call` #f76400 (6.26 on ground; 5.37 on surface, against the header and the dock) with `call-hover` #fc7a14 and `on-call` #1a0b05 (6.20; 7.25 on hover);
  - the banner: `banner` #3b2b0d with `on-banner` #fbc865 (8.81).
- **Shape and depth:** radii 4 for controls, 10 for tiles and plates, 12 for the map frame, full for nodes. Tone plus a `line` edge everywhere. The only glow is today's soft orange shadow under the call.
- **Signature:** the night plate and the one lit line, "pe platformă.". Waive 38iii on the record: DESIGN.md makes amber the identity, and it appears once.
- **Reference:** `spacex` (design-md-library): a full-bleed dark plate with condensed display set low in the frame and almost no chrome. Not its pure black, tracked caps or ghost pills.

### B. Lines first

- **Idea:** the dispatcher's answer before the story. The three owners' numbers, any hour, sit on the first screen on one raised board, and the scene plays later, where "suntem pe drum" happens.
- **Skeleton, 1280:**
  - banner and header band as A.
  - **The hero, on the ground (no plate):**
    - the h1 on one line across the container, sentence case;
    - the lede (56ch) with "Ce facem" at its right;
    - today's dashed amber-to-orange lane line, full container width: B's one road cue.
  - **The board** (`id="contact"`): one raised panel the full container width, 1200 wide. `surface`, `line` edge, radius 12, 32 padding, one soft shadow.
    - Its head row: h2 "Sună." / "Răspundem." beside the contact copy.
    - Then one 12-column row: the dispatcher's orange plate spans columns 1 to 6, 96 px tall, with a phone icon in an ink disc, "Ionuț P." and "sună acum" in `on-call-muted`, and the number at 48 in `on-call`. Andrei M. (columns 7 to 9) and Vasile T. (10 to 12) are `surface-2` cells with the name in muted and the number at 28.
    - Its foot: the status "Non-stop 24/7" and "Oltenia". The mail line sits under the board, which keeps the first frame near 80 words.
    - **The plate is the hero's call and Contact's dispatcher, as one control.** B draws no other "Sună acum" button above it.
  - **The first frame must show the h1, the lede, the lane line and the whole board.**
  - **Servicii:** the head row with the lede and the call. The lead tile spans the full width, as a row with its truck pictogram at 48; the four tiles sit in one row of four below it. Tiles as A.
  - **Acoperire:** one raised panel. The copy and county list take 5 columns, the map 7, drawn on the panel with no frame of its own.
  - **Cum funcționează:** the scene's home in B. A full-bleed night plate, 440 px, with the h2 over its upper-left. The three steps sit on one raised strip (`surface`, split into three cells by hairlines, the nodes joined by the dashed lane) overlapping the plate's foot by 48 px.
  - **The footer** as A. The page ends on the drive, not on Contact.
- **Skeleton, 390:**
  - banner; 56 px header; the h1 in two lines; the lede; the lane line;
  - **the board stacked:** head, copy, the plate at full width (72 px, the number at 32), the two lines as 56 px rows (name left, number right), the foot;
  - all three lines must sit inside 844 px. Measure, and tighten the copy's size before cutting a row;
  - "Ce facem" under the board; the rest in one column;
  - **the dock appears only once the board's last line leaves the screen.** Draw it hidden in `dark-390.png` and visible at the foot in `dark-390-full.png`. In the build it is visible by default, and a script hides it while the board is on screen, so no-JS visitors keep it. One orange call per screen.
- **Type:** Big Shoulders Display 800 in **sentence case** (road signs set destinations in mixed case) for the heads, plate and line numbers, and the wordmark (capitals, as the logotype); Archivo for the rest. Six sizes: h1 80/80 (44/46 at 390); h2, the board head and the plate number 48/48 (32/34); line numbers and tile titles 28/30 (24/26); the lede 20/30 (17/27); body 16/26; labels 14/20 at 600.
- **Palette (dark only):** A's neutrals, call and banner, with contrast as A. Plus `on-call-muted` #411e0d, for the plate's small labels (4.79 on the call). **Amber is no longer a text colour:** only the beacon mark, the lane line's start, the map hub, the step nodes and the focus ring (10.19 on ground, 8.75 on surface). Orange is the one accent.
- **Shape and depth:** radii 4 for controls, 12 for panels and the board, full for nodes. The board alone carries a shadow (0 24px 48px −24px, black at 70 %). Panels are `surface` with a `line` edge, never a card inside a card: cells inside the board and the strip are `surface-2` fills or hairline splits.
- **Signature:** the board of three named lines with the dispatcher's number set large. The road in it is the lane line and the scene in the steps section.
- **Reference:** `uber` (design-md-library): the request card on the first screen, the action before the pitch. Not its black and white, pills or illustrations.
- **How it differs from A:** a type hero on the ground and a full-width board, against a cinematic plate with copy over it; all three lines on the first screen; the scene moved to the steps, and no spine; a full-width lead row over four tiles, against a 2+1 grid; coverage on one panel; sentence case and a single accent.
- **Off Manifesto (catalog check):** the axes dark / display-condensed / warm sit near Hallmark's Manifesto: near-black, condensed capitals, and a red band holding the action. B stays off it by sentence case, the cold asphalt, and a dark raised board where orange is one cell, **never a full-width coloured band**.

## 6. Registry lines

| tractari (A) | Night road, lit | Big Shoulders Display, capitals (today's; Hallmark's Carnival theme sets it, kept as DESIGN.md's recorded face) | Archivo (today's; newspapper and CivicMap set it as display) | amber beacon `#f3b01d`, hue 80 (today's; 2° from lantern's lamp), safety orange `#f76400`, hue 45 (today's; satchel's clay family, 18° from auto-service's red, 5° from subcort's light-ground drafting orange `#af4316`, both today's) for the call, with asphalt ink on it | 64 px header band with places and the call; a 500 px full-bleed night plate (the 3D scene) with head, lede and actions lower-left; a dashed lane spine in the left gutter with a node per section; a 2+1 lead tile over four raised tiles; a surface band of three steps; copy beside a framed county map; the dispatcher plate over two line cells; phone: the dock is the call from the first paint |
| tractari (B) | Lines first | Big Shoulders Display, sentence case (today's) | Archivo (today's) | safety orange `#f76400` (today's) as the one accent; amber only in the beacon, lane line, map hub, nodes and focus | header band; the head across the container over a dashed lane line; a full-width raised board of the three named lines (the dispatcher's orange plate, two line cells, status and mail in its foot); a full-width lead tile over four tiles; one coverage panel of copy and map; the 3D scene as the steps' plate with a three-cell strip at its foot; phone: the board on the first screen, the dock after it |

## 7. Questions for the owner (ask sticky) and notes

1. **Approve a direction:** A or B? B reopens two recorded calls. DESIGN.md's "Full-bleed cinematic hero: the 3D scene fills the entire opening viewport", and PRODUCT.md's "The whole page is one continuous night road … each section is a stop on that single drive" (locked via /the-one-move). B moves the scene to "Cum funcționează", drops the spine, and puts Contact first. A departs less: its plate no longer fills the opening viewport, and its phone hero has no call of its own (the dock is the call).
2. **The response time:** `site.ts` holds `responseMinutes: 30` ("for the animated counter"), but no section shows it, and neither sketch does. Show it in the build, as a promise to a stranded driver, or delete it from `site.ts`?

- **Note, gsap:** neither direction animates with gsap (the scene stays Three.js, the reveals stay CSS). The build's default: remove the dependency, the knip ignore and every mention, in one commit (brief 08, Interplay).
- **Note, the scene in judging:** both sketches and today show the reduced-motion backdrop. A's plate will look emptier on the board than in a browser with WebGL. The owner can open the live demo to see the truck.
- **Note, `tel:` links:** B merges the hero call into the board, so its page has 9 (nav 1, board 3, Servicii 1, footer 3, dock 1). Brief 08 asks for at least 10, so that acceptance line changes to 9 if B wins. A keeps 10.
