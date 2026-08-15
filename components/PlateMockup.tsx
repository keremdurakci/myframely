import Image from "next/image";
import { Merriweather, Playfair_Display, Archivo_Black } from "next/font/google";
import { PLATE_ART, type PlateArtConfig } from "@/lib/plates/plateArt";

const merriweather = Merriweather({ subsets: ["latin"], weight: ["700", "900"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700", "800"] });
const archivoBlack = Archivo_Black({ subsets: ["latin"], weight: ["400"] });

function fontClassName(font: PlateArtConfig["font"]): string {
  if (font === "elegantSerif") return playfair.className;
  if (font === "blackSans") return archivoBlack.className;
  return merriweather.className;
}

// Rough average glyph width per font family, in em — used only to pick a
// font-size that keeps a plate string from overflowing its text box. Not
// real font metrics, just enough to make "KRM" render bigger than
// "KEREM82" the way a real plate press would size to fit.
function approxCharWidthEm(font: PlateArtConfig["font"]): number {
  return font === "blackSans" ? 0.62 : 0.58;
}

export default function PlateMockup({ stateCode, plate }: { stateCode: string; plate: string }) {
  const art = PLATE_ART[stateCode];
  if (!art) return null;

  // Two independent caps, smaller one wins: cqw so a short plate ("KRM")
  // doesn't stay tiny in a wide box, cqh so a short plate in a *short* box
  // doesn't blow past its height — a fixed cqw alone did exactly that (a
  // 5-character plate sized to 30cqw came out taller than its own text box).
  const fontSizeCqw = Math.min(32, Math.max(9, 92 / (plate.length * approxCharWidthEm(art.font))));
  const fontSizeCqh = 62;

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg bg-black/10"
      style={{ aspectRatio: `${art.width} / ${art.height}` }}
    >
      <Image
        src={art.image}
        alt={`Blank ${stateCode} license plate`}
        fill
        sizes="(max-width: 640px) 100vw, 420px"
        className="object-contain"
        priority={false}
      />
      <div
        className="absolute"
        style={{
          top: `${art.textBox.top}%`,
          left: `${art.textBox.left}%`,
          width: `${art.textBox.width}%`,
          height: `${art.textBox.height}%`,
          containerType: "size",
        }}
      >
        <div
          className={`flex h-full w-full items-center justify-center ${fontClassName(art.font)}`}
          style={{
            color: art.color,
            fontSize: `min(${fontSizeCqw}cqw, ${fontSizeCqh}cqh)`,
            fontStyle: art.italic ? "italic" : "normal",
            letterSpacing: "0.03em",
            lineHeight: 1,
            whiteSpace: "nowrap",
            textShadow: "0 1px 0 rgba(255,255,255,0.35), 0 -1px 1px rgba(0,0,0,0.25)",
          }}
        >
          {plate}
        </div>
      </div>
    </div>
  );
}
