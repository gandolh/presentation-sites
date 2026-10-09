# README images

How each image was made, so the next refresh is a re-run. Re-take an image when that site's first screen changes.

All six are the first screen of the live site, taken on 2026-10-09 with no interaction: open the URL, wait for the network to go idle, wait five more seconds so the Three.js heroes on tractari and subcort finish drawing, then screenshot the viewport.

| File | Shows | URL | Viewport | Data | Taken |
|---|---|---|---|---|---|
| saloon-home.webp | Hero: headline, WhatsApp button, nail photo | https://gandolh.ro/saloon/ | 1440×720 @2x | live site, real nail photo | 2026-10-09 |
| auto-service-home.webp | Hero: headline and the drawn rev counter | https://gandolh.ro/auto-service/ | 1440×720 @2x | live site; phone shown as the placeholder 07XX XXX XXX | 2026-10-09 |
| tractari-home.webp | Hero: headline over the night-road scene | https://gandolh.ro/tractari/ | 1440×720 @2x | live demo, made-up firm and phone | 2026-10-09 |
| subcort-home.webp | Hero: headline, tent drawing, size strip | https://gandolh.ro/subcort/ | 1440×720 @2x | live demo, made-up firm | 2026-10-09 |
| churchix-home.webp | Parish home: name, next service, week schedule | https://gandolh.ro/churchix/ | 1440×720 @2x | live site; the photo slot is still a placeholder | 2026-10-09 |
| design-study-home.webp | Index: title and the first style cards | https://gandolh.ro/design-study/ | 1440×720 @2x | live site, made-up blog | 2026-10-09 |

## Why 720 high

At 1440×900 the salon's page shows the top of its "Bună, sunt Ana" section, which has a portrait of a real person. A 720 px viewport stops above it. Keep it at 720 or less, and check the bottom edge of the salon image whenever you re-take it. Do the same for any site that starts shipping staff photos or a private phone number in its first screen.

## Commands

```bash
S="agent-browser --session presentation-sites"
$S set viewport 1440 720 2
$S open https://gandolh.ro/saloon/
$S wait --load networkidle
$S wait 5000
$S screenshot /abs/path/saloon.png      # always an absolute path
# repeat open/wait/screenshot for each site, then:
ffmpeg -y -loglevel error -i saloon.png -vf scale=1200:-1:flags=lanczos -c:v libwebp -quality 82 docs/images/saloon-home.webp
agent-browser --session presentation-sites close
```

Each WebP is 1200×600 and 30 to 42 KB.
