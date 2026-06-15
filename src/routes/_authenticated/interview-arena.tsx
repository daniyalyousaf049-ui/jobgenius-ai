import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Lock, Swords, Flame, Trophy, Sparkles, ArrowLeft, Send, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getMyStats, awardInterviewXp } from "@/lib/gamification.functions";
import { sfx } from "@/lib/sfx";
import { toast } from "sonner";
import { VictoryScreen, DefeatScreen, LeaderCardAnimated, BattleScreenAnimation } from "@/components/ArenaAnimations";

export const Route = createFileRoute("/_authenticated/interview-arena")({
  head: () => ({
    meta: [
      { title: "Interview Arena — JobGenius AI" },
      { name: "description", content: "Face the world's most demanding leaders. Climb from Rookie to Legend." },
    ],
  }),
  component: ArenaPage,
});

// XP tiers
const TIERS = [
  { name: "Rookie", xp: 0, color: "from-slate-400 to-slate-600", emoji: "🟢" },
  { name: "Bronze", xp: 100, color: "from-amber-600 to-orange-700", emoji: "🟤" },
  { name: "Silver", xp: 500, color: "from-slate-300 to-slate-500", emoji: "⚪" },
  { name: "Gold", xp: 1500, color: "from-yellow-400 to-amber-500", emoji: "🟡" },
  { name: "Platinum", xp: 3500, color: "from-cyan-300 to-sky-500", emoji: "⚪" },
  { name: "Diamond", xp: 7000, color: "from-sky-400 to-indigo-500", emoji: "💎" },
  { name: "Legend", xp: 15000, color: "from-fuchsia-400 to-pink-600", emoji: "🏆" },
];

function tierForXp(xp: number) {
  let i = 0;
  for (let k = 0; k < TIERS.length; k++) if (xp >= TIERS[k].xp) i = k;
  const next = TIERS[i + 1];
  return { current: TIERS[i], next, progress: next ? Math.min(1, (xp - TIERS[i].xp) / (next.xp - TIERS[i].xp)) : 1 };
}

