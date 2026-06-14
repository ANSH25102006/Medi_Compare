import { ShieldCheck, Award, CheckCircle } from "lucide-react";

export function HospitalNetworkTrust() {
  const accreditations = [
    {
      title: "JCI Accredited Hospitals",
      desc: "Partners meet Joint Commission International gold standards for medical safety.",
      hospitals: "Apollo, Medanta, Max Healthcare",
      icon: ShieldCheck,
      color: "text-primary bg-primary-soft dark:bg-primary-soft/10",
    },
    {
      title: "NABL Certified Diagnostics",
      desc: "Clinical lab tests are processed through accredited national laboratory diagnostics.",
      hospitals: "Fortis Labs, City Diagnostics",
      icon: Award,
      color: "text-success bg-success-soft dark:bg-success/5",
    },
    {
      title: "NABH Approved Clinics",
      desc: "Clinical doctors and staff satisfy rigorous national safety and hygiene guidelines.",
      hospitals: "Manipal, Kokilaben Hospital",
      icon: CheckCircle,
      color: "text-amber-500 bg-amber-500/10",
    },
  ];

  const partners = [
    "Apollo",
    "Fortis",
    "Max Healthcare",
    "Manipal",
    "Medanta",
    "Kokilaben",
    "Narayana",
  ];

  return (
    <section
      aria-labelledby="credibility-strip-title"
      className="border-y border-border bg-secondary/15 py-12 dark:bg-secondary/5"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2
            id="credibility-strip-title"
            className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary"
          >
            Accredited Healthcare Booking Ecosystem
          </h2>
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            Booking clinical consultations and diagnostics through fully certified,
            quality-accredited institutions.
          </p>
        </div>

        {/* Accreditations Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {accreditations.map((acc) => {
            const Icon = acc.icon;
            return (
              <div
                key={acc.title}
                className="group flex gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated hover:border-primary/20 dark:border-border"
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${acc.color} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground leading-snug">{acc.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{acc.desc}</p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-primary">
                    Providers: {acc.hospitals}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compact Partner Logo Ribbon */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4 border-t border-border/50 pt-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
            Trusted by Leading Healthcare Networks
          </span>
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 mt-1">
            {partners.map((name) => (
              <div
                key={name}
                className="flex items-center gap-2 rounded-xl border border-border bg-card/20 px-4 py-2.5 text-xs font-bold text-muted-foreground/40 transition-all duration-[300ms] hover:text-primary hover:border-primary/30 hover:bg-primary/5 hover:scale-[1.05] cursor-default opacity-80 hover:opacity-100 shadow-sm"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/35 transition-colors duration-300 group-hover:bg-primary" />
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
