---
name: Ecclesia Digitalis
colors:
  surface: "#fcf9f4"
  surface-dim: "#dcdad5"
  surface-bright: "#fcf9f4"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f6f3ee"
  surface-container: "#f0ede9"
  surface-container-high: "#ebe8e3"
  surface-container-highest: "#e5e2dd"
  on-surface: "#1c1c19"
  on-surface-variant: "#544243"
  inverse-surface: "#31302d"
  inverse-on-surface: "#f3f0eb"
  outline: "#877273"
  outline-variant: "#dac0c1"
  surface-tint: "#99424c"
  primary: "#4e0816"
  on-primary: "#ffffff"
  primary-container: "#6b1f2a"
  on-primary-container: "#ee868f"
  inverse-primary: "#ffb2b7"
  secondary: "#c8a24b"
  on-secondary: "#ffffff"
  secondary-container: "#ffd578"
  on-secondary-container: "#795a03"
  tertiary: "#29241c"
  on-tertiary: "#ffffff"
  tertiary-container: "#403930"
  on-tertiary-container: "#aca397"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#ffdadb"
  primary-fixed-dim: "#ffb2b7"
  on-primary-fixed: "#40000e"
  on-primary-fixed-variant: "#7b2b36"
  secondary-fixed: "#ffdf9d"
  secondary-fixed-dim: "#eac167"
  on-secondary-fixed: "#251a00"
  on-secondary-fixed-variant: "#5b4300"
  tertiary-fixed: "#ece1d4"
  tertiary-fixed-dim: "#d0c5b9"
  on-tertiary-fixed: "#201b13"
  on-tertiary-fixed-variant: "#4d463d"
  background: "#fcf9f4"
  on-background: "#1c1c19"
  surface-variant: "#e5e2dd"
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: "700"
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: "600"
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: "600"
    lineHeight: 36px
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "500"
    lineHeight: 20px
    letterSpacing: 0.01em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 0.25rem
  xs: 0.5rem
  sm: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 4rem
  gutter: 1.5rem
  container-max: 1200px
---

## Brand & Style

The design system is engineered for the Romanian Orthodox liturgical context, balancing ancient tradition with modern digital accessibility. The brand personality is **reverent, formal, and architectural**. It avoids decorative excess in favor of a "Digital Iconostasis" approach—where the interface serves as a quiet, respectful frame for sacred content.

The design style is **Corporate / Modern with Subtle Liturgical Accents**. It utilizes high-quality serif typography and a warm, organic color palette to evoke the feeling of parchment and incense without sacrificing the functional clarity required for modern web applications. The system is optimized for multilingual support, specifically accommodating the character widths and diacritics of Romanian and German.

## Colors

The palette is rooted in the chromatic tradition of Orthodox iconography:

- **Primary (Burgundy):** Used for high-emphasis actions, headers, and symbolic elements. It represents the liturgical dignity.
- **Secondary (Gold):** Used sparingly as an accent for active states, highlights, or decorative dividers. It signifies divinity and light.
- **Surface (Warm Cream):** The foundation of the UI, replacing harsh white to reduce eye strain and provide a tactile, parchment-like quality.
- **Ink & Muted:** Deep charcoal for maximum legibility of theological texts, with a stone-grey for secondary metadata.

For re-skinning, focus on adjusting the `primary_color_hex` to vary between different parish traditions (e.g., forest green for Pentecost-themed sites or deep blue for Marian feasts).

## Typography

Typography is the primary vehicle for the "liturgical" feel. **Source Serif 4** provides an authoritative, academic, and ecclesiastical tone for headings. **Inter** is used for body text to ensure maximum readability for long-form articles, prayer texts, and administrative details.

**Handling Romanian & German:**

- Line heights are slightly generous (minimum 1.5x for body) to accommodate the vertical height of diacritics (ă, î, ț) and the frequent capital letters in German.
- Avoid tight tracking (letter spacing) on body text to maintain legibility during extended reading of scriptures or news.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop to create a sense of stability and permanence.

- **Grid:** A 12-column grid with a 1200px max-width container.
- **Rhythm:** All margins and paddings are multiples of the 4px (`0.25rem`) base unit.
- **Responsive Behavior:** On mobile, margins reduce to `1rem` (sm), and the layout collapses to a single column.
- **Verticality:** Use generous vertical spacing (`xl`) between major sections to allow the content to breathe, reflecting the quietude of a church interior.

## Elevation & Depth

This design system uses **Tonal Layers** and **Low-contrast outlines** rather than aggressive shadows.

- **Level 0 (Base):** Surface color (#faf7f2).
- **Level 1 (Cards/Floating):** White background with a very soft, 1px border using the `Muted` color at 15% opacity.
- **Depth:** Depth is achieved through "pockets" of color—using slight variations of the surface color to distinguish between the main content and sidebars.
- **Interactive Elevation:** Buttons and interactive cards may use a subtle ambient shadow (4px blur, 10% opacity of the Ink color) upon hover to provide tactile feedback.

## Shapes

The shape language is **Soft and Balanced**. While the content is formal, the UI uses `0.5rem` (rounded) corners to avoid a sharp, overly bureaucratic feel. This subtle roundness suggests the organic nature of wood-carved furniture and ecclesiastical architecture.

- **Standard Elements:** Buttons, Input fields, and Cards use the base `roundedness`.
- **Special Elements:** Images of icons or church murals should maintain sharp corners or use a specific "arch" mask to reference traditional window shapes.

## Components

- **Buttons:** Primary buttons are solid Burgundy (#6b1f2a) with White text. Secondary buttons use a Gold (#c8a24b) outline. Padding should be generous horizontally to accommodate long Romanian verbs.
- **Cards:** Used for news and event listings. They feature a white background, the standard 0.5rem radius, and a subtle bottom border in Gold for "Featured" items.
- **Input Fields:** Clean, underlined or lightly bordered in Muted grey. Focus states must transition the border color to Gold.
- **Lists:** Information-heavy lists (e.g., liturgical calendars) should use alternating row tints (Surface vs. a slightly darker cream) to maintain scanning ease.
- **Dividers:** Use a custom SVG divider—a simple horizontal line with a small "cross" or geometric Byzantine node in the center—to separate major content blocks.
- **Chips/Badges:** Used for categories like "Pastoral," "Cultural," or "Administrative." Use the Muted color palette to keep them secondary to the main text.