// ---- Tier Reveal Overlay (Shows EVERY time page opens) ----
function TierReveal({ xp, onComplete }: { xp: number; onComplete: () => void }) {
  const tier = TIERS.reduce((prev, curr) => (xp >= curr.xp ? curr : prev), TIERS[0]);

  useEffect(() => {
    // Play sound on reveal
    try {
      sfx.reveal();
    } catch {}

    // Auto-dismiss after 2.5 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md"
      onClick={onComplete}
    >
      <motion.div
        initial={{ scale: 0, rotate: -30, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 0, rotate: 30, opacity: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 15, delay: 0.15 }}
        className="text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Expanding glow rings */}
        <motion.div
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-gradient-to-br ${tier.color} blur-xl`}
        />
        <motion.div
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 3.2, opacity: 0 }}
          transition={{ duration: 1.6, delay: 0.35 }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full bg-gradient-to-br ${tier.color} blur-2xl`}
        />

        {/* Tier Badge */}
        <motion.div
          animate={{
            scale: [1, 1.06, 1],
            rotate: [0, 3, -3, 0],
          }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.6 }}
          className={`relative w-36 h-36 mx-auto rounded-3xl bg-gradient-to-br ${tier.color} flex items-center justify-center text-7xl shadow-2xl mb-6`}
        >
          {tier.emoji}
        </motion.div>

        {/* Tier Name */}
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`text-5xl font-extrabold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent mb-3`}
        >
          {tier.name}
        </motion.h2>

        {/* XP */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-slate-300 text-xl font-medium"
        >
          {xp.toLocaleString()} XP
        </motion.p>

        {/* Tap hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.2 }}
          className="text-slate-500 text-sm mt-8 animate-pulse"
        >
          Tap anywhere to enter the Arena
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

// --- Battle result tiers ---
type ResultBadge = { label: string; className: string };

function statusForScore(score: number): ResultBadge {
  if (score >= 9) return { label: "🏆 MASTERED", className: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/30" };
  if (score >= 7) return { label: "✅ PASSED", className: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30" };
  if (score >= 5) return { label: "⚠️ CLOSE", className: "bg-amber-500/20 text-amber-300 border-amber-400/30" };
  if (score >= 3) return { label: "🔄 RETRY", className: "bg-orange-500/20 text-orange-300 border-orange-400/30" };
  return { label: "💀 KEEP TRAINING", className: "bg-red-500/20 text-red-300 border-red-400/30" };
}

function getRecommendedLeader(score: number, currentLeader: Leader): Leader | null {
  if (score >= 3) return null;
  const easierLeaders = LEADERS.filter(
    (l) => l.difficulty < currentLeader.difficulty && l.requireXp <= currentLeader.requireXp
  );
  if (easierLeaders.length === 0) return null;
  return easierLeaders.sort((a, b) => a.difficulty - b.difficulty)[0];
}

type Leader = {
  id: string;
  name: string;
  title: string;
  emoji: string;
  difficulty: number;
  quote: string;
  theme: string;
  requireXp: number;
  questions: string[];
};

const LEADERS: Leader[] = [
  {
    id: "oprah", name: "Oprah Winfrey", title: "The Empathetic Visionary", emoji: "🎤", difficulty: 1,
    quote: "Turn your wounds into wisdom.", theme: "from-purple-500 to-pink-500", requireXp: 0,
    questions: [
      "Tell me about a moment that shaped who you are today.",
      "How do you create genuine connection with people you've just met?",
      "Describe a time you helped someone unlock their potential.",
    ],
  },
  {
    id: "branson", name: "Richard Branson", title: "The Adventurous Rebel", emoji: "🚀", difficulty: 1,
    quote: "Screw it, let's do it.", theme: "from-red-500 to-orange-500", requireXp: 0,
    questions: [
      "What's the boldest risk you've ever taken?",
      "How do you decide when to break the rules?",
      "Pitch me an idea that scares you in 60 seconds.",
    ],
  },
  {
    id: "satya", name: "Satya Nadella", title: "The Growth Mindset Leader", emoji: "💡", difficulty: 2,
    quote: "Be a learn-it-all, not a know-it-all.", theme: "from-blue-500 to-cyan-500", requireXp: 100,
    questions: [
      "Tell me about something you completely changed your mind on.",
      "How do you foster empathy on a team that disagrees?",
      "Walk me through how you'd reinvent a struggling product.",
    ],
  },
  {
    id: "indra", name: "Indra Nooyi", title: "The Strategic Powerhouse", emoji: "⚡", difficulty: 3,
    quote: "Just because you are CEO, don't think you have landed.", theme: "from-emerald-500 to-teal-500", requireXp: 500,
    questions: [
      "How do you balance short-term wins with long-term strategy?",
      "Describe a tough decision that disappointed half your stakeholders.",
      "What does 'performance with purpose' mean to you?",
    ],
  },
  {
    id: "jobs", name: "Steve Jobs", title: "The Perfectionist Visionary", emoji: "🍎", difficulty: 5,
    quote: "Stay hungry. Stay foolish.", theme: "from-zinc-400 to-zinc-700", requireXp: 1500,
    questions: [
      "What's something everyone in your field gets wrong?",
      "Show me you can say no to a great idea to protect a greater one.",
      "Convince me that craft still matters when shipping fast wins.",
    ],
  },
  {
    id: "elon", name: "Elon Musk", title: "The First Principles Disruptor", emoji: "🛸", difficulty: 6,
    quote: "When something is important enough, you do it even if the odds aren't in your favor.", theme: "from-indigo-500 to-violet-600", requireXp: 3500,
    questions: [
      "Reason from first principles: why is X expensive, and how would you make it 10× cheaper?",
      "Tell me about a 'physics-of-the-problem' mistake on your last project.",
      "If you had 6 months and unlimited compute, what would you build?",
    ],
  },
  {
    id: "boardroom", name: "Boardroom Mode", title: "Face All Leaders At Once", emoji: "🏛️", difficulty: 7,
    quote: "Eight perspectives. One you.", theme: "from-amber-500 to-rose-600", requireXp: 7000,
    questions: [
      "Oprah asks: Why does this work matter to you, personally?",
      "Elon asks: What assumption everyone makes is actually wrong?",
      "Jobs asks: What would you cut to make this perfect?",
    ],
  },
  {
    id: "mirror", name: "Mirror Match", title: "Face Your Own AI Clone", emoji: "🪞", difficulty: 7,
    quote: "Your toughest opponent is you.", theme: "from-fuchsia-500 to-pink-600", requireXp: 15000,
    questions: [
      "Your clone says you avoid hard feedback. Defend yourself.",
      "Your clone says your last 'win' was actually luck. Convince it otherwise.",
      "What would you have to become to beat your future self?",
    ],
  },
];

function Particles() {
  const dots = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        d: 8 + Math.random() * 10,
      })),
    [],
  );
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute w-1 h-1 rounded-full bg-fuchsia-400/60"
          initial={{ x: `${d.x}%`, y: `${d.y}%`, opacity: 0.2 }}
          animate={{ y: [`${d.y}%`, `${(d.y + 30) % 100}%`, `${d.y}%`], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: d.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function ArenaPage() {
  const router = useRouter();
  const fetchStats = useServerFn(getMyStats);
  const awardXp = useServerFn(awardInterviewXp);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [results, setResults] = useState<Record<string, number>>({});
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [open, setOpen] = useState<Leader | null>(null);
  const [active, setActive] = useState<Leader | null>(null);
  const [showTierReveal, setShowTierReveal] = useState(true); // Show EVERY time

  useEffect(() => {
    fetchStats().then((s: any) => {
      setXp(s?.xp ?? 0);
      setStreak(s?.current_streak ?? 0);
    });
    try {
      const stored = localStorage.getItem("arena.results");
      if (stored) {
        setResults(JSON.parse(stored));
      } else {
        const legacy = JSON.parse(localStorage.getItem("arena.defeated") ?? "[]");
        if (Array.isArray(legacy) && legacy.length) {
          const migrated: Record<string, number> = {};
          legacy.forEach((id: string) => {
            migrated[id] = 6;
          });
          setResults(migrated);
          localStorage.setItem("arena.results", JSON.stringify(migrated));
        }
      }
      const storedAttempts = localStorage.getItem("arena.attempts");
      if (storedAttempts) {
        setAttempts(JSON.parse(storedAttempts));
      }
    } catch {}
  }, [fetchStats]);

  const t = tierForXp(xp);
  const defeatedCount = Object.keys(results).length;

  const onChallenge = (l: Leader) => {
    sfx.reveal();
    setOpen(null);
    setActive(l);
  };

  const onComplete = async (l: Leader, score: number) => {
    try {
      const res: any = await awardXp({ data: { finalScore: score } });
      setXp(res.xp);
      setStreak(res.currentStreak);
      const next = { ...results, [l.id]: score };
      setResults(next);
      localStorage.setItem("arena.results", JSON.stringify(next));
      const nextAttempts = { ...attempts, [l.id]: (attempts[l.id] || 0) + 1 };
      setAttempts(nextAttempts);
      localStorage.setItem("arena.attempts", JSON.stringify(nextAttempts));
      sfx.correct();
      const { label } = statusForScore(score);
      const recommendedLeader = getRecommendedLeader(score, l);
      if (score >= 7) {
        toast.success(`+${res.gained} XP · ${l.name} — ${label} (${score}/10)`);
      } else if (score >= 5) {
        toast.warning(`${l.name} — ${label} (${score}/10). Keep pushing!`);
      } else if (score >= 3) {
        toast.error(`${l.name} — ${label} (${score}/10). Practice and retry!`);
      } else {
        const recMsg = recommendedLeader
          ? ` Try ${recommendedLeader.name} first (Difficulty ${recommendedLeader.difficulty}/7).`
          : "";
        toast.error(`${l.name} — ${label} (${score}/10).${recMsg}`);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save XP");
    }
    setActive(null);
  };

  if (active) return <ArenaInterview leader={active} onExit={() => setActive(null)} onComplete={onComplete} />;

  return (
    <div className="relative min-h-screen text-foreground">
      {/* Tier Reveal Overlay — plays EVERY time page opens */}
      <AnimatePresence>
        {showTierReveal && (
          <TierReveal
            xp={xp}
            onComplete={() => setShowTierReveal(false)}
          />
        )}
      </AnimatePresence>

      <Particles />

      <section className="container mx-auto px-4 sm:px-6 max-w-6xl pt-14 pb-10 relative">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-6xl font-bold tracking-tight mb-3"
        >
          🏟️ <span className="text-fluid">Interview Arena</span>
        </motion.h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Face the world's most demanding leaders. Climb from Rookie to Legend.
        </p>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatPill icon={<Sparkles className="w-4 h-4" />} label="Current tier" value={t.current.name} grad={t.current.color} />
          <div className="glass-card p-4">
            <div className="text-xs text-muted-foreground mb-1">XP</div>
            <div className="text-xl font-bold mb-2">
              {xp.toLocaleString()}
              {t.next && <span className="text-xs text-muted-foreground font-normal"> / {t.next.xp.toLocaleString()}</span>}
            </div>
            <Progress value={t.progress * 100} className="h-1.5" />
            {t.next && <div className="text-[10px] text-muted-foreground mt-1">Next: {t.next.name}</div>}
          </div>
          <StatPill icon={<Flame className="w-4 h-4 text-orange-400" />} label="Streak" value={`${streak} 🔥`} grad="from-orange-500 to-red-500" />
          <StatPill icon={<Trophy className="w-4 h-4 text-amber-400" />} label="Leaders defeated" value={`${defeatedCount} / 8`} grad="from-amber-400 to-yellow-500" />
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 max-w-6xl pb-24 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {LEADERS.map((l, i) => {
            const unlocked = xp >= l.requireXp;
            const result = results[l.id];
            const badge = result !== undefined ? statusForScore(result) : null;
            const attemptCount = attempts[l.id] || 0;
            return (
              <motion.button
                key={l.id}
                onClick={() => setOpen(l)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative text-left rounded-2xl p-6 border backdrop-blur overflow-hidden transition-all ${
                  unlocked
                    ? "glass-card glass-hover hover:border-fuchsia-400/40"
                    : "bg-muted/30 border-border/40 grayscale opacity-70"
                }`}
              >
                <div className={`absolute -top-16 -right-16 w-44 h-44 rounded-full bg-gradient-to-br ${l.theme} opacity-30 blur-3xl`} />
                {badge && (
                  <div className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.className}`}>
                    {badge.label} · {result}/10
                  </div>
                )}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${l.theme} flex items-center justify-center text-3xl mb-4 shadow-lg`}>
                  {l.emoji}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-fuchsia-500 dark:text-fuchsia-300 font-semibold mb-1">{l.title}</div>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  {l.name}
                  {!unlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                </h3>
                <div className="text-amber-500 dark:text-amber-400 text-sm mb-3 tracking-widest">{"💀".repeat(l.difficulty)}</div>
                <p className="text-sm text-muted-foreground italic line-clamp-2">"{l.quote}"</p>
                {attemptCount > 0 && (
                  <div className="text-[10px] text-muted-foreground mt-2">Attempt #{attemptCount}</div>
                )}
                <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold">
                  {unlocked ? (
                    <span className="text-emerald-500 dark:text-emerald-300 inline-flex items-center gap-1">
                      <Swords className="w-3.5 h-3.5" /> Challenge
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Unlock at {l.requireXp.toLocaleString()} XP</span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full rounded-3xl bg-slate-900 border border-white/10 p-8 text-center overflow-hidden"
            >
              <div className={`absolute -inset-10 -z-10 bg-gradient-to-br ${open.theme} opacity-30 blur-3xl`} />
              <div className={`w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br ${open.theme} flex items-center justify-center text-6xl mb-4 shadow-xl`}>
                {open.emoji}
              </div>
              <div className="text-xs uppercase tracking-widest text-fuchsia-300 font-semibold mb-1">{open.title}</div>
              <h3 className="text-2xl font-bold mb-2">{open.name}</h3>
              <p className="text-slate-300 italic mb-3">"{open.quote}"</p>
              <div className="text-amber-400 mb-3 tracking-widest text-lg">{"💀".repeat(open.difficulty)}</div>
              {results[open.id] !== undefined && (
                <div className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full border mb-4 ${statusForScore(results[open.id]).className}`}>
                  Last result: {statusForScore(results[open.id]).label} · {results[open.id]}/10
                </div>
              )}
              {(attempts[open.id] || 0) >= 3 && (
                <div className="text-xs text-amber-400 mb-3">
                  ⚠️ You've attempted {open.name} {attempts[open.id]} times. Consider trying a different leader.
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                {xp >= open.requireXp ? (
                  <Button size="lg" onClick={() => onChallenge(open)} className="bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:opacity-90">
                    ⚔️ Accept Challenge
                  </Button>
                ) : (
                  <Button size="lg" disabled className="bg-slate-700">
                    🔒 Locked · Need {(open.requireXp - xp).toLocaleString()} more XP
                  </Button>
                )}
                <Button size="lg" variant="outline" onClick={() => setOpen(null)} className="border-white/20 bg-transparent hover:bg-white/10">
                  ↩️ Back to Arena
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatPill({ icon, label, value, grad }: { icon: React.ReactNode; label: string; value: string; grad: string }) {
  return (
    <div className="glass-card p-4">
      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">{icon} {label}</div>
      <div className={`text-xl font-bold bg-gradient-to-r ${grad} bg-clip-text text-transparent`}>{value}</div>
    </div>
  );
}

function ArenaInterview({
  leader,
  onExit,
  onComplete,
}: {
  leader: Leader;
  onExit: () => void;
  onComplete: (l: Leader, score: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [scores, setScores] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const total = leader.questions.length;
  const q = leader.questions[idx];

  const submit = () => {
    const words = answer.trim().split(/\s+/).filter(Boolean);
    const unique = new Set(words.map((w) => w.toLowerCase())).size;
    const raw = Math.min(10, Math.round(2 + words.length / 14 + unique / 18));
    const score = Math.max(1, raw);
    const next = [...scores, score];
    setScores(next);
    setAnswer("");
    sfx.submit();
    if (idx + 1 >= total) {
      const avg = Math.round(next.reduce((a, b) => a + b, 0) / next.length);
      setDone(true);
      setTimeout(() => onComplete(leader, avg), 1800);
    } else {
      setIdx(idx + 1);
    }
  };

  const avgScore = done ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const resultBadge = done ? statusForScore(avgScore) : null;
  const recommendedLeader = done ? getRecommendedLeader(avgScore, leader) : null;

  return (
    <div className={`relative min-h-screen text-white bg-gradient-to-br ${leader.theme}`}>
      <div className="absolute inset-0 bg-black/55 -z-0" />
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-10 relative">
        <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Forfeit
        </button>
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 flex flex-col items-center justify-center text-center"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          >
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
              className="w-32 h-32 rounded-3xl bg-white/15 flex items-center justify-center text-7xl mb-4 shadow-2xl">
              {leader.emoji}
            </motion.div>
            <div className="text-xs uppercase tracking-widest text-white/70 mb-1">{leader.title}</div>
            <h2 className="text-2xl font-bold mb-3">{leader.name}</h2>
            <p className="italic text-white/80">"{leader.quote}"</p>
            {done && resultBadge && (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, type: "spring" }}
                className={`mt-6 px-4 py-2 rounded-full border text-lg font-bold ${resultBadge.className}`}>
                {resultBadge.label} · {avgScore}/10
              </motion.div>
            )}
          </motion.div>
          <motion.div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center justify-between text-xs text-white/70 mb-2">
              <span>Question {Math.min(idx + 1, total)} of {total}</span>
              <span>{Math.round(((done ? total : idx) / total) * 100)}%</span>
            </div>
            <Progress value={((done ? total : idx) / total) * 100} className="h-1.5 mb-6 bg-white/10" />
            {!done ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="text-lg md:text-xl font-medium mb-5 leading-relaxed">
                    {q}
                  </motion.div>
                </AnimatePresence>
                <textarea autoFocus value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer…" rows={6}
                  className="w-full rounded-xl bg-black/30 border border-white/20 p-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none" />
                <Button className="mt-4 w-full bg-white text-slate-900 hover:bg-white/90" size="lg" disabled={answer.trim().length < 8} onClick={submit}>
                  <Send className="w-4 h-4 mr-2" /> Submit answer
                </Button>
              </>
            ) : (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-6">
                <div className="text-5xl mb-3">
                  {avgScore >= 7 ? "🏆" : avgScore >= 5 ? "⚡" : avgScore >= 3 ? "🔄" : "💪"}
                </div>
                <div className="text-2xl font-bold mb-1">
                  {avgScore >= 7 ? "Well fought!" : avgScore >= 5 ? "Close battle!" : avgScore >= 3 ? "Keep training!" : "Don't give up!"}
                </div>
                <div className="text-white/80 mb-4">
                  {avgScore >= 7 ? "The leader respects your effort." : avgScore >= 5 ? "You're almost there. Try again!" : avgScore >= 3 ? "Practice more and come back stronger." : "Start with easier leaders and build up."}
                </div>
                {recommendedLeader && (
                  <div className="bg-white/10 rounded-xl p-3 mb-4 text-sm">
                    💡 Try practicing with <strong>{recommendedLeader.name}</strong> first (Difficulty {recommendedLeader.difficulty}/7)
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button size="lg" onClick={() => { setIdx(0); setScores([]); setAnswer(""); setDone(false); }}
                    className="bg-white text-slate-900 hover:bg-white/90">
                    <RotateCcw className="w-4 h-4 mr-2" /> Retry Challenge
                  </Button>
                  <Button size="lg" variant="outline" onClick={onExit} className="border-white/20 bg-transparent hover:bg-white/10">
                    ↩️ Back to Arena
                  </Button>
                </div>
                <div className="text-xs text-white/50 mt-3">Tallying XP…</div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}