import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Sparkles, Star, MapPin, ArrowRight, Bot, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiRecommendation, aiAlternatives, hospitals, getServiceAverage } from "@/lib/mock-data";

const ALL_RECS = [aiRecommendation, ...aiAlternatives];

const matchColors: Record<string, string> = {
  "Best Price": "bg-success/10 text-success border-success/20",
  "High Rating": "bg-warning/10 text-warning border-warning/20",
  "Available Today": "bg-primary/10 text-primary border-primary/20",
  "Highest Rated": "bg-warning/10 text-warning border-warning/20",
  "Insurance Covered": "bg-violet-500/10 text-violet-600 border-violet-500/20",
  "Quick Slots": "bg-success/10 text-success border-success/20",
  "Lowest Price": "bg-success/10 text-success border-success/20",
  "Same-day Slots": "bg-primary/10 text-primary border-primary/20",
  "Top Hospital": "bg-warning/10 text-warning border-warning/20",
  Nearest: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
};

function useTypingEffect(text: string, speed = 35) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return { displayed, done };
}

export function AIRecommendation() {
  const [recIdx, setRecIdx] = useState(0);
  const rec = ALL_RECS[recIdx];
  const h = hospitals.find((x) => x.id === rec.hospitalId) ?? hospitals[0];
  const svc = h.services.find((s) => s.name === rec.service) ?? h.services[0];
  const avg = getServiceAverage(svc.name);
  const savings = Math.max(avg - svc.price, 0);

  const { displayed: typedQuery, done: queryDone } = useTypingEffect(`"${rec.query}"`, 28);

  const handleNext = () => setRecIdx((i) => (i + 1) % ALL_RECS.length);

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-card p-6 shadow-elevated md:p-10">
        {/* Background glows */}
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-80 w-80 rounded-full bg-success/8 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          {/* Left: intro + query */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              <Sparkles className="h-3 w-3" /> AI-Powered Recommendation
            </span>
            <h2 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
              Smart matches, tailored to your needs.
            </h2>
            <p className="mt-3 max-w-lg text-muted-foreground">
              Our AI compares price, rating, distance and availability across every partner hospital
              so you can decide in seconds.
            </p>

            {/* Query card */}
            <div className="mt-6 rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
                  <Bot className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Patient query
                  </p>
                  <p className="mt-1 text-sm font-medium min-h-[1.25rem]">
                    {typedQuery}
                    {!queryDone && (
                      <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-primary align-middle" />
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Rotate button */}
            <button
              onClick={handleNext}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Try another query
            </button>
          </div>

          {/* Right: recommendation card */}
          <div className="relative rounded-2xl border border-border bg-background p-5 shadow-elevated">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Recommended for you
              </div>
              {/* Confidence */}
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary-gradient"
                    style={{ width: `${rec.confidence}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-primary">{rec.confidence}% match</span>
              </div>
            </div>

            <div className="mt-4 flex gap-4">
              <img
                src={h.image}
                alt={h.name}
                className="h-20 w-20 shrink-0 rounded-xl object-cover shadow-soft"
              />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-bold">{h.name}</h3>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {h.city} · {h.distance} km
                  </span>
                  <span className="flex items-center gap-0.5 font-semibold text-warning">
                    <Star className="h-3.5 w-3.5 fill-current" /> {h.rating}
                  </span>
                </p>
                {/* Match reasons */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {rec.matchReasons.map((r) => (
                    <span
                      key={r}
                      className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${matchColors[r] ?? "bg-secondary text-foreground border-border"}`}
                    >
                      <CheckCircle className="h-2.5 w-2.5" /> {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-primary-soft p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {svc.name}
                </p>
                <p className="mt-1 text-xl font-bold text-primary">₹{svc.price.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-success/10 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-success">
                  You save
                </p>
                <p className="mt-1 text-xl font-bold text-success">₹{savings.toLocaleString()}</p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{rec.rationale}</p>

            <div className="mt-5 flex gap-2">
              <Button asChild variant="outline" className="flex-1 rounded-full text-xs">
                <Link to="/hospitals/$hospitalId" params={{ hospitalId: h.id }}>
                  View details
                </Link>
              </Button>
              <Button
                asChild
                className="flex-1 rounded-full bg-primary-gradient text-xs shadow-soft hover:shadow-elevated transition-all hover:scale-[1.03]"
              >
                <Link to="/book" search={{ hospital: h.id, service: svc.name }}>
                  Book now <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
