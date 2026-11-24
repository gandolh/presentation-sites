// The chapters' prose, run from a plain module script so it works before any island hydrates:
// - each chapter's steps: the step at the reading line is the active one, and the figure takes its pose;
// - the part names in the prose: hovering or focusing one lights that part on the figure;
// - the current chapter: its link in the header and in the contents band is marked while the chapter holds the
//   reading line, and nothing is marked in the hero.
// Under reduced motion the stylesheet drops the transitions, so a new pose jumps.

import { setFocus, setPose } from "./figure";

// The reading line: a thin band across the screen. In one column (below 64rem) the figure sticks to the top, so the
// band sits lower, under it.
const ONE_COLUMN = "(width < 64rem)";
const READING_LINE = { wide: "-45% 0px -50% 0px", oneColumn: "-64% 0px -22% 0px" };
const CURRENT_LINE = "-40% 0px -55% 0px";

function watchSteps(chapter: HTMLElement, figure: HTMLElement) {
  const steps = [...chapter.querySelectorAll<HTMLElement>(".step[data-step]")];
  const first = steps.find((step) => step.classList.contains("is-active")) ?? steps[0];
  if (!first) return;
  const activate = (step: HTMLElement) => {
    for (const each of steps) each.classList.toggle("is-active", each === step);
    setPose(figure, step.dataset.step ?? "", { e: Number(step.dataset.explode ?? 0) });
  };
  activate(first);

  const oneColumn = matchMedia(ONE_COLUMN);
  let observer: IntersectionObserver | undefined;
  const observe = () => {
    observer?.disconnect();
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) activate(entry.target as HTMLElement);
      },
      { rootMargin: oneColumn.matches ? READING_LINE.oneColumn : READING_LINE.wide },
    );
    for (const step of steps) observer.observe(step);
  };
  observe();
  oneColumn.addEventListener("change", observe);
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
