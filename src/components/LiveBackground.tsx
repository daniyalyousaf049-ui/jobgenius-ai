import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

/**
 * Three-layer site-wide background:
 *   1. Shifting deep gradient
 *   2. Drifting micro-particles (gold / teal / lavender)
 *   3. Soft tier-coloured orb near center
 */
export function LiveBackground() {
  const [isMobile, setIsMobile] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const rmq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setIsMobile(mq.matches);
    update();
    setReduced(rmq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const count = reduced ? 0 : isMobile ? 14 : 36;
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: 100 + Math.random() * 40,
        size: 2 + Math.random() * 4,
        sway: 4 + Math.random() * 10,
        dur: 18 + Math.random() * 22,
        delay: Math.random() * -30,
        color: ["#d4a853", "#2dd4bf", "#a78bfa"][i % 3],
        op: 0.12 + Math.random() * 0.2,
      })),
    [count],
  );

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Layer 1 — shifting deep gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, var(--bg-a), var(--bg-b), var(--bg-c))",
          backgroundSize: "300% 300%",
          animation: reduced ? "none" : "lbShift 18s ease-in-out infinite",
        }}
      />
      <style>{`
        :root {
          --bg-a: oklch(0.99 0.005 260);
          --bg-b: oklch(0.97 0.02 280);
          --bg-c: oklch(0.96 0.03 200);
        }
        .dark {
          --bg-a: #0a0a1a;
          --bg-b: #1a0a2e;
          --bg-c: #061826;
        }
        @keyframes lbShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes lbDrift {
          0% { transform: translate3d(0, 0, 0); opacity: 0; }
          10% { opacity: var(--op, 0.3); }
          90% { opacity: var(--op, 0.3); }
          100% { transform: translate3d(var(--sx, 0px), -110vh, 0); opacity: 0; }
        }
      `}</style>

      {/* Layer 3 — tier orb */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[60vmin] h-[60vmin] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(168,139,250,0.45), rgba(45,212,191,0.25) 50%, transparent 75%)",
          marginLeft: "-30vmin",
          marginTop: "-30vmin",
          opacity: 0.08,
        }}
        animate={
          reduced
            ? undefined
            : { x: [0, 60, -30, 0], y: [0, -40, 30, 0], scale: [1, 1.08, 0.96, 1] }
        }
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle aurora wave at the bottom */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full h-[40vh] opacity-30 dark:opacity-25"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lbWave" x1="0" x2="1">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <motion.path
          fill="url(#lbWave)"
          initial={{ d: "M0,200 C320,80 1040,300 1440,160 L1440,320 L0,320 Z" }}
          animate={
            reduced
              ? undefined
              : {
                  d: [
                    "M0,200 C320,80 1040,300 1440,160 L1440,320 L0,320 Z",
                    "M0,180 C400,260 960,60 1440,220 L1440,320 L0,320 Z",
                    "M0,220 C300,120 1100,280 1440,180 L1440,320 L0,320 Z",
                    "M0,200 C320,80 1040,300 1440,160 L1440,320 L0,320 Z",
                  ],
                }
          }
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* Layer 2 — drifting particles (CSS animated; pauses with tab) */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            opacity: 0,
            ["--op" as never]: p.op,
            ["--sx" as never]: `${(p.sway * (Math.random() > 0.5 ? 1 : -1)).toFixed(0)}px`,
            animation: `lbDrift ${p.dur}s linear ${p.delay}s infinite`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}
