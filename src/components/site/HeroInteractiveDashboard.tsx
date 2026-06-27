import { useEffect, useState } from "react";
import { Search, Scale, ShieldCheck, Star, MapPin, CheckCircle2 } from "lucide-react";

export function HeroInteractiveDashboard() {
  const [time, setTime] = useState(0);

  // Time-based timeline loop (0 to 6500ms)
  useEffect(() => {
    const intervalTime = 50; // Update state every 50ms for smooth transitions
    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev >= 6500) {
          return 0; // Restart loop
        }
        return prev + intervalTime;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // Step calculations based on time:
  // Step 1 (0ms+): Search bar appears
  const showSearchBar = time >= 0;

  // Step 2 (400ms - 1300ms): Auto-types "MRI Scan"
  const fullText = "MRI Scan";
  const charIndex = Math.min(fullText.length, time >= 400 ? Math.floor((time - 400) / 100) : 0);
  const typedText = fullText.slice(0, charIndex);

  // Step 3 (1300ms - 1800ms): Results scan/search pulse
  const showLoading = time >= 1300 && time < 1800;
  const showResults = time >= 1800;

  // Step 4 (1800ms+): Hospital cards slide in
  const showHospitalCards = time >= 1800;

  // Step 5 (2800ms+): Savings badge appears and ticks up
  const showSavingsBadge = time >= 2800;
  const savingsProgress = Math.min(1, time >= 2800 ? (time - 2800) / 800 : 0);
  const currentSavings = Math.floor(savingsProgress * 3300);

  // Step 6 (3800ms+): Book Appointment CTA becomes active
  const showBookCTAActive = time >= 3800;

  return (
    <div
      className="relative w-full min-h-[460px] md:min-h-[500px] flex flex-col justify-between select-none p-6 rounded-[32px] border border-white/20 bg-card/30 shadow-[0_20px_50px_rgba(0,72,206,0.08)] backdrop-blur-xl dark:bg-card/20 dark:border-border/60"
      aria-hidden="true"
    >
      {/* Background ambient light overlay */}
      <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-tr from-primary/15 via-primary/5 to-success/15 blur-3xl pointer-events-none dark:from-primary/10" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">
            Live Product Simulator
          </span>
        </div>
        <div className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[9px] font-bold text-primary dark:bg-primary-soft/10">
          Search → Book
        </div>
      </div>

      {/* Visual Storyboard Canvas */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-6 min-h-[300px]">
        {/* Step 1: Search bar appears and query auto-types */}
        {!showResults && showSearchBar && (
          <div className="w-full max-w-sm space-y-4 transition-all duration-500 ease-out transform translate-y-0 opacity-100">
            <div className="text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary shadow-soft dark:bg-primary-soft/10">
                <Search className="h-6 w-6" />
              </span>
              <h4 className="text-sm font-extrabold text-foreground mt-3">
                Step 1: Enter Scan or Test
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">Typing query & fetching prices</p>
            </div>

            <div className="glass rounded-2xl p-4 border border-white/60 shadow-md">
              <div className="flex items-center gap-3 bg-background dark:bg-zinc-950 px-4 py-3 rounded-xl border border-border/60">
                <Search
                  className={`h-4 w-4 transition-colors ${showLoading ? "text-primary animate-pulse" : "text-muted-foreground"}`}
                />
                <span className="text-xs font-bold text-foreground tracking-wide">
                  {typedText}
                  {charIndex < fullText.length && (
                    <span className="animate-pulse font-light text-primary">|</span>
                  )}
                </span>
                {showLoading && (
                  <span className="ml-auto text-[10px] font-bold text-primary animate-pulse">
                    Scanning...
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3, 4, 5, 6: Results Comparison, Savings Badge & active CTA */}
        {showResults && (
          <div className="w-full max-w-sm space-y-4 transition-all duration-500 ease-out transform translate-y-0 opacity-100 relative">
            <div className="text-center">
              <h4 className="text-sm font-extrabold text-foreground">Step 2: Compare & Book</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Verified side-by-side hospital rates
              </p>
            </div>

            <div className="grid gap-3 relative">
              {/* Hospital A: Expensive Alternative */}
              <div className="flex justify-between items-center bg-background/60 p-3.5 rounded-xl border border-border/40 transition-all duration-500 transform translate-x-0 shadow-sm">
                <div>
                  <h5 className="text-[11px] font-extrabold text-foreground leading-none">
                    Royal Specialty
                  </h5>
                  <div className="flex items-center gap-2 mt-1 text-[9px] text-muted-foreground font-semibold">
                    <span className="flex items-center gap-0.5">
                      <Star className="h-2.5 w-2.5 fill-warning text-warning" /> 4.9
                    </span>
                    <span>· 4.8 km</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-foreground">₹9,500</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5 leading-none">
                    Standard Rate
                  </p>
                </div>
              </div>

              {/* Hospital B: Value Deal */}
              <div className="flex justify-between items-center bg-success/[0.03] p-3.5 rounded-xl border border-success/30 transition-all duration-500 transform translate-x-0 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-8 h-8 bg-success/15 rounded-bl-full flex items-center justify-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                </div>
                <div>
                  <h5 className="text-[11px] font-extrabold text-success flex items-center gap-1.5">
                    City Diagnostics
                    <span className="rounded bg-success/10 border border-success/20 px-1 py-0.5 text-[8px] text-success">
                      Best Deal
                    </span>
                  </h5>
                  <div className="flex items-center gap-2 mt-1 text-[9px] text-muted-foreground font-semibold">
                    <span className="flex items-center gap-0.5">
                      <Star className="h-2.5 w-2.5 fill-warning text-warning" /> 4.8
                    </span>
                    <span>· 2.4 km</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-success">₹6,200</p>
                  <p className="text-[9px] text-success font-bold mt-0.5 leading-none">Save 34%</p>
                </div>
              </div>

              {/* Step 5: Savings Badge appears and counts up */}
              <div
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-500 transform ${
                  showSavingsBadge
                    ? "scale-100 opacity-100 rotate-3"
                    : "scale-50 opacity-0 pointer-events-none"
                }`}
              >
                <div className="flex flex-col items-center justify-center rounded-full bg-success p-3 text-center text-success-foreground shadow-[0_8px_30px_rgba(34,197,94,0.4)] border-4 border-background dark:border-zinc-950 h-22 w-22">
                  <span className="text-[8px] font-extrabold uppercase tracking-widest leading-none text-success-foreground/90">
                    You Save
                  </span>
                  <span className="text-lg font-black tracking-tight mt-0.5 leading-none tabular-nums">
                    ₹{currentSavings.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Step 6: Book Appointment CTA becomes active */}
            <div
              className={`transition-all duration-500 transform ${
                showBookCTAActive
                  ? "translate-y-0 opacity-100 scale-100"
                  : "translate-y-2 opacity-30 scale-95 pointer-events-none"
              }`}
            >
              <button
                type="button"
                className={`w-full rounded-full py-2.5 text-xs font-extrabold shadow-soft transition-all duration-300 btn-interactive ${
                  showBookCTAActive
                    ? "bg-success hover:bg-success/90 text-success-foreground ring-4 ring-success/20 active:scale-95 cursor-pointer"
                    : "bg-secondary text-muted-foreground border border-border"
                }`}
              >
                {showBookCTAActive ? "Book Appointment Instantly ✓" : "Reviewing Slots..."}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Story Timeline Progress Indicator */}
      <div className="relative z-10 grid grid-cols-4 gap-2.5 pt-4 border-t border-border/40">
        {[
          { id: "search", title: "Search", threshold: 1800 },
          { id: "compare", title: "Compare", threshold: 2800 },
          { id: "save", title: "Save", threshold: 3800 },
          { id: "book", title: "Book", threshold: 6500 },
        ].map((item, idx) => {
          let prg = 0;
          if (idx === 0) {
            prg = Math.min(100, (time / 1800) * 100);
          } else if (idx === 1) {
            prg = time >= 1800 ? Math.min(100, ((time - 1800) / 1000) * 100) : 0;
          } else if (idx === 2) {
            prg = time >= 2800 ? Math.min(100, ((time - 2800) / 1000) * 100) : 0;
          } else if (idx === 3) {
            prg = time >= 3800 ? Math.min(100, ((time - 3800) / 2700) * 100) : 0;
          }

          const isActive =
            (idx === 0 && time < 1800) ||
            (idx === 1 && time >= 1800 && time < 2800) ||
            (idx === 2 && time >= 2800 && time < 3800) ||
            (idx === 3 && time >= 3800);

          return (
            <div key={item.id} className="flex flex-col">
              <div className="h-1 w-full rounded-full bg-secondary overflow-hidden dark:bg-secondary/40">
                <div
                  className="h-full bg-primary-gradient rounded-full transition-all duration-75"
                  style={{ width: `${prg}%` }}
                />
              </div>
              <span
                className={`text-[10px] font-extrabold tracking-wide mt-2 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
