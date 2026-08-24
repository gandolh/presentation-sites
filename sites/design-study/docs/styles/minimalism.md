---
summary: Minimalism as a subtraction rule rather than a look — one column, no rules, warm near-monochrome, and the image treatment and prompt vocabulary for reproducing it.
updated: 2026-08-23
---

# Minimalism

**1960s — ongoing.** Out of Bauhaus reduction and mid-century product design
(Rams, Braun), absorbed into digital via Japanese editorial and later the
gallery-website vernacular.

## The rule, not the look

Minimalism is not "a sparse layout". It is a test applied to every element:
*would removing this cost meaning?* If not, it goes. A page can be sparse and
not minimal (it is just empty), and dense and minimal (nothing on it is
optional). The discipline is in the deletions, which is why it is so often
imitated badly — the imitation copies the emptiness, not the criterion.

## Defining traits

- One column. A grid describes relationships between things; minimalism keeps
  only one relationship — this, then that.
- No rules, borders or boxes. Space performs every separating job a line would.
- One typeface, one weight. Hierarchy comes from size and, mostly, from leading.
- Enormous vertical rhythm. Distance is the only separator between sections, so
  the distance has to be large enough to be unmistakable.
- No colour, or one, used once.

## Palette

Warm rather than clinical — pure white and pure black read as unfinished.

| Role | Value |
|---|---|
| Paper | `#faf9f7` warm off-white |
| Ink | `#1a1a18` warm near-black |
| Quiet | `#6e6a63` (5.4:1 on paper) |
| Hairline | `#e4e1db`, used almost nowhere |

## Typography

A neutral grotesque (Inter, Helvetica Now, Söhne). Body 16–17px at 1.7–1.8
leading — high, because the leading is doing the work a second weight would
otherwise do. Headings barely larger than body: 1.4–1.75×, regular weight,
tight tracking (−0.02em) at display sizes. Small caps or wide-tracked uppercase
(0.14em) for metadata is the one permitted flourish.

## Surface and depth

None. No shadow, no elevation, no radius beyond 0. Everything is on the same
plane, and the page is a sheet of paper, not a stack of cards.

## Layout and composition

Narrow measure — 34–38rem, 60–70 characters. Centred column, centred headings
on article pages, left-aligned in the feed. Whitespace budget is roughly 60% of
vertical space; if it drops below half, the design has stopped being minimal.

## Motion

Almost none. Opacity and 200–300ms ease on hover, nothing that moves position.
Motion is decoration, and decoration is what this style removes.

## Image treatment

**The reusable recipe.** Photographs are pulled most of the way to grey and
their blacks are lifted, so the picture sits at the same low contrast as the
type and nothing on the page shouts.

```css
filter: grayscale(0.92) contrast(0.88) brightness(1.06);
```

- No frame, no shadow, no radius.
- Full-bleed within the column; never floated beside text.
- Subject centred and small in frame — the negative space in the photograph
  should echo the negative space on the page.

**For generating images in this style:** a single object, off-centre, on a
seamless warm-grey ground; soft diffuse north light; no cast shadow or one very
long soft one; muted palette of two greys and one desaturated warm; large empty
margin on at least two sides; matte surfaces; nothing in the frame that is not
the subject.

## Prompt descriptors

`minimalist still life` · `seamless warm grey backdrop` · `soft diffused
daylight` · `single subject, off-centre` · `generous negative space` · `muted
monochrome, lifted blacks` · `matte finish` · `no props` · `low contrast` ·
`editorial product photography` · `4:5 portrait crop`

## Accessibility

The safest style in this study when done honestly, and the most dangerous when
done fashionably. Real risks: grey-on-grey secondary text below 4.5:1 (this
theme holds `--min-quiet` at 5.4:1), and hierarchy carried only by whitespace,
which is invisible to a screen reader — headings must still be real `<h2>`s
even when they look like body text.

## How it's built here

`src/themes/minimalism/` — see `theme.css`. The whole file is under 300 lines
because there is very little to declare. Compare with [swiss.md](swiss.md):
same restraint, opposite instincts about the grid.
