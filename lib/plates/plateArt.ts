// Per-state blank plate template art. Only states with a template here get
// the mockup treatment on the results page — everything else falls back to
// the plain plate-text card, same as before. `textBox` is a percentage-based
// bounding box (of the image's own pixel dimensions) the plate string is
// centered inside; picked by eye against each template's actual blank area,
// not measured programmatically, so treat these as a first pass to refine
// against the real render.
export type PlateArtConfig = {
  image: string;
  width: number;
  height: number;
  textBox: { top: number; left: number; width: number; height: number };
  font: "serif" | "elegantSerif" | "blackSans";
  color: string;
  italic?: boolean;
};

export const PLATE_ART: Record<string, PlateArtConfig> = {
  TN: {
    image: "/plates/TN.png",
    width: 2172,
    height: 724,
    textBox: { top: 26, left: 5, width: 90, height: 46 },
    font: "serif",
    color: "#1b3a6b",
  },
  KS: {
    image: "/plates/KS.png",
    width: 2172,
    height: 724,
    textBox: { top: 30, left: 5, width: 90, height: 40 },
    font: "serif",
    color: "#1a2f5c",
  },
  ND: {
    image: "/plates/ND.png",
    width: 2172,
    height: 724,
    textBox: { top: 26, left: 5, width: 90, height: 52 },
    font: "serif",
    color: "#161616",
  },
  WV: {
    image: "/plates/WV.png",
    width: 2172,
    height: 724,
    textBox: { top: 24, left: 5, width: 90, height: 50 },
    font: "elegantSerif",
    color: "#f2a833",
  },
  ME: {
    image: "/plates/ME.png",
    width: 2172,
    height: 724,
    textBox: { top: 22, left: 13, width: 74, height: 50 },
    font: "serif",
    color: "#1a2f52",
  },
  ID: {
    image: "/plates/ID.png",
    width: 1774,
    height: 887,
    textBox: { top: 30, left: 8, width: 84, height: 24 },
    font: "elegantSerif",
    color: "#8b1c2b",
  },
  NV: {
    image: "/plates/NV.png",
    width: 1774,
    height: 887,
    textBox: { top: 25, left: 8, width: 84, height: 38 },
    font: "blackSans",
    color: "#111111",
  },
  WI: {
    image: "/plates/WI.png",
    width: 1774,
    height: 887,
    textBox: { top: 26, left: 8, width: 84, height: 46 },
    font: "blackSans",
    color: "#c41230",
    italic: true,
  },
  // Florida's blank space is a thin strip above the orange-branch graphic,
  // not the usual open middle — everything else here has more room.
  FL: {
    image: "/plates/FL.png",
    width: 2172,
    height: 724,
    textBox: { top: 18, left: 5, width: 90, height: 12 },
    font: "serif",
    color: "#1f5c3d",
  },
  IL: {
    image: "/plates/IL.png",
    width: 2172,
    height: 724,
    textBox: { top: 24, left: 8, width: 84, height: 32 },
    font: "serif",
    color: "#111111",
  },
  // Pelican sits bottom-right, "Sportsman's Paradise" bottom-left — text
  // box is narrower and left-biased to clear both.
  LA: {
    image: "/plates/LA.png",
    width: 2172,
    height: 724,
    textBox: { top: 30, left: 8, width: 50, height: 42 },
    font: "serif",
    color: "#c8102e",
  },
  // Small Texas-outline icon sits dead center — text box is a short strip
  // above it, under the "TEXAS" header, rather than the full-height box
  // every other state gets.
  TX: {
    image: "/plates/TX.png",
    width: 2172,
    height: 724,
    textBox: { top: 20, left: 5, width: 90, height: 15 },
    font: "blackSans",
    color: "#111111",
  },
  VA: {
    image: "/plates/VA.png",
    width: 2172,
    height: 724,
    textBox: { top: 24, left: 8, width: 84, height: 46 },
    font: "serif",
    color: "#1a3a8f",
  },
};
