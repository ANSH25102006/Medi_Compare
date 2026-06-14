import { useEffect, useState, useRef } from "react";
import { Building2, MapPin, BarChart3, ShieldCheck, Banknote } from "lucide-react";

interface CounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

function AnimatedNumber({ value, suffix = "", prefix = "", decimals = 0 }: CounterProps) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
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
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    let startTime: number | null = null;
    const duration = 1500; // 1.5 seconds

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentVal = progress * value;
      setCount(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value, hasAnimated]);

  return (
    <span ref={elementRef} className="tabular-nums">
      {prefix}
      {count.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

export function TrustMetricsBar() {
  const metrics = [
    {
      icon: Building2,
      component: <AnimatedNumber value={500} suffix="+" />,
      label: "Verified Hospitals",
      description: "Apollo, Fortis, Max & more",
    },
    {
      icon: MapPin,
      component: <AnimatedNumber value={50} suffix="+" />,
      label: "Cities Covered",
      description: "Pan-India presence",
    },
    {
      icon: BarChart3,
      component: <AnimatedNumber value={20000} suffix="+" />,
      label: "Comparisons Completed",
      description: "Transparent price checks",
    },
    {
      icon: ShieldCheck,
      component: <AnimatedNumber value={10000} suffix="+" />,
      label: "Appointments Booked",
      description: "100% secure reservations",
    },
    {
      icon: Banknote,
      component: <AnimatedNumber value={5} prefix="₹" suffix=" Cr+" />,
      label: "Healthcare Costs Compared",
      description: "Costs compared & saved",
    },
  ];

  return (
    <div className="relative z-20 mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="glass rounded-[24px] border border-white/60 p-6 shadow-[0_20px_50px_rgba(0,72,206,0.12)] dark:bg-card/75 dark:border-border/60 dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 lg:divide-x lg:divide-border/60">
          {metrics.map((m, idx) => (
            <div
              key={m.label}
              className={`flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] ${
                idx > 0 ? "lg:pl-4" : ""
              }`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-primary-soft text-primary shadow-soft transition-transform duration-300 dark:bg-primary-soft/10">
                <m.icon className="h-5 w-5" />
              </span>
              <div>
                <div className="flex flex-col">
                  <span className="text-2xl font-extrabold text-foreground tracking-tight leading-none">
                    {m.component}
                  </span>
                  <span className="text-xs font-bold text-primary uppercase tracking-wide mt-1">
                    {m.label}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                  {m.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
