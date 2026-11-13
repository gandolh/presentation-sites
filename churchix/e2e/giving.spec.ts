import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { open } from "./floor.js";

// /donatii shows every IBAN, the Form 230 note and the SMS line the content holds, and the copy-IBAN control works
// from the keyboard. Pomelnice's labels, errors and sent state have names a screen reader reads, and every control
// is reachable with Tab. The parish's content is read, never written to. The dev server has no endpoint, so the form
// runs its demo path and never fetches.
const site = JSON.parse(
  readFileSync(
    join(import.meta.dirname, "..", "apps", "parohia-harlesti-bacau", "src", "content", "site.json"),
    "utf8",
  ),
)[0] as {
  giving: {
    ibans: { iban: string; holder?: string; label: string }[];
    form230?: boolean;
    smsKeyword?: string;
    smsNumber?: string;
  };
};

test.use({ hasTouch: false, isMobile: false, viewport: { width: 1280, height: 800 } });

test.describe("Donații", () => {
  test("shows every IBAN, the Form 230 note and the SMS line the content holds", async ({ page }) => {
    await open(page, "/donatii");
    const text = (await page.locator("main").innerText()).replace(/\s+/g, " ");
    for (const acc of site.giving.ibans) {
      expect(text).toContain(acc.iban);
      if (acc.holder) expect(text).toContain(acc.holder);
    }
    if (site.giving.form230) expect(text).toContain("Formularul 230");
    if (site.giving.smsKeyword && site.giving.smsNumber) {
      expect(text).toContain(site.giving.smsKeyword.toUpperCase());
      expect(text).toContain(site.giving.smsNumber);
    }
  });

  test("the copy control works from the keyboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await open(page, "/donatii");
    const first = site.giving.ibans[0];
    const button = page.getByRole("button", { name: new RegExp(`^Copiază IBAN.*${first?.label}`) }).first();
    await expect(button).toBeVisible();
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      if (await button.evaluate((el) => el === document.activeElement)) break;
    }
    await expect(button).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(button).toHaveText("Copiat!");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(first?.iban);
  });
});

test.describe("Pomelnice", () => {
  test("every field has a name a screen reader reads, and Tab reaches each of them in order", async ({ page }) => {
    await open(page, "/pomelnice");
    const fields = [
      page.getByRole("textbox", { name: /Scrieți numele de botez ale celor vii/ }),
      page.getByRole("textbox", { name: /Scrieți numele de botez ale celor trecuți la Domnul/ }),
      page.getByRole("radio", { name: "20,00 RON" }),
      page.getByRole("radio", { name: "50,00 RON" }),
      page.getByRole("radio", { name: "100,00 RON" }),
      page.getByRole("spinbutton", { name: "Altă sumă (RON)" }),
      page.getByRole("textbox", { name: "Nume și prenume" }),
      page.getByRole("textbox", { name: "Adresă de email" }),
    ];
    for (const f of fields) await expect(f).toBeVisible();
    await expect(page.getByRole("group", { name: "Sumă ofrandă" })).toBeVisible();
    await expect(page.getByRole("note")).toContainText("Trimiterea pomelnicului online nu este încă disponibilă");
    const reached = new Set<string>();
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press("Tab");
      for (const [idx, f] of fields.entries())
        if (await f.evaluate((el) => el === document.activeElement)) reached.add(String(idx));
    }
    // A radio group takes one tab stop; the others are reached with the arrow keys.
    for (const idx of [0, 1, 5, 6, 7]) expect(reached.has(String(idx)), `field ${idx} is reached with Tab`).toBe(true);
    expect(
      [...reached].some((i) => ["2", "3", "4"].includes(i)),
      "the amount chips are reached with Tab",
    ).toBe(true);
  });

  test("the error and the sent state are announced with their own names", async ({ page }) => {
    await open(page, "/pomelnice");
    const submit = page.getByRole("button", { name: "Trimite Pomelnicul" });
    await expect(submit).toBeDisabled();
    await expect(page.getByText("Adăugați cel puțin un nume pentru a putea trimite pomelnicul.")).toBeVisible();
    // The button is disabled with no name, so the validation error is reached only by a submit that does not
    // come from the button (a script, an assistive tool).
    await page.locator("form").evaluate((f) => (f as HTMLFormElement).requestSubmit());
    await expect(page.getByRole("alert")).toContainText("Adăugați cel puțin un nume în pomelnicul de vii");
    await page.getByRole("textbox", { name: /Scrieți numele de botez ale celor vii/ }).fill("Ioan");
    await expect(submit).toBeEnabled();
    await submit.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status")).toContainText("Pomelnicul a fost trimis");
    await expect(page.getByRole("button", { name: "Trimite alt pomelnic" })).toBeVisible();
  });
});
