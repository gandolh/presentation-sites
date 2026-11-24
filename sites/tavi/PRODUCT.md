# PRODUCT.md: Tavi Ceasornicaru

## Register

**Personal, not a business.** A presentation site for Tavi Ceasornicaru, a friend who loves clocks and watches and
mends wristwatches. Less marketing, more an interactive watch: a movement the visitor winds, watches tick and takes
apart, chapter by chapter, framed by Tavi's story and his bench, with a quiet line about his repairs.

## Who it is for

- Tavi, who should recognise his craft in it.
- His friends, who send it on.
- Anyone curious how a mechanical watch keeps time, with no watchmaking words to start from.

## The one thing

**Understand a watch by playing with one.** Every chapter shows one part of the movement doing its job, slowly
enough to see, and lets the visitor wind it, pause it, slow it down and take it apart.

## Principles

1. **Drawn, not photographed.** The movement, the bench and the tools are drawn or modelled in the site's style, from
   one part table. A real 21,600 vph train, so the ratios and the beat are true.
2. **The repair line stays quiet.** It lives in the footer and the contents band's chapter 7, never on the first
   screen. No contact details until the owner gives one.
3. **English.** The only English site in this repo; the others are Romanian.
4. **Light.** Warm paper, one look, no theme switch.
5. **Everything can stop.** Every moving figure has a Pause, plus one in the header for the whole page; reduced motion
   starts still; nothing moves without scripting.

## Anti-references

- A clone of ciechanow.ski's explainers: the same idea of an explorable mechanism, but its own drawing, chapters and
  voice.
- A luxury-watch template: black grounds, gold serif capitals, a hero photo of a dial.
- A SaaS landing page: a centred hero stack, feature cards, testimonials, a call to action in every section.

## Accessibility

English (`lang="en"`). Light only: body text at least 4.5:1 on paper, a 2px focus ring at least 3:1. Links and
buttons at least 44px tall, except a part name inside running prose, which keeps the sentence's line. Reduced motion starts every figure paused; with scripting off the page reads in full and every chapter
link works.

## Stack

Astro 7.3.5 (static), React 19 islands for the controls and the 3D movement, Base UI 1.9.0 through
`src/components/ui/`, Tailwind 4 with one stylesheet. Fonts self-hosted through Fontsource; the site makes no
third-party request. three.js 0.187.0 inside one island, loaded only where the fallback ladder allows. Served under
`/tavi` (`PUBLIC_BASE`), on the origin from `PUBLIC_SITE`.
