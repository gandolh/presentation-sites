# Task 13 — tractari hero reads "sauMehedinți" with no space

## Context

Found during the 2026-10-09 README refresh. Bug brief only; nothing was fixed when this was written.

The hero lede on tractari runs the word "sau" into the last county: the live page and the built HTML
read `...Vâlcea, Olt sauMehedinți? Venim cu platforma...`. The source puts "sau" at the end of one line
and `{site.counties.at(-1)}` at the start of the next, and Astro drops the line break between the text and
the expression instead of keeping it as a space.

## Reproduce

1. `npm run tractari:dev`, open the home page, read the hero paragraph under "Tractări auto pe platformă."
2. Or `npm run build` for the site and grep the output: `grep -o "sau[^ ]\{0,3\}Mehedin[^<]*" sites/tractari/dist/index.html`
   (confirmed on the current `dist/` on 2026-10-09).

## Evidence (re-checked on 2026-10-09)

- [`sites/tractari/src/components/Hero.astro:39-40`](../../../sites/tractari/src/components/Hero.astro#L39-L40):
  `Ai rămas pe drum în {site.counties.slice(0, -1).join(", ")} sau` then, on the next line,
  `{site.counties.at(-1)}? Venim cu platforma și ducem mașina în`.
- The counties come from [`sites/tractari/src/content/site.ts:30`](../../../sites/tractari/src/content/site.ts#L30).
- Check the same pattern elsewhere in tractari (and the other Astro sites) before closing: an
  expression at the start of a wrapped line after text is the trigger.

## What to do

Keep the space inside the expression line, so a wrap cannot remove it. The least clever fix is to put
both on one line, or to build the string once in the frontmatter:
`const countiesText = `${head.join(", ")} sau ${last}`` and render `{countiesText}`. A literal
`{" "}` before the second expression also works. Pick one and keep the Romanian copy as it is.
Do not change the copy or the county list. Real site data lives in `site.local.ts` (gitignored): don't
paste it anywhere.

## Files you OWN

- `sites/tractari/src/components/Hero.astro`
- Any other tractari component the grep above finds with the same pattern

## Files you must NOT touch

- `sites/tractari/src/content/site.ts` and `site.local.ts`
- The hero's WebGL scene and layout.

## Acceptance

- The built `dist/index.html` reads "... Olt sau Mehedinți?" with a space (the grep above matches `sau Mehedin`).
- `npm run check` (and the site's build) pass.
- **Deploy:** the fix reaches the live page only after tractari is redeployed. Deploy lives in a
  separate repo, so the owner runs it; this brief does not.
