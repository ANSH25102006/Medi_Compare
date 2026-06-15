import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, X, Send, MessageCircle, Minimize2, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getServiceAverage, services } from "@/lib/mock-data";
import { useHospitals } from "@/hooks/use-hospitals";
import { Button } from "@/components/ui/button";

// ── Types ──────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  links?: { label: string; to: string; search?: Record<string, string> }[];
  time: Date;
}

// ── Response Engine ────────────────────────────────────────────────────────
function getBotResponse(
  input: string,
  hospitalsList: any[],
): Omit<Message, "id" | "role" | "time"> {
  const q = input.toLowerCase().trim();

  // Greeting
  if (/^(hi|hello|hey|howdy|namaste)/i.test(q) && q.split(" ").length <= 3) {
    return {
      text: "Hello! 👋 I'm MediBot, your personal healthcare assistant. I can help you:\n\n• Find the cheapest hospital for any service\n• Compare prices and ratings\n• Navigate to your booking\n• Answer questions about our platform\n\nWhat can I help you with today?",
    };
  }

  // Help / what can you do
  if (/help|what can you|what do you/i.test(q)) {
    return {
      text: 'I can help you with:\n\n💊 **Find a service** — ask me about MRI, CT Scan, Blood Test, Dental, etc.\n💰 **Save money** — ask "which hospital is cheapest for X?"\n⭐ **Best hospitals** — ask for top-rated providers\n📍 **Nearby hospitals** — ask "hospitals near me"\n📅 **Book an appointment** — I\'ll take you straight to booking',
      links: [{ label: "Browse all services →", to: "/compare" }],
    };
  }

  // Book / appointment
  if (/book|appoint|schedul|reserv/i.test(q) && !/my book|my appoint/i.test(q)) {
    return {
      text: "Ready to book? 🎉 Our multi-step booking takes less than 2 minutes. You can select your service, pick a date and time slot, and confirm your appointment instantly.",
      links: [{ label: "Book appointment →", to: "/book" }],
    };
  }

  // Dashboard
  if (/dashboard|my account|profile|appointment.*my|my.*appoint/i.test(q)) {
    return {
      text: "Your patient dashboard gives you a full overview of upcoming appointments, money saved, saved hospitals, and medical records.",
      links: [{ label: "Go to dashboard →", to: "/dashboard" }],
    };
  }

  // Signup / register
  if (/sign.?up|register|creat.*account/i.test(q)) {
    return {
      text: "Creating a free account lets you save hospitals, track appointments, and see your savings history. It takes less than 30 seconds!",
      links: [{ label: "Create free account →", to: "/signup" }],
    };
  }

  // Login
  if (/log.?in|sign.?in/i.test(q)) {
    return {
      text: "Welcome back! Log in to access your dashboard and appointments.",
      links: [{ label: "Log in →", to: "/login" }],
    };
  }

  // --- Advanced Filtering ---
  const wantsCheap = /cheap|afford|sav|budget|low.?cost|best.?price|least.?expens|lowest/i.test(q);
  const wantsNear = /near|close|proxim|km|locat|distance/i.test(q);
  const wantsBest = /best|top.?rat|highest.?rat|rating|\brated\b/i.test(q);

  const serviceRegexes = [
    { name: "Full Body Health Checkup", regex: /full body|checkup/i },
    { name: "MRI Scan", regex: /mri/i },
    { name: "CT Scan", regex: /ct scan|cat scan/i },
    { name: "Cardiac Consultation", regex: /cardiac|heart/i },
    { name: "Blood Test Panel", regex: /blood test|blood panel|blood/i },
    { name: "Orthopedic Consultation", regex: /orthopedic|bone|joint/i },
    { name: "Dermatology Consultation", regex: /dermatolog|skin/i },
    { name: "Endoscopy", regex: /endoscopy/i },
    { name: "ECG", regex: /ecg|electrocardiogram/i },
    { name: "Ultrasound", regex: /ultrasound|sonogram/i },
  ];

  const matchedServiceObj = serviceRegexes.find((sr) => sr.regex.test(q));
  const matchedService = matchedServiceObj?.name;

  if (matchedService || wantsCheap || wantsNear || wantsBest) {
    let results = [...hospitalsList];

    // 1. Filter by service if specified
    if (matchedService) {
      results = results.filter((h) => h.services.some((s: any) => s.name === matchedService));
    }

    // 2. Score or sort based on user preferences
    results.sort((a, b) => {
      if (wantsNear && !wantsBest && !wantsCheap) return a.distance - b.distance;
      if (wantsBest && !wantsNear && !wantsCheap) return b.rating - a.rating;
      if (wantsCheap && !wantsNear && !wantsBest) {
        if (matchedService) {
          const priceA = a.services.find((s: any) => s.name === matchedService)?.price || 0;
          const priceB = b.services.find((s: any) => s.name === matchedService)?.price || 0;
          return priceA - priceB;
        } else {
          const maxSaveA = Math.max(
            ...a.services.map((s: any) => getServiceAverage(s.name, hospitalsList) - s.price),
          );
          const maxSaveB = Math.max(
            ...b.services.map((s: any) => getServiceAverage(s.name, hospitalsList) - s.price),
          );
          return maxSaveB - maxSaveA;
        }
      }

      // Composite score for multiple intents
      let scoreA = a.rating * 10 - a.distance * 2;
      let scoreB = b.rating * 10 - b.distance * 2;

      if (matchedService) {
        const priceA = a.services.find((s: any) => s.name === matchedService)?.price || 0;
        const priceB = b.services.find((s: any) => s.name === matchedService)?.price || 0;
        scoreA -= priceA / 100;
        scoreB -= priceB / 100;
      } else if (wantsCheap) {
        const saveA = Math.max(
          ...a.services.map((s: any) => getServiceAverage(s.name, hospitalsList) - s.price),
        );
        const saveB = Math.max(
          ...b.services.map((s: any) => getServiceAverage(s.name, hospitalsList) - s.price),
        );
        scoreA += saveA / 100;
        scoreB += saveB / 100;
      }

      return scoreB - scoreA;
    });

    const topResults = results.slice(0, 3);

    if (topResults.length === 0) {
      return {
        text: "I couldn't find any hospitals matching your criteria. Try adjusting your search.",
        links: [{ label: "Explore hospitals →", to: "/compare" }],
      };
    }

    let responseText = "";
    if (matchedService) {
      const avg = getServiceAverage(matchedService, hospitalsList);
      responseText += `Here are the best options for **${matchedService}**`;

      const conditions = [];
      if (wantsCheap) conditions.push("lowest price");
      if (wantsNear) conditions.push("nearest");
      if (wantsBest) conditions.push("top-rated");

      if (conditions.length > 0) {
        responseText += ` (${conditions.join(", ")})`;
      }
      responseText += `:\n\nAverage market price: ₹${avg.toLocaleString()}\n\n`;

      const lines = topResults
        .map((h) => {
          const svc = h.services.find((s: any) => s.name === matchedService)!;
          const savings = Math.max(avg - svc.price, 0);
          const details = [];
          if (wantsNear || (wantsBest && wantsNear) || (!wantsCheap && !wantsNear && !wantsBest))
            details.push(`${h.distance} km`);
          if (wantsBest || (!wantsCheap && !wantsNear && !wantsBest))
            details.push(`⭐ ${h.rating}`);

          const detailsStr = details.length > 0 ? ` [${details.join(" | ")}]` : "";
          return `• ${h.name} — ₹${svc.price.toLocaleString()}${savings > 0 ? ` (save ₹${savings.toLocaleString()})` : ""}${detailsStr}`;
        })
        .join("\n");

      responseText += lines + "\n\nWant to see full comparison with filters?";

      return {
        text: responseText,
        links: [
          {
            label: `Compare ${matchedService} prices →`,
            to: "/compare",
            search: { q: matchedService },
          },
        ],
      };
    } else {
      let intentStr = "options";
      if (wantsCheap && !wantsNear && !wantsBest) intentStr = "top savings opportunities";
      else if (wantsNear && !wantsCheap && !wantsBest) intentStr = "nearest hospitals";
      else if (wantsBest && !wantsCheap && !wantsNear) intentStr = "top-rated hospitals";
      else intentStr = "best matching hospitals";

      responseText += `Here are the ${intentStr}:\n\n`;
      const lines = topResults
        .map((h) => {
          const details = [];
          if (wantsCheap) {
            const topSavingSvc = [...h.services].sort(
              (a, b) =>
                getServiceAverage(b.name, hospitalsList) -
                b.price -
                (getServiceAverage(a.name, hospitalsList) - a.price),
            )[0];
            if (topSavingSvc) {
              const save = Math.max(
                getServiceAverage(topSavingSvc.name, hospitalsList) - topSavingSvc.price,
                0,
              );
              if (save > 0) details.push(`Save ₹${save.toLocaleString()} on ${topSavingSvc.name}`);
              else details.push(`Great value for ${topSavingSvc.name}`);
            }
          }
          if (wantsNear || (!wantsCheap && !wantsNear && !wantsBest))
            details.push(`${h.distance} km`);
          if (wantsBest || (!wantsCheap && !wantsNear && !wantsBest))
            details.push(`⭐ ${h.rating}`);

          return `• **${h.name}** — ${details.join(" | ")}`;
        })
        .join("\n");

      responseText += lines;
      return {
        text: responseText,
        links: [{ label: "Compare all hospitals →", to: "/compare" }],
      };
    }
  }

  // Default fallback
  const randomTip = [
    "Try asking me about a specific service like 'MRI' or 'Blood Test' — I'll find the best prices!",
    "You can compare hospitals by price, rating, or distance on our Compare page.",
    "Our AI recommends hospitals based on price, rating, and availability — all in one click.",
  ][Math.floor(Math.random() * 3)];

  return {
    text: `I'm not sure I understood that, but here's a tip: ${randomTip}`,
    links: [{ label: "Explore hospitals →", to: "/compare" }],
  };
}

