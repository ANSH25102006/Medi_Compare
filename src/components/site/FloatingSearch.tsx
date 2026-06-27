import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search, MapPin, CalendarDays, Stethoscope, History, TrendingUp, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { services, cities } from "@/lib/mock-data";

export function FloatingSearch({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as any;

  const [service, setService] = useState(search.q || search.service || "");
  const [city, setCity] = useState(search.city || "");
  const [date, setDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (search.q !== undefined) {
      setService(search.q);
    } else if (search.service !== undefined) {
      setService(search.service);
    }
    if (search.city !== undefined) {
      setCity(search.city);
    }
  }, [search.q, search.service, search.city]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("medicompare_recent_searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      // ignore storage issues
    }
  }, []);

  // Handle outside clicks to close suggestion box
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter suggestion list dynamically
  const filteredServices = services
    .filter((s) => s.toLowerCase().includes(service.toLowerCase()) && s.toLowerCase() !== service.toLowerCase())
    .slice(0, 5);

  const popularSearches = ["MRI Scan", "CT Scan", "Ultrasound", "Full Body Checkup", "Dental Care"].slice(0, 4);

  // Combine visible options to build keyboard mapping list
  const allOptions = [...filteredServices, ...recentSearches, ...popularSearches];

  // Reset active index when text changes or dropdown opens/closes
  useEffect(() => {
    setActiveIdx(-1);
  }, [service, showSuggestions]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = service.trim();
    if (query) {
      const updated = [query, ...recentSearches.filter((x) => x !== query)].slice(0, 5);
      setRecentSearches(updated);
      try {
        localStorage.setItem("medicompare_recent_searches", JSON.stringify(updated));
      } catch (err) {
        // ignore
      }
    }
    setShowSuggestions(false);
    navigate({ to: "/compare", search: { q: query, city } });
  };

  const selectSearchTerm = (term: string) => {
    setService(term);
    setShowSuggestions(false);
    // Auto submit search
    const updated = [term, ...recentSearches.filter((x) => x !== term)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem("medicompare_recent_searches", JSON.stringify(updated));
    } catch (err) {
      // ignore
    }
    navigate({ to: "/compare", search: { q: term, city } });
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = recentSearches.filter((x) => x !== term);
    setRecentSearches(updated);
    try {
      localStorage.setItem("medicompare_recent_searches", JSON.stringify(updated));
    } catch (err) {
      // ignore
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || allOptions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((prev) => (prev + 1) % allOptions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((prev) => (prev - 1 + allOptions.length) % allOptions.length);
    } else if (e.key === "Enter") {
      if (activeIdx >= 0 && activeIdx < allOptions.length) {
        e.preventDefault();
        selectSearchTerm(allOptions[activeIdx]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIdx(-1);
    }
  };

  return (
    <form
      onSubmit={handleSearchSubmit}
      className={`grid grid-cols-1 items-stretch overflow-visible rounded-2xl border border-border bg-background/95 shadow-elevated backdrop-blur md:grid-cols-[1.3fr_1fr_1fr_auto] ${className} relative z-40`}
    >
      {/* Medical Service Selector */}
      <div ref={containerRef} className="relative group flex flex-col border-b border-border md:border-b-0 md:border-r">
        <label className="flex items-center gap-3 px-5 py-3 h-full cursor-pointer">
          <Stethoscope className="h-4 w-4 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Medical service
            </p>
            <input
              type="text"
              value={service}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setService(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="MRI, Blood test, Consult…"
              className="mt-0.5 w-full bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground/60 text-foreground"
            />
          </div>
        </label>

        {/* Suggestion Dropdown */}
        {showSuggestions && (
          <div className="absolute top-full left-0 w-full md:w-[420px] mt-2 rounded-2xl border border-border bg-card p-4 shadow-elevated animate-fade-in z-50 text-foreground">
            {/* Live Filter Suggestions */}
            {service.trim() && filteredServices.length > 0 && (
              <div className="mb-4">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary animate-pulse" /> Matching services
                </p>
                <div className="flex flex-col gap-0.5">
                  {filteredServices.map((term, index) => {
                    const isActive = activeIdx === index;
                    return (
                      <button
                        key={term}
                        type="button"
                        onClick={() => selectSearchTerm(term)}
                        className={`text-left w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer flex items-center justify-between ${
                          isActive ? "bg-primary-soft text-primary" : "hover:bg-primary-soft hover:text-primary"
                        }`}
                      >
                        <span>{term}</span>
                        <span className="text-[9px] font-extrabold text-primary uppercase opacity-0 group-hover:opacity-100">Select</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-4">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <History className="h-3 w-3" /> Recent Searches
                </p>
                <div className="flex flex-col gap-0.5">
                  {recentSearches.map((term, index) => {
                    const isActive = activeIdx === filteredServices.length + index;
                    return (
                      <div
                        key={term}
                        className={`group/item flex items-center justify-between w-full rounded-lg transition-all duration-150 ${
                          isActive ? "bg-secondary text-foreground" : "hover:bg-secondary/60"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => selectSearchTerm(term)}
                          className="text-left flex-1 px-2.5 py-1.5 text-xs font-semibold text-foreground/80 hover:text-foreground cursor-pointer"
                        >
                          {term}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(e, term)}
                          className="p-1 mr-1.5 rounded-md text-muted-foreground/45 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          title="Remove"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Popular Services */}
            <div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-success" /> Popular Scans & Tests
              </p>
              <div className="flex flex-wrap gap-1.5">
                {popularSearches.map((term, index) => {
                  const isActive = activeIdx === filteredServices.length + recentSearches.length + index;
                  return (
                    <button
                      key={term}
                      type="button"
                      onClick={() => selectSearchTerm(term)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer btn-interactive active:scale-95 ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-secondary/30 border-border text-foreground hover:bg-primary-soft hover:text-primary hover:border-primary/20"
                      }`}
                    >
                      {term}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Location Selector */}
      <label className="group flex items-center gap-3 border-b border-border px-5 py-3 md:border-b-0 md:border-r cursor-pointer">
        <MapPin className="h-4 w-4 text-primary shrink-0" />
        <div className="flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
            Location
          </p>
          <input
            list="fs-cities"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City or area"
            className="mt-0.5 w-full bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground/60 text-foreground"
          />
          <datalist id="fs-cities">
            {cities.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </label>

      {/* Date Selector */}
      <label className="group flex items-center gap-3 border-b border-border px-5 py-3 md:border-b-0 md:border-r cursor-pointer">
        <CalendarDays className="h-4 w-4 text-primary shrink-0" />
        <div className="flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
            Date
          </p>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-0.5 w-full bg-transparent text-sm font-semibold outline-none text-foreground"
          />
        </div>
      </label>

      {/* Search Submit Button */}
      <div className="flex items-center justify-end p-2 md:pl-4">
        <Button type="submit" size="lg" className="h-12 w-full gap-2 rounded-xl md:w-auto md:px-6 btn-interactive bg-primary-gradient cursor-pointer text-primary-foreground font-bold text-sm shadow-soft">
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>
    </form>
  );
}
