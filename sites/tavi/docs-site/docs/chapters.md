---
title: The chapter engine and the islands
description: How a chapter poses its figure from the reading line, what state lives on the figure element, and which React islands exist.
---

The page is Astro HTML. Most of what moves is plain CSS or a module script, so it works before React arrives.

## A chapter

`components/chapter/Chapter.astro` places prose steps beside a sticky figure. Below 64rem the figure sticks to the top
and the steps run under it. The chapters' prose and their poses are in `src/pages/index.astro`.

A module script, `lib/chapters.ts`, runs without any island:

- **Steps.** An `IntersectionObserver` watches the steps against the reading line, a band across the screen (mid-screen in two columns, lower in one). The step that holds the line becomes active and calls `setPose` on the figure with the step's name and how far the lifted parts have risen. In one column the band moves below the stuck figure's foot when the figure is tall.
- **Part names.** A part name in the prose (`PartName.astro`), hovered or focused, lights that part on the figure and drops the rest to a ghost pair. A part drawn only on the face turned away lights nothing.
- **The current chapter.** Its link in the header and in the contents band is marked while the chapter holds the line.

## State on the figure

A figure's state lives on its element, in `lib/figure.ts`, so the script, the control tray and the 3D view read and
write the same thing:

| State | Where | Meaning |
| --- | --- | --- |
| Pose | `data-step` and `--e` | which parts stay in colour, how far the lift groups have risen |
| Focus | `data-focus` | the part the prose points at |
| Pick | `data-pick` | the part the visitor chose in chapter 5 |
| Turn | `data-turn` | degrees from the view the 3D opens on |
| Speed | `--slow` | 1, 10 or 100, stretching every ticking duration |
| Hold | `data-hold` | the moment of the figure's clock it stands still at |
| Reserve | `data-reserve` | the mainspring's hours of power, absent while full |

Every change fires one `tavi:figure` event on the figure.

## Play, speed and hold

**Play** is one state for the page: `data-playing` on `<html>`. An inline head script in `Base.astro` sets it before the
first paint, to `false` under reduced motion, and every Pause changes it through `lib/playback.ts`. Motion runs only
under the `js` class and `data-playing="true"`. Speed belongs to each figure. A hold belongs to a figure too: a step
that wants one phase of a beat shown asks for it, and it leaves the page's play state alone. Every Pause is a toggle
that keeps the word "Pause" and shows pressed while paused.

Chapters 3 and 4 are drawn by a frame loop, not by CSS (`lib/clockFigure.ts`). One loop per figure asks for frames only
while the page plays, the figure is on screen and the tab is visible, and it clamps a frame's step at 0.25 s.

## Sound

The header's Sound toggle is off on every visit and stores nothing. Its first press loads `lib/sound.ts`, which schedules
a synthesised tick (filtered noise on the audio clock) at the beat of the moving figure nearest the reading line, at
that figure's speed. It is silent while paused, hidden, held, or with no figure in view, and the button is hidden where
the browser has no `AudioContext`.

## The islands

| Island | Where | Loads |
| --- | --- | --- |
| `ChaptersMenu` | the header, phones | `client:media="(width < 64rem)"` |
| `FigureTray`, `EnergyTray`, `TogetherTray` | each moving figure's controls | `client:visible` |
| `MovementFigure` | the hero and chapter 5 | `client:idle` on the hero, `client:visible` 200px early on chapter 5 |

The controls (a Slider, a radio group for speed, a Drawer for Chapters) are Base UI, wrapped in `components/ui/`.
Without scripting a control that only works with it is hidden. In development builds `window.taviPose(figure, pose)`
sets a figure's pose for stills and tests.