// ── Quick chips ────────────────────────────────────────────────────────────
const QUICK_CHIPS = [
  "Find cheapest MRI",
  "Top-rated hospitals",
  "Hospitals near me",
  "Book appointment",
  "How does it work?",
];

// ── Main component ─────────────────────────────────────────────────────────
export function HealthChatbot() {
  const { data: hospitalsList = [] } = useHospitals();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(1);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "ai",
      text: "Hi! I'm MediBot 🏥 Your AI healthcare assistant.\n\nAsk me to find the best prices, compare hospitals, or navigate to booking. Try a quick question below!",
      time: new Date(),
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, typing]);

  // Focus input on open
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setUnread(0);
    }
  }, [open, minimized]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: "user",
        text: text.trim(),
        time: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setTyping(true);

      // Simulate thinking delay
      const delay = 600 + Math.random() * 800;
      setTimeout(() => {
        const response = getBotResponse(text, hospitalsList);
        const aiMsg: Message = { id: `a-${Date.now()}`, role: "ai", ...response, time: new Date() };
        setMessages((prev) => [...prev, aiMsg]);
        setTyping(false);
        if (!open) setUnread((n) => n + 1);
      }, delay);
    },
    [open, hospitalsList],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleOpen = () => {
    setOpen(true);
    setMinimized(false);
    setUnread(0);
  };

  return (
    <>
      {/* ── Floating button ── */}
      {!open && (
        <button
          id="chat-open-btn"
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-gradient shadow-elevated transition-all duration-300 hover:scale-110 hover:shadow-[0_8px_32px_oklch(0.56_0.17_250_/_0.35)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6 text-white" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white shadow">
              {unread}
            </span>
          )}
        </button>
      )}

      {/* ── Chat panel ── */}
      {open && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex w-[360px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-elevated transition-all duration-300 ${
            minimized ? "h-14" : "h-[540px]"
          }`}
          style={{
            animation: "chatSlideUp 0.3s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          {/* Header */}
          <div className="flex h-14 shrink-0 items-center justify-between bg-primary-gradient px-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
                <Bot className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white leading-none">MediBot</p>
                <p className="text-[10px] text-white/70 leading-none mt-0.5 flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-300" />
                  AI Assistant · Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized((v) => !v)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition hover:bg-white/20 hover:text-white"
                aria-label="Minimize"
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition hover:bg-white/20 hover:text-white"
                aria-label="Close chat"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    {msg.role === "ai" && (
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary text-xs">
                        <Sparkles className="h-3.5 w-3.5" />
                      </span>
                    )}
                    <div
                      className={`max-w-[78%] space-y-2 ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}
                    >
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-secondary text-foreground rounded-tl-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                      {msg.links && msg.links.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {msg.links.map((lnk) => (
                            <Link
                              key={lnk.label}
                              to={lnk.to}
                              search={lnk.search as Record<string, string> | undefined}
                              onClick={() => setOpen(false)}
                              className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
                            >
                              {lnk.label}
                              <ArrowRight className="h-2.5 w-2.5" />
                            </Link>
                          ))}
                        </div>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {msg.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {typing && (
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary text-xs">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-secondary px-3.5 py-3">
                      <span className="chat-dot" />
                      <span className="chat-dot" style={{ animationDelay: "0.15s" }} />
                      <span className="chat-dot" style={{ animationDelay: "0.3s" }} />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick chips */}
              <div className="shrink-0 flex gap-1.5 overflow-x-auto px-3 pb-2 pt-1 scrollbar-none">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    className="shrink-0 whitespace-nowrap rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:border-primary/40 hover:bg-primary-soft hover:text-primary"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="shrink-0 border-t border-border p-3">
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2"
                >
                  <input
                    ref={inputRef}
                    id="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about hospitals, prices, services…"
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    autoComplete="off"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || typing}
                    className="h-8 w-8 shrink-0 rounded-full"
                    id="chat-send-btn"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </form>
                <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                  Powered by MediCompare AI
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
