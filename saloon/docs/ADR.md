# Ana Saloon — Architecture Decision Record & Design Brief

> **Purpose**: This document is the source-of-truth specification for the Ana Saloon presentation site. It is written to be fed into design tools (e.g. Google Stitch) to generate a coherent design system, and to be referenced by developers during implementation.

---

## 1. Project Overview

**Product**: Marketing / presentation website for **Ana Saloon**, a single-operator nail salon.

**Operator**: Ana — the only employee. Performs all services personally.

**Location**: Târgu-Jiu, Județul Gorj, Romania.

**Audience**: Local Romanian-speaking women, ages roughly 18–55, looking for a personal, high-quality nail service. Mobile-first (~70%+ traffic expected from phones). No tourists, no expats.

**Primary goal of the site**: Convert visitors into appointment requests via WhatsApp.

**Secondary goals**: Build trust through portfolio and testimonials; communicate the personal, boutique nature of the salon; surface contact info and location.

**Non-goals**:
- No e-commerce
- No blog
- No client account system
- No real-time calendar / slot booking
- No multi-language support (Romanian only)

---

## 2. Architectural Decisions

### ADR-001: Static site with Astro + React

**Decision**: Build with Astro (static output) using React for any interactive islands.

**Why**:
- Content is fully hardcoded — no CMS, no API.
- Astro produces minimal-JS static HTML, ideal for SEO and fast loading on Romanian mobile networks.
- React islands cover the few interactive parts (booking form, mobile menu, gallery lightbox).
- Output is plain HTML/CSS/JS — works on any web server.

**Trade-off**: Content changes require a redeploy. Acceptable because Ana's content (services, prices, hours) changes rarely.

### ADR-002: Self-hosted on owner's VPS

**Decision**: Build as pure static output (`dist/`), deployable via nginx, Caddy, or any static host.

**Why**: Owner plans to host on their own VPS.

**Implication**: No platform-specific features (no Vercel/Netlify functions, no edge runtime, no serverless). All dynamic behavior happens client-side or via third-party services (Formspree, WhatsApp).

### ADR-003: Single-page scroll architecture

**Decision**: One page with anchor-linked sections; no separate routes.

**Why**:
- Mobile users prefer scrolling to navigating.
- Reduces cognitive load for a small business with ~8 distinct content blocks.
- Faster to build, faster to load (one HTML payload).

**Trade-off**: Slightly weaker SEO for individual service keywords. Mitigated by good `<h2>` structure and schema markup.

### ADR-004: Booking via custom form + WhatsApp deep-link + Formspree fallback

**Decision**: A custom React form collects appointment details, then opens WhatsApp with a pre-filled message; submits a parallel email via Formspree as backup.

**Why**:
- Ana is the only operator; she doesn't need real-time slot management — she confirms manually.
- WhatsApp is already Ana's primary communication channel.
- Keeps users on the site (vs. MERO redirect).
- Zero third-party branding on the site.
- Free.

**Rejected alternatives**:
- **MERO embed** — works but takes users off-site, requires Ana to maintain a MERO account
- **Versum / Setmore / Calendly** — generic, English-feel, overkill for single operator
- **Google Calendar Appointment Scheduling** — basic UI, doesn't fit brand
- **Custom full booking system** — overkill, needs DB, ongoing maintenance

### ADR-005: Hardcoded content, no CMS

**Decision**: All copy, prices, services, testimonials live in TypeScript constants inside the repo.

**Why**: Content is small and changes rarely. CMS adds infrastructure cost and maintenance for no real benefit at this scale.

**Implication**: Developer involvement required for content edits. Acceptable.

### ADR-006: Mockup imagery in MVP phase

**Decision**: Use locally-bundled placeholder JPGs (free stock nail/manicure photos) under `/public/images/`. To be replaced by real photography in a later phase.

**Why**: Site can ship and look polished without waiting for a photo shoot.

**Implication**: Image swap must be a one-line change — use semantic file names (`hero.jpg`, `gallery-01.jpg`, etc.) rather than baking image identity into component code.

