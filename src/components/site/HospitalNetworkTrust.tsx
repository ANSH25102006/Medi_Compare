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
      color: "text-primary bg-primary-soft",
    },
  ];



  return (
    <div
      aria-labelledby="credibility-strip-title"
      className="py-12 mt-12 border-t border-border/60"
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
                className="group flex gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-elevated hover:border-primary/20"
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


      </div>
    </div>
  );
}
