import { cn } from "@/lib/utils";

type CollageTile = {
  id: string;
  colSpan: 1 | 2;
  rowSpan: 1 | 2;
  category: string;
  rounded?: "xl" | "2xl";
  offset?: string;
  minBreakpoint?: "md" | "lg" | "xl";
};

const COLLAGE_TILES: CollageTile[] = [
  { id: "1581594693702-fbdc51b2763b", colSpan: 2, rowSpan: 2, category: "doctors", rounded: "2xl" },
  {
    id: "1576091160399-11c7aa403805",
    colSpan: 1,
    rowSpan: 1,
    category: "nurses",
    rounded: "xl",
    offset: "translate-y-1",
  },
  {
    id: "1551076805-e1869033e561",
    colSpan: 1,
    rowSpan: 2,
    category: "medical-tech",
    rounded: "2xl",
  },
  {
    id: "1516549655169-df83a0774514",
    colSpan: 1,
    rowSpan: 1,
    category: "diagnostics",
    rounded: "xl",
  },
  {
    id: "1538108149393-fbbd81895907",
    colSpan: 1,
    rowSpan: 1,
    category: "patients",
    rounded: "xl",
    offset: "-translate-x-0.5",
  },
  {
    id: "1519494026892-80bbd2d6fd0d",
    colSpan: 2,
    rowSpan: 1,
    category: "hospitals",
    rounded: "2xl",
  },
  {
    id: "1584362917165-526a968579e8",
    colSpan: 1,
    rowSpan: 1,
    category: "collaboration",
    rounded: "xl",
  },
  {
    id: "1631815589968-fdb09a223b1e",
    colSpan: 1,
    rowSpan: 2,
    category: "telemedicine",
    rounded: "2xl",
    offset: "translate-y-2",
  },
  { id: "1579684385127-1ef15d508118", colSpan: 1, rowSpan: 1, category: "wellness", rounded: "xl" },
  { id: "1559757175-0fca8933d7da", colSpan: 1, rowSpan: 1, category: "doctors", rounded: "xl" },
  {
    id: "1582757142636-9ad61e340554",
    colSpan: 2,
    rowSpan: 1,
    category: "hospitals",
    rounded: "2xl",
  },
  {
    id: "1512678086850-d5634dd95bbf",
    colSpan: 1,
    rowSpan: 1,
    category: "medical-tech",
    rounded: "xl",
    offset: "translate-x-1",
  },
  { id: "1505750592870-f989a9299692", colSpan: 1, rowSpan: 1, category: "wellness", rounded: "xl" },
  {
    id: "1530497613843007-9d1e79c0db7f",
    colSpan: 1,
    rowSpan: 2,
    category: "patients",
    rounded: "2xl",
  },
  {
    id: "1573496359142-b8d87734a5a2",
    colSpan: 1,
    rowSpan: 1,
    category: "doctors",
    rounded: "xl",
    minBreakpoint: "md",
  },
  {
    id: "1612349317150-e413f6e5113a",
    colSpan: 2,
    rowSpan: 2,
    category: "collaboration",
    rounded: "2xl",
    minBreakpoint: "md",
  },
  {
    id: "1584829400739-a87500372c63",
    colSpan: 1,
    rowSpan: 1,
    category: "nurses",
    rounded: "xl",
    minBreakpoint: "md",
  },
  {
    id: "1622253692010-333ef2c6fa1a",
    colSpan: 1,
    rowSpan: 1,
    category: "telemedicine",
    rounded: "xl",
    minBreakpoint: "md",
  },
  {
    id: "1584034174-dc4cf2ad2f68",
    colSpan: 1,
    rowSpan: 2,
    category: "diagnostics",
    rounded: "2xl",
    minBreakpoint: "lg",
  },
  {
    id: "1666218861-c99835260065",
    colSpan: 1,
    rowSpan: 1,
    category: "medical-tech",
    rounded: "xl",
    minBreakpoint: "lg",
  },
  {
    id: "1576091160550-2173d9609a6b",
    colSpan: 2,
    rowSpan: 1,
    category: "hospitals",
    rounded: "2xl",
    minBreakpoint: "lg",
  },
  {
    id: "1579167533344-599f300f4deb",
    colSpan: 1,
    rowSpan: 1,
    category: "wellness",
    rounded: "xl",
    minBreakpoint: "lg",
    offset: "-translate-y-1",
  },
  {
    id: "1581594693702-fbdc51b2763b",
    colSpan: 1,
    rowSpan: 1,
    category: "doctors",
    rounded: "xl",
    minBreakpoint: "md",
  },
  {
    id: "1551076805-e1869033e561",
    colSpan: 2,
    rowSpan: 1,
    category: "medical-tech",
    rounded: "2xl",
    minBreakpoint: "lg",
  },
  {
    id: "1519494026892-80bbd2d6fd0d",
    colSpan: 1,
    rowSpan: 2,
    category: "hospitals",
    rounded: "2xl",
    minBreakpoint: "xl",
  },
  {
    id: "1631815589968-fdb09a223b1e",
    colSpan: 1,
    rowSpan: 1,
    category: "telemedicine",
    rounded: "xl",
    minBreakpoint: "xl",
  },
];

function collageImageUrl(id: string) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=85`;
}

function breakpointClass(min?: CollageTile["minBreakpoint"]) {
  if (!min) return "";
  if (min === "md") return "hidden md:block";
  if (min === "lg") return "hidden lg:block";
  return "hidden xl:block";
}

function spanClass(colSpan: 1 | 2, rowSpan: 1 | 2) {
  return cn(colSpan === 2 && "col-span-2", rowSpan === 2 && "row-span-2");
}

export function HeroBackgroundCollage() {
  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none"
      aria-hidden
    >
      <div
        className={cn("absolute -inset-[15%] min-h-[120%] w-full", "rotate-[-1.5deg] scale-[1.12]")}
      >
        <div
          className={cn(
            "hero-collage-grid grid h-full w-full min-h-full",
            "grid-cols-3 gap-1",
            "sm:grid-cols-4 sm:gap-1.5",
            "md:grid-cols-5 md:gap-1.5",
            "lg:grid-cols-6 lg:gap-2",
            "xl:grid-cols-7",
          )}
        >
          {COLLAGE_TILES.map((tile, i) => (
            <div
              key={`${tile.id}-${i}`}
              className={cn(
                "overflow-hidden opacity-70 saturate-[0.85]",
                "ring-1 ring-white/20 shadow-sm",
                tile.rounded === "2xl" ? "rounded-2xl" : "rounded-xl",
                spanClass(tile.colSpan, tile.rowSpan),
                breakpointClass(tile.minBreakpoint),
                tile.offset,
              )}
            >
              <img
                src={collageImageUrl(tile.id)}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover animate-slow-pan"
                style={{
                  animationDelay: `${(i % 5) * -4}s`,
                  animationDirection: i % 2 === 0 ? "normal" : "reverse",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 bg-primary/15 mix-blend-multiply" />
      <div className="absolute inset-0 bg-sky-100/35" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/88 via-background/50 to-transparent md:from-background/72 md:via-background/28 md:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/25 via-transparent to-background/20" />
    </div>
  );
}
