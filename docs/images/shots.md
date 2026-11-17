# README images

How each image was made, so the next refresh is a re-run. Re-take an image when that site's first screen changes.

Each image is a site's first screen with no interaction: open the page, wait for the network to go idle, wait five more seconds so the Three.js tent on subcort finishes drawing, then screenshot the viewport at 1440×720 @2x in the Europe/Bucharest time zone.

The four business sites were re-taken on 2026-11-16, after their 2026-11-13 redesigns, from local dev servers with the committed placeholders, since the redesigns are not deployed yet. The salon and the garage ran in mock mode (`npm run saloon -- dev:mock`, `npm run auto-service -- dev:mock`), so no real photo or real phone number is in them. churchix and design-study are older captures of the live site.

| File | Shows | How to reach it | Viewport | Data | Taken |
|---|---|---|---|---|---|
| saloon-home.webp | Hero: headline, WhatsApp button, the photo slot beside the Servicii & prețuri card | `npm run saloon -- dev:mock`, open `/` | 1440×720 @2x | committed placeholders; the photo slot reads "Hero photo" | 2026-11-16 |
| auto-service-home.webp | Hero: headline, facts table, the job card with call and WhatsApp | `npm run auto-service -- dev:mock`, open `/` | 1440×720 @2x | committed placeholders; phone shown as 07XX XXX XXX | 2026-11-16 |
| tractari-home.webp | Hero: headline and the board of three phone lines | `npm run tractari:dev`, open `/` | 1440×720 @2x, clipped to 1380×690 from x=30 | made-up firm, line names and phones | 2026-11-16 |
| subcort-home.webp | Hero: headline card on the sage grid, the tent, the size strip | `npm run subcort:dev`, open `/` | 1440×720 @2x | made-up firm | 2026-11-16 |
| churchix-home.webp | Parish home: name, next service, week schedule | `/churchix/` on the live site | 1440×720 @2x | live site; the photo slot is still a placeholder | 2026-10-09 |
| design-study-home.webp | Index: title and the first style cards | `/design-study/` on the live site | 1440×720 @2x | live site, made-up blog | 2026-10-09 |

churchix-home.webp shows the parish home from before churchix's 2026-11-13 redesign and is due for a re-take; it was not re-taken on 2026-11-16 because that refresh left `churchix/` alone. The design-study index has not changed since 2026-08-24. Its page uses the system font stack, so a re-take on another machine draws the title in a different face.

## Why 720 high

At 1440×900 the salon's page shows the top of its "Bună, sunt Ana" section, which has a portrait of a real person when the real photos are in. A 720 px viewport stops above it. Keep it at 720 or less, and check the bottom edge of the salon image whenever you re-take it. Do the same for any site that starts shipping staff photos or a private phone number in its first screen.

tractari's demo contact email sits just under the phone board, at 703 px. The clip to 1380×690 keeps it out and keeps the 2:1 shape of the other five.

## Commands

The dev servers take a port after the passthrough's `--` (two for `<site>:dev`, one after the script name for `<site> -- dev:mock`):

```bash
npm run saloon -- dev:mock -- --port 6301
npm run auto-service -- dev:mock -- --port 6302
npm run subcort:dev -- -- --port 6303
npm run tractari:dev -- -- --port 6304
```

Then a Playwright script, one browser context per site:

```js
const context = await browser.newContext({
  viewport: { width: 1440, height: 720 },
  deviceScaleFactor: 2,
  timezoneId: "Europe/Bucharest",
});
const page = await context.newPage();
await page.goto(url, { waitUntil: "networkidle" });
await page.addStyleTag({ content: "astro-dev-toolbar{display:none!important}" }); // the dev server's toolbar
await page.waitForTimeout(5000);
await page.screenshot({ path: "/abs/path/saloon.png" }); // tractari: clip { x: 30, y: 0, width: 1380, height: 690 }
```

```bash
ffmpeg -y -loglevel error -i saloon.png -vf scale=1200:-1:flags=lanczos -c:v libwebp -quality 82 docs/images/saloon-home.webp
```

Each WebP is 1200×600 and 29 to 41 KB. Stop the dev servers afterwards: started without a terminal, `astro dev` detaches and prints its pid.
