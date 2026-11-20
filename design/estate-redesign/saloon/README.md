# The redesign: "Menu beside the work"

This folder is the design record of Saloon's redesign. The estate redesign board, where it was drawn and approved, is a private canvas; this is a copy of the app's page on it plus the build behind that page. The owner approved it on 2026-11-13, and [brief 06](../../../corpus/briefs/done/06-saloon-redesign-with-hallmark-on-the-estate-board.md) built it. The code is now the source of truth: where the app and these files differ, the app wins, and later work may have moved a screen on. Read this folder to see what was decided and why before reshaping a screen.

## The owner's decisions

The owner approved the whole board on 2026-11-13, with every question standing at what the board proposed unless they reopened it. The questions this app's page asked:

- **Ask:** 1. Reopened: the phone booking bar. DESIGN.md has it wait for the hero to scroll away and hold WhatsApp only; here it is docked from the first paint, adds a round call button and the hero's own button goes on phones. Accept? 2. Approve Menu beside the work (prices beside the photo on the first screen) as Saloon's direction, or take the runner-up, Daylight studio (today's order, refined into islands)? 3. Ana's "3+ ani de experiență" is a placeholder in site.ts, so the facts pair is not drawn until the real number is set. Confirm Ana's number, or keep the pair hidden?
- **Reopened:** Recorded (DESIGN.md, MobileBookingBar): the bar waits for the hero to scroll away and holds WhatsApp only. Proposed: docked from the first paint, WhatsApp plus a round call button, and no in-hero button on phones; it still hides while Programează-te or Unde mă găsești is on screen.
- **Reopened:** Recorded (DESIGN.md, Typography): buttons, nav, subtitles and the Bun de știut label are tracked capitals, and the arrow is a glued →. Proposed: sentence case, untracked, and an arrow icon 6 px after the words (Hallmark Floor 9, 10 and gate 67). The words are unchanged.
- **Reopened:** Recorded (DESIGN.md, Interaction): the focus ring is gold, 2.14:1 on today's ground. Proposed: gold-ink at 2 px with a 3 px offset, 4.9:1 on the ground. Still gold, which is the gold's real job.

Where the files below disagree, the later layer wins: the owner's decisions, then the controller's rulings, then the judges' rulings, then the directions file.

## What is here

| Path | What it holds |
|---|---|
| `directions/saloon.md` | The director's brief: both directions (the winner is the one built), the shared fixture and the screens to draw. |
| `judge/saloon/RESULT.md` | The blind judging against today and the rulings that came with the win. |
| `critiques/saloon-controller.md`, `critiques/saloon.md` | The design critic's review against today, and the controller's rulings over it. |
| `manifests/saloon.tokens.css`, `manifests/saloon.tokens-map.md` | The token hand-off in the app's own names, and the renamed, new and unused tokens. |
| `manifests/saloon.board-notes.md` | What the board said beside the screens: the asks, decisions, reopened rules, open questions, the contrast table and the runner-up. |
| `work/saloon/twins/*.html` | Each drawn screen as static HTML, light and dark: open one in a browser. |
| `work/saloon/shots/` | The twins rendered at 1280 and 390, light and dark, WebP. `direction.webp` is the board's direction sheet. |
| `shots/saloon/` | Today's screens as the board showed them before the redesign. |

People's names and data in the pictures come from seeded demo accounts or are invented.

## Not here

The sketches and the judges' images, the runner-up's build (its notes are in the board's notes), the build's scripts, and the screenshots taken while it was built. They stay in the estate build folder.
