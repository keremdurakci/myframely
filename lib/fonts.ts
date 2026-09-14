import { Bebas_Neue, JetBrains_Mono, Cinzel, Inter } from "next/font/google";

// Design system: the site treats every surface like a piece of the product
// itself — a plate. Bebas Neue is a condensed, all-caps grotesk that reads
// like embossed plate lettering, used for headlines. JetBrains Mono stands
// in for the stamped character set on a real plate, used for small labels,
// tags, and FAQ numbering. Cinzel is kept only for the emblem/crest touches
// that echo the winged logo mark. Inter remains the body workhorse.
export const display = Bebas_Neue({ subsets: ["latin"], weight: "400" });
export const plateMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });
export const emblem = Cinzel({ subsets: ["latin"], weight: ["500", "600", "700"] });
export const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
