// Tavi's bench seen from above: the tools a service needs, laid out on the mat, as one typed table. Units are
// millimetres on the bench, and the drawing's viewBox is the mat, so every tool is drawn at its own size beside the
// movement, which sits in its holder at the NH35's 27.4 mm. svg.ts draws the table; bench.test.ts checks that every
// tool lies on the mat and none lies on another.

import { DEG, type Pt } from "../movement/geometry.ts";
import { MOVEMENT } from "../movement/parts.ts";

/**
 * A tool's flat material. The metals are the movement's own pairs (the holder's chrome takes the bridges' pair); the
 * plastics, the screwdrivers' and the oiler's colour-coded caps and the loupe's body, are the tools' own tokens.
 */
export type ToolMaterial = "steel" | "chrome" | "brass" | "black" | "yellow" | "red" | "grey" | "violet";

export type ToolId = "holder" | "loupe" | "screwdrivers" | "tweezers" | "brass-tweezers" | "oiler" | "oil-cup";

/** Which builder draws the tool. */
type ToolShape = "holder" | "loupe" | "screwdrivers" | "tweezers" | "oiler" | "oil-cup";

export interface Tool {
  readonly id: ToolId;
  /** Its name, as a screen reader says it. */
  readonly label: string;
  readonly shape: ToolShape;
  /** The footprint's centre on the mat, in millimetres. */
  readonly at: Pt;
  /** The footprint before it turns: `w` across, `h` down, in millimetres. The builder draws inside it. */
  readonly size: { readonly w: number; readonly h: number };
  /** Degrees, clockwise, about `at`. */
  readonly angle: number;
  /** The material most of the tool is made of. */
  readonly material: ToolMaterial;
  /** The text shade its name takes in the prose: a metal's, or none for the page's ink. */
  readonly ink: "steel" | "brass" | null;
  /** The chapter's steps that keep it in colour. Step 1 shows the whole bench, so every tool is in it. */
  readonly steps: readonly number[];
}

/** The mat, the drawing's whole frame. */
export const MAT = { w: 240, h: 164 } as const;

/** The NH35's diameter, 27.4 mm (Seiko Instruments' specification sheet). */
export const MOVEMENT_DIAMETER = 27.4;

/** Millimetres per unit of the part table, so the movement in the holder is its real size on the bench. */
export const MOVEMENT_SCALE = MOVEMENT_DIAMETER / (2 * MOVEMENT.plate.R);

/** The movements a Bergeon 4040 holder grips, in millimetres across: 8¾ to 19 lignes. */
export const HOLDER_RANGE = [20, 43] as const;

/** Bergeon's 30081 set of five, smallest first: each blade's width in millimetres and the colour of its cap. */
export const SCREWDRIVERS = [
  { blade: 0.8, cap: "yellow" },
  { blade: 1, cap: "black" },
  { blade: 1.2, cap: "red" },
  { blade: 1.4, cap: "grey" },
  { blade: 1.6, cap: "violet" },
] as const satisfies readonly { blade: number; cap: ToolMaterial }[];

/** Bergeon's 7013-R dip oiler: a 0.18 mm tip, the finest of the 7013 set, its handle coded red. */
export const OILER = { tip: 0.18, cap: "red" } as const satisfies { tip: number; cap: ToolMaterial };

export const TOOLS: readonly Tool[] = [
  {
    id: "screwdrivers",
    label: "Five screwdrivers",
    shape: "screwdrivers",
    at: [40, 60],
    size: { w: 57, h: 96 },
    angle: -2,
    material: "steel",
    ink: "steel",
    steps: [1, 4],
  },
  {
    id: "holder",
    label: "Movement holder",
    shape: "holder",
    at: [124, 66],
    size: { w: 72, h: 52 },
    angle: 0,
    material: "chrome",
    ink: "steel",
    steps: [1, 2, 3],
  },
  {
    id: "oil-cup",
    label: "Oil cup",
    shape: "oil-cup",
    at: [214, 80],
    size: { w: 22, h: 22 },
    angle: 0,
    material: "chrome",
    ink: "steel",
    steps: [1, 6],
  },
  {
    id: "oiler",
    label: "Oiler",
    shape: "oiler",
    at: [184, 106],
    size: { w: 98, h: 8 },
    angle: -4,
    material: "steel",
    ink: "steel",
    steps: [1, 6],
  },
  {
    id: "tweezers",
    label: "Steel tweezers",
    shape: "tweezers",
    at: [100, 127],
    size: { w: 110, h: 10 },
    angle: 2,
    material: "steel",
    ink: "steel",
    steps: [1, 5],
  },
  {
    id: "brass-tweezers",
    label: "Brass tweezers",
    shape: "tweezers",
    at: [124, 148],
    size: { w: 120, h: 10 },
    angle: -1,
    material: "brass",
    ink: "brass",
    steps: [1, 5],
  },
  {
    id: "loupe",
    label: "Loupe",
    shape: "loupe",
    at: [198, 36],
    size: { w: 33, h: 33 },
    angle: 0,
    material: "black",
    ink: null,
    steps: [1, 3],
  },
];

/** A tool by its id. */
export function toolOf(id: ToolId): Tool {
  const tool = TOOLS.find((t) => t.id === id);
  if (!tool) throw new Error(`no tool ${id}`);
  return tool;
}

/** A point of a tool's own frame, placed on the mat: turned by its angle about its centre. */
function onMat(tool: Tool, [x, y]: Pt): Pt {
  const a = tool.angle * DEG;
  return [tool.at[0] + x * Math.cos(a) - y * Math.sin(a), tool.at[1] + x * Math.sin(a) + y * Math.cos(a)];
}

/** The footprint's four corners on the mat, clockwise from the top left. */
export function corners(tool: Tool): readonly Pt[] {
  const { w, h } = tool.size;
  return (
    [
      [-w / 2, -h / 2],
      [w / 2, -h / 2],
      [w / 2, h / 2],
      [-w / 2, h / 2],
    ] as const
  ).map((p) => onMat(tool, p));
}

/** The holder's centre is the movement's; this is where its balance sits on the mat, the crown turned to the top. */
export function balanceOnMat(): Pt {
  const holder = toolOf("holder");
  const [x, y] = MOVEMENT.balance.at;
  // Turned a quarter clockwise, so the crown points up between the holder's rails.
  return onMat(holder, [-y * MOVEMENT_SCALE, x * MOVEMENT_SCALE]);
}

/** Step 3's move: the loupe slides from its place on the mat until its lens is over the movement's balance. */
export function loupeSlide(): Pt {
  const loupe = toolOf("loupe");
  const [bx, by] = balanceOnMat();
  return [bx - loupe.at[0], by - loupe.at[1]];
}
