import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, ShieldCheck, CheckCircle2, TrendingDown } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function ComparisonDemo() {
  const [hasVisited, setHasVisited] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // Animation states
  const [cityPrice, setCityPrice] = useState(9500);
  const [savings, setSavings] = useState(0);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasVisited) {
          setHasVisited(true);
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = elementRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasVisited]);

  useEffect(() => {
    if (!hasVisited) return;

    // Run comparison loop
    const runAnimation = () => {
      // Reset
      setCityPrice(9500);
      setSavings(0);
      setShowBadge(false);

      // 1. After 800ms, start counting down the City Diagnostics price from 9500 to 6200
      const countdownTimeout = setTimeout(() => {
        let currentPrice = 9500;
        const targetPrice = 6200;
        const priceDuration = 1000; // 1s
        const steps = 30;
        const stepTime = priceDuration / steps;
        const decrement = (currentPrice - targetPrice) / steps;

        const priceInterval = setInterval(() => {
          currentPrice -= decrement;
          if (currentPrice <= targetPrice) {
            setCityPrice(targetPrice);
            clearInterval(priceInterval);

            // 2. Trigger Savings Badge appearance
            setShowBadge(true);

            // 3. Tick savings from 0 to 3300
            let currentSavings = 0;
            const targetSavings = 3300;
            const savingsDuration = 800; // 0.8s
            const savingsSteps = 25;
            const savingsStepTime = savingsDuration / savingsSteps;
            const savingsIncrement = targetSavings / savingsSteps;

            const savingsInterval = setInterval(() => {
              currentSavings += savingsIncrement;
              if (currentSavings >= targetSavings) {
                setSavings(targetSavings);
                clearInterval(savingsInterval);
              } else {
                setSavings(Math.floor(currentSavings));
              }
            }, savingsStepTime);
          } else {
            setCityPrice(Math.floor(currentPrice));
          }
        }, stepTime);
      }, 800);

      return () => clearTimeout(countdownTimeout);
    };

    runAnimation();

    // Loop every 8 seconds so visitors see it multiple times
    const loopInterval = setInterval(runAnimation, 8000);

    return () => clearInterval(loopInterval);
  }, [hasVisited]);

  return (
    <section
      ref={elementRef}
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-border"
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">
          Compare in Real Time
        </p>
        <h2 className="mt-3 text-3xl font-bold md:text-4xl text-balance">
          Transparent Pricing, Side-by-Side
        </h2>
        <p className="mt-2 text-muted-foreground text-sm">
          Don&apos;t pay more for the exact same treatment. Check ratings, distance, and real
          patient wait times before you decide.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-12 items-center">
        {/* Left Side: Detail Package Overview */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-3xl border border-primary/15 bg-primary-soft/50 p-6 shadow-soft dark:bg-primary-soft/5 relative overflow-hidden group hover:shadow-[0_15px_30px_rgba(0,72,206,0.08)] transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <TrendingDown className="h-3.5 w-3.5" /> Average Savings: 34%
            </span>
            <h3 className="mt-4 text-xl font-bold text-foreground">MRI Brain Scan</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Standard 1.5 Tesla MRI, including contrast and diagnostic reports.
            </p>
            <div className="mt-6 border-t border-border pt-4 space-y-2.5 text-xs font-medium text-muted-foreground">
              <div className="flex justify-between">
                <span>National Average Price</span>
                <span className="font-semibold text-foreground">₹9,800</span>
              </div>
              <div className="flex justify-between">
                <span>MediCompare Best Price</span>
                <span className="font-bold text-success text-sm">₹6,200</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Hospital Cards Comparison */}
        <div className="lg:col-span-8 relative">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Hospital 1 - The Value Option */}
            <div
              className={`relative overflow-hidden rounded-3xl border bg-card p-6 shadow-soft transition-all duration-[250ms] ease-out hover:-translate-y-[6px] hover:scale-[1.01] hover:shadow-elevated ${
                cityPrice === 6200
                  ? "border-success/40 shadow-[0_12px_40px_rgba(34,197,94,0.08)]"
                  : "border-border"
              }`}
            >
              {cityPrice === 6200 && (
                <div className="absolute top-0 right-0 rounded-bl-2xl bg-success px-4 py-1 text-[11px] font-extrabold text-success-foreground tracking-wider uppercase animate-fade-in">
                  Best Value
                </div>
              )}
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-300 ${
                    cityPrice === 6200
                      ? "bg-success/15 text-success"
                      : "bg-primary-soft text-primary"
                  }`}
                >
                  <ShieldCheck className="h-6 w-6" />
                </span>
                <div>
                  <h4 className="font-bold text-foreground">City Diagnostics Center</h4>
                  <p className="text-xs text-muted-foreground">NABL Accredited • Indiranagar</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-y border-border py-4 my-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Price
                  </span>
                  <p
                    className={`text-2xl font-black mt-0.5 transition-colors duration-500 tabular-nums ${
                      cityPrice === 6200 ? "text-success scale-105" : "text-foreground"
                    }`}
                  >
                    ₹{cityPrice.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Distance
                  </span>
                  <p className="text-base font-bold text-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> 2.4 km
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Rating
                  </span>
                  <p className="text-base font-bold text-foreground mt-0.5 flex items-center gap-1">
                    4.8 <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Next Slot
                  </span>
                  <p className="text-xs font-semibold text-primary mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Today, 2:30 PM
                  </p>
                </div>
              </div>

              <ul className="space-y-1.5 text-xs text-muted-foreground mb-6">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Reports in 4 Hours
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Radiologist consultation
                  included
                </li>
              </ul>

              <Button
                asChild
                className={`w-full rounded-full border-0 shadow-soft transition-colors duration-300 ${
                  cityPrice === 6200
                    ? "bg-success hover:bg-success/90"
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                <Link to="/book" search={{ hospital: "apollo-central", service: "MRI Scan" }}>
                  Book Instantly
                </Link>
              </Button>
            </div>

            {/* Hospital 2 - Premium/Alternate Option */}
            <div className="relative group overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition-all duration-[250ms] ease-out hover:-translate-y-[6px] hover:scale-[1.01] hover:border-border/80 hover:shadow-elevated">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </span>
                <div>
                  <h4 className="font-bold text-foreground">Royal Specialty Hospital</h4>
                  <p className="text-xs text-muted-foreground">JCI Accredited • MG Road</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-y border-border py-4 my-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Price
                  </span>
                  <p className="text-2xl font-black text-foreground mt-0.5">₹9,500</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Distance
                  </span>
                  <p className="text-base font-bold text-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> 4.8 km
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Rating
                  </span>
                  <p className="text-base font-bold text-foreground mt-0.5 flex items-center gap-1">
                    4.9 <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Next Slot
                  </span>
                  <p className="text-xs font-semibold text-primary mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Today, 4:00 PM
                  </p>
                </div>
              </div>

              <ul className="space-y-1.5 text-xs text-muted-foreground mb-6">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Premium private lounge
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Digital access to scans
                </li>
              </ul>

              <Button asChild variant="outline" className="w-full rounded-full">
                <Link to="/book" search={{ hospital: "fortis-greens", service: "MRI Scan" }}>
                  Book Instantly
                </Link>
              </Button>
            </div>
          </div>

          {/* Interactive Savings Connector Badge */}
          <div
            className={`absolute left-1/2 top-1/2 z-10 hidden h-26 w-26 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-success p-3 text-center text-success-foreground shadow-[0_8px_30px_rgba(34,197,94,0.4)] border-4 border-background dark:border-zinc-950 md:flex transition-all duration-500 hover:scale-110 cursor-default ${
              showBadge ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
          >
            <span className="text-[9px] font-black uppercase tracking-widest leading-none text-success-foreground/80">
              Save
            </span>
            <span className="text-xl font-black tracking-tight mt-0.5 leading-none tabular-nums">
              ₹{savings.toLocaleString()}
            </span>
            <span className="text-[9px] font-bold mt-1 bg-white/20 px-1.5 py-0.5 rounded-full leading-none">
              34% Saved
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
