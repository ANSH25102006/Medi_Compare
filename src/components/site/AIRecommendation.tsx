import { Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Sparkles, Star, MapPin, ArrowRight, Bot, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiRecommendation, aiAlternatives, getServiceAverage } from "@/lib/mock-data";
import { useHospitals } from "@/hooks/use-hospitals";

const ALL_RECS = [aiRecommendation, ...aiAlternatives];

const matchColors: Record<string, string> = {
  "Best Price": "bg-success/10 text-success border-success/20",
  "High Rating": "bg-primary-soft text-primary border-primary/20",
  "Available Today": "bg-primary-soft text-primary border-primary/20",
  "Highest Rated": "bg-primary-soft text-primary border-primary/20",
  "Insurance Covered": "bg-primary-soft text-primary border-primary/20",
  "Quick Slots": "bg-success/10 text-success border-success/20",
  "Lowest Price": "bg-success/10 text-success border-success/20",
  "Same-day Slots": "bg-primary-soft text-primary border-primary/20",
  "Top Hospital": "bg-primary-soft text-primary border-primary/20",
  Nearest: "bg-primary-soft text-primary border-primary/20",
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
  const { data: hospitalsList = [], isLoading } = useHospitals();
  const [recIdx, setRecIdx] = useState(0);
  const rec = ALL_RECS[recIdx];

  const h = useMemo(() => {
    return hospitalsList.find((x) => x.id === rec.hospitalId) ?? hospitalsList[0];
  }, [hospitalsList, rec.hospitalId]);

  const svc = useMemo(() => {
    return (
      h?.services?.find((s) => s.name === rec.service) ??
      h?.services?.[0] ?? { name: "General Service", price: 0 }
    );
  }, [h, rec.service]);

  const avg = useMemo(() => {
    return getServiceAverage(svc.name, hospitalsList);
  }, [svc.name, hospitalsList]);

  const savings = Math.max(avg - svc.price, 0);

  const { displayed: typedQuery, done: queryDone } = useTypingEffect(`"${rec.query}"`, 28);
  const handleNext = () => setRecIdx((i) => (i + 1) % ALL_RECS.length);

  // Early return if loading or hospital not resolved
  if (isLoading || !h) {
    return (
      <div className="w-full">
        <div className="animate-pulse rounded-3xl border border-primary/15 bg-card p-6 h-64 flex items-center justify-center">
          <p className="text-muted-foreground text-sm font-medium">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8">

        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          {/* Left: intro + query */}
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-bold text-primary dark:bg-primary/10">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" /> AI-Powered Recommendation
            </span>
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
              Smart matches, tailored to your needs.
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground/95 leading-relaxed font-semibold">
              Our AI compares price averages, nurse ratings, distance, and real-time slot availability across our verified hospital network so you can make informed care choices in seconds.
            </p>

            {/* Query card */}
            <div className="rounded-xl border border-border/40 bg-background/50 p-4 backdrop-blur-md shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm animate-bounce">
                  <Bot className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                    Patient query
                  </p>
                  <p className="mt-1 text-xs font-bold text-foreground min-h-[1.25rem]">
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
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
            >
              <RefreshCw className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-500" /> Try another query
            </button>
          </div>

          {/* Right: recommendation card */}
          <div className="relative rounded-2xl border border-border/40 bg-card/65 p-6 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Recommended Choice
              </div>
              {/* Confidence */}
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${rec.confidence}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-primary">{rec.confidence}% match</span>
              </div>
            </div>

            <div className="mt-5 flex gap-4">
              <img
                src={h.image}
                alt={h.name}
                className="h-20 w-20 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-border/40"
              />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-bold text-foreground">{h.name}</h3>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-semibold">
                    <MapPin className="h-3.5 w-3.5" />
                    {h.city} · {h.distance} km
                  </span>
                  <span className="flex items-center gap-0.5 font-bold text-warning">
                    <Star className="h-3.5 w-3.5 fill-current" /> {h.rating}
                  </span>
                </p>
                {/* Match reasons */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {rec.matchReasons.map((r) => (
                    <span
                      key={r}
                      className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${matchColors[r] ?? "bg-secondary text-foreground border-border"}`}
                    >
                      <CheckCircle className="h-2.5 w-2.5" /> {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  {svc.name}
                </p>
                <p className="mt-1 text-lg font-bold text-primary">₹{svc.price.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-success/5 border border-success/10 p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-success">
                  You save
                </p>
                <p className="mt-1 text-lg font-bold text-success">₹{savings.toLocaleString()}</p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground font-semibold">{rec.rationale}</p>

            <div className="mt-6 flex gap-2.5">
              <Button asChild variant="outline" className="flex-1 rounded-lg text-xs h-9 font-bold cursor-pointer">
                <Link to="/hospitals/$hospitalId" params={{ hospitalId: h.id }}>
                  View Profile
                </Link>
              </Button>
              <Button
                asChild
                className="flex-1 rounded-lg bg-primary text-primary-foreground text-xs h-9 font-bold shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Link to="/book" search={{ hospital: h.id, service: svc.name }}>
                  Book Appointment <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
