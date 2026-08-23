# Product

## Register

brand

## Users

People in Gorj and the wider Oltenia region planning an event at a place that
matters to them: the family home, the yard, a plot of land in the village. They
are not booking a restaurant or a venue, they want the event to happen *here*,
where they are, and they need someone to bring the space itself. The occasion
varies widely, from a wedding or a botez to a company gathering to the quieter,
heavier days a family also has to host. They arrive wanting to understand one
thing first: **can you bring a proper, comfortable covered space to my location,
set it up the way I want, and handle the heat or the cold?** They are weighing
whether this is a serious, dependable operation or an improvised one. This is a
DEMO / concept site, so there is no real booking outcome; the job is to make the
service *legible and credible* at a glance.

## Product Purpose

Subcort is the multi-page presentation site for an **event-tent rental and
setup service**: it brings a large tent to the client's own location, mounts it
exactly to plan, lays a proper floor, lights it, and provides heating or cooling
by season. Optional extras (catering, music, decor) are coordinated **through
local partners**, at extra cost, never provided in-house.

The site is **informational, not transactional**. By deliberate decision it has
**no calls-to-action**: no quote form, no booking widget, no scattered
call/WhatsApp buttons, no sticky bars. It explains the service across five pages
(Acasă, Corturi, Servicii, Zonă, Contact) and lets the visitor reach the contact
details on their own terms. Success is comprehension and trust: a visitor leaves
understanding what Subcort does, what sizes exist, what comfort is provided, that
it covers their area, and where the (placeholder) contact details are.

The positioning is **deliberately occasion-agnostic and calm**. The tent is a
prepared, neutral space for whatever the day asks for. The site never leans
festive (so it fits a wide range of events, including somber ones) but it also
never names somber occasions explicitly: a safe umbrella framing. Romanian only.
Static (Astro + React), fast, deployed to a sub-path on a VPS.

## Brand Personality

**Calm, dependable, sheltering.** The voice of a crew that has set up a hundred
of these and will quietly handle yours, too. Plain, grounded Romanian: it talks
about the *space* (size, floor, warmth, light, the area covered) rather than
selling an emotion. It does not perform excitement and it does not perform
solemnity, it stays even, because the same tent serves a wedding and a wake, and
the brand respects both by not presuming which one you are planning. Emotional
goal: a visitor thinks "these people are serious and steady, they will bring a
proper space and set it up right, and I don't have to worry about the logistics."

## Anti-references

- **The festive party-rental site.** Confetti, balloons, neon "EVENIMENTE!",
  gold-glitter wedding clichés, a dancing-couple hero. Subcort is occasion-
  neutral on purpose; a celebratory skin would exclude half of what the tent is
  actually used for.
- **The cheap classifieds listing.** OLX-grade clutter, watermarked phone
  photos, all-caps price shouting, a wall of mismatched stock images. The trust
  signal here is restraint and clarity.
- **Generic SaaS / startup landing.** Hero-metric template (giant number +
  label + gradient accent), identical icon-card grids repeated down the page,
  gradient blobs, buzzword copy ("transform your event", "seamless"). The
  auto-template AI look is the enemy.
- **Forest-green-on-cream "natural brand" cliché.** The saturated AI attractor:
  a timid sage accent floating on a heavy cream page. Subcort instead *commits*
  to a deep canopy green that carries real structural weight on the dark anchors
  (hero, footer, page headers), over warm cream paper *lit from within* by a warm
  clay lamp glow that does real work on the light body — the clay is the lamp, not
  a polite trim. One companion accent, no third hue.

## Design Principles

1. **The space is the subject.** Every section describes the covered space it
   delivers, size, floor, warmth, light, the area reached, not an imagined party.
   Concrete logistics over staged emotion.
2. **Even tone, any occasion.** Never festive, never funereal. The copy and
   imagery stay calm and neutral so the same site honestly serves a wedding and a
   memorial. Imagery is the empty, prepared tent, not a celebration in progress.
3. **Quiet, not loud.** No CTAs, no urgency, no shouting. The site informs and
   steps back; trust is built by clarity and restraint, and the visitor is
   trusted to make contact on their own.
4. **Committed green, warm cream, lamp-lit.** A deep canopy green is the identity
   and carries the page anchors (hero, footer, subpage headers), set on warm cream
   paper that is lit from within — a daylight-readable light theme, never a dark
   theme and never a passive heavy cream. One warm clay accent is the lamp glow,
   doing real work on the light body (glow pools, lit cards); no third hue.
5. **Sheltering craft.** Sturdy, grounded forms (a slab-serif headline, solid
   panels, generous floors of whitespace) that feel like a well-pitched structure:
   calm, square, dependable, never flimsy or ornamental.

## Accessibility & Inclusion

Target **WCAG 2.2 AA**. Body text ≥4.5:1, large text ≥3:1 (the green-leaning
graphite ink and the deepened green/clay are chosen to clear AA; white text on
the canopy green and on the clay accent both pass). Full keyboard navigation with
visible `:focus-visible` rings, semantic landmarks, and a skip link.
`prefers-reduced-motion` is honoured throughout (scroll-reveal degrades to
instant); reveal animations enhance an already-visible default so content never
ships blank to crawlers or throttled tabs. Romanian diacritics (ă â î ș ț)
render correctly via self-hosted latin-ext fonts. Generous tap targets.
