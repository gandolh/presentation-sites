import type { Page } from "@playwright/test";

// What the redesign checks share: the routes, the two seed sets, and the page-side helpers that put a second
// parish's seeds and a 69-character name on the page through the DOM. The parish's content is never written to.

export const ROUTES: { screen: string; path: string }[] = [
  { screen: "home", path: "/" },
  { screen: "donatii", path: "/donatii" },
  { screen: "pomelnice", path: "/pomelnice" },
  { screen: "program", path: "/program" },
  { screen: "anunturi", path: "/anunturi" },
  { screen: "anunt", path: "/anunturi/hramul-parohiei" },
  { screen: "despre", path: "/despre" },
  { screen: "contact", path: "/contact" },
  { screen: "404", path: "/nu-exista" },
];

/** The second parish's seeds (the board's blue and silver set). */
export const SEED2 = { primary: "#1f3f66", secondary: "#a8b0b8", surface: "#f5f6f4", onPrimary: "#ffffff" };

export const LONG_NAME = "Parohia Ortodoxă „Sfinții Mari Voievozi Mihail și Gavriil” – Hârlești";

export type Variant = "parish" | "seed2" | "long";

/** Put the variant on the loaded page. BaseLayout emits the seeds as a plain `:root` block, so a later one wins. */
export async function applyVariant(page: Page, variant: Variant): Promise<void> {
  if (variant === "seed2") {
    const s = SEED2;
    await page.addStyleTag({
      content: `:root{--primary:${s.primary};--secondary:${s.secondary};--surface:${s.surface};--on-primary:${s.onPrimary};--brand-primary:${s.primary};--brand-accent:${s.secondary};--brand-surface:${s.surface};--brand-on-primary:${s.onPrimary}}`,
    });
  }
  if (variant === "long") {
    await page.evaluate((name) => {
      const h1 = document.querySelector("h1");
      if (h1 && document.querySelector("main")?.contains(h1) && h1.closest("section")) h1.textContent = name;
    }, LONG_NAME);
  }
  await page.evaluate(() => document.fonts.ready);
}
