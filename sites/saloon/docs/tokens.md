---
name: Ana Saloon
colors:
  surface: "#fff8f6"
  surface-dim: "#ebd6cd"
  surface-bright: "#fff8f6"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#fff1ec"
  surface-container: "#ffe9e2"
  surface-container-high: "#fae4db"
  surface-container-highest: "#f4ded6"
  on-surface: "#241914"
  on-surface-variant: "#4f4442"
  inverse-surface: "#3b2e28"
  inverse-on-surface: "#ffede7"
  outline: "#817472"
  outline-variant: "#d3c3c0"
  surface-tint: "#705955"
  primary: "#705955"
  on-primary: "#ffffff"
  primary-container: "#f4d6d0"
  on-primary-container: "#725c57"
  inverse-primary: "#ddc0ba"
  secondary: "#745b1b"
  on-secondary: "#ffffff"
  secondary-container: "#ffdc8e"
  on-secondary-container: "#795f1f"
  tertiary: "#605e5b"
  on-tertiary: "#ffffff"
  tertiary-container: "#e0dcd7"
  on-tertiary-container: "#62605d"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#fadcd6"
  primary-fixed-dim: "#ddc0ba"
  on-primary-fixed: "#271814"
  on-primary-fixed-variant: "#56423e"
  secondary-fixed: "#ffdf9b"
  secondary-fixed-dim: "#e4c278"
  on-secondary-fixed: "#251a00"
  on-secondary-fixed-variant: "#5a4302"
  tertiary-fixed: "#e6e2dd"
  tertiary-fixed-dim: "#c9c6c1"
  on-tertiary-fixed: "#1c1c19"
  on-tertiary-fixed-variant: "#484743"
  background: "#fff8f6"
  on-background: "#241914"
  surface-variant: "#f4ded6"
typography:
  display-wordmark:
    fontFamily: Fraunces
    fontSize: 32px
    fontWeight: "500"
    lineHeight: "1.2"
  headline-xl:
    fontFamily: Fraunces
    fontSize: 56px
    fontWeight: "500"
    lineHeight: 64px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Fraunces
    fontSize: 40px
    fontWeight: "500"
    lineHeight: 48px
  headline-lg:
    fontFamily: Fraunces
    fontSize: 40px
    fontWeight: "500"
    lineHeight: 48px
  headline-md:
    fontFamily: Fraunces
    fontSize: 32px
    fontWeight: "600"
    lineHeight: 40px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  section-padding-desktop: 96px
  section-padding-mobile: 48px
  gutter: 24px
  margin-mobile: 20px
  container-max-width: 1200px
---

## Brand & Style

This design system is crafted for a boutique nail salon experience that prioritizes intimacy, craftsmanship, and a "slow-fashion" lookbook aesthetic. The visual identity avoids the loud, synthetic tropes of the beauty industry in favor of a refined, editorial approach.

The design style is **Minimalist with Tactile accents**, characterized by:

- **Editorial Sophistication:** High-contrast serif typography paired with expansive whitespace.
- **Warmth & Calm:** A palette of organic tones that evokes a sense of serenity and personal care.
- **Understated Luxury:** Subtle gold accents and soft shadows that suggest premium quality without being ostentatious.
- **Personal Touch:** A focus on high-quality imagery and clean line-art that feels artisanal and bespoke.

## Colors

The color strategy is rooted in warmth and natural skin tones to reinforce the salon's focus on beauty and care.

- **Primary & Accent:** The Soft Blush Pink (#F4D6D0) is the signature color for interactive elements and brand identifiers. It transitions to a deeper rose (#E8A6A0) on hover to provide tactile feedback.
- **Backgrounds:** The Warm Cream (#FBF7F2) serves as the primary canvas, providing a softer, more premium alternative to pure white.
- **Highlights:** Warm Gold (#C9A961) is reserved for high-value details such as dividers, ratings, and specific heading accents to signify excellence.
- **Typography:** Warm Near-Black (#2B1F1A) ensures high legibility while maintaining the organic temperature of the brand.

## Typography

The typography pairing creates an "editorial lookbook" feel.

- **Display & Headings:** **Fraunces** (a variable serif, self-hosted via `@fontsource-variable/fraunces`) provides a warm, hand-made high-fashion personality. It is a variable face: headings let the browser pick the optical-size master (`font-optical-sizing: auto`) and soften the serifs with `font-variation-settings: "SOFT" 30, "opsz" 40` so the type reads artisanal rather than glossy. Large headlines use a slightly tighter letter-spacing (~-0.005em) to feel intentional and composed.
- **The Wordmark:** The brand name is rendered in Fraunces, creating a signature-like appearance.
- **Body & Interface:** Manrope provides a clean, modern contrast. It ensures that service menus and booking flows remain highly readable and professional. Use the 600 weight for labels to provide clear hierarchy in dense information areas.
- **Fonts are self-hosted** (no Google Fonts CDN) — a GDPR decision (see `LEGAL.md`). Fraunces loads via the `opsz` variable axis (+italic); Manrope loads weights 400–700 (latin + latin-ext for Romanian diacritics).

## Layout & Spacing

The layout philosophy is defined by **Generous Breathing Room**.

- **Vertical Rhythm:** A heavy 96px vertical padding between sections on desktop allows each service category or brand message to stand alone, mimicking the layout of a physical high-end magazine.
- **Grid System:** A 12-column fluid grid is used for desktop layouts, transitioning to a single-column stack on mobile with 20px side margins.
- **Content Density:** Elements should be spaced out significantly. If in doubt, increase whitespace to maintain the "slow-fashion" aesthetic.

## Elevation & Depth

This design system utilizes **Tonal Layering** over heavy shadows to maintain a clean, flat aesthetic.

- **Surfaces:** Cards and floating elements use a pure White (#FFFFFF) background to subtly lift them from the Warm Cream (#FBF7F2) page background.
- **Soft Shadows:** When depth is required (e.g., active modals or primary call-to-action buttons), use an ultra-diffused, low-opacity shadow tinted with the primary near-black color (e.g., `rgba(43, 31, 26, 0.04)`).
- **Interactive States:** Depth is primarily communicated through color shifts (Soft Blush to Deep Rose) rather than physical elevation changes.

## Shapes

The shape language is soft and feminine, avoiding sharp corners to reflect the gentle nature of the services.

- **Cards & Containers:** All cards and main containers must use a consistent 16px (1rem) border radius.
- **Interactive Elements:** Buttons, tags, and input fields utilize a **Pill-shaped (Full)** radius to provide a modern, friendly feel that contrasts with the sophisticated serif typography.
- **Iconography:** Use line-art icons with a consistent 1.5px stroke weight. Terminals should be rounded to match the UI's softness.

## Components

- **Buttons:** Primary buttons are pill-shaped, filled with Soft Blush Pink, and use the Label-MD (uppercase) typography. The hover state deepens to #E8A6A0.
- **Secondary Buttons:** Use a 1.5px border of Soft Blush Pink with no fill, maintaining the pill shape.
- **Cards:** White backgrounds with 16px radius. Use generous internal padding (32px) and no border unless the card is placed on a white background, in which case use a 1px stroke of #E8E2DA.
- **Inputs:** Pill-shaped fields with a Warm Cream background and a subtle 1px border. Focus states should transition the border to Warm Gold.
- **Service Lists:** Display service names in Fraunces (Medium) with prices in Manrope (Semi-bold). Use a thin Warm Gold divider between items.
- **Chips/Tags:** Small pill-shaped containers with Soft Blush Pink background (20% opacity) and Deep Rose text for indicating availability or categories.
