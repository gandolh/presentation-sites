---
summary: Surrealism as one broken rule rendered sincerely — impossible scale, apertures, upward shadows, one inverted slide — with the hue-shift image recipe.
updated: 2026-08-23
---

# Surrealism

**1924 — ongoing.** Breton's manifesto; visually, Magritte, Dalí, Oppenheim,
Varo. In interface work it surfaces through fashion and music sites, and more
recently through AI-image-adjacent art direction.

## The idea

Surrealism is not "weird decoration". It is a specific move: take something
ordinary, change exactly one rule about it, and render the result with complete
sincerity. Magritte's sky is painted properly; it is simply in the wrong place.
The sincerity is load-bearing — if the rendering is also strange, it reads as
noise rather than dream.

## Defining traits

- Elements escape their containers instead of fitting them.
- Scale is wrong on purpose (a title larger than the photograph it titles).
- Shadows fall in a direction no light in the page could explain — here,
  *upward*: `box-shadow: 0 -26px 48px`.
- Photographs are always seen *through* something: a circle, an arch, a keyhole.
- The grammar around the dislocations stays calm — quiet serif, generous air.

## Palette

Dusty and slightly unreal — sky that has been left out too long.

| Role | Value |
|---|---|
| Sky | `#dfe6ea` → `#b9c9d4` (fixed vertical gradient) |
| Ink | `#2b2438` |
| Quiet | `#5f5670` |
| Flesh | `#e8c4b0` |
| Clay | `#e2725b` |
| Ochre | `#d9a441` |

Flesh tones next to sky blue is the specific Magritte pairing.

## Typography

Playfair Display, italic, at 400 — a quiet serif set large. System sans for
metadata, wide-tracked (0.22em) uppercase at 11px. The type never becomes hard
to read; all the strangeness is in the arrangement.

## Surface and depth

Inverted lighting. Every shadow points up. Blockquotes get organic border-radii
(`48% 48% 42% 42% / 22% 22% 16% 16%`) so they read as objects rather than boxes,
and are pulled outside the column (`margin-inline: -12% 0`).

## Layout and composition

Two columns that alternate order by `:nth-child(2n)`. Titles overlap their
images by negative margin. A cloud-that-is-also-a-hole in the masthead. Each
feed entry gets a different aperture shape by `:nth-child(3n)`.

## Motion

None beyond hover, which switches the title from italic to roman — a small
correction rather than an animation.

## Image treatment

**The reusable recipe.** Two moves. First, everything is hue-shifted toward
dusk. Second, **one slide in every three is inverted** — lit from inside, by
nothing.

```css
.image { filter: saturate(0.85) hue-rotate(-18deg) contrast(1.05);
         box-shadow: 0 -26px 48px rgb(43 36 56 / 0.3); }
.slide:nth-child(3n) .image { filter: invert(1) hue-rotate(180deg) saturate(0.9); }
```

Plus the apertures — `border-radius: 50%`, an arch (`50% 50% 0 0 / 62% 62% 0 0`),
or a `clip-path` polygon.

**For generating images in this style:** an ordinary object at an impossible
scale; a clear blue sky with a single cloud indoors; objects floating without
support; a doorway or aperture with the wrong thing behind it; shadows falling
upward or in contradictory directions; realistic rendering, dreamlike content;
Magritte palette of dusty blue, flesh pink and ochre.

## Prompt descriptors

`Magritte-like` · `impossible scale` · `object floating, no support` ·
`aperture / doorway framing` · `contradictory shadow direction` · `dusty sky
blue and flesh tone` · `photorealistic rendering of an impossible scene` ·
`single ordinary object made strange` · `soft dusk hue shift` · `inverted
luminance`

## Accessibility

The inverted third slide is the one real hazard — it can flip a light image to
near-black and back as the carousel moves, which is uncomfortable for
photosensitive readers. It is applied to still images only, never on a timer,
and the carousel never autoplays. The overlapping titles use `mix-blend-mode:
multiply` rather than transparency, which keeps text contrast predictable over
a light image but would need re-checking against dark photography.

## How it's built here

`src/themes/surrealism/` — the aperture shapes are per-`nth-child` in
`theme.css`, so the rhythm never repeats within a page of four.
