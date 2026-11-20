# The redesign: "The porch notice"

This folder is the design record of Churchix's redesign. The estate redesign board, where it was drawn and approved, is a private canvas; this is a copy of the app's page on it plus the build behind that page. The owner approved it on 2026-11-13, and [brief 05](../../../churchix/corpus/briefs/done/05-parish-template-redesign-with-hallmark-on-the-estate-board.md) built it. The code is now the source of truth: where the app and these files differ, the app wins, and later work may have moved a screen on. Read this folder to see what was decided and why before reshaping a screen.

## The owner's decisions

The owner approved the whole board on 2026-11-13, with every question standing at what the board proposed unless they reopened it. The questions this app's page asked:

- **Ask:** 1. Approve The porch notice as the parish template's direction, or keep Iconostasis restored (A: today's frame with its rail, a split hero and a large framed photo)? 2. Parish phones get a bottom bar of five places (Acasă, Program, Pomelnice, Donează, Meniu) with the Drawer behind Meniu: yes, or the Drawer alone as today? 3. The footer links Termeni și Condiții and Politică de Confidențialitate lead to pages the parish app does not have (they 404 today): should the template add those pages, or drop the links?
- **Ask:** 4. With no endpoint set, Pomelnice opens on today's note (sending is off) and still shows the fields under it, as built. Should it instead show the Pomelnice indisponibile state (drawn on the Direction sheet, with Contactați parohia), so nobody types names that cannot be sent? That changes behaviour, so it is yours to call.
- **Open question:** The handoff is two parts, not a bare @theme block: tokens.css (the color-mix roles under :where(:root)) and theme.css (new names, shadows, type). primary-container, on-primary-container and surface-container-low are kept as today for Badge, Alert, the form note and the Drawer ring. New names, no new seed: primary-strong (hover, pressed, the arch), secondary-strong (icons and marks on light surfaces), on-primary-variant and surface-highlight. on-surface, on-surface-variant, surface-container and secondary-container change derivation; see the map.
- **Reopened:** Recorded (churchix wiki/decisions.md, 2026-10-23, Q40): "The phone menu (MobileNav) is a Base UI Dialog (2026-10-23), a swipeable Drawer since 2026-11-12." Proposed: the Drawer stays, behind Meniu, and a bottom bar of five labelled places joins it, so Program, Pomelnice and Donează are a thumb away (the 390 comps; the last item opens the Drawer).
- **Reopened:** Recorded (churchix wiki/design-system.md, the 2026-06-18 redesign): the Hero is "an asymmetric split" with the identity left and a framed image above the week timeline right; the liturgical Rail runs beside the content; Home ends on "a quiet burgundy despre band"; PageShell opens inner pages with an overline kicker. Proposed: the name and the picture sit in a full-width burgundy band, the program and the giving card rise out of its edge, the Rail is retired, Despre is plain text beside a facts card on the page ground, and inner pages open on a slim band with title and lede. The kickers (Rânduiala liturgică, Dania ta, Pomenire la Sfânta Liturghie) are dropped: Floor 9 bans eyebrows and the lede already says it.

Where the files below disagree, the later layer wins: the owner's decisions, then the controller's rulings, then the judges' rulings, then the directions file.

## What is here

| Path | What it holds |
|---|---|
| `directions/churchix.md` | The director's brief: both directions (the winner is the one built), the shared fixture and the screens to draw. |
| `judge/churchix/RESULT.md` | The blind judging against today and the rulings that came with the win. |
| `critiques/churchix-controller.md`, `critiques/churchix.md` | The design critic's review against today, and the controller's rulings over it. |
| `manifests/churchix.tokens.css`, `manifests/churchix.tokens-map.md` | The token hand-off in the app's own names, and the renamed, new and unused tokens. |
| `manifests/churchix.board-notes.md` | What the board said beside the screens: the asks, decisions, reopened rules, open questions, the contrast table and the runner-up. |
| `work/churchix/twins/*.html` | Each drawn screen as static HTML, light and dark: open one in a browser. |
| `work/churchix/shots/` | The twins rendered at 1280 and 390, light and dark, WebP. `direction.webp` is the board's direction sheet. |
| `shots/churchix/` | Today's screens as the board showed them before the redesign. |

People's names and data in the pictures come from seeded demo accounts or are invented.

## Not here

The sketches and the judges' images, the runner-up's build (its notes are in the board's notes), the build's scripts, and the screenshots taken while it was built. They stay in the estate build folder.
