// The page's one play state: `data-playing` on <html>. The head script in Base.astro sets it before the first paint
// ("false" under reduced motion, else "true"); every Pause on the page changes it here, and every moving drawing
// follows it (CSS keys its animations on the attribute). Islands read it with
// `useSyncExternalStore(subscribe, isPlaying, () => true)`.

const EVENT = "tavi:playing";

/** Whether the page's drawings may move. True until something pauses them. */
export function isPlaying(): boolean {
  return document.documentElement.dataset.playing !== "false";
}

/** Plays or pauses every moving drawing on the page, and tells every subscriber. */
export function setPlaying(on: boolean): void {
  if (isPlaying() === on) return;
  document.documentElement.dataset.playing = on ? "true" : "false";
  document.dispatchEvent(new CustomEvent<boolean>(EVENT, { detail: on }));
}

/** Calls `listener` with the new state whenever it changes; returns the unsubscribe. */
export function subscribe(listener: (playing: boolean) => void): () => void {
  const onChange = (event: Event) => {
    listener((event as CustomEvent<boolean>).detail);
  };
  document.addEventListener(EVENT, onChange);
  return () => {
    document.removeEventListener(EVENT, onChange);
  };
}
