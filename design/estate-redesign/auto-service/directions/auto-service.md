# auto-service (BavAuto Gorj): directions for the redesign board

Written 2026-11-13 by the art director. Repo: presentation-sites, site `sites/auto-service`, brief 05 (`corpus/briefs/todo/`). The other three sites (saloon, subcort, tractari) get their own directors.

**Recorded calls that bind both directions.**
- **One dark look, no theme switch** (brief 05 steps 5 and 7; `corpus/wiki/decisions-ui.md`, "The phone menus on Drawer", Q18). This replaces board-director's light + dark palettes: each direction has **one dark palette**, the comp has no `theme` tweak, and the sketcher renders that same look in both judged frames (1280×800 and 390×844).
- **No photography** (DESIGN.md:260, brief default 1). **No roundel**, and the independence disclaimer stays in the footer (brief default 2). **No quote form is added** (brief default 3).
- **Services are never a card per service** (DESIGN.md's stated anti-reference). Both put the nine rows on one raised surface with hairlines between rows: structure for the owner, no icon-card grid.
- **Fonts:** Google Fonts names are for the sketch only; the build self-hosts with `@fontsource-variable` (DESIGN.md, `docs/LEGAL.md`). Checked: `@fontsource-variable/encode-sans` 5.3.0 has `wdth` 75–125, `wght` 100–900 and latin-ext.
- **Hallmark's Floor gates both:** no tracked capitals (67), no dot-joined strings (63), mono only for figures (64), no invented facts (46a), 48 px phone targets, the call never under the sticky bar.

## 1. Today's strengths (jobs both directions keep)

1. **The call is the one lit control:** `Sună acum` with the number in the hero, the phone in the header, and a sticky call bar with WhatsApp on phones.
2. **Three symptom entry points** that open WhatsApp with the first message already written.
3. **Hours and the town on the first screen,** beside the actions.
4. **Four specific proofs** (RAR, deviz, garanție, doar BMW) in one band straight under the hero, on their own ground between hairlines.
5. **Nine services as one scannable list** (pictogram, title, subtitle, description), closed by a call line; never an icon-card grid.
6. **A look of its own:** dark, heavy headline, BMW enthusiast language without the roundel; nothing like a cheap garage.

**What today does badly (both fix).** At 390 the hero call sits half under the sticky bar, below a 150 px gauge band, and the third symptom chip is clipped in a sideways scroller. Nav, legends, subtitles and the call are tracked mono capitals (Floor 67 and 64; DESIGN.md's own Printed-Legend Rule says mono is for readings only). Hours are dot-joined (63). The band's LEDs, lit 5/4/3/5, read as scores ("Garanție 12 luni", 3 of 5). Regions part by hairlines only, which the owner reads as flat. And tractari, in the same repo and the same trade, sits on nearly the same cold graphite (hue 250 vs 255), an orange call (45 vs 58) and Archivo.

## 2. The main screen

**Home `/` with its shell.** Today: `light-1280-home.png` and `light-390-home.png` (first screens), `light-1280-home-full.png` and `light-390-home-full.png` (whole page). The files say light; the site is dark. The sketch covers **the first screen plus the next two sections**: the M stripe and WIP banner, the header, the hero, the trust band, the services section, and the phone call bar. That is the first ~2,100 px of today's 5,483 px page at 1280. Out: "De ce să ne lași…", "Cum lucrăm…", "O familie…", "Hai cu mașina la noi", the footer.

## 3. The content fixture (shared, word for word)

Values, not separators: today's `·` and `|` are presentation and go (63). Case is presentation too: where the source has capitals (`AUTORIZARE`, `SUNĂ ACUM`) or CSS uppercases (nav, subtitles), both directions set the words in sentence case (67). The wordmark is exempt. Placeholders stay as shown; no other figure appears. **Both sketches show everything below, all nine descriptions included:** gate 58 (about 80 words a screen) on the services section waits for the owner's answer to question 3, so no sketcher trims on their own.

- **Top:** the M stripe (blue, indigo, red segments). Banner: "Site în lucru. Pentru programări și oferte, sună-ne sau scrie-ne pe WhatsApp." with links "07XX XXX XXX" (tel) and "WhatsApp".
- **Header:** wordmark "BavAuto Gorj" (link, `aria-label="BavAuto Gorj — acasă"`); places "Acasă" (current), "Servicii", "Atelier", "Contact" (`aria-label="Navigare principală"`); phone "07XX XXX XXX" (tel). Phone width: wordmark and a menu button, `aria-label="Deschide meniul"`.
- **Symptoms** (list `aria-label="Spune-ne ce are mașina"`); each opens WhatsApp with its message (href only, never shown):
  - "Mi-a apărut un martor" (warning) → "Bună ziua! Mi-a apărut un martor pe bord. Model și an: ___. Ce scrie / cum arată martorul: ___."
  - "Revizie depășită" (wrench) → "Bună ziua! Am revizia depășită și aș vrea o programare. Model și an: ___. Km actuali: ___."
  - "Face un zgomot" (sound) → "Bună ziua! Mașina face un zgomot. Model și an: ___. Când apare zgomotul: ___."
- **Headline** (h1, three lines): "BMW-ul tău," / "pe mâini care" / "îl citesc."
- **Lede:** "Trei oameni, o singură marcă. Citim toate modulele, îți spunem exact ce are și cât costă — și abia apoi punem mâna pe mașină."
- **Actions:** the call "Sună acum" over "07XX XXX XXX" (tel); "Trimite o poză pe WhatsApp" (message: "Bună ziua! Aș dori o programare / un deviz pentru BMW-ul meu. Model și an: ___. Problema: ___.").
- **Status:** "Deschis acum" (live dot), "L–V 08:00–18:00", "Sâ 09:00–14:00", "Târgu-Jiu", "Gorj" (join the last two with a comma or a line break).
- **Trust band** (`aria-label="De ce ne poți lăsa mașina"`), legend / title (h3) / note:
  - "Autorizare" / "Autorizat RAR" / "Lucrări conforme, cu factură"
  - "Înainte de lucrare" / "Deviz scris, în avans" / "Niciun cost neaprobat de tine"
  - "După lucrare" / "Garanție 12 luni" / "Piese și manoperă, în scris"
  - "Specializare" / "Doar BMW, zi de zi" / "Diagnoză dedicată, nu generalistă"
- **Services:** h2 "Ce citim din mașina ta"; lede "De la revizia de rutină la lucrările pe care nu le face oricine. Dacă nu găsești aici ce-ți trebuie, sună-ne — probabil o rezolvăm." Nine rows in this order (title / subtitle / description / pictogram):
  1. "Diagnoză computerizată BMW" / "Citire & ștergere erori, codări" / "Diagnoză dedicată BMW: citim toate modulele, interpretăm corect erorile și facem codări/adaptări (retrofit, înregistrare baterie, resetări service)." / pulse
  2. "Revizii & schimb ulei" / "Ulei + filtre, conform fișei BMW" / "Revizie completă cu ulei și filtre potrivite motorului tău (ulei, aer, polen, combustibil), cu resetarea corectă a indicatorului de service." / oil drop
  3. "Distribuție & lanț" / "Curea/lanț + pompă apă" / "Înlocuire kit distribuție (curea sau lanț, inclusiv lanțuri N47/N57) și pompă de apă, cu piese de calitate și montaj la cuplul corect." / chain
  4. "Sistem de frânare" / "Plăcuțe, discuri, lichid" / "Plăcuțe și discuri față/spate, purjare și schimb lichid de frână, resetarea senzorilor de uzură și a martorilor din bord." / brake disc
  5. "Suspensie & direcție" / "Amortizoare, brațe, rulmenți" / "Amortizoare, arcuri, brațe și bucși, rulmenți de roată, capete de direcție, pentru ținuta de drum specifică unui BMW." / spring
  6. "Răcire & VANOS" / "Termostat, pompă, garnituri" / "Reparații sistem de răcire (termostat, pompă apă, vas expansiune) și intervenții specifice BMW: garnituri VANOS, capac valve, scurgeri de ulei." / thermometer
  7. "Electrică & electronică auto" / "Baterie, alternator, instalație" / "Baterie (cu înregistrare în sistem), alternator, electromotor, instalație electrică, iluminat și senzori — diagnoză și reparație." / bolt
  8. "Climatizare / AC" / "Freon, etanșeitate, igienizare" / "Încărcare freon (R134a / R1234yf), verificarea etanșeității sistemului, reparații compresor/condensator și igienizarea habitaclului." / snowflake
  9. "Pre-ITP & remediere" / "Verificare înainte de inspecție" / "Verificăm mașina înainte de ITP și remediem deficiențele, ca să treci inspecția din prima, fără drumuri în plus." / clipboard check
  - Foot: "Nu găsești aici ce ai nevoie? Sună-ne și îți spunem din vorbă, fără obligații." ("Sună-ne" is a tel link).
- **Phone call bar** (390 only): "Sună: 07XX XXX XXX" (tel) and a WhatsApp icon button, `aria-label="Scrie pe WhatsApp"`.
- **A only, the instrument** (`aria-hidden`): tach 0–8 with "1/min x1000", red arc from 6.5, the dot-matrix window "ULEI 3.400 km" over "TÂRGU-JIU · GORJ"; the shoulder dial "DEVIZ". Inside the drawn display these keep today's capitals: they are the drawing, not labels.

Icons: one 24 px stroke set at one weight (today's closed set is hand-drawn at 1.75); brand marks (WhatsApp) filled. No emoji.

## 4. Directions

### A. Bordcomputer, serviced (Evolve today)

- **Idea:** the same instrument binnacle at night, serviced: every legend readable, the surfaces raised so the page groups the way a cluster does, and one amber that still lights only the call.
- **Skeleton, 1280** (container 1240, gutters 36): the M stripe and a one-line banner; a 72 px header on its own `surface` band with a `line` foot (wordmark, four places, the outline phone). Hero in two halves. Left: the three symptom chips (44 px, `surface-2`, amber pictogram, a small WhatsApp mark at the end), the head, the lede, the actions (the lit two-line call, the steel WhatsApp button), then an **hours well**: one `surface` strip of four cells split by hairlines (Deschis acum with its dot; the two hour readings; Târgu-Jiu, Gorj). Right: today's tach with the DEVIZ shoulder cropped by the edge, and its amber bloom. Under the hero, the **trust band**, full bleed on `surface` with `line` edges, four columns: the legend as a column head (body face, 14/20), one solid 32×4 segment in that cell's M code (blue, indigo, red, amber; no counts), title, note. Then the services head, and **one raised well** (`surface`, radius 10, `line` edge, 32 padding) holding the two-column board: hairline rows, a 44 px lamp well (amber on hover or focus), title, subtitle, description. The foot line under the well.
- **Skeleton, 390:** banner in two short lines; 56 px header (wordmark, menu). Head, lede, then **the call (full width, 56 px) and WhatsApp (48 px) before anything else**; the chips wrap to two rows under them; the hours well as two rows; the tach as a 120 px arc band; the band as four rows (legend beside the title); the board in one column; the sticky call bar on `surface`, content padded by its height.
- **Type:** Archivo, driven on width: display 76/78 (44/46 at 390) 800 wdth 112, −0.028em; h2 48/52 (32/36) 800 wdth 110; titles 22/28 700 wdth 106; wordmark 800 wdth 118, uppercase, its amber mid-dot kept. Hanken Grotesk: lede 17/28, body 16/26, labels and subtitles 14/20 500, sentence case, untracked. Azeret Mono 500 for figures only (phone, hours, km), tabular. Link: `Archivo:wdth,wght@100..125,700..800`, `Hanken+Grotesk:wght@400;500;600`, `Azeret+Mono:wght@500`.
- **Palette (dark only), with contrast:** `ground` #090b0f · `surface` #1a1e25 (header, band, wells, call bar; 1.18 on ground) · `surface-2` #252b32 (chips, steel buttons, lamp wells; 1.17 on surface) · `line` #333840 (1.67 on ground, 1.42 on surface) · `line-strong` #636972 (control edges; 3.56 / 3.02) · `ink` #f0f2f4 (17.55 / 14.89) · `ink-muted` #b0b5bb (9.54 / 8.10; 6.92 on surface-2) · `accent` #f1840b (the call fill and the live dot; 7.54 / 6.40) with `accent-hover` #fd9e3d and `accent-deep` #de6f00 for the filament gradient · `on-accent` #1c0a01 (7.36 on accent, 5.84 on deep) · `accent-text` #fcb368 (the lit word, links, the 2 px focus ring; 11.05 / 9.38) · `m-blue` #2fa7f3, `m-indigo` #7e74e1, `m-red` #ed413b (stripe, segments, redline only; 6.32 / 4.36 / 4.31 on surface) · `whatsapp` #42b970 (the mark only; 5.72 on surface-2).
- **Shape and depth:** radii 4 (controls), 6 (lamp wells, chips), 10 (wells), full (dots). Depth by tone, a `line` edge and the machined top lip (`inset 0 1px 0` white at 5.5%); the only outward glow is the amber bloom under the call.
- **Signature:** the instrument and the one lit call. Waive on the record Hallmark 80 and 47c (the drawn tach) and 38iii (the lit "îl citesc."): DESIGN.md names both as the world's signature, and they appear once.
- **Departures from DESIGN.md (the Floor wins):** legends, nav, subtitles and the call label in Hanken sentence case; hours and place as cells, not dot strings; the decorative pilot dot before the wordmark goes; LED counts become one solid coded segment; the Hairline Rule gives way to raised surfaces for the header, band and board.
- **Reference:** `lamborghini` (design-md-library): one accent spent only on primary actions against a dark ground, under heavy wide type. Not its pure black, gold or angled terminals.

### B. The job card

- **Idea:** the workshop's job card, pinned beside the page: the number, WhatsApp, the three symptoms that write the first message, and the hours never leave the screen while the page makes its case.
- **World:** the workshop's paperwork instead of the instrument. A warm graphite ground (the workshop floor, not tractari's cold asphalt); the one light material, today's trim panel, moves to the card that converts; the call takes the red the site already holds (today's `m-red`, the gauge's redline), deepened for a white label. No gauge, no chips above the head, no lit word.
- **Skeleton, 1280** (container 1240): the M stripe and banner; a 64 px header on `surface` with a `line` foot (wordmark, four places with an ink underline on the current one, the outline phone). Below, a grid `minmax(0,1fr) 400px`, 48 gap. **Right: the job card,** `position: sticky; top: 24px`, from the hero to the end of the services. Radius 8, 24 padding, one soft shadow. Inside, in order: the call (full width, two lines: "Sună acum" 14/20 over the number 24/28 tabular); WhatsApp (outline, 48 px); a hairline; "Spune-ne ce are mașina" (today's aria-label, now visible) over three 52 px symptom rows (pictogram, label, the WhatsApp mark at the end); a hairline; "Deschis acum" with a red live dot, the two hour rows, then Târgu-Jiu, Gorj. **Left:** the head and lede only; then the **trust table** on a raised `surface` panel: four rows, the legend as a row head (`th scope="row"`, 14/20 muted), the title (18/26 700) and the note; then the services head and the **services index** on one raised panel: a row per service, pictogram, title over subtitle in the first column, description in the second; the foot line.
- **Skeleton, 390:** banner; 56 px header (wordmark, menu). Head, lede, then **the job card inline at full width**: call first, WhatsApp, symptoms, hours, so the light card fills the lower half of the first screen. Then the trust table (row heads above their values), the index stacked, and the sticky call bar on `ground` with a `line` top. Content padded by the bar's height.
- **Type:** Encode Sans throughout, normal width: h1 64/66 (40/44 at 390) 800, −0.02em; h2 40/44 (30/34) 800; the card's number 24/28 700; lede and service titles 18/26 (titles 700); body 16/26 400; labels 14/20 600, sentence case. Wordmark: "BAVAUTO GORJ" at wdth 125, 800, keeping today's wide logotype without the dot. Figures tabular. Link: `Encode+Sans:wdth,wght@100..125,400..800`.
- **Palette (dark only), with contrast:** `ground` #161310 · `surface` #24211e (header, panels; 1.16 on ground) · `surface-2` #312d29 (steel buttons; 1.17 on surface) · `line` #413c38 (1.70 / 1.47) · `line-strong` #736e67 (control edges; 3.66 / 3.17) · `ink` #f2f0ec (16.26 / 14.07) · `ink-muted` #bbb7b0 (9.26 / 8.02) · `card` #ece9e4 (15.28 on ground) · `card-ink` #201c18 (13.98) · `card-ink-muted` #5a544e (6.17; also control edges in the card) · `card-line` #cbc7c0 (hairlines; 1.39) · `card-row` #dddad5 (row hover only, never a card in the card) · `signal` #c52525 (the call fill and the live dot; 4.73 on card, 3.23 on ground; **red sits only on the card or the ground**, never on `surface`, where it is 2.80) · `signal-hover` #ae1c1d · `on-signal` #fdfcf9 (5.58; 6.86 on hover) · `whatsapp` #42b970 (mark on dark; 5.47 on surface-2) · `whatsapp-on-card` #00773d (mark only, never text; 4.68 on card) · `focus` #fdc9c2 on dark (12.61), `card-ink` on the card (13.98), 2 px with a 2 px offset · `error` #e97ab2 (6.95; kept apart from the signal, always with an icon and words).
- **Shape and depth:** radii 4 (controls), 8 (card, panels), full (dots). Panels by tone plus a `line` edge; the card alone carries a shadow (0 16px 40px −16px black at 60%).
- **Below the sketch (for the build):** the card stops pinning at the end of the services, and the page returns to one column. Home's contact section, today's light trim panel, goes dark in B (a `surface` panel), so the page keeps one light material.
- **Signature:** the job card, the phone number set large on a light card that stays.
- **Reference:** `airbnb` (design-md-library): the sticky reservation card beside a scrolling listing, which folds to a bottom bar on phones. Not its pink, pills or photographs.
- **How it differs from A:** a pinned card in a two-column page against stacked full-width bands; no instrument; a light card on the first screen at both widths; warm graphite and red against cool graphite and amber; one Encode Sans against today's Archivo trio; a row-headed table and an index against a band and a board.

**Catalog checks** (`theme.mjs check`): A's axes dark / grotesk-heavy / amber are clear (Darkroom is display-condensed). B's dark / grotesk-heavy / red are clear and stay off Manifesto (near-black, condensed capitals, red) through the warm ground, normal width and sentence case. Encode Sans is a clear display face.

## 5. Registry lines

| auto-service (A) | Bordcomputer, serviced | Archivo, `wdth` 112 (today's; newspapper A sets the same cut) | Hanken Grotesk + Azeret Mono for figures (both today's) | cluster amber `#f1840b`, hue 58 (today's; 5° from satchel's dark clay, between tractari's 45 and lantern's 82), M codes on segments | header band with places and phone; hero: symptom chips, a three-line head with one lit word, call and WhatsApp, an hours well, the drawn tach right; a raised full-bleed band of four; one raised well holding the two-column services board; phone: the call before the chips, the tach as an arc band, sticky call bar |
| auto-service (B) | The job card | Encode Sans (wordmark at `wdth` 125) | Encode Sans | M red `#c52525`, hue 27 (today's `m-red`, deepened; 4° from newspapper's rubylith `#e8452e`, a marking ink there) | header band; two columns: the head, a row-headed trust table and a services index on raised panels, beside a 400 px light job card pinned right (call, WhatsApp, three symptoms, hours); phone: the card inline under the head, sticky call bar |

## 6. Questions for the owner (ask sticky) and notes

1. **Approve a direction:** A keeps the Bordcomputer world; B replaces it with the pinned job card and the red call (brief 05, owner decision 4). Which?
2. **The quote form:** PRODUCT.md lists one and the code has none. Drop it from PRODUCT.md (the default), or write a form brief?
3. **Service descriptions on home:** today home shows all nine (about 200 words); Hallmark's budget is about 80 words a screen. Keep them on home, or show titles and subtitles there and the descriptions only on `/servicii`?

- **Note, "Deschis acum":** it is fixed text in `Hero.astro`, shown even on Sunday. The build's default: the HTML shows the hours alone, and a few lines of script add "Deschis acum" with its dot only inside the hours in `site.ts`. No new copy.
- **Note, a copy change in B:** "Spune-ne ce are mașina" is today's aria-label on the symptom list. B shows it as the card's visible sub-head. The words are unchanged, but the owner sees them for the first time.
- **Note, tractari:** today the two dark sites share nearly one ground, accent and face (dealt-by-trade rule 5). B moves auto-service off it; if A wins, tractari's director should move instead.
