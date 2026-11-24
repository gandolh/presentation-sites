// The chapters' prose, run from a plain module script so it works before any island hydrates:
// - each chapter's steps: the step at the reading line is the active one, and the figure takes its pose;
// - the part names in the prose: hovering or focusing one lights that part on the figure;
// - the current chapter: its link in the header and in the contents band is marked while the chapter holds the
//   reading line, and nothing is marked in the hero.
// Under reduced motion the stylesheet drops the transitions, so a new pose jumps.

import { setFocus, setPose } from "./figure";

// The reading line: a thin band across the screen. In two columns it sits mid-screen. In one column (below 64rem)
// the figure sticks to the top, so the band sits lower, at 64% of the screen; on a short screen (a phone turned
// sideways, a small laptop window) the stuck figure reaches past that, and the band starts just under its foot
// instead, so a step is read where it shows and never behind the figure.
const ONE_COLUMN = "(width < 64rem)";
const READING_LINE = { wide: "-45% 0px -50% 0px", oneColumn: "-64% 0px -22% 0px" };
const ONE_COLUMN_BAND = { top: 0.64, height: 0.14 };
/** Pixels between the stuck figure's foot and the top of the reading line. */
const FIGURE_CLEARANCE = 8;
const CURRENT_LINE = "-40% 0px -55% 0px";

/** The one-column reading line: at 64% of the screen, or lower when the stuck figure would cover it. */
function oneColumnLine(figure: HTMLElement): string {
  const screen = innerHeight;
  // The figure's foot once it is stuck: its sticky top (the stylesheet's) plus its height.
  const foot = (parseFloat(getComputedStyle(figure).top) || 0) + figure.offsetHeight;
  if (foot + FIGURE_CLEARANCE <= screen * ONE_COLUMN_BAND.top) return READING_LINE.oneColumn;
  const top = Math.min(Math.ceil(foot + FIGURE_CLEARANCE), screen - 1);
  const bottom = Math.max(0, Math.floor(screen - top - screen * ONE_COLUMN_BAND.height));
  return `-${top}px 0px -${bottom}px 0px`;
}

function watchSteps(chapter: HTMLElement, figure: HTMLElement) {
  const steps = [...chapter.querySelectorAll<HTMLElement>(".step[data-step]")];
  const first = steps.find((step) => step.classList.contains("is-active")) ?? steps[0];
  if (!first) return;
  const pose = (step: HTMLElement) => {
    for (const each of steps) each.classList.toggle("is-active", each === step);
    setPose(figure, step.dataset.step ?? "", { e: Number(step.dataset.explode ?? 0) });
  };
  // A step that is already active keeps the figure as the visitor left it (a slider dragged holds until the next step
  // arrives), also when the reading line moves and the steps are observed again.
  const activate = (step: HTMLElement) => {
    if (!step.classList.contains("is-active")) pose(step);
  };
  pose(first);

  const oneColumn = matchMedia(ONE_COLUMN);
  let observer: IntersectionObserver | undefined;
  let line = "";
  // Observes the steps at the reading line, again whenever the line moves: the layout changes at 64rem, and in one
  // column the line follows the figure's height and the screen's.
  const observe = () => {
    const next = oneColumn.matches ? oneColumnLine(figure) : READING_LINE.wide;
    if (next === line) return;
    line = next;
    observer?.disconnect();
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) activate(entry.target as HTMLElement);
      },
      { rootMargin: line },
    );
    for (const step of steps) observer.observe(step);
  };
  observe();
  oneColumn.addEventListener("change", observe);
  addEventListener("resize", observe);
  new ResizeObserver(observe).observe(figure);
}

function watchPartNames(chapter: HTMLElement, figure: HTMLElement) {
  // Back to the part name that has the keyboard focus, if any, else to the step's own parts.
  const rest = () => {
    const focused = document.activeElement;
    const named = focused instanceof HTMLElement && chapter.contains(focused) ? focused.dataset.part : undefined;
    setFocus(figure, named ?? null);
  };
  for (const button of chapter.querySelectorAll<HTMLButtonElement>(".part-name[data-part]")) {
    const part = button.dataset.part ?? null;
    button.addEventListener("mouseenter", () => {
      setFocus(figure, part);
    });
    button.addEventListener("mouseleave", rest);
    button.addEventListener("focus", () => {
      setFocus(figure, part);
    });
    button.addEventListener("blur", () => {
      setFocus(figure, null);
    });
    // A tap focuses the button where the browser doesn't (Safari), so it lights the part as a keyboard focus does.
    button.addEventListener("click", () => {
      button.focus();
    });
  }
}

function watchCurrentChapter() {
  const links = (id: string) =>
    document.querySelectorAll(`.chapters a[href="#${id}"], .contents-band a[href="#${id}"]`);
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        for (const link of links(entry.target.id)) {
          if (entry.isIntersecting) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        }
      }
    },
    { rootMargin: CURRENT_LINE },
  );
  for (const chapter of document.querySelectorAll<HTMLElement>("section.chapter[id]")) observer.observe(chapter);
}

/** Starts every chapter on the page: its steps, its part names, and the current-chapter mark. */
export function startChapters(): void {
  for (const chapter of document.querySelectorAll<HTMLElement>("section.chapter")) {
    const figure = chapter.querySelector<HTMLElement>("[data-figure]");
    if (!figure) continue;
    watchSteps(chapter, figure);
    watchPartNames(chapter, figure);
  }
  watchCurrentChapter();
}
