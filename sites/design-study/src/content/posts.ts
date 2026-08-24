// The shared root data. Every one of the 14 themes renders exactly this — the
// same twelve posts, the same words, the same photographs. Nothing here knows
// which theme is asking.
//
// The body is a list of *blocks*, not a markdown string, and that is the whole
// point: full per-theme rendering means Brutalism can slam a pull-quote across
// the full bleed while Ethereal lets the same quote float in thin serif. A
// pre-rendered HTML string would make that impossible.
//
// Images are logical names resolved through `images.ts` (the repo's standard
// mock/real pipeline), and they are drawn from one shared pool so the same
// photograph appears in several themes and can be compared directly.

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "list"; items: string[] }
  | { type: "aside"; text: string };

/** Instagram post ratios. `4:5` is the portrait default; `1:1` is the square. */
export type Ratio = "4:5" | "1:1";

export type Post = {
  slug: string;
  title: string;
  /** The standfirst. One sentence, used on the feed card and under the title. */
  dek: string;
  /** ISO date — themes format it however they like. */
  date: string;
  author: string;
  tags: string[];
  /** Logical image names for the carousel, in order. Three to five each. */
  images: string[];
  ratio: Ratio;
  body: Block[];
};

export const posts: Post[] = [
  {
    slug: "the-weight-of-a-handle",
    title: "The weight of a handle",
    dek: "A door tells you how to open it before your hand arrives. Most doors lie.",
    date: "2026-08-14",
    author: "Ilinca Mureșan",
    tags: ["objects", "affordance"],
    images: ["photo-01", "photo-02", "photo-03", "photo-04"],
    ratio: "4:5",
    body: [
      {
        type: "p",
        text: "We spent a morning in the workshop weighing handles. Not measuring them — weighing them, in the hand, one after another, until the differences stopped being numbers and started being opinions.",
      },
      {
        type: "p",
        text: "A handle at ninety grams asks to be pulled. The same shape at two hundred and forty insists on it. Nothing about the geometry changed; the instruction did.",
      },
      { type: "h2", text: "What the hand reads first" },
      {
        type: "list",
        items: [
          "Temperature — brass answers the room, oak does not",
          "The radius where the palm lands, which forgives more than the length does",
          "Whether the fixing is visible, and what that admits about the maker",
        ],
      },
      {
        type: "quote",
        text: "A good handle is a sentence with no adjectives in it.",
        cite: "Notebook, undated",
      },
      {
        type: "p",
        text: "The prototypes that failed all failed the same way: they were beautiful sitting still and ambiguous in motion. You reached, and the object had no view about what you should do next.",
      },
    ],
  },
  {
    slug: "twelve-greys-and-an-argument",
    title: "Twelve greys and an argument",
    dek: "Mixing a neutral is easy. Mixing a neutral that stays neutral under three lights is not.",
    date: "2026-08-06",
    author: "Ilinca Mureșan",
    tags: ["colour", "process"],
    images: ["photo-05", "photo-06", "photo-07"],
    ratio: "1:1",
    body: [
      {
        type: "p",
        text: "Every grey we mixed looked correct on the bench. Carried to the window, four of them turned green. Carried back under the tungsten, two of the survivors turned pink.",
      },
      {
        type: "aside",
        text: "The bench lamp was 4000K, the window was overcast north light, and the tungsten was whatever had been in the fitting since before we moved in.",
      },
      {
        type: "p",
        text: "The lesson was not about pigment. It was that a decision made under one condition is a guess about every other condition, and we had been calling those guesses judgements.",
      },
      {
        type: "quote",
        text: "Neutral is not a colour. It is a claim about the room.",
      },
    ],
  },
  {
    slug: "against-the-perfect-edge",
    title: "Against the perfect edge",
    dek: "The machine can hold a tolerance the eye cannot see. We kept paying for it anyway.",
    date: "2026-07-29",
    author: "Tudor Albescu",
    tags: ["making", "tolerance"],
    images: ["photo-08", "photo-09", "photo-10", "photo-11", "photo-12"],
    ratio: "4:5",
    body: [
      {
        type: "p",
        text: "Two shelves, identical drawings. One cut to a tenth of a millimetre, one cut by a person who had done it four hundred times and stopped measuring somewhere around the ninetieth.",
      },
      { type: "h2", text: "Nobody could tell" },
      {
        type: "p",
        text: "We put both in the corridor for a fortnight and asked everyone who walked past. Eleven people guessed. Five were right, which is the number you get from guessing.",
      },
      {
        type: "list",
        items: [
          "The machined edge cost four times as much",
          "The hand-cut edge took eleven minutes longer",
          "Only one of them had a story anyone wanted to hear",
        ],
      },
      {
        type: "p",
        text: "We kept the tolerance where it does work — the joints, the runners, anywhere two parts have to agree. We dropped it everywhere the only audience was the drawing.",
      },
    ],
  },
  {
    slug: "a-room-that-hears-itself",
    title: "A room that hears itself",
    dek: "Acoustic treatment as a visual problem, solved badly for a year and then properly in a weekend.",
    date: "2026-07-18",
    author: "Tudor Albescu",
    tags: ["space", "sound"],
    images: ["photo-13", "photo-14", "photo-15"],
    ratio: "4:5",
    body: [
      {
        type: "p",
        text: "The studio had a slap echo you could clap into and count. For a year we hung things on the wall that looked like they should help and did not.",
      },
      {
        type: "quote",
        text: "Everything we hung was chosen by eye and judged by ear. That mismatch was the whole problem.",
      },
      {
        type: "p",
        text: "What fixed it was cheap, ugly, and behind a curtain: mineral wool in the two corners, a rug with an underlay, and a bookshelf turned ninety degrees so the spines faced the room.",
      },
      {
        type: "aside",
        text: "The bookshelf is a diffuser. It has always been a diffuser. We had simply never let it face the right way.",
      },
    ],
  },
  {
    slug: "notes-on-a-failed-catalogue",
    title: "Notes on a failed catalogue",
    dek: "We printed two thousand of them. The grid was fine. The reading order was not.",
    date: "2026-07-09",
    author: "Ilinca Mureșan",
    tags: ["print", "hierarchy"],
    images: ["photo-16", "photo-17", "photo-18", "photo-01"],
    ratio: "1:1",
    body: [
      {
        type: "p",
        text: "Twelve columns, a baseline grid, generous margins, a type scale we had argued over for a week. Every page passed inspection. The object failed.",
      },
      { type: "h2", text: "Where it broke" },
      {
        type: "p",
        text: "Readers opened at the middle, as everyone does with a catalogue, and found no way to work out where they were. The grid told them how things aligned. It said nothing about what mattered.",
      },
      {
        type: "list",
        items: [
          "No running head, because it spoiled the spread",
          "Section openers set at the same weight as the entries",
          "Page numbers in a grey that lost to the paper stock",
        ],
      },
      {
        type: "quote",
        text: "Alignment is not hierarchy. We spent the week on the wrong noun.",
      },
    ],
  },
  {
    slug: "the-drawer-that-taught-us-friction",
    title: "The drawer that taught us friction",
    dek: "Resistance is information. Removing all of it makes an object feel broken.",
    date: "2026-06-30",
    author: "Tudor Albescu",
    tags: ["objects", "feedback"],
    images: ["photo-02", "photo-05", "photo-09"],
    ratio: "4:5",
    body: [
      {
        type: "p",
        text: "We fitted the cabinet with the smoothest runners we could find. The drawer now travels its full length from a fingertip and stops with a soft-close nobody asked for.",
      },
      {
        type: "p",
        text: "Everyone who used it pulled too hard. Every single one. The absence of resistance read as an absence of the drawer.",
      },
      {
        type: "quote",
        text: "The friction was never a defect. It was the drawer telling you how far it had gone.",
      },
      {
        type: "p",
        text: "We put a felt pad at three quarters travel. It adds nothing mechanically. It gives the hand a landmark, and the complaints stopped that afternoon.",
      },
    ],
  },
  {
    slug: "borrowed-light",
    title: "Borrowed light",
    dek: "A north window, a white wall, and four weeks of photographing the same object to find out which was doing the work.",
    date: "2026-06-21",
    author: "Ilinca Mureșan",
    tags: ["light", "photography"],
    images: ["photo-03", "photo-07", "photo-11", "photo-14"],
    ratio: "4:5",
    body: [
      {
        type: "p",
        text: "Same bowl, same position, same lens, one frame a day at eleven in the morning. Twenty-eight frames. The only variable we did not control was the sky.",
      },
      {
        type: "aside",
        text: "Frame nineteen is the one everybody picks. It was taken on the flattest, most featureless overcast day of the month.",
      },
      {
        type: "p",
        text: "Hard light described the glaze. Soft light described the form. We had been asking for drama and then wondering why the shape kept disappearing.",
      },
      { type: "h2", text: "What we kept" },
      {
        type: "list",
        items: [
          "The wall, repainted a half-tone warmer",
          "One bounce card, always camera-left",
          "The rule that nothing gets shot after two in the afternoon",
        ],
      },
    ],
  },
  {
    slug: "an-inventory-of-almosts",
    title: "An inventory of almosts",
    dek: "Everything on the reject shelf, photographed and catalogued, because throwing it out would waste the lesson.",
    date: "2026-06-11",
    author: "Tudor Albescu",
    tags: ["process", "archive"],
    images: ["photo-04", "photo-08", "photo-12", "photo-16", "photo-18"],
    ratio: "1:1",
    body: [
      {
        type: "p",
        text: "Forty-one objects that did not make it. Not failures exactly — most of them work. They simply lost to a later version, and then sat on a shelf collecting the kind of dust that makes a decision look inevitable.",
      },
      {
        type: "quote",
        text: "The shelf is the only honest record of how the good ones happened.",
      },
      {
        type: "p",
        text: "Photographing them in order made something obvious that a year of working had hidden: we solve the same problem three times before we notice it is the same problem.",
      },
    ],
  },
  {
    slug: "the-cost-of-a-radius",
    title: "The cost of a radius",
    dek: "Two millimetres of corner, multiplied by every edge in the range, is a different business.",
    date: "2026-05-30",
    author: "Ilinca Mureșan",
    tags: ["making", "detail"],
    images: ["photo-06", "photo-10", "photo-15"],
    ratio: "4:5",
    body: [
      {
        type: "p",
        text: "A softened corner is the cheapest way to make an object look considered and the most expensive way to make a hundred of them.",
      },
      {
        type: "list",
        items: [
          "One extra pass on every edge",
          "A jig that only exists because of the radius",
          "Sanding that can no longer be done flat",
        ],
      },
      {
        type: "p",
        text: "We kept it. Not because the sums worked, but because the sharp version was the only one anybody put down carefully.",
      },
    ],
  },
  {
    slug: "reading-a-surface",
    title: "Reading a surface",
    dek: "Matte, satin, gloss — and the discovery that nobody in the room used the words the same way.",
    date: "2026-05-19",
    author: "Tudor Albescu",
    tags: ["material", "language"],
    images: ["photo-09", "photo-13", "photo-17", "photo-02"],
    ratio: "1:1",
    body: [
      {
        type: "p",
        text: "We asked six people to sort eleven samples from least to most reflective. No two orderings matched, and two were exact reverses of each other.",
      },
      { type: "h2", text: "The vocabulary problem" },
      {
        type: "p",
        text: "Half the room was sorting by how much light bounced. The other half was sorting by how much the surface hid a fingerprint. Both called it gloss.",
      },
      {
        type: "quote",
        text: "You cannot specify a finish in a language the workshop and the client do not share.",
      },
      {
        type: "aside",
        text: "The fix was a physical card with the eleven samples on it, numbered. Nobody has argued about finish since.",
      },
    ],
  },
  {
    slug: "what-the-offcuts-know",
    title: "What the offcuts know",
    dek: "A year of scrap, sorted by species and thickness, turned out to be a map of every mistake we make.",
    date: "2026-05-07",
    author: "Ilinca Mureșan",
    tags: ["material", "waste"],
    images: ["photo-11", "photo-16", "photo-05"],
    ratio: "4:5",
    body: [
      {
        type: "p",
        text: "We tipped the bin out on the floor and sorted it. Oak in one pile, ash in another, and a third pile of pieces too small to be anything, which was the largest by a distance.",
      },
      {
        type: "p",
        text: "The small pile is where the cutting list was wrong. Not wasteful — wrong. Every one of those pieces is the remainder of a dimension chosen before the sheet size was checked.",
      },
      {
        type: "quote",
        text: "Waste is rarely carelessness. It is usually a decision made in the wrong order.",
      },
    ],
  },
  {
    slug: "the-last-ten-percent",
    title: "The last ten percent",
    dek: "Finishing takes as long as everything before it, and it is the only part anybody touches.",
    date: "2026-04-24",
    author: "Tudor Albescu",
    tags: ["process", "finish"],
    images: ["photo-01", "photo-07", "photo-12", "photo-18"],
    ratio: "4:5",
    body: [
      {
        type: "p",
        text: "Design, joinery, assembly: three weeks. Sanding, sealing, waxing, and the four days of waiting between them: three weeks.",
      },
      {
        type: "aside",
        text: "We have never once quoted the second three weeks accurately.",
      },
      { type: "h2", text: "Why it resists estimation" },
      {
        type: "list",
        items: [
          "The work is judged by hand, so it ends when it feels finished",
          "Every coat reveals something the previous coat was hiding",
          "Drying time is not work, but it is calendar",
        ],
      },
      {
        type: "p",
        text: "The structure is what we are proud of. The surface is what the object actually is, to everyone who is not us.",
      },
    ],
  },
];

/** The shared image pool, in the order the placeholder generator emits it. */
export const IMAGE_POOL = Array.from(
  { length: 18 },
  (_, i) => `photo-${String(i + 1).padStart(2, "0")}`,
);

export const postBySlug = new Map<string, Post>(posts.map((p) => [p.slug, p]));

/** How many posts a feed shows per page before the pager takes over. */
export const POSTS_PER_PAGE = 4;
