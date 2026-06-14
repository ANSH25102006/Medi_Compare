import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

const SPLASH_KEY = "medicompare_splash_shown";
const SPLASH_DURATION = 4000; // 4 seconds
const FADE_DURATION = 600; // fade-out duration ms

// ECG path for the heartbeat line
const ECG_PATH = "M0,50 L30,50 L40,50 L50,20 L60,80 L70,10 L80,85 L90,50 L110,50 L140,50";

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress bar
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min((elapsed / SPLASH_DURATION) * 100, 100));
    }, 16);

    // Fade in → hold → fade out → done
    const fadeOutTimer = setTimeout(() => setPhase("out"), SPLASH_DURATION - FADE_DURATION);
    const doneTimer = setTimeout(onDone, SPLASH_DURATION);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeOutTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, oklch(0.60 0.17 250) 0%, oklch(0.50 0.20 240) 50%, oklch(0.42 0.18 260) 100%)",
        transition: `opacity ${FADE_DURATION}ms ease`,
        opacity: phase === "out" ? 0 : 1,
        pointerEvents: phase === "out" ? "none" : "all",
        overflow: "hidden",
      }}
    >
      {/* Background orbs */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          left: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, oklch(0.75 0.12 200 / 0.25) 0%, transparent 70%)",
          animation: "orb-float 6s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "-5%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, oklch(0.55 0.20 280 / 0.20) 0%, transparent 70%)",
          animation: "orb-float 8s ease-in-out infinite reverse",
        }}
      />

      {/* Grid pattern overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(oklch(1 0 0 / 0.04) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main content */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "32px",
          animation: "splash-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      >
        {/* Icon cluster */}
        <div style={{ position: "relative", width: "120px", height: "120px" }}>
          {/* Outer pulsing ring */}
          <div
            style={{
              position: "absolute",
              inset: "-16px",
              borderRadius: "50%",
              border: "2px solid oklch(1 0 0 / 0.15)",
              animation: "pulse-ring 2s ease-out infinite",
            }}
          />
          {/* Middle ring */}
          <div
            style={{
              position: "absolute",
              inset: "-6px",
              borderRadius: "50%",
              border: "1.5px solid oklch(1 0 0 / 0.25)",
              animation: "pulse-ring 2s ease-out infinite 0.4s",
            }}
          />
          {/* Main circle */}
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "oklch(1 0 0 / 0.15)",
              backdropFilter: "blur(20px)",
              border: "1.5px solid oklch(1 0 0 / 0.30)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 40px oklch(0 0 0 / 0.25), inset 0 1px 0 oklch(1 0 0 / 0.2)",
            }}
          >
            {/* Hospital cross */}
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <rect
                x="18"
                y="6"
                width="16"
                height="40"
                rx="3"
                fill="white"
                fillOpacity="0.95"
                style={{ animation: "cross-draw 0.6s ease-out both 0.3s" }}
              />
              <rect
                x="6"
                y="18"
                width="40"
                height="16"
                rx="3"
                fill="white"
                fillOpacity="0.95"
                style={{ animation: "cross-draw 0.6s ease-out both 0.5s" }}
              />
              {/* Heart overlay */}
              <path
                d="M26 36 C26 36 14 28 14 20 C14 15.6 17.6 12 22 12 C24 12 25.6 12.8 26 13.6 C26.4 12.8 28 12 30 12 C34.4 12 38 15.6 38 20 C38 28 26 36 26 36Z"
                fill="oklch(0.75 0.15 15 / 0.7)"
                style={{ animation: "heart-beat 1.4s ease-in-out infinite 0.8s" }}
              />
            </svg>
          </div>
        </div>

        {/* Brand name */}
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: "clamp(2.5rem, 8vw, 3.75rem)",
              fontWeight: 800,
              color: "white",
              letterSpacing: "-0.03em",
              lineHeight: 1,
              animation: "splash-rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both 0.15s",
              textShadow: "0 2px 20px oklch(0 0 0 / 0.2)",
            }}
          >
            Medi<span style={{ color: "oklch(0.88 0.10 200)" }}>Compare</span>
          </h1>
          <p
            style={{
              marginTop: "10px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
              fontWeight: 400,
              color: "oklch(1 0 0 / 0.75)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              animation: "splash-rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both 0.3s",
            }}
          >
            Find Quality Healthcare at the Right Price
          </p>
        </div>

        {/* ECG / Heartbeat animation */}
        <div
          style={{
            animation: "splash-rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both 0.45s",
          }}
        >
          <svg
            viewBox="0 0 140 100"
            style={{ width: "clamp(220px, 40vw, 320px)", height: "60px", overflow: "visible" }}
          >
            {/* Glow line */}
            <path
              d={ECG_PATH}
              fill="none"
              stroke="oklch(0.75 0.12 200 / 0.4)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Animated ECG line */}
            <path
              d={ECG_PATH}
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="300"
              strokeDashoffset="300"
              style={{ animation: "ecg-draw 1.2s ease-out both 0.6s" }}
            />
            {/* Moving dot */}
            <circle
              r="4"
              fill="white"
              style={{
                filter: "drop-shadow(0 0 6px white)",
                animation: "ecg-dot 1.2s ease-out both 0.6s",
              }}
            >
              <animateMotion dur="1.2s" begin="0.6s" fill="freeze" path={ECG_PATH} />
            </circle>
          </svg>
        </div>

        {/* Stats pills */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            justifyContent: "center",
            animation: "splash-rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both 0.6s",
          }}
        >
          {[
            { value: "500+", label: "Hospitals" },
            { value: "50K+", label: "Patients" },
            { value: "10K+", label: "Appointments" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "10px 20px",
                borderRadius: "100px",
                background: "oklch(1 0 0 / 0.12)",
                backdropFilter: "blur(8px)",
                border: "1px solid oklch(1 0 0 / 0.20)",
              }}
            >
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "white",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.7rem",
                  color: "oklch(1 0 0 / 0.65)",
                  marginTop: "3px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "oklch(1 0 0 / 0.15)",
        }}
      >
        <div
          style={{
            height: "100%",
            background: "linear-gradient(90deg, oklch(0.85 0.10 200), white)",
            width: `${progress}%`,
            transition: "width 16ms linear",
            boxShadow: "0 0 12px white",
          }}
        />
      </div>

      {/* Keyframe styles injected inline */}
      <style>{`
        @keyframes splash-rise {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes heart-beat {
          0%, 100% { transform: scale(1);    opacity: 0.7; }
          14%       { transform: scale(1.25); opacity: 0.9; }
          28%       { transform: scale(1);    opacity: 0.7; }
          42%       { transform: scale(1.20); opacity: 0.9; }
          70%       { transform: scale(1);    opacity: 0.7; }
        }
        @keyframes ecg-draw {
          from { stroke-dashoffset: 300; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes orb-float {
          0%, 100% { transform: translateY(0)   scale(1); }
          50%       { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes cross-draw {
          from { opacity: 0; transform: scaleY(0); transform-origin: center; }
          to   { opacity: 0.95; transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

/** Wrapper — shows the splash once per browser session then calls onDone */
export function SplashGate({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Show splash once per session (sessionStorage resets on tab close)
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return !sessionStorage.getItem(SPLASH_KEY);
    } catch {
      return true;
    }
  });

  const handleDone = () => {
    try {
      sessionStorage.setItem(SPLASH_KEY, "1");
    } catch {
      // ignore
    }
    setShowSplash(false);
    // After splash: go to login if logged out, else home
    if (!isLoggedIn) {
      navigate({ to: "/login" });
    }
  };

  return (
    <>
      {showSplash && <SplashScreen onDone={handleDone} />}
      {/* Always render children (so fonts/assets preload), but visually hide while splash is up */}
      <div style={{ visibility: showSplash ? "hidden" : "visible" }}>{children}</div>
    </>
  );
}
