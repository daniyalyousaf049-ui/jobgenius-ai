import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import confetti from "canvas-confetti";
import { sfx } from "@/lib/sfx";

export type Medal = { name: string; min: number; emoji: string; color: string; glow: string };

export const MEDALS: Medal[] = [
  { name: "Rookie",    min: 0,     emoji: "🪨", color: "from-slate-400 to-slate-600",       glow: "shadow-[0_0_30px_#94a3b8]" },
  { name: "Bronze",    min: 100,   emoji: "🥉", color: "from-amber-700 to-orange-800",      glow: "shadow-[0_0_30px_#b45309]" },
  { name: "Silver",    min: 500,   emoji: "🥈", color: "from-slate-300 to-slate-500",       glow: "shadow-[0_0_30px_#cbd5e1]" },
  { name: "Gold",      min: 1500,  emoji: "🥇", color: "from-yellow-400 to-amber-600",      glow: "shadow-[0_0_30px_#fbbf24]" },
  { name: "Platinum",  min: 3500,  emoji: "💎", color: "from-cyan-300 to-sky-500",          glow: "shadow-[0_0_30px_#22d3ee]" },
  { name: "Diamond",   min: 7000,  emoji: "🔷", color: "from-sky-400 to-indigo-600",        glow: "shadow-[0_0_30px_#6366f1]" },
  { name: "Legend",    min: 15000, emoji: "👑", color: "from-fuchsia-400 to-violet-700",    glow: "shadow-[0_0_30px_#c084fc]" },
];

export function currentMedal(xp: number) {
  let idx = 0;
  for (let i = 0; i < MEDALS.length; i++) if (xp >= MEDALS[i].min) idx = i;
  return { medal: MEDALS[idx], next: MEDALS[idx + 1] ?? null, idx };
}

const LS_KEY = "medal-unlocked";

export function MedalsSection({ xp }: { xp: number }) {
  const { medal, next, idx } = currentMedal(xp);
  const [unlocked, setUnlocked] = useState<Medal | null>(null);
  const fired = useRef(false);

  // Detect new-medal unlock vs persisted high-water-mark
  useEffect(() => {
    const stored = parseInt(localStorage.getItem(LS_KEY) ?? "-1", 10);
    if (idx > stored && !fired.current) {
      fired.current = true;
      localStorage.setItem(LS_KEY, String(idx));
      // skip the very first save (no celebration on first visit)
      if (stored >= 0) {
        setUnlocked(medal);
        sfx.legendary();
        confetti({ particleCount: 160, spread: 90, origin: { y: 0.4 }, colors: ["#fbbf24","#a855f7","#22d3ee","#ec4899","#10b981"] });
        setTimeout(() => setUnlocked(null), 4500);
      }
    }
  }, [idx, medal]);

  const progress = next ? Math.round(((xp - medal.min) / (next.min - medal.min)) * 100) : 100;
  const toNext = next ? Math.max(0, next.min - xp) : 0;

  return (
    <Card className="p-6 mb-8 bg-gradient-card relative overflow-hidden">
      <div className="absolute -inset-1 -z-10 opacity-30 blur-3xl bg-gradient-hero" />
      <div className="flex items-center gap-4 mb-5">
        <motion.div
          animate={{ y: [0, -4, 0], rotate: [-3, 3, -3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${medal.color} ${medal.glow} flex items-center justify-center text-3xl`}
        >
          {medal.emoji}
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Current rank</div>
          <div className="text-2xl font-bold">{medal.name}</div>
          <div className="text-sm text-muted-foreground">
            {next ? <>{toNext.toLocaleString()} XP to <span className="font-semibold text-foreground">{next.name}</span> {next.emoji}</> : <>You're at the top tier 👑</>}
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gradient">{xp.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">XP</div>
        </div>
      </div>

      <div className="relative h-3 rounded-full bg-muted overflow-hidden mb-6">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400"
        />
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {MEDALS.map((m, i) => {
          const earned = xp >= m.min;
          const isNext = i === idx + 1;
          return (
            <motion.div
              key={m.name}
              whileHover={{ y: -3, scale: 1.05 }}
              className={`relative rounded-xl p-3 text-center border transition-all
                ${earned ? `bg-gradient-to-br ${m.color} text-white border-transparent ${m.glow}` : "border-border bg-card opacity-60"}
                ${isNext ? "ring-2 ring-primary/60" : ""}`}
              title={`${m.name} · ${m.min} XP`}
            >
              <div className={`text-2xl ${!earned ? "grayscale" : ""}`}>{m.emoji}</div>
              <div className="text-[10px] mt-1 font-semibold uppercase tracking-wide">{m.name}</div>
              <div className="text-[10px] opacity-80">{m.min.toLocaleString()}</div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {unlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 14 }}
              className={`rounded-3xl px-12 py-10 text-center bg-gradient-to-br ${unlocked.color} ${unlocked.glow}`}
            >
              <motion.div
                animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="text-7xl mb-3"
              >
                {unlocked.emoji}
              </motion.div>
              <div className="text-white/90 text-xs uppercase tracking-widest">New medal unlocked</div>
              <div className="text-4xl font-bold text-white">{unlocked.name}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
