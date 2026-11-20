# The redesign: "The job card"

This folder is the design record of BavAuto Gorj's redesign. The estate redesign board, where it was drawn and approved, is a private canvas; this is a copy of the app's page on it plus the build behind that page. The owner approved it on 2026-11-13, and [brief 05](../../../corpus/briefs/done/05-auto-service-redesign-with-hallmark-on-the-estate-board.md) built it. The code is now the source of truth: where the app and these files differ, the app wins, and later work may have moved a screen on. Read this folder to see what was decided and why before reshaping a screen.

## The owner's decisions

The owner approved the whole board on 2026-11-13, with every question standing at what the board proposed unless they reopened it. The questions this app's page asked:

- **Ask:** 1. The quote form: PRODUCT.md lists one, the code has none (read 2026-11-10). Drop it from PRODUCT.md (the default), or write a form brief? 2. Service descriptions on home: all nine (about 200 words) as drawn, or titles and subtitles on home and the descriptions only on Servicii? 3. Approve B, The job card, as BavAuto Gorj's direction? (A, Bordcomputer serviced, was the runner-up.)
- **Open question:** Copy edits for Floor 19 (no dashes in copy). Ranges use the figure dash U+2012: L‒V 08:00‒18:00, Sâ 09:00‒14:00, Luni‒Vineri, 08:00‒18:00, 1‒2 ore. Em dashes in sentences, old to new: cât costă — și abia to cât costă, și abia; sună-ne — probabil to sună-ne, probabil; senzori — diagnoză to senzori: diagnoză; bolile de model — lanț N47, VANOS, răcire — și știm to bolile de model (lanț N47, VANOS, răcire) și știm; ani buni — pentru că to ani buni, pentru că; pe BMW — acolo to pe BMW: acolo; WhatsApp — poți to WhatsApp, poți; sună-ne — îți răspundem to sună-ne, îți răspundem; atelierului — nu to atelierului, nu. The aria-label BavAuto Gorj — acasă is untouched.
- **Open question:** Services and the trust table show every word (about 200 on home). If the owner answers question 2 with titles only on home, the index rows lose their description column and the page is about 1,100 px shorter.
- **Reopened:** DESIGN.md names the Bordcomputer world (the page as an instrument cluster: gauge, service-interval LED band, check-control legend board) and brief 05 owner decision 4 says 'Hallmark proposes inside it first, and one alternative world on the board'. B is that alternative: a workshop job card, warm graphite, M red call. Only the LED band survives, as the rail.
- **Reopened:** DESIGN.md's THE TRIM RULE (the brushed-aluminium trim is the one light material and carries the conversion moment), THE LIVE-AMBER RULE (amber lights only what is live) and THE PRINTED-LEGEND RULE (mono capitals for legends). B moves the light material to the job card and lights the call in M red. Amber returns in one place only, the hours in the readout window (it is what is live); Azeret Mono is dropped, so nav, legends, subtitles and the call are sentence-case Encode Sans.

Where the files below disagree, the later layer wins: the owner's decisions, then the controller's rulings, then the judges' rulings, then the directions file.

## What is here

| Path | What it holds |
|---|---|
| `directions/auto-service.md` | The director's brief: both directions (the winner is the one built), the shared fixture and the screens to draw. |
| `judge/auto-service/RESULT.md` | The blind judging against today and the rulings that came with the win. |
| `critiques/auto-service-controller.md`, `critiques/auto-service.md` | The design critic's review against today, and the controller's rulings over it. |
| `manifests/auto-service.tokens.css`, `manifests/auto-service.tokens-map.md` | The token hand-off in the app's own names, and the renamed, new and unused tokens. |
| `manifests/auto-service.board-notes.md` | What the board said beside the screens: the asks, decisions, reopened rules, open questions, the contrast table and the runner-up. |
| `work/auto-service/twins/*.html` | Each drawn screen as static HTML, light and dark: open one in a browser. |
| `work/auto-service/shots/` | The twins rendered at 1280 and 390, light and dark, WebP. `direction.webp` is the board's direction sheet. |
| `shots/auto-service/` | Today's screens as the board showed them before the redesign. |

People's names and data in the pictures come from seeded demo accounts or are invented.

## Not here

The sketches and the judges' images, the runner-up's build (its notes are in the board's notes), the build's scripts, and the screenshots taken while it was built. They stay in the estate build folder.
