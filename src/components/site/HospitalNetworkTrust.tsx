import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

const hospitalNetworks = [
  { name: "Apollo Hospitals", abbr: "Apollo", color: "#0072CE" },
  { name: "Fortis Healthcare", abbr: "Fortis", color: "#00A651" },
  { name: "Max Healthcare", abbr: "Max", color: "#003366" },
  { name: "Manipal Hospitals", abbr: "Manipal", color: "#E31937" },
  { name: "Medanta", abbr: "Medanta", color: "#C41230" },
  { name: "Kokilaben Hospital", abbr: "Kokilaben", color: "#6B2D8B" },
  { name: "AIIMS", abbr: "AIIMS", color: "#1E3A8A" },
  { name: "Narayana Health", abbr: "Narayana", color: "#0066B3" },
] as const;

function HospitalLogo({
  name,
  abbr,
  color,
}: {
  name: string;
  abbr: string;
  color: string;
}) {
  return (
    <div
      className="group/logo flex shrink-0 flex-col items-center gap-2 px-4 py-2 sm:px-6"
      aria-label={name}
    >
      <div
        className="flex h-12 w-28 items-center justify-center rounded-xl border border-border/60 bg-card px-3 shadow-soft transition-all duration-300 ease-out group-hover/logo:scale-105 group-hover/logo:shadow-elevated sm:h-14 sm:w-32"
        style={
          {
            "--brand-color": color,
          } as React.CSSProperties
        }
      >
        <span
          className="text-sm font-bold tracking-tight transition-colors duration-300 group-hover/logo:text-[var(--brand-color)] sm:text-base"
          style={{ color: "var(--brand-color)" }}
        >
          {abbr}
        </span>
      </div>
      <span className="max-w-[7rem] text-center text-[10px] font-medium leading-tight text-muted-foreground transition-colors duration-300 group-hover/logo:text-foreground sm:max-w-none sm:text-xs">
        {name}
      </span>
    </div>
  );
}

export function HospitalNetworkTrust() {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <section
      ref={ref}
      aria-labelledby="hospital-trust-heading"
      className={cn(
        "border-y border-border bg-background py-10 sm:py-12",
        inView ? "animate-fade-in" : "opacity-0",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2
          id="hospital-trust-heading"
          className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-xs sm:tracking-[0.25em]"
        >
          Trusted by India&apos;s leading healthcare networks
        </h2>

        <div
          className="mt-8 -mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:overflow-visible sm:px-0"
          role="list"
          aria-label="Partner hospital networks"
        >
          <div className="flex w-max items-center justify-start gap-2 sm:mx-auto sm:w-auto sm:flex-wrap sm:justify-center sm:gap-4">
            {hospitalNetworks.map((hospital) => (
              <div
                key={hospital.name}
                role="listitem"
                className="grayscale transition-[filter,transform] duration-300 hover:grayscale-0"
              >
                <HospitalLogo {...hospital} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
