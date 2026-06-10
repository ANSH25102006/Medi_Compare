import {
  Building2,
  Microscope,
  Shield,
  Pill,
  Rocket,
  Video,
  GraduationCap,
  Landmark,
  HeartHandshake,
  Leaf,
  type LucideIcon,
} from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

type EcosystemCard = {
  title: string;
  description: string;
  icon: LucideIcon;
  tint: string;
};

const ecosystemCards: EcosystemCard[] = [
  {
    title: "Hospital Networks",
    description: "500+ verified multi-specialty hospitals across India",
    icon: Building2,
    tint: "from-primary/10 to-primary/5",
  },
  {
    title: "Diagnostic Labs",
    description: "NABL-accredited labs with transparent test pricing",
    icon: Microscope,
    tint: "from-accent/20 to-accent/5",
  },
  {
    title: "Insurance Providers",
    description: "Cashless coverage from leading insurers",
    icon: Shield,
    tint: "from-success/15 to-success/5",
  },
  {
    title: "Pharmacies",
    description: "Licensed pharmacies with verified medicine pricing",
    icon: Pill,
    tint: "from-primary/10 to-accent/10",
  },
  {
    title: "HealthTech Startups",
    description: "Innovative digital health tools on one platform",
    icon: Rocket,
    tint: "from-warning/15 to-warning/5",
  },
  {
    title: "Telemedicine Platforms",
    description: "Virtual consultations with certified specialists",
    icon: Video,
    tint: "from-primary/15 to-primary/5",
  },
  {
    title: "Medical Colleges",
    description: "Teaching hospitals and academic medical centers",
    icon: GraduationCap,
    tint: "from-accent/15 to-primary/5",
  },
  {
    title: "Government Health Programs",
    description: "Ayushman Bharat and state health scheme integration",
    icon: Landmark,
    tint: "from-success/10 to-primary/5",
  },
  {
    title: "Healthcare NGOs",
    description: "Community health initiatives and outreach programs",
    icon: HeartHandshake,
    tint: "from-destructive/10 to-primary/5",
  },
  {
    title: "Wellness Platforms",
    description: "Preventive care, fitness, and holistic wellness",
    icon: Leaf,
    tint: "from-success/15 to-accent/10",
  },
];

function EcosystemCardItem({
  card,
  index,
}: {
  card: EcosystemCard;
  index: number;
}) {
  const Icon = card.icon;

  return (
    <article
      className={cn(
        "ecosystem-card group relative flex w-[260px] shrink-0 flex-col rounded-[18px] border border-border/80 bg-card/80 p-5 shadow-soft backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-elevated sm:w-[280px]",
        "dark:bg-card/60 dark:border-border",
      )}
      style={{ animationDelay: `${index * 0.4}s` }}
      aria-label={`${card.title}: ${card.description}`}
    >
      <div
        className={cn(
          "absolute inset-0 -z-0 rounded-[18px] bg-gradient-to-br opacity-60 transition-opacity duration-300 group-hover:opacity-100",
          card.tint,
        )}
      />
      <div className="relative">
        <span className="ecosystem-card-icon inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-background/80 text-primary shadow-soft ring-1 ring-border/60 transition-transform duration-300 group-hover:scale-110 dark:bg-background/40">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-sm font-bold leading-tight text-foreground">
          {card.title}
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          {card.description}
        </p>
      </div>
    </article>
  );
}

export function HealthcareEcosystemMarquee() {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <section
      ref={ref}
      aria-labelledby="ecosystem-heading"
      className={cn(
        "relative overflow-hidden border-b border-border bg-secondary/40 py-16 sm:py-20 dark:bg-secondary/20",
        inView && "fade-up-visible",
        !inView && "fade-up-hidden",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Healthcare ecosystem
          </p>
          <h2
            id="ecosystem-heading"
            className="mt-3 text-3xl font-bold text-balance md:text-4xl"
          >
            Built Around India&apos;s Healthcare Ecosystem
          </h2>
          <p className="mt-4 text-muted-foreground text-balance">
            Connecting hospitals, patients, diagnostics, insurance providers,
            pharmacies, and healthcare innovators on one transparent platform.
          </p>
        </div>
      </div>

      <div
        className="marquee-container relative mt-12"
        aria-label="Healthcare ecosystem partners"
      >
        <div className="marquee-fade-secondary-left pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24" aria-hidden="true" />
        <div className="marquee-fade-secondary-right pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-24" aria-hidden="true" />

        <div className="marquee-track group overflow-hidden py-2">
          <div className="marquee-content flex w-max gap-4 px-4 sm:gap-5">
            {[...ecosystemCards, ...ecosystemCards].map((card, i) => (
              <EcosystemCardItem
                key={`${card.title}-${i}`}
                card={card}
                index={i % ecosystemCards.length}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