### ADR-007: Romanian-only

**Decision**: All UI text and content in Romanian. No language switcher.

**Why**: 100% of clientele will be Romanian-speaking locals. EN adds work for no payoff and complicates content management.

---

## 3. Information Architecture

The site is a single page with the following sections, in this order:

| # | Section ID | Section name (RO) | Purpose |
|---|---|---|---|
| 1 | `#acasa` | Acasă (Hero) | Brand promise + primary CTA |
| 2 | `#despre` | Despre Ana | Personal story, trust building |
| 3 | `#servicii` | Servicii & Prețuri | Service catalog with pricing |
| 4 | `#galerie` | Galerie | Visual portfolio of nail work |
| 5 | `#testimoniale` | Testimoniale | Social proof, sample reviews |
| 6 | `#loialitate` | Program de Loialitate | Loyalty/package mention |
| 7 | `#programari` | Programări | Appointment request form |
| 8 | `#contact` | Contact | Address, hours, phone, map |

**Top navigation** (sticky on scroll): logo wordmark left, anchor links centered (Acasă, Servicii, Galerie, Contact), "Programează-te" button right. On mobile: hamburger menu opens a full-screen overlay.

**Footer**: Logo, mini-nav, social icons (Instagram, Facebook, WhatsApp), copyright, ANPC / cookie policy links.

---

## 4. Section-by-Section Content Spec

### 4.1 Hero (`#acasa`)

- **Layout**: Full-viewport-height. Left half: text content. Right half: large hero photo of nails. On mobile: stacked, photo first.
- **Headline (h1)**: *"Unghii care vorbesc despre tine"*
- **Subheadline**: *"Salon de manichiură în Târgu-Jiu, dedicat fiecărei cliente în parte."*
- **Primary CTA button**: *"Programează-te acum"* → scrolls to `#programari`
- **Secondary CTA (text link)**: *"Vezi serviciile"* → scrolls to `#servicii`
- **Trust micro-line under CTAs**: *"⭐ 5.0 pe Google · Peste 500 de cliente mulțumite"* (placeholder)

### 4.2 Despre Ana (`#despre`)

- **Layout**: Two-column. Left: portrait photo of Ana (placeholder). Right: text.
- **Heading**: *"Bună, sunt Ana"*
- **Body** (2-3 short paragraphs):
  - Paragraph 1: Personal intro — passion for nail art, years of experience (placeholder: 5+ ani).
  - Paragraph 2: Philosophy — calitate, igienă, atenție la detaliu, atmosferă caldă.
  - Paragraph 3: Invitation — *"Te aștept în salonul meu din Târgu-Jiu pentru o experiență relaxantă și unghii care să te facă să zâmbești de fiecare dată când le privești."*
- **Optional inline stats** (3 small cards under text): *"5+ ani experiență"*, *"500+ cliente"*, *"100% produse premium"*

### 4.3 Servicii & Prețuri (`#servicii`)

- **Layout**: 3-column grid on desktop, single column on mobile.
- **Heading**: *"Servicii"*
- **Sub-heading**: *"Prețuri orientative. Pentru ofertă personalizată, contactează-mă."*
- **Three service cards**:
  1. **Manichiură**
     - Subtitle: *"Clasică & semipermanentă"*
     - Description: *"Manichiură îngrijită cu lac semipermanent rezistent până la 3 săptămâni."*
     - Price: *"de la 80 lei"*
     - Icon: minimal line-art (nail polish bottle)
  2. **Unghii cu gel**
     - Subtitle: *"Construcție & gel"*
     - Description: *"Construcție pe tipsuri sau șablon, pentru unghii rezistente și un aspect impecabil."*
     - Price: *"de la 150 lei"*
     - Icon: minimal line-art (long nail shape)
  3. **Nail Art**
     - Subtitle: *"Design-uri personalizate"*
     - Description: *"French, babyboomer, ombre, pictură manuală — design-uri unice, adaptate stilului tău."*
     - Price: *"de la 20 lei / unghie"*
     - Icon: minimal line-art (paintbrush or floral motif)
