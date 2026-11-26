// The ticking sound, synthesised: no recording of a watch exists, and a few milliseconds of filtered noise is what a
// tick is. It is off on every visit and nothing is stored. Header.astro's Sound toggle loads this module on the first
// press, makes the AudioContext inside that click (browsers keep audio shut until a visitor acts) and hands it over.
//
// The ticks follow the moving figure nearest the reading line, at its speed: the clock's beats, six a second at 1×,
// ten times slower at 1/10 and a hundred times at 1/100. A figure that keeps a clock (lib/figure.ts) is followed to
// the beat, each tick landing as its balance passes rest; the CSS-driven ones (the hero's drawing, chapters 1 and 2)
// keep the same rate without the phase. Nothing sounds while the page is paused, the tab is hidden, the figure is held
// at a moment by a step, chapter 5's spring has run down, or no moving figure is in view.
//
// Each tick is scheduled on the audio clock, a little ahead of time, never from a timer: a timer only decides when to
// look, so a late timer costs nothing but a shorter look-ahead. A tick is a 4 ms burst of noise through a band-pass
// filter; tick and tock differ a little in pitch, as the two pallet stones do. A second press stops it at once.

import { MOVEMENT } from "../movement/parts";
import { clockOf, heldAt, reserveOf, speedOf } from "./figure";
import { isPlaying } from "./playback";

declare global {
  interface Window {
    /** Development builds only: how many ticks have been scheduled since the sound first started. */
    taviSound?: { ticks: number };
  }
}

/** The figures that move, in the order a tie goes: the hero's first. */
const FIGURES = [
  "hero-figure",
  "energy-figure",
  "wheels-figure",
  "escapement-figure",
  "balance-figure",
  "together-figure",
];
/** The figures drawn only by the clock: with no stamp from it nothing on screen moves, so nothing sounds. */
const CLOCKED = new Set(["escapement-figure", "balance-figure", "together-figure"]);

const BEATS_PER_SECOND = MOVEMENT.spec.vph / 3600;
/** How far ahead of the audio clock ticks are scheduled, and how often the schedule is looked at, in seconds. */
const LOOK_AHEAD = 0.25;
const LOOK_EVERY = 0.03;
/** The master level: soft, as a watch is heard across a table. */
const LEVEL = 0.22;
/** A tick's burst, its decay and the two pitches in Hz, tick then tock, and the filter's Q. */
const BURST = 0.004;
const PITCH = [2700, 2250] as const;
const Q = 2.4;

export interface Sound {
  /** Starts ticking; the context was made by the click that asked. */
  start(): void;
  /** Stops at once: what was scheduled ahead is cut. */
  stop(): void;
}

/** The figure whose ticks to follow: the moving one nearest the reading line, or null. */
function nearestMoving(): HTMLElement | null {
  const line = window.innerHeight * 0.5;
  let best: HTMLElement | null = null;
  let near = Infinity;
  for (const id of FIGURES) {
    const el = document.getElementById(id);
    if (!el) continue;
    const box = el.getBoundingClientRect();
    if (box.height === 0 || box.bottom <= 0 || box.top >= window.innerHeight) continue;
    if (heldAt(el) !== null || reserveOf(el) <= 0) continue;
    if (CLOCKED.has(id) && !clockOf(el)) continue;
    const away = line < box.top ? box.top - line : line > box.bottom ? line - box.bottom : 0;
    if (away < near) {
      near = away;
      best = el;
    }
  }
  return best;
}

/** Makes the sound for `context`, stopped until `start`. */
export function createSound(context: AudioContext): Sound {
  // A burst of white noise, made once and played for every tick.
  const noise = context.createBuffer(1, Math.ceil(context.sampleRate * 0.03), context.sampleRate);
  const samples = noise.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;

  let master: GainNode | null = null;
  let timer = 0;
  /** What the schedule is following: the figure and its speed, and the next beat's number and audio time. */
  let following: { figure: HTMLElement; slow: number; clocked: boolean; beat: number; when: number } | null = null;
  let ticks = 0;

  const tick = (when: number, beat: number) => {
    if (!master) return;
    const source = context.createBufferSource();
    source.buffer = noise;
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = PITCH[beat % 2] ?? PITCH[0];
    filter.Q.value = Q;
    const gain = context.createGain();
    gain.gain.setValueAtTime(1, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + BURST);
    source.connect(filter).connect(gain).connect(master);
    source.start(when);
    source.stop(when + BURST + 0.01);
    ticks += 1;
    if (import.meta.env.DEV) window.taviSound = { ticks };
  };

  /** Drops every tick already scheduled by swapping the master gain for a fresh one. */
  const cut = () => {
    if (!master) return;
    master.disconnect();
    master = context.createGain();
    master.gain.value = LEVEL;
    master.connect(context.destination);
  };

  /** Looks at what is on screen and schedules the beats that fall inside the look-ahead. */
  const look = () => {
    const figure = isPlaying() && document.visibilityState === "visible" ? nearestMoving() : null;
    if (!figure) {
      // What was scheduled ahead is cut, so a Pause or a scroll away is heard at once, not a quarter second later.
      if (following) cut();
      following = null;
      return;
    }
    const slow = speedOf(figure);
    const stamp = clockOf(figure);
    const now = context.currentTime;
    if (!following || following.figure !== figure || following.slow !== slow || following.clocked !== !!stamp) {
      if (stamp) {
        // The next beat after the figure's clock: the balance passes rest at each half beat.
        const phase = (stamp.t + (performance.now() - stamp.at) / 1000 / slow) * BEATS_PER_SECOND;
        const beat = Math.ceil(phase - 0.5);
        following = { figure, slow, clocked: true, beat, when: now + ((beat + 0.5 - phase) / BEATS_PER_SECOND) * slow };
      } else {
        // A drawing that runs on CSS keeps its rate; its phase isn't ours to read.
        following = { figure, slow, clocked: false, beat: 0, when: now + 0.02 };
      }
    }
    const every = slow / BEATS_PER_SECOND;
    // A look that came late (a busy page) skips the beats already gone rather than playing them in a rush.
    while (following.when < now - 0.005) {
      following.when += every;
      following.beat += 1;
    }
    while (following.when < now + LOOK_AHEAD) {
      tick(Math.max(following.when, now), following.beat);
      following.when += every;
      following.beat += 1;
    }
  };

  return {
    start() {
      if (master) return;
      master = context.createGain();
      master.gain.value = LEVEL;
      master.connect(context.destination);
      following = null;
      void context.resume();
      timer = window.setInterval(look, LOOK_EVERY * 1000);
      look();
    },
    stop() {
      window.clearInterval(timer);
      timer = 0;
      following = null;
      // Cutting the master off silences every tick already scheduled, however close.
      master?.disconnect();
      master = null;
      void context.suspend();
    },
  };
}
