# saloon (Unghii by Ana): two directions

Written 2026-11-13 by the art director. Repo: presentation-sites, site `sites/saloon`, brief 06 (`corpus/briefs/todo/`), which runs brief 05's shared steps.

**Sources read:**
- the repo's `CLAUDE.md` and `corpus/wiki/decisions*.md`;
- `sites/saloon/DESIGN.md`, `PRODUCT.md`, `docs/ADR.md` and `src/styles/global.css`;
- the source of `Nav`, `WipBanner`, `Hero`, `About`, `Services`, `MobileBookingBar` and `MobileMenu`;
- `content/site.ts`, `services.ts` and the mock SVGs.

## Recorded calls that bind both directions

**One light look, no theme switch.**
- Sources: brief 06 ("The redesign stays light and adds no theme switch"), the owner's answer to Q18 on 2026-11-10 (`decisions-ui.md`), and `DESIGN.md` ("never sterile white, never dark").
- This replaces board-director.md's light and dark palettes. Each direction has one light palette and no `theme` tweak.
- Sketchers render that one look in both judged frames: 1280×800 and 390×844.
- `pairs.mjs` reads `<L>/dark-390.png` by name. Save the **light** 390×844 render under that name too, and say so in `tokens.md`. Today's phone contestant is `light-390-home.png`.

**The brand stays.** `DESIGN.md`: "Identity preservation wins".
- Keep the blush-cream ground, the one blush brand colour, gold under 10% of any surface, Fraunces for display and Manrope for body.
- Both faces are today's, so the registry allows them.
- Fraunces is on Hallmark's saturated list; its argument is recorded in `DESIGN.md` (chosen over Playfair, to read hand-made).
- The sketch loads fonts from Google; the build keeps self-hosting with Fontsource.

**Services stay a menu of rows, price on the right, never a card per service** (the comment in `Services.astro`). Both directions put the three rows on one raised surface.

**The phone menu stays the Base UI Drawer** (Q40). No bottom tab bar.

**Also from `DESIGN.md`:**
- hero text before the image on phones;
- the desktop hero image capped near 30rem;
- no split headers;
- no nested cards;
- no kicker above a section title;
- the gold rule only for Ana's intro (the loyalty panel is outside this sketch);
- hyphens, not dashes.

**Content limits:**
- Testimonials stay parked (brief 06).
- No copy is rewritten. Business facts and placeholders stay as shown.
- Only the site's image slots exist. Both directions draw them as today's mocks (section 3): no stock or library photos and no drawn illustrations, so the judges compare design on equal pictures.

## The Floor wins on presentation, the words stay (one ruling for both)

These are departures from `DESIGN.md`:

- **Capitals.** Tracked capitals on buttons, nav, subtitles and stat labels become sentence case, untracked, in Manrope (Floor 9). The source strings are already sentence case.
- **Arrows.** The `→` glued to `Vezi serviciile` and `Programează` becomes a Phosphor `arrow-right` icon, 6 px after the words, `aria-hidden` (Floor 10).
- **Banner dot.** The banner's decorative dot goes (Floor 10).
- **Focus ring.** The ring moves from `#c9a961` to `gold-ink`, 2 px with a 3 px offset.
  - The old gold is 2.04:1 on A's ground and today's ring is 2.14:1, both under 3:1.
  - The new one is 5.36:1 on A's ground and 4.94:1 on B's.
  - It is still gold, which is the gold's real job.
- **Gold-ink and ochre.** `gold-ink` deepens from `#806619` to `#7a6118`, and the ochre label from `#745b1b` to `#6f561a`, so both hold AA on the deeper grounds.
- **Smaller changes:**
  - the hero's stray gold disc goes;
  - the header keeps its 1 px foot edge at all times;
  - the film grain is not drawn;
  - icons are inline strokes in Phosphor's light geometry, the site's one family.

## 1. Today's strengths (keep all of them)

1. **The offer and the action on the first screen at both widths.**
   - Phone: text first (headline, one sentence, the green WhatsApp button).
   - Desktop: the same beside the capped photo.
2. **One unmistakable booking action.**
   - Solid WhatsApp green with the glyph marks every WhatsApp action, each one pre-filled.
   - Each price row has its own `Programează` that pre-fills the service.
   - `Programează-te` is in the header on desktop; a sticky bar keeps WhatsApp in reach on phones.
