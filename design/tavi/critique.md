# Tavi sketch: critique before the owner sees it

I read this against `sketch-1280x800.png`, `sketch-390x844.png`, the 1440 full page in `.hallmark/shots/`,
chapter 1 at both sizes in `scratch/shots/final-*.png`, and the three `prototype-*.png` renders.

## Verdict

The sketch holds up. The drawn movement is the page, and it looks like a real calibre, not clip art. The
train is a real 21,600 vph train, the parts wear their own metals, and the ticking follows the ratios. The
prototype proves the 3D centrepiece can be that same drawing, built from one part table in 109 draw calls.
What it still lacks is Tavi. Without the bench chapter and his own line, this is a beautiful watch explainer
that happens to carry his name.

## Hierarchy

- On the desktop first screen the head sits left and the movement right at about 520px, with nothing
  competing. The blue button is the only saturated colour, so it is the obvious next step.
- The four callouts are the right four. Barrel, wheel train, balance and escape wheel name the chapters
  you're about to read. They sit in the body face at 15px with plain leaders, quieter than the drawing.
- The header marked "1 Energy" as current while you were still in the hero, a small lie. Fixed. A chapter now
  becomes current only when it reaches the reading line.
- In chapter 1, focus by subtraction works. The barrel, spring and ratchet are the only colour in a ghosted
  movement, so the eye lands where the prose is, and the coloured part names tie prose and drawing together.

## Does the first screen say what the site is?

Mostly. "Six beats every second", a ticking movement and "Tavi loves clocks and watches" read as a watch
explained for someone called Tavi, in about a second. It doesn't say Tavi repairs watches. That line lives in
the footer and in chapter 7 of the contents band. The owner asked for a quiet repair line and less marketing,
so I'd keep it there, but the owner should know it's a scroll away.

## Phone

- The first screen at 390 holds the head, the lede, the button, then the drawing at full width with its
  callouts. The movement still reads as the subject.
- The callouts drop to about 14px on a phone. Readable, at the floor.
- The contents band becomes a seven-row list, a full screen of scrolling before chapter 1. It works as a map
  but delays the first interaction. A two-column grid would halve it.
- In chapter 1 the stage sticks to the top at 30% of the screen and the steps scroll under it. The tray wraps
  to two rows, so the controls take as much height as the drawing. Fine for a sketch; the site should put
  Wind and Take apart in one row of two compact sliders.
- The phone header isn't sticky, so the global Pause scrolls away. The stage keeps its own Pause, so
  WCAG 2.2.2 still holds.

## Legibility

Newsreader at 17 to 19px reads well on the warm paper, and ink on paper is far above 4.5:1. Figures in IBM
Plex Mono stay tabular. The weakest text is the muted hint under each step, such as "Slide Take apart to see
inside", at 15px in `--color-muted`. It passes contrast but sits near the noise floor beside 19px prose.

## Motion that earns its place

- The balance swinging and the escape wheel stepping 12° six times a second are the subject. They earn it.
- At 1× the escapement is a blur and the train barely moves, so the hero's motion reads mostly as a shimmer
  on the balance. That's true to the watch, and the headline promises six beats a second, so the hero stays
  at 1×. Chapter 3 should open at 1/10.
- The explode in chapter 1 is the best moment on the page. The bridge and ratchet lift along one axis with
  dashed assembly lines. The prototype's 3D version with labels is the strongest thing in either file.
- Everything can stop. Header and tray Pause, reduced motion, a hidden tab and an off-screen figure all halt it.

## Weakest

1. The poster and the 3D don't share a first frame. The SVG is a flat top view and the prototype opens at a
   34° tilt, so swapping one for the other in the site would jump. The 3D should open flat and tilt on the
   first drag or scroll.
2. The prototype's labels. On desktop the right-hand column fans eight leaders into a narrow band near the
   top, and some cross. On a phone the apart view is width-bound, so the figure is small with empty bands
   above and below, and only eight parts get labels.
3. Chapter 1's steps are each 58% of the screen tall. With a sticky figure that's the scrollytelling rhythm,
   but on a long desktop scroll the left column is mostly empty paper.

## Must-fixes, done before handing over

- Under reduced motion, Play flipped its label and nothing moved, because `animation: none !important` beat
  the play state. Play now runs the movement once the visitor asks for it.
- The footer said "A way to reach him will be added here", a contact promise against the owner's "no contact
  line". Removed. Chapter 7's line in the contents band now reads "What Tavi mends." instead of inviting a visit.
- Chapter 1's figure was a hard crop through the plate on the right and bottom, which read as a bug. Both
  edges now fade into the card.
- Sloplint WARN 58 counted 83 words on one screen. I cut the chapter lede, which only restated the head.
- "1 Energy" no longer shows as current in the hero, in the header or the contents band.
- Prototype fixes. The centre wheel ran through the barrel drum, so I restacked every height. Draw calls went
  from 365 to 109 with one vertex-coloured material and one mesh per outlined part. A dotted seam across the
  plate is gone. The frame clamp was 1/20 s, so below 20 fps the watch ran slow; at 5 fps headless it kept a
  quarter of real time. The clamp is now 0.25 s, and the clock runs at 0.99 of real time at 5 fps.

## Left for the next pass

- The 3D opening on the poster's flat view, weakest point 1.
- Label layout in the prototype. Alternate sides by depth, uncross the leaders, and on phones use the parts
  list under the figure that the research proposed.
- The footer's dashed slot, "[Tavi's line, in his own words]". It's an honest placeholder. That line from Tavi
  is the one piece of material that would most improve the page, with his favourite calibre a close second.

## Not checked

- Every render is at device pixel ratio 1. The gear outlines are one-device-pixel WebGL lines, so on a HiDPI
  laptop or the owner's Android phone they'll look thinner than the shell outlines on the bridges.
- Not tried live: the no-WebGL message, the paused start under reduced motion on either page, and a real phone.
- The prototype had sloplint only (0 FAIL, 0 WARN, 1 waived), not the full Hallmark sweep with a fresh-context
  review. The sketch is at 0 FAIL, 0 WARN, 3 waived, 1 dismissed.
