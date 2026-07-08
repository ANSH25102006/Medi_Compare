import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Scale, ShieldCheck, CalendarCheck, FileText, Building2, Star, ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/site/ScrollReveal";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — MediCompare" },
      { name: "description", content: "Learn how simple it is to search, compare, and book verified healthcare services." },
    ],
  }),
  component: HowItWorksPage,
});

const steps = [
  {
    n: "1",
    title: "Search Care",
    icon: Search,
    desc: "Type in any service you need — such as 'MRI scan', 'Dental crown', or 'Cardiology consultation' — along with your city.",
    outcome: "See all local hospitals offering it.",
    illustration: (
      <div className="space-y-2.5">
        <div className="h-3 w-2/3 bg-primary/10 rounded border border-primary/20 animate-pulse" />
        <div className="h-3 w-full bg-muted rounded animate-pulse" />
      </div>
    )
  },
  {
    n: "2",
    title: "Compare Options",
    icon: Scale,
    desc: "Filter results by price, patient reviews, wait times, distance, and insurance support. View all attributes side by side in our comparison matrix.",
    outcome: "Identify which hospital gives the best value.",
    illustration: (
      <div className="flex gap-2">
        <div className="flex-1 rounded border border-success/30 bg-success/5 p-2 text-center text-success text-[10px] font-bold">₹5,000</div>
        <div className="flex-1 rounded border border-destructive/20 bg-destructive/5 p-2 text-center text-muted-foreground text-[10px] font-semibold">₹7,200</div>
      </div>
    )
  },
  {
    n: "3",
    title: "Book Securely",
    icon: CalendarCheck,
    desc: "Choose an active, real-time consultation time slot that fits your calendar. Fill in the patient details and secure the checkout.",
    outcome: "Confirm your appointment slot in a few clicks.",
    illustration: (
      <div className="grid grid-cols-2 gap-1.5">
        <span className="rounded bg-primary text-primary-foreground text-center p-1 text-[8px] font-bold">10:30 AM</span>
        <span className="rounded bg-muted text-muted-foreground text-center p-1 text-[8px] font-semibold">02:30 PM</span>
      </div>
    )
  },
  {
    n: "4",
    title: "Visit Provider",
    icon: Building2,
    desc: "Show your digital booking pass at the registration desk. Walk in directly for your scheduled appointment with zero waiting queue friction.",
    outcome: "Skip the lobby queue entirely.",
    illustration: (
      <div className="flex items-center gap-2 rounded bg-primary-soft/50 p-2 text-[10px] font-bold text-primary">
        <Building2 className="h-4 w-4" /> Entry Pass #MC-4920
      </div>
    )
  },
  {
    n: "5",
    title: "Leave Review",
    icon: Star,
    desc: "Share your rating on pricing correctness, clinical wait time, and room hygiene to help future patients make informed decisions.",
    outcome: "Support community verified reviews transparency.",
    illustration: (
      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} className="h-3.5 w-3.5 fill-warning text-warning" />
        ))}
      </div>
    )
  }
];

function HowItWorksPage() {
  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-hero-gradient py-16 border-b border-border/40">
        <div className="absolute inset-0 z-0 opacity-[0.03] bg-[linear-gradient(to_right,oklch(0.55_0.22_260)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.55_0.22_260)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-4xl text-center px-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
            SaaS Journey Guide
          </p>
          <h1 className="mt-3 text-3xl font-extrabold md:text-5xl text-foreground tracking-tight animate-fade-in">
            How It Works
          </h1>
          <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed font-semibold">
            From the initial pricing comparison to your actual hospital check-in, we streamline the entire patient journey.
          </p>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-20 border-b border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 relative">
          {/* Central connecting line for desktop, left-side for mobile */}
          <div className="absolute left-[39px] md:left-1/2 top-24 bottom-24 w-0.5 bg-border/50 -translate-x-1/2 z-0" />

          <div className="space-y-20 relative z-10">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isEven = idx % 2 === 0;

              return (
                <ScrollReveal key={s.n} delay={idx * 60}>
                  <div className={`grid gap-8 items-start md:grid-cols-2 relative ${isEven ? "" : "md:flex-row-reverse"}`}>
                    {/* Step circle bullet positioned on the line */}
                    <span className="absolute left-[20px] md:left-1/2 top-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-border/70 text-[10px] font-bold text-primary shadow-sm -translate-x-1/2 z-20">
                      {s.n}
                    </span>

                    {/* Text card on one side */}
                    <div className={`pl-12 md:pl-0 ${isEven ? "md:text-right md:pr-12" : "md:order-2 md:pl-12 text-left"}`}>
                      <div className={`flex items-center gap-2 ${isEven ? "md:justify-end" : "justify-start"}`}>
                        <Icon className="h-4.5 w-4.5 text-primary shrink-0" />
                        <h2 className="text-base font-bold text-foreground">{s.title}</h2>
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground font-semibold">
                        {s.desc}
                      </p>
                      <p className="mt-2.5 text-[9px] font-bold text-success uppercase tracking-wider flex items-center gap-1 justify-start md:justify-end">
                        <span>✓</span> {s.outcome}
                      </p>
                    </div>

                    {/* Preview mockup card on the other side */}
                    <div className={`pl-12 md:pl-0 ${isEven ? "md:order-2 md:pl-12" : "md:order-1 md:pr-12"}`}>
                      <div className="rounded-3xl border border-border bg-card p-5 shadow-soft min-h-[110px] flex flex-col justify-between hover:border-primary/20 hover:-translate-y-1.5 hover:shadow-elevated transition-all duration-300">
                        <div className="flex items-center justify-between border-b border-border/40 pb-2">
                          <span className="text-[8px] uppercase tracking-widest text-primary font-bold">Step {s.n} Preview</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-success" />
                        </div>
                        <div className="my-2">
                          {s.illustration}
                        </div>
                        <span className="text-[8px] uppercase tracking-wider text-muted-foreground/80 font-bold">READY</span>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          <div className="mt-20 text-center border-t border-border/40 pt-12">
            <h3 className="text-base font-bold text-foreground">Ready to try it yourself?</h3>
            <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
              Run a live simulation search query and discover immediate healthcare savings.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild size="sm" className="rounded-lg h-9 px-4 text-xs font-bold cursor-pointer">
                <Link to="/compare">
                  Go to Comparison Matrix <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
