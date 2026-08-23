# Product

## Register

brand

## Users

Women in and around Târgu-Jiu (Gorj county, Romania) looking for a manicure
they can trust. They arrive from Instagram, Facebook, TikTok, or a friend's
recommendation, usually on a phone, deciding whether this is "their" salon
before they ever message. Their job to be done: see Ana's work, feel confident
about hygiene and care, and book an appointment with the least friction —
which here means a pre-filled WhatsApp message, not a form or a login.

The site is Romanian-only by intent; the audience is local.

## Product Purpose

A single-page marketing site for Ana Saloon, a one-woman nail studio near
Târgu-Jiu. It exists to turn a stranger's first visit into a booked
appointment. It does three things, in order of weight: show the work
(gallery, hero), build trust (about Ana, sterilization, testimonials, loyalty),
and remove friction from booking (WhatsApp deep-link with a pre-filled
message). Success is a message sent, not a session length.

It is a static Astro site (React only for the few interactive islands like the
mobile menu), deployed under a sub-path on a Hetzner VPS behind Caddy. Real
business data (phone, address, CUI, photos) is merged in at build time from a
git-ignored local file, so the repo stays shareable.

## Brand Personality

Warm, personal, refined. The voice of a skilled friend, not a chain salon.
Speaks Romanian naturally and a little intimately ("Unghii care vorbesc despre
tine"). Confident about craft and hygiene without bragging; reassuring without
being clinical. Calm, boutique, one-on-one — Ana knows you by name. Emotional
goal on arrival: *"this feels like a place that will take care of me."*

## Anti-references

- **Generic salon template.** No stock-photo / Wix-beauty-template look,
  clip-art service icons, or lorem-ipsum filler. The real photos and Ana's
  actual voice are the point.
- **Cold / clinical.** Not a dermatology office. Hygiene is communicated
  through warmth and confidence, never sterile blue-white impersonality.
- **Cheap / loud discount.** No neon banners, ALL-CAPS sale shouting, blinking
  promos, or cluttered offer strips. Restraint reads as quality here.
- **Overdesigned / busy.** No glassmorphism-by-default, gradient-everything,
  heavy scroll-jacking, or three competing typefaces. Motion stays quiet and
  purposeful.

## Design Principles

1. **Show the work first.** Photography and real results carry the brand;
   chrome serves the images, never competes with them.
2. **Booking is one tap away.** Every persuasive moment leads back to the
   WhatsApp CTA. Reduce the distance between "I'm convinced" and "message sent."
3. **Trust through warmth, not sterility.** Earn confidence (hygiene,
   experience, testimonials) in a voice that stays personal and reassuring.
4. **Quiet confidence over loud selling.** Restraint, whitespace, and one
   gold accent do more than promos and exclamation marks.
5. **Works for everyone, on a phone, without JS.** Mobile-first, content
   visible without scripts, AA-readable, motion that respects preferences.

## Accessibility & Inclusion

Target: **WCAG 2.1 AA**. Body text ≥ 4.5:1, large text ≥ 3:1 against its
background; verify the muted `on-surface-variant` ink against tinted surfaces.
Full `prefers-reduced-motion: reduce` support (already scaffolded in
global.css — reveals collapse to visible, no transition). Reveal animations
enhance an already-visible default, so no-JS users and crawlers see all content.
Keyboard-navigable, visible focus, 44px minimum tap targets (already used on
the hero's secondary link). Romanian diacritics rendered correctly throughout.