- **CTA below cards**: *"Programează-te"* button

### 4.4 Galerie (`#galerie`)

- **Layout**: Masonry grid, 3 columns desktop / 2 mobile. 9–12 images. Click to open lightbox.
- **Heading**: *"Galerie"*
- **Sub-heading**: *"Câteva dintre lucrările mele recente"*
- **Images**: Mix of close-up nail shots — different styles (french, color, art, gel). Placeholder JPGs for MVP.
- **CTA at bottom**: *"Urmărește-mă pe Instagram pentru mai multe"* → external link to IG (placeholder URL)

### 4.5 Testimoniale (`#testimoniale`)

- **Layout**: Horizontal scrolling cards on mobile / 3-column grid on desktop.
- **Heading**: *"Ce spun clientele mele"*
- **3-5 testimonial cards**, each with:
  - 5-star row at top
  - Quote (2-3 sentences, in Romanian)
  - Client first name + last initial (e.g. *"Andreea M."*)
  - Small "Verified review on Google" badge (placeholder)
- **Sample quotes**:
  1. *"Ana e o profesionistă desăvârșită. De fiecare dată ies din salon cu unghii perfecte și un zâmbet pe față."* — Andreea M.
  2. *"Atmosferă caldă, atenție la detalii, și unghii care chiar durează 3 săptămâni. Recomand cu drag!"* — Maria P.
  3. *"Cel mai bun salon din Târgu-Jiu. Ana ascultă ce vrei și livrează exact asta — și încă ceva în plus."* — Ioana R.

### 4.6 Program de Loialitate (`#loialitate`)

- **Layout**: Single full-width banner card with subtle blush-pink background.
- **Heading**: *"Program de fidelitate"*
- **Body**: *"La fiecare a 5-a programare, primești 20% reducere. Ne ținem evidența — tu te bucuri de unghii frumoase."*
- **Optional secondary line**: *"Recomandă o prietenă și primiți amândouă 10% reducere la următoarea vizită."*
- **CTA**: *"Programează-te acum"*

### 4.7 Programări (`#programari`)

- **Layout**: Centered form, max-width ~600px. Left side (desktop): short reassurance copy. Right side: form.
- **Heading**: *"Programează-te"*
- **Reassurance copy**: *"Completează formularul și îți confirm programarea pe WhatsApp în cel mai scurt timp."*
- **Form fields** (all required unless noted):
  - Nume (text)
  - Telefon (tel)
  - Serviciu dorit (select: Manichiură / Unghii cu gel / Nail Art / Altele)
  - Data preferată (date)
  - Ora preferată (time, optional)
  - Mesaj (textarea, optional) — *"Vreo cerere specială?"*
- **Submit button**: *"Trimite cererea pe WhatsApp"*
- **Behavior**: On submit, pre-fills a WhatsApp message and opens `https://wa.me/40XXXXXXXXX?text=...`. Simultaneously POSTs the same data to Formspree as backup.
- **Below form, small print**: *"Datele tale sunt folosite doar pentru a te contacta pentru programare."*

### 4.8 Contact (`#contact`)

- **Layout**: Two columns. Left: contact details. Right: embedded Google Map of Târgu-Jiu (placeholder pin).
- **Heading**: *"Contact"*
- **Details**:
  - **Adresă**: Str. Exemplu nr. X, Târgu-Jiu, Gorj
  - **Telefon / WhatsApp**: 07XX XXX XXX (click-to-call)
  - **Email**: contact@anasaloon.ro
  - **Program**:
    - Luni–Vineri: 09:00 – 19:00
    - Sâmbătă: 10:00 – 16:00
    - Duminică: Închis
  - **Social**: Instagram, Facebook, TikTok icons
- **Map**: 16:9 aspect ratio, centered on Târgu-Jiu coordinates.

### 4.9 Footer

