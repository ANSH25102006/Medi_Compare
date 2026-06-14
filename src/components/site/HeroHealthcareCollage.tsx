import { ShieldCheck, CalendarCheck, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

export function HeroHealthcareCollage() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar in Checkup card on load
    const timer = setTimeout(() => setProgress(75), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full z-10 animate-fade-in" aria-hidden="true">
      {/* Local floating keyframes & custom enhancements */}
      <style>{`
        @keyframes collage-float-y1 {
          0%, 100% { transform: translateY(0px) rotate(0.2deg); }
          50% { transform: translateY(-8px) rotate(-0.2deg); }
        }
        @keyframes collage-float-y2 {
          0%, 100% { transform: translateY(0px) rotate(-0.3deg); }
          50% { transform: translateY(-14px) rotate(0.3deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }
        .animate-collage-1 {
          animation: collage-float-y1 7s ease-in-out infinite;
        }
        .animate-collage-2 {
          animation: collage-float-y2 9s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }
      `}</style>

      {/* Background ambient light overlay */}
      <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-tr from-primary/20 via-primary/5 to-secondary/30 blur-3xl dark:from-primary/10 dark:to-transparent pointer-events-none" />

      <div className="relative grid grid-cols-12 gap-4 w-full">
        {/* Left Column in Grid */}
        <div className="col-span-5 space-y-4 pt-12 animate-collage-1">
          {/* Card 1: JCI Accredited */}
          <div className="group relative overflow-hidden rounded-[24px] border border-white/20 bg-card/45 shadow-xl backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:scale-[1.04] hover:shadow-[0_20px_45px_rgba(59,130,246,0.2)] hover:border-primary/45 active:scale-[0.99]">
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_95%,rgba(59,130,246,0.15)_95%)] bg-[size:100%_40px] pointer-events-none" />
            <img
              src="/images/hospital_lobby.png"
              alt="Hospital Building"
              className="h-[200px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success text-white shadow-md">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold text-white drop-shadow-md tracking-wide">
                JCI Accredited
              </span>
            </div>
          </div>

          {/* Card 2: Booking Confirmed */}
          <div className="rounded-[20px] border border-white/60 bg-white/80 p-4 shadow-lg backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.03] hover:shadow-xl hover:border-primary/30 active:scale-[0.99] relative overflow-hidden dark:bg-card/75 dark:border-border/60">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-primary/10 text-primary dark:bg-primary-soft/10">
                <CalendarCheck className="h-6 w-6" />
                <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-success text-[9px] font-bold text-white border-2 border-white dark:border-zinc-950 shadow-sm">
                  ✓
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-extrabold text-foreground tracking-tight">
                  Booking Confirmed
                </p>
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5 truncate">
                  Apollo Hospitals • 10:30 AM
                </p>
              </div>
            </div>
          </div>

          {/* Card 5: Verified Doctor Consultations */}
          <div className="group relative overflow-hidden rounded-[24px] border border-white/20 bg-card/45 shadow-xl backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:scale-[1.04] hover:shadow-[0_20px_45px_rgba(59,130,246,0.2)] hover:border-primary/45 active:scale-[0.99]">
            <img
              src="/images/medical_doctor.png"
              alt="Medical Consultation"
              className="h-[220px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className="text-xs font-bold text-white drop-shadow-md tracking-wide bg-primary/30 border border-white/10 px-2.5 py-1 rounded-[8px] backdrop-blur-md">
                Verified Experts
              </span>
            </div>
          </div>
        </div>

        {/* Right Column in Grid */}
        <div className="col-span-7 space-y-4 animate-collage-2">
          {/* Card 3: Full Body Checkup */}
          <div className="rounded-[24px] border border-white/60 bg-white/80 p-5 shadow-lg backdrop-blur-xl relative overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.03] hover:shadow-xl hover:border-primary/30 active:scale-[0.99] dark:bg-card/75 dark:border-border/60">
            <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-primary/5 to-transparent" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                  Full Body Checkup
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-foreground tracking-tight">₹4,500</span>
                  <span className="text-xs font-bold text-muted-foreground line-through opacity-70">
                    ₹6,000
                  </span>
                </div>
              </div>
              <div className="rounded-full bg-success/15 px-3 py-1 text-xs font-extrabold text-success border border-success/20">
                Save 25%
              </div>
            </div>
            {/* Animated progress bar indicator */}
            <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-secondary dark:bg-secondary/40">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-primary-gradient transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2.5 text-[10px] font-bold text-muted-foreground flex justify-end items-center gap-1">
              <MapPin className="h-3 w-3 text-primary/80" /> 3 hospitals near you
            </p>
          </div>

          {/* Card 4: Specialist Doctors Collage */}
          <div className="group relative overflow-hidden rounded-[24px] border border-white/20 bg-card/45 shadow-xl backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:scale-[1.04] hover:shadow-[0_20px_45px_rgba(59,130,246,0.2)] hover:border-primary/45 active:scale-[0.99]">
            <img
              src="/images/radiology_center.png"
              alt="Radiology Scan Center"
              className="h-[250px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/30 to-transparent dark:from-zinc-950/95" />
            <div className="absolute bottom-5 left-5 right-5">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="flex -space-x-2.5">
                  {[12, 47, 33].map((n) => (
                    <img
                      key={n}
                      src={`https://i.pravatar.cc/120?img=${n}`}
                      className="h-9 w-9 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm object-cover"
                      alt="Doctor"
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-white tracking-wide bg-white/25 px-2.5 py-1 rounded-[8px] backdrop-blur-md">
                  Top Specialists
                </span>
              </div>
              <p className="text-[13px] font-medium leading-tight text-white/95">
                Access 500+ world-class medical experts and advanced diagnostic scan facilities.
              </p>
            </div>
          </div>

          {/* Card 6: Smart Diagnostics Scan */}
          <div className="group relative overflow-hidden rounded-[24px] border border-white/20 bg-card/45 shadow-xl backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:scale-[1.04] hover:shadow-[0_20px_45px_rgba(59,130,246,0.2)] hover:border-primary/45 active:scale-[0.99]">
            <img
              src="/images/diagnostic_lab.png"
              alt="Diagnostic Lab Center"
              className="h-[200px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className="text-xs font-bold text-white drop-shadow-md tracking-wide bg-success/30 border border-white/10 px-2.5 py-1 rounded-[8px] backdrop-blur-md">
                Smart Diagnostics
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
