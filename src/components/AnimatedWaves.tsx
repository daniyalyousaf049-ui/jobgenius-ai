import { motion } from "framer-motion";

/** Soft animated colored waves for hero / interview backgrounds. */
export function AnimatedWaves({ intensity = 1 }: { intensity?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <svg
        className="absolute inset-x-0 bottom-0 w-full h-[60%] opacity-60"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="w1" x1="0" x2="1">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
          <linearGradient id="w2" x1="0" x2="1">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="w3" x1="0" x2="1">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        {[
          { d: "M0,160 C320,260 720,40 1440,200 L1440,320 L0,320 Z", fill: "url(#w1)", dur: 14, op: 0.35 * intensity },
          { d: "M0,200 C400,80 1040,300 1440,160 L1440,320 L0,320 Z", fill: "url(#w2)", dur: 18, op: 0.3 * intensity },
          { d: "M0,240 C320,180 1120,320 1440,220 L1440,320 L0,320 Z", fill: "url(#w3)", dur: 22, op: 0.4 * intensity },
        ].map((w, i) => (
          <motion.path
            key={i}
            d={w.d}
            fill={w.fill}
            opacity={w.op}
            animate={{ d: [w.d, w.d.replace(/(\d+),(\d+)/g, (_, x, y) => `${x},${Number(y) + (i % 2 ? 30 : -30)}`), w.d] }}
            transition={{ duration: w.dur, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </svg>
      <div className="absolute -top-32 -left-20 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
      <div className="absolute -top-10 right-0 w-[400px] h-[400px] rounded-full bg-fuchsia-500/20 blur-[120px] animate-pulse" style={{ animationDelay: "1.5s" }} />
    </div>
  );
}