- Logo wordmark
- Mini-nav: Acasă · Servicii · Galerie · Contact
- Social icons row
- Cookie policy link · Termeni și condiții link · ANPC SAL · ANPC SOL badges
- Copyright: *"© 2026 Ana Saloon · Toate drepturile rezervate"*

---

## 5. Design System

### 5.1 Color Palette

| Token | Hex (proposed) | Usage |
|---|---|---|
| `--color-bg` | `#FBF7F2` | Page background — warm cream |
| `--color-surface` | `#FFFFFF` | Cards, elevated surfaces |
| `--color-blush` | `#F4D6D0` | Primary accent — soft blush pink |
| `--color-blush-deep` | `#E8A6A0` | Hover states, emphasis |
| `--color-gold` | `#C9A961` | Secondary accent — warm gold (used sparingly, for headings underlines, stars, dividers) |
| `--color-text` | `#2B1F1A` | Primary text — warm near-black |
| `--color-text-muted` | `#7A6B62` | Secondary text |
| `--color-border` | `#EEE5DD` | Subtle dividers |

**Usage rules**:
- Cream (`--color-bg`) is the dominant color (60% of any view).
- Blush (`--color-blush`) is the accent (30%).
- Gold (`--color-gold`) is the highlight (10% max — overuse looks tacky).
- White (`--color-surface`) for cards to lift them off the cream background.

### 5.2 Typography

- **Headings**: `Playfair Display`, serif. Weights 500/700. Large display sizes for h1 (clamp(2.5rem, 6vw, 4.5rem)).
- **Body**: `Manrope` or `Inter`, sans-serif. Weights 400/500/600.
- **Tone**: elegant + readable. Headings convey craft and femininity; body conveys clarity.
- **Line heights**: 1.2 for headings, 1.6 for body.
- **Wordmark**: "Ana Saloon" in Playfair Display, italic, 500 weight.

### 5.3 Spacing & Layout

- **Base unit**: 4px. Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128.
- **Section vertical padding**: 96px desktop, 64px mobile.
- **Container max-width**: 1200px, centered, with 24px side padding on mobile.
- **Card border-radius**: 16px (soft, generous).
- **Button border-radius**: 999px (fully rounded — feminine, modern).

### 5.4 Components Inventory

Must be designed for the system:

1. **Button — Primary**: blush background, near-black text, fully rounded, hover deepens to `--color-blush-deep`.
2. **Button — Secondary / Ghost**: transparent, blush border, blush text, hover fills blush.
3. **Nav Bar**: sticky, white-with-blur on scroll, transparent at top of page.
4. **Mobile Menu Overlay**: full-screen blush-tinted with large serif anchor links.
5. **Service Card**: white surface, icon top, heading, description, price in gold, optional CTA.
6. **Testimonial Card**: white surface, gold stars, quote in serif italic, attribution in sans.
7. **Section Heading**: serif h2, often with a small gold underline accent.
8. **Form Input**: cream background, blush focus ring, generous padding.
9. **Image Frame**: gallery thumbnails with subtle border, hover-lift.
10. **Footer**: warm dark variant — `--color-text` background with cream text.

### 5.5 Imagery Direction

- Macro close-ups of nails (hands resting on neutral fabric, soft natural light).
- Portrait of Ana in the workspace (warm tones, candid feel).
- Salon space details (chair, lamp, color palette, tools laid out aesthetically).
- **Avoid**: heavy filters, neon backgrounds, stock-photo cliches.
- **Mood**: warm, intimate, editorial — closer to a slow-fashion lookbook than a flashy beauty ad.

### 5.6 Iconography

- Style: thin line, 1.5px stroke weight, rounded line caps.
- Source: Lucide or Phosphor (free, consistent set).
- Color: inherits text color; gold for accent uses.

### 5.7 Motion

- Subtle: 200–300ms ease-out on hover transitions.
- Scroll-triggered fade-in for sections (small translateY 8px + opacity).
- No parallax, no heavy animations — keep it calm, premium.

