---
summary: Neumorphism — the two-shadow system, why it is the least accessible style here, and the two deliberate departures this theme makes to stay usable.
updated: 2026-08-23
---

# Neumorphism

**2019.** Named in a Michal Malewicz Medium post; briefly everywhere on
Dribbble, almost nowhere in shipped products. Sometimes "soft UI".

## The idea

The whole interface is a single sheet of soft plastic. Nothing sits *on* the
background; things are pushed out of it or pressed into it. A component
therefore has no border and no fill of its own — only two shadows.

```css
--raised:  -7px -7px 15px var(--light),  7px 7px 15px var(--dark);
--pressed: inset -5px -5px 10px var(--light), inset 5px 5px 10px var(--dark);
```

That is the entire system. Everything else follows from it, **including the
problem**: with no border and no fill, edges are carried by shadow alone, and
shadow contrast against a mid-tone ground is by definition low.

## Palette

A single surface colour, and two derived from it.

| Role | Value |
|---|---|
| Surface | `#e4e9f2` — everything is this |
| Light | `#ffffff` |
| Dark | `#b9c2d4` |
| Ink | `#3d4457` (7.2:1) |
| Quiet | `#656d82` (4.6:1) |
| Accent | `#5b6b9c` |

The light and dark values must be equidistant from the surface in luminance, or
the extrusion looks lit from an impossible angle.

## Typography

A soft rounded sans — Nunito, Quicksand, Poppins. 800 for headings. The
signature text effect is a soft emboss:

```css
text-shadow: -1px -1px 1px var(--light), 1px 1px 2px var(--dark);
```

Used here only on the wordmark and article title, at a depth that still reads.

## Surface and depth

Two states, raised and pressed, and nothing else. Radii are large (16–30px)
because sharp corners break the moulded-plastic read. **No borders anywhere** —
adding one is the most common way people accidentally leave the style.

## Layout and composition

Cards on a grid, 19rem minimum, with wide gaps (2rem) so adjacent shadows do
not collide. Images sit in pressed wells; buttons and cards are raised.

## Motion

Press swaps `--raised` for `--pressed`. Nothing else moves.

## Image treatment

**The reusable recipe.** Desaturated and flattened so the photograph *joins*
the single surface rather than sitting on it. Anything vivid breaks the
illusion instantly.

```css
filter: saturate(0.55) contrast(0.86) brightness(1.05);
border-radius: 14px;
/* framed by a pressed well, not a border */
```

**For generating images in this style:** matte moulded plastic or soft clay in
a single pale colour; extremely soft, even, shadowless studio light; the subject
the same colour as the background; form described only by gentle shading; very
low contrast; no texture, no reflections, no colour variation; monochrome
sculptural.

## Prompt descriptors

`monochrome matte plastic` · `single pale surface colour` · `soft even studio
light` · `subject same colour as ground` · `form described by shading alone` ·
`very low contrast` · `no reflections, no texture` · `moulded, extruded` ·
`soft rounded geometry` · `sculptural minimalism`

## Accessibility

**The least accessible style in this study, and it is not close.** The failure
is structural, not a matter of execution: the style's defining property is that
element boundaries are carried by low-contrast shadow, and WCAG 1.4.11 requires
3:1 for the visual boundary of a control. A neumorphic button that satisfies
1.4.11 is no longer neumorphic.

This theme does not pretend otherwise, but it refuses to ship an unusable page.
Two deliberate departures, stated in the CSS as well as here:

1. **Body text runs at 7.2:1**, rather than the era's typical 2:1.
2. **Every interactive control keeps a visible focus ring** — `outline: 2px
   solid var(--accent); outline-offset: 3px`.

Purists would call both cheating. Anyone who has tried to use a real neumorphic
interface in sunlight would not.

## How it's built here

`src/themes/neumorphism/` — the two shadow recipes are custom properties, so
the "single sheet" premise is enforced by construction: a component cannot
invent a third depth. Compare [claymorphism.md](claymorphism.md), which fakes
depth the same way and keeps its contrast.