3. **The price list reads like a salon menu.** Name, subtitle and description on the left; the price on the right in gold-ink Fraunces with tabular figures.
4. **Warmth over chrome.** The blush-cream ground, the soft serif, the italic wordmark, and Ana's signed intro ("cu drag, Ana" under a gold rule) carry trust.
5. **The page varies by what each section is,** not by a template beat. Nothing competes with the pictures.

**Faults both fix:**
- **Surfaces don't separate.** Cards are `#ffffff` on `#fff8f6` at 1.05:1, and the bands are also 1.05:1, so the page reads as one flat sheet. Every group gets a raised surface or a visible band.
- **The yellow `Site în lucru` banner is the loudest thing on the page.** It becomes a pale gold notice.
- **The header pill and the hero button read as two different actions.** The green leads.
- **Capitals, glued arrows and the failing focus ring** (fixed by the ruling above).
- **A dead field under the hero's actions at 1280.**

## 2. The main screen

**Home `/` with its shell.** It is the site's only screen; the legal pages use their own layout.

Today's shots are in `board/shots/saloon/`, all in mock-image mode:
- first screens: `light-1280-home.png` and `light-390-home.png`;
- whole page: `light-1280-home-full.png` and `light-390-home-full.png`.

**What the sketch covers:**
- the notice band, the header and the hero;
- `Bună, sunt Ana`;
- `Servicii & prețuri`;
- the phone booking bar and the menu button (the Drawer itself is not drawn).

That is today's first 2,458 px of 7,632 at 1280 (about a third), and the first ~3,160 of 9,449 at 390.

