---
name: Ana Saloon
description: One light look, redesign "Menu beside the work", 2026-11-13. Values mirror the `@theme` block in src/styles/global.css.
colors:
  surface: "#f5e8e2"
  surface-dim: "#e3cdc4"
  surface-bright: "#f5e8e2"
  surface-container-lowest: "#fffcfb"
  surface-container-low: "#efdcd4"
  surface-container: "#f1dfd8"
  surface-container-high: "#f3ddd5"
  surface-container-highest: "#ead3ca"
  on-surface: "#241914"
  on-surface-variant: "#4f4442"
  inverse-surface: "#3b2e28"
  inverse-on-surface: "#ffede7"
  inverse-on-surface-variant: "#dccbc4"
  outline: "#86726e"
  outline-variant: "#dcc3ba"
  primary: "#705955"
  on-primary: "#fffcfb"
  primary-container: "#f4d6d0"
  on-primary-container: "#5f4743"
  secondary: "#6f561a"
  secondary-container: "#f6e4bd"
  on-secondary-container: "#5a4512"
  blush: "#f4d6d0"
  blush-deep: "#e8a6a0"
  gold: "#c9a961"
  gold-ink: "#7a6118"
  whatsapp: "#118040"
  whatsapp-deep: "#0e7a37"
  on-whatsapp: "#fffcfb"
typography:
  display: { fontFamily: Fraunces, fontSize: 64px, lineHeight: 68px, fontWeight: "440" }
  heading: { fontFamily: Fraunces, fontSize: 32px, lineHeight: 38px, fontWeight: "440" }
  title: { fontFamily: Fraunces, fontSize: 24px, lineHeight: 30px, fontWeight: "500" }
  lead: { fontFamily: Manrope, fontSize: 18px, lineHeight: 28px }
  body: { fontFamily: Manrope, fontSize: 16px, lineHeight: 24px }
  label: { fontFamily: Manrope, fontSize: 14px, lineHeight: 20px, fontWeight: "600" }
rounded: { sm: 0.25rem, DEFAULT: 0.5rem, md: 0.75rem, lg: 1rem, xl: 1.5rem, full: 9999px }
elevation:
  card: "0 1px 2px rgb(36 25 20 / 0.06), 0 12px 32px -16px rgb(36 25 20 / 0.22)"
  glow: "0 8px 20px -8px rgb(17 128 64 / 0.55)"
layers: { header: 20, dock: 30 }
---

# Tokens

The prose of the look is in [../DESIGN.md](../DESIGN.md). Every token above (and
the unlisted `tertiary`, `error`, `surface-tint`, `inverse-primary`,
`surface-variant` and `cream`, kept for later forms and the hero gradient) lives
in the single `@theme` block of `src/styles/global.css`. The new names are
`on-whatsapp`, `on-whatsapp-wash`, `inverse-on-surface-variant`, `inverse-wash`,
`inverse-line`, `--shadow-card`, `--shadow-glow`, the `--text-display`,
`-heading`, `-title`, `-lead` and `-label` set (with their line heights and
weights) and `--z-index-header` and `--z-index-dock`.

Fonts: Fraunces Variable (`@fontsource-variable/fraunces` 5.3.0, `opsz` file)
and Manrope (`@fontsource/manrope` 5.3.0, weights 400-700), self-hosted.

Contrast, from the scripted run over the built pages (`SITES=saloon npx
playwright test -c e2e floor-contrast`): the lowest text pair is 4.91:1 and the
lowest icon pair 3.68:1.
