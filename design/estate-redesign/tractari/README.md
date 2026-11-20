# The redesign: "Lines first"

This folder is the design record of AXA Tractări's redesign. The estate redesign board, where it was drawn and approved, is a private canvas; this is a copy of the app's page on it plus the build behind that page. The owner approved it on 2026-11-13, and [brief 08](../../../corpus/briefs/done/08-tractari-redesign-with-hallmark-on-the-estate-board.md) built it. The code is now the source of truth: where the app and these files differ, the app wins, and later work may have moved a screen on. Read this folder to see what was decided and why before reshaping a screen.

## The owner's decisions

The owner approved the whole board on 2026-11-13, with every question standing at what the board proposed unless they reopened it. The questions this app's page asked:

- **Ask:** 1. Approve Lines first as the direction? It reopens two recorded calls: DESIGN.md's full-bleed hero (the 3D scene fills the opening viewport) and PRODUCT.md's one continuous night road (each section a stop on one drive). The scene moves to Cum funcționează, the spine goes, and the call board opens the page. 2. responseMinutes: 30 sits in site.ts "for the animated counter" and is shown nowhere; show it as a promise to a stranded driver, or delete it? 3. This design has 9 tel: links (header 1, board 3, Servicii 1, footer 3, dock 1), where brief 08's acceptance asks for 10 because the hero call merged into the board: change that line to 9?
- **Reopened:** Recorded (DESIGN.md and PRODUCT.md, locked via /the-one-move): "Full-bleed cinematic hero: the 3D scene fills the entire opening viewport" and "The whole page is one continuous night road … each section is a stop on that single drive." Proposed: the hero is type on the ground, the scene plays in Cum funcționează, and the spine is dropped. DESIGN.md also says white text on the orange call; the Floor wins (3.02:1).

Where the files below disagree, the later layer wins: the owner's decisions, then the controller's rulings, then the judges' rulings, then the directions file.

## What is here

| Path | What it holds |
|---|---|
| `directions/tractari.md` | The director's brief: both directions (the winner is the one built), the shared fixture and the screens to draw. |
| `judge/tractari/RESULT.md` | The blind judging against today and the rulings that came with the win. |
| `critiques/tractari-controller.md`, `critiques/tractari.md` | The design critic's review against today, and the controller's rulings over it. |
| `manifests/tractari.tokens.css`, `manifests/tractari.tokens-map.md` | The token hand-off in the app's own names, and the renamed, new and unused tokens. |
| `manifests/tractari.board-notes.md` | What the board said beside the screens: the asks, decisions, reopened rules, open questions, the contrast table and the runner-up. |
| `work/tractari/twins/*.html` | Each drawn screen as static HTML, light and dark: open one in a browser. |
| `work/tractari/shots/` | The twins rendered at 1280 and 390, light and dark, WebP. `direction.webp` is the board's direction sheet. |
| `shots/tractari/` | Today's screens as the board showed them before the redesign. |

People's names and data in the pictures come from seeded demo accounts or are invented.

## Not here

The sketches and the judges' images, the runner-up's build (its notes are in the board's notes), the build's scripts, and the screenshots taken while it was built. They stay in the estate build folder.