**Left out** (the build carries the winner's language into them): `Curățenie fără compromisuri`, `Lucrări recente`, the loyalty panel, `Întrebări frecvente`, `Programează-te`, `Unde mă găsești` and the footer.

Judges see only the first viewport, so each direction's difference must show inside 1280×800 and 390×844.

## 3. The content fixture (word for word, from source; source case, not CSS capitals)

**Notice band:** `Site în lucru. Pentru programări, scrie-mi oricând pe WhatsApp.` (no dot)

**Header:**
- Wordmark `Unghii by Ana`, italic Fraunces, linking to `#acasa`.
- Places: `Despre`, `Servicii`, `Galerie`, `Întrebări`, `Contact`.
- Button `Programează-te`, linking to `#programari`.
- At 390: the wordmark and a 48 px menu button (list icon), `aria-label="Deschide meniul"`.

**Hero:**
- h1: `Unghii care vorbesc despre tine`
- Sentence: `Manichiură personalizată lângă Târgu-Jiu, dedicată fiecărei cliente în parte.`
- Primary action: the glyph and `Programează-te pe WhatsApp`. The href pre-fills `Bună, Ana! Aș dori o programare. Când ai un loc liber?`, which is never shown.
- Link: `Vezi serviciile` with the arrow icon, linking to `#servicii`, 44 px target.

**About:**
- h2: `Bună, sunt Ana`, then the gold rule (48×2).
- Paragraph 1: `Am început manichiura lucrând pentru prietene și familie, iar de câțiva ani o fac cu seriozitate, pentru tot mai multe cliente. Pun suflet în fiecare set de unghii și știu că pot livra un rezultat de care să fii mulțumită.`
- Paragraph 2: `Lucrez cu produse de calitate, în condiții de igienă atente, și îmi place să ascult ce își dorește fiecare clientă, ca rezultatul să fie exact pe gustul tău.`
- Paragraph 3: `Dacă vrei unghii îngrijite și un moment doar pentru tine, te aștept în Iezureni.`
- Signature: `cu drag, Ana`, `aria-label="semnat, Ana"`, italic Fraunces with a gold underline.
- Facts: `3+` over `ani de experiență`, and `1 la 1` over `doar tu și Ana`.

**Services:**
- h2: `Servicii & prețuri`
- Lead: `Prețuri orientative. Pentru o ofertă personalizată, scrie-mi pe WhatsApp.`
- Rows, each giving title, subtitle, description, price, then the link `Programează` with the arrow icon (the `·` below only separates the fields here; never draw it). The link pre-fills `Bună, Ana! Aș dori o programare pentru <title>. Când ai un loc liber?`.
  1. `Manichiură` · `Clasică & semipermanentă` · `Manichiură îngrijită cu lac semipermanent rezistent până la 3 săptămâni.` · `de la 80 lei`
  2. `Unghii cu gel` · `Construcție & gel` · `Construcție pe tipsuri sau șablon, pentru unghii rezistente și un aspect impecabil.` · `de la 150 lei`
  3. `Nail Art` · `Design-uri personalizate` · `French, babyboomer, ombre, pictură manuală: design-uri unice, adaptate stilului tău.` · `de la 20 lei / unghie`
- Foot: `Nu găsești ce cauți?`, then the link `Întreabă-mă pe WhatsApp`, then `.`. The link pre-fills `Bună, Ana! Aș vrea să întreb despre un serviciu care nu e în listă.`

**Phone bar:**
- The glyph and `Scrie-mi pe WhatsApp`, `aria-label="Scrie-mi pe WhatsApp la 07XX XXX XXX"`.
- B adds a call button: phone icon, `aria-label="Sună-mă"`, a `tel:` link. `Sună-mă` is today's label from `Programează-te`.

**Picture slots, as today's mocks:** a 135° two-stop gradient through tokens, with the label centred in italic serif, in ink at 45%.
- `Hero photo`: `#f4d6d0` to `#fbf7f2`. Alt: `Detaliu cu unghii manichiurate de Ana`.
- `Portret Ana`: `#fae4db` to `#e8a6a0`. Alt: `Portret al Anei`.

**Font check:** render `Bună`, `câțiva`, `săptămâni`, `Construcție`, `șablon`, `Întreabă-mă` and `Târgu-Jiu`. Comma-below ș and ț, and ă, â and î, must come from Fraunces and Manrope, not a fallback.

**States (Direction sheet, for the build):**
- a failed picture keeps its well and label, never alt text across it;
- focus on every link and button;
- reduced motion means no reveals;
- the phone bar hides while `Programează-te` or `Unde mă găsești` is on screen, as today.

## 4. Directions

### A. Daylight studio (Evolve today)

**Idea:** today's page in today's order. The groups become visible islands on a slightly deeper blush-cream, the capitals and stray ornaments go, and the green stays the one loud thing.

**1280** (container 1200, gutters 32):
- **Notice band:** 36 px, with a 1 px gold foot.
- **Header:** 76 px on the ground, with a `line` foot.
  - Wordmark on the left, 28/32.
  - The five places centred, 16/24 500, muted ink, turning to ink on hover.
  - On the right, the blush `Programează-te` pill: 48 px, ink, 16/20 600, card shadow.
- **Hero:** today's split, `1.05fr / 0.95fr`, 64 gap, 56 px top padding.
  - Left, centred against the photo: the h1 on two lines, the sentence (max 30em), then the 52 px green pill and `Vezi serviciile`.
  - Right: the hero slot, 480 tall, radius 24.
  - The top 80 px of the About band shows in the 800 frame.
- **About:** on the band, one island (card, radius 24, 48 padding, edge and shadow).
  - Left: the portrait slot, 4:5, 400 wide, radius 16.
  - Right: h2, the gold rule, the paragraphs (muted, max 60ch), the signature, then the two facts with a vertical hairline between them.
- **Services:** on the ground.
  - The h2 and lead stacked on the left.
  - Below, one raised menu card: radius 24, padding 8/48, edge and shadow, three rows split by hairlines.
  - Each row is a `minmax(0,1fr) auto` grid: title, the subtitle in `secondary` and the description on the left; the price over `Programează` on the right (underlined in `line`, ink on hover).
  - The foot line sits under the card.

**390** (gutters 20):
- **Top:** the notice band in flow, then a 64 px header with the wordmark (24/30) and the menu button.
- **Hero:** h1, sentence, a full-width 52 px green pill, `Vezi serviciile`, then the 4:5 slot (radius 20).
- **The bar:** the first frame has no booking bar, as today, because the bar slides in after the hero. Draw it only in a scrolled 390 render.
- **About:** an island with 24 padding, text first and the portrait below it.
- **Services:** the menu card's rows stack, with the price and `Programează` sharing one baseline.

**Type:**
- Fraunces, `opsz` auto, `"SOFT" 30`:
  - h1 64/68 at weight 440 (40/44 at 390), tracking −0.015em;
  - h2 40/46 (32/38);
  - titles, prices (tabular), fact figures and the italic 500 signature 26/32 (24/30).
- Manrope:
  - lead 18/28;
  - body 16/26;
  - nav and buttons 16 at 500/600;
  - subtitles, foot and notice 14/20.
- Six sizes; the wordmark is the logo.
- Font link: `https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,400..600,0..100;1,9..144,400..600,0..100&family=Manrope:wght@400..700&display=swap`

**Palette** (light only, by the app's token names, with contrast):

| Token | Role | Hex | Contrast |
|---|---|---|---|
| `background`/`surface` | ground | `#fbf2ee` | |
| `surface-container-low` | band | `#f5e6df` | 1.10 on ground |
| `surface-container-lowest` | card | `#ffffff` | 1.10 on ground, 1.22 on band; always with an edge and shadow |
| `surface-container-high` | well | `#f3ddd5` | |
| `outline-variant` | line | `#e0c8bf` | 1.44 on ground, 1.59 on card |
| `outline` | control edge | `#8a7773` | 3.83 / 4.23 |
| `on-surface` | ink | `#241914` | 15.55 on ground, 14.10 on band, 17.15 on card |
| `on-surface-variant` | muted ink | `#4f4442` | 8.51 / 7.72 / 9.38; 6.87 on blush |
| `primary` | rose-brown, for the signature and figures | `#705955` | 5.86 / 5.31 / 6.46 |
| `blush` | the pill fill | `#f4d6d0` | ink on it 12.56 |
| `blush-deep` | hover | `#e8a6a0` | |
| `gold` | the rule and the notice foot only | `#c9a961` | |
| `gold-ink` | prices and the focus ring | `#7a6118` | 5.91 on card, 5.36 on ground, 4.86 on band; **never on blush** (4.33) |
| `secondary` | subtitles | `#6f561a` | 6.95 / 6.30 |
| `whatsapp` / `whatsapp-deep` | the booking action | `#118040` / `#0e7a37` | white on it 5.02 / 5.44; green on ground 4.55 |
| `secondary-container` / `on-secondary-container` | the notice | `#f6e4bd` / `#5a4512` | 7.30 |

**Shape:**
- Radii: 8, 16 (frames, phone cards), 24 (islands), full (buttons).
- Card shadow: `0 1px 2px` ink at 6% plus `0 12px 32px -16px` ink at 22%.
- The green button keeps today's glow.

**Signature:** Ana's signed island: portrait beside the letter, the gold rule and "cu drag, Ana", raised off its band.

**Reference:** `starbucks` (design-md-library): a warm material ground where one deep green carries every action and gold is kept for ceremony. Nothing of its palette, type or pills.

### B. Menu beside the work

**Idea:** the first screen answers the three questions a visitor brings from Instagram: what the work looks like, what it costs and how to book. The headline runs across, with the photo and the price menu side by side under it. On a phone the booking bar is docked from the first paint.

**1280:**
- **Notice band and header:** as A.
- **Hero, stacked rather than split:**
  - The h1 on one line across the container.
  - The sentence and the action row (green pill, `Vezi serviciile`) under it, left-aligned. This is not a split header.
  - Then a `7fr / 5fr` row with a 32 gap. Left: the hero slot at the menu card's height (about 480, inside the cap), radius 24. Right: the menu card. This is `DESIGN.md`'s "real element" exception: the Services section moves up into the hero.
- **The menu card:** radius 24, with an edge and shadow.
  - A blush head band holding the h2 and the lead in muted ink.
  - A white body with three rows split by hairlines. In each row: the title and price on one baseline, the subtitle, the description, then `Programează` aligned right.
  - The foot line closes the card.
- **In the 800 frame:** the header, h1, sentence, actions, photo, the menu's head and all three prices. Fit this with 32 px of top padding, never with type under 14.
- **Below:** Ana's island on the band, as A, but with the portrait on the right, mirroring the hero row.

**390:**
- **Top:** notice band, then a 64 px header with the menu button.
- **Hero:** h1 and sentence, with no in-hero button. Then `Vezi serviciile` (44 px), the hero slot at 4:3 (radius 20), then the menu card, whose blush head shows in the first frame.
- **The dock:** fixed, 72 px plus the gesture inset, in every 390 render including the first frame.
  - It sits on `card`, with a `line` top edge and the card shadow.
  - The green `Scrie-mi pe WhatsApp` pill: 52 px tall, flexible width.
  - Beside it, a 52 px round outlined `Sună-mă` button.
  - Pad the page by the dock's height.
- **Below the menu card:** Ana's island.

**Type:** the faces and link as A.
- Fraunces: h1 64/68 on one line (40/44 at 390); h2 32/38 (28/34); titles, prices, figures and the signature 24/30.
- Manrope: lead 18/28, body 16/24, labels 14/20.
- Six sizes.

**Palette** (light only; tokens not listed are as A):

| Token | Role | Hex | Contrast |
|---|---|---|---|
| `background`/`surface` | ground | `#f5e8e2` | |
| `surface-container-low` | band | `#efdcd4` | 1.11 on ground |
| `surface-container-lowest` | card | `#fffcfb` | 1.17 on ground, 1.30 on band |
| `surface-container-high` | well | `#f3ddd5` | |
| `outline-variant` | line | `#dcc3ba` | 1.40 on ground, 1.64 on card |
| `outline` | control edge | `#86726e` | 3.77 / 4.43 |
| `on-surface` | ink | `#241914` | 14.31 on ground, 12.95 on band, 16.80 on card; 12.56 on blush |
| `on-surface-variant` | muted ink | `#4f4442` | 7.83 / 7.09 / 9.19; 6.87 on blush |
| `primary-container` | menu head, blush | `#f4d6d0` | 1.34 on card, with a `line` foot |
| `primary` | rose-brown | `#705955` | 5.39 / 4.88 / 6.33 |
| `gold-ink` | prices and the focus ring | `#7a6118` | 5.79 on card, 4.94 on ground; **only on card or ground** (4.47 on band, 4.33 on blush) |
| `secondary` | subtitles | `#6f561a` | 6.81 on card |
| `whatsapp` | the booking action | as A | 4.19 on ground, 3.79 on band |

**Shape:** A's radii and shadows. The photo and the menu card share radius 24 and height, so they read as one pair.

**Signature:** the menu card beside the picture: a raised price list with a blush head, three gold-ink prices and three pre-filled `Programează` links, on the first screen.

**Reference:** `apple` (design-md-library): photography first, with the thing to buy shown beside its options and price, and chrome that recedes. Nothing of its palette, type or blue.

**How it differs from A:**
- A stacked hero (headline across, then picture and menu) against A's text/photo split.
- Services ride on the first screen instead of third.
- A two-action dock from the first paint replaces the in-hero button on phones.
- Unlike auto-service B's pinned card, nothing is sticky on desktop.

## 5. Questions for the owner (ask sticky, the reopen first)

1. **B's dock reopens `DESIGN.md`'s `MobileBookingBar`.** Today the bar waits for the hero to scroll away and holds WhatsApp only. B shows it from the first paint, adds `Sună-mă`, and drops the hero's own button on phones. Accept that if B wins?
2. **Approve a direction:** A (today's order, refined into islands) or B (prices beside the work)?
3. **`3+ ani de experiență`.** `site.ts` marks `3+` as a placeholder, and Hallmark's Floor forbids an invented figure. Confirm Ana's number, or the build shows the pair only once `site.local.ts` sets it?

Notes, not questions:
- `07XX XXX XXX` and the notice stay as placeholders.
- The social card and the marketing assets read the brand colours: re-check them after the token change (brief 06).

## 6. Registry lines

| saloon (A) | Daylight studio | Fraunces (today's) | Manrope (today's) | blush `#f4d6d0` and rose-brown `#705955` (today's; rose-brown near churchix's burgundy in hue, far lower chroma); WhatsApp green `#118040` for every booking action; gold `#c9a961` in two rules only (today's; churchix's `#c8a24b` is its twin, both today's) | 76 px header (wordmark, five places, a Programează-te pill); split hero, text left, capped photo right; Ana's island (portrait beside the signed letter) on a band; the price list as one raised menu card of ruled rows; phone: Drawer, text then photo, booking bar after the hero |
| saloon (B) | Menu beside the work | Fraunces (today's) | Manrope (today's) | as A; blush also fills the menu card's head band | header as A; a one-line headline across with the actions under it; the photo (7 cols) beside a raised price menu card with a blush head (5 cols), all three prices on the first screen; Ana's island mirrored below; phone: words, a 4:3 photo, the menu card, a dock with WhatsApp and Sună-mă from the first paint |