---

## 6. Technical Implementation Notes

### 6.1 Project Structure (planned)

```
nails-saloon/
├── astro.config.mjs
├── tailwind.config.mjs
├── public/
│   └── images/
│       ├── hero.jpg
│       ├── ana-portrait.jpg
│       ├── gallery-01.jpg ... gallery-12.jpg
│       └── og-image.jpg
├── src/
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Hero.astro
│   │   ├── About.astro
│   │   ├── Services.astro
│   │   ├── Gallery.astro
│   │   ├── Testimonials.astro
│   │   ├── Loyalty.astro
│   │   ├── BookingForm.tsx       (React island)
│   │   ├── Contact.astro
│   │   ├── Footer.astro
│   │   └── MobileMenu.tsx        (React island)
│   ├── content/
│   │   ├── services.ts           (hardcoded data)
│   │   ├── testimonials.ts
│   │   └── site.ts               (contact info, social URLs)
│   ├── layouts/
│   │   └── Base.astro
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       └── globals.css
└── package.json
```

### 6.2 SEO & Metadata

- `<title>`: *"Ana Saloon — Salon de manichiură în Târgu-Jiu"*
- Meta description: ~155 chars, includes "salon unghii Târgu-Jiu", "manichiură semipermanentă", "unghii cu gel".
- Open Graph + Twitter card images.
- `LocalBusiness` + `BeautySalon` JSON-LD schema with address, hours, phone, geo coordinates.
- `lang="ro"` on `<html>`.
- Sitemap.xml + robots.txt at build time.

### 6.3 Performance Targets

- Lighthouse: 95+ on all four metrics.
- LCP < 2.0s on 4G.
- Total page weight < 1MB (excluding gallery, which lazy-loads).
- All images: WebP with JPG fallback, `loading="lazy"` below the fold.
- No client-side JS on first paint except the booking-form island and mobile menu.

### 6.4 Accessibility

- WCAG AA contrast minimum (verified for blush-on-cream pairings).
- Semantic HTML — proper `<section>`, `<h2>` hierarchy.
- Keyboard navigation for menu, form, gallery lightbox.
- `aria-label`s on icon-only buttons.
- Form labels associated; clear error states.

### 6.5 Third-Party Services

- **Formspree** (free tier, ≤50 submissions/month) — backup email delivery of form submissions.
- **WhatsApp Click-to-Chat** — `https://wa.me/40XXXXXXXXX?text=<urlencoded message>`.
- **Google Maps** — embedded iframe, no API key needed.
- **Google Fonts** — Playfair Display + Manrope, self-hosted at build time for privacy/perf.

### 6.6 Legal / Compliance (Romanian)

- Cookie banner (only if analytics are added — none in MVP).
- Privacy policy page (linked from footer) — brief, covering form data handling.
- ANPC SAL + SOL badge links in footer (required for any business in Romania).
- GDPR: form must include consent checkbox if data is stored anywhere (Formspree counts).

---

## 7. Out of Scope (Explicitly)

- Blog
- E-commerce / online voucher purchase
- Multi-language
- Real calendar / slot booking
- Client account / login
- Push notifications
- Analytics (for now — can add Plausible later)
- A/B testing
- CMS / admin panel

---

## 8. Future Phases (Not in MVP)

- Real photography from a salon photo shoot.
- Real contact info (phone, address, social handles).
- Plausible Analytics integration.
- Possible upgrade to MERO booking if volume justifies.
- Google Reviews widget replacing hardcoded testimonials.
- Promotional banner system (toggleable monthly offer).

---

## 9. Open Questions / Decisions Still Pending

- Domain name: assume `anasaloon.ro` — needs verification of availability.
- Exact phone number / WhatsApp number for booking (currently placeholder).
- Real opening hours (currently placeholder).
- Real address (currently placeholder).
- Final services pricing (currently "de la X lei" placeholders).
- Instagram / Facebook / TikTok handles.
- Whether to include a "gift voucher" section in v1.1.
