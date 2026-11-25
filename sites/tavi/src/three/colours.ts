// The parts' colours, read from the stylesheet, so the 3D movement wears the drawing's metals: each token is painted on
// a 1×1 canvas and read back as sRGB, which turns any CSS colour (the tokens are oklch) into what WebGL takes. No
// colour is written in code; a token changed in the stylesheet changes both renderers.

import { Color, SRGBColorSpace } from "three";

/** A part's flat fill and its same-hue line, and the walls between them that a tilted view shows. */
export interface Paint {
  readonly fill: Color;
  readonly line: Color;
  readonly side: Color;
}

/** The token pairs the scene paints with: `--color-part-<fill>` and `--color-part-<line>`. */
const PAIRS = {
  plate: ["plate", "plate-line"],
  bridge: ["bridge", "bridge-line"],
  brass: ["brass", "brass-line"],
  drum: ["brass-deep", "brass-line"],
  gilt: ["gilt", "gilt-line"],
  steel: ["steel", "steel-line"],
  spring: ["spring", "spring-line"],
  balance: ["balance", "balance-line"],
  hair: ["hair", "hair"],
  screw: ["screw", "screw-line"],
  slot: ["screw-slot", "screw-line"],
  ruby: ["ruby", "ruby-line"],
  glint: ["ruby-glint", "ruby-line"],
  chaton: ["chaton", "ruby-line"],
} as const;

export type PaintName = keyof typeof PAIRS;
export type Palette = Readonly<Record<PaintName, Paint>>;

/** How far a wall's colour sits from its fill towards its line: the prototype's. */
const SIDE = 0.42;

/** Reads every part token from the page's stylesheet. */
export function readPalette(root: Element = document.documentElement): Palette {
  const css = getComputedStyle(root);
  const probe = document.createElement("canvas");
  probe.width = 1;
  probe.height = 1;
  const px = probe.getContext("2d", { willReadFrequently: true });
  const token = (name: string): Color => {
    const colour = new Color();
    if (!px) return colour;
    px.clearRect(0, 0, 1, 1);
    // An unreadable token leaves the probe's last valid colour: start from a known one.
    px.fillStyle = "#000";
    px.fillStyle = css.getPropertyValue(`--color-part-${name}`).trim();
    px.fillRect(0, 0, 1, 1);
    const [r = 0, g = 0, b = 0] = px.getImageData(0, 0, 1, 1).data;
    return colour.setRGB(r / 255, g / 255, b / 255, SRGBColorSpace);
  };
  const entries = Object.entries(PAIRS).map(([key, [fill, line]]) => {
    const f = token(fill);
    const l = token(line);
    return [key, { fill: f, line: l, side: f.clone().lerp(l, SIDE) }] as const;
  });
  return Object.fromEntries(entries) as Record<PaintName, Paint>;
}
