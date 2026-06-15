import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listInterviews, getProfile, deleteInterview } from "@/lib/interviews.functions";
import { getMyStats } from "@/lib/gamification.functions";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, BarChart3, Trophy, Clock, Trash2, Flame, Zap, AlertTriangle,
  Swords, Award, TrendingUp, Mail, Sparkles, Star, Target, Calendar,
  Cpu, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { getStreakReminderHours } from "@/lib/streak-settings";
import { sfx } from "@/lib/sfx";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — JobGenius AI" }] }),
  component: Dashboard,
});

type Row = {
  id: string;
  role: string;
  model_used: string;
  started_at: string;
  completed_at: string | null;
  final_score: number | null;
};

const TIERS = [
  { name: "Rookie", xp: 0, color: "from-slate-400 to-slate-600", emoji: "🟢" },
  { name: "Bronze", xp: 100, color: "from-amber-600 to-orange-700", emoji: "🟤" },
  { name: "Silver", xp: 500, color: "from-slate-300 to-slate-500", emoji: "⚪" },
  { name: "Gold", xp: 1500, color: "from-yellow-400 to-amber-500", emoji: "🟡" },
  { name: "Platinum", xp: 3500, color: "from-cyan-300 to-sky-500", emoji: "⚪" },
  { name: "Diamond", xp: 7000, color: "from-sky-400 to-indigo-500", emoji: "💎" },
  { name: "Legend", xp: 15000, color: "from-fuchsia-400 to-pink-600", emoji: "🏆" },
];

function getTier(xp: number) {
  return TIERS.reduce((prev, curr) => (xp >= curr.xp ? curr : prev), TIERS[0]);
}

function AnimatedTierObject({ color, emoji }: { color: string; emoji: string }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
      className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-4xl shadow-xl relative overflow-hidden shrink-0`}
    >
      <motion.div
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 bg-white/20"
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/60" />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/40" />
      </motion.div>
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
      >
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/50" />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/40" />
      </motion.div>
      <span className="relative z-10">{emoji}</span>
    </motion.div>
  );
}

function ScreenCrack({ onComplete, userName }: { onComplete: () => void; userName: string }) {
  const [stage, setStage] = useState(0);
  const [cracks, setCracks] = useState<{ x: number; y: number; w: number; h: number; rot: number }[]>([]);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 2200);
    const t2 = setTimeout(() => {
      setCracks(Array.from({ length: 14 }).map(() => ({
        x: Math.random() * 100, y: Math.random() * 100,
        w: 40 + Math.random() * 140, h: 1 + Math.random() * 3, rot: Math.random() * 360,
      })));
      try { sfx.reveal(); } catch {}
    }, 2400);
    const t3 = setTimeout(() => onComplete(), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden"
      onClick={() => stage >= 1 && onComplete()}
    >
      {Array.from({ length: 25 }).map((_, i) => (
        <motion.div key={i} initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.7, 0], scale: [0, 1.8, 0], y: [-20, -100] }}
          transition={{ duration: 2.5, delay: 0.3 + Math.random() * 1.8 }}
          className="absolute w-1.5 h-1.5 rounded-full bg-fuchsia-400"
          style={{ left: `${Math.random() * 100}%`, top: `${55 + Math.random() * 45}%` }}
        />
      ))}
      <AnimatePresence>
        {stage === 0 && (
          <motion.div
            initial={{ scale: 0, rotate: -12, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 1.8, opacity: 0, filter: "blur(8px)" }}
            transition={{ type: "spring", stiffness: 180, damping: 14 }}
            className="text-center z-10 px-4"
          >
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg sm:text-xl mb-2">Welcome back,</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="text-5xl sm:text-7xl md:text-8xl font-extrabold bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              {userName}
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 1.2 }}
              className="text-muted-foreground text-sm mt-6">Ready to crush it today? ✨</motion.p>
          </motion.div>
        )}
      </AnimatePresence>
      {stage === 1 && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/50 z-20" />
          {cracks.map((crack, i) => (
            <motion.div key={i} initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: [0, 0.9, 0.6] }}
              transition={{ delay: i * 0.03, duration: 0.4 }} className="absolute bg-white/70 z-30"
              style={{ left: `${crack.x}%`, top: `${crack.y}%`, width: `${crack.w}px`, height: `${crack.h}px`, transform: `rotate(${crack.rot}deg)` }}
            />
          ))}
          <motion.div initial={{ scale: 0, opacity: 1 }} animate={{ scale: 25, opacity: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 z-20"
          />
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div key={`shard-${i}`} initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
              animate={{ x: (Math.random() - 0.5) * 700, y: 500 + Math.random() * 500, opacity: 0, rotate: Math.random() * 900, scale: 0 }}
              transition={{ duration: 1.8 + Math.random(), delay: 0.4, ease: "easeIn" }}
              className="absolute top-1/2 left-1/2 w-3 h-7 bg-white/50 rounded-sm z-30"
              style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
            />
          ))}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.8 }}
            className="absolute bottom-20 text-slate-400 text-sm z-40 animate-pulse">Tap to skip</motion.p>
        </>
      )}
    </motion.div>
  );
}

function SparkleDot({ delay, color }: { delay: number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 0.8, 0], scale: [0, 1.2, 0] }}
      transition={{ duration: 1.5, delay, repeat: Infinity, repeatDelay: 3 }}
      className={`absolute w-1.5 h-1.5 rounded-full ${color}`}
      style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
    />
  );
}

function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const fetchList = useServerFn(listInterviews);
  const fetchProfile = useServerFn(getProfile);
  const fetchStats = useServerFn(getMyStats);
  const removeInterview = useServerFn(deleteInterview);

  const [rows, setRows] = useState<Row[]>([]);
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(50);
  const [stats, setStats] = useState<{ xp: number; current_streak: number; best_streak: number; last_interview_at: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    Promise.all([fetchList(), fetchProfile(), fetchStats()])
      .then(([r, p, s]) => {
        setRows(r as Row[]);
        setUsed(p.profile?.interviews_used ?? 0);
        setLimit(p.freeTierLimit);
        setStats(s as never);
        if ((s as any)?.xp !== undefined) {
          localStorage.setItem("lastKnownXp", String((s as any).xp));
        }
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [fetchList, fetchProfile, fetchStats]);

  const completed = rows.filter((r) => r.final_score != null);
  const avg = completed.length
    ? Math.round((completed.reduce((s, r) => s + (r.final_score ?? 0), 0) / completed.length) * 10) / 10
    : 0;
  
  const currentXp = stats?.xp ?? parseInt(localStorage.getItem("lastKnownXp") || "0");
  const tier = getTier(currentXp);
  const nextTier = TIERS[TIERS.findIndex(t => t.name === tier.name) + 1];
  const xpProgress = nextTier ? Math.round((currentXp - tier.xp) / (nextTier.xp - tier.xp) * 100) : 100;
  const userName = user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? "Champion";
  const userEmail = user?.email ?? "";
  const bestScore = completed.length ? Math.max(...completed.map(r => r.final_score ?? 0)) : 0;
  const totalInterviews = rows.length;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this interview?")) return;
    await removeInterview({ data: { id } });
    setRows((rs) => rs.filter((r) => r.id !== id));
    toast.success("Deleted");
  };

  const scores = completed.slice(-5).map((r, i) => ({ name: `Q${i + 1}`, score: r.final_score ?? 0 }));

  const getAiRecommendation = () => {
    if (avg === 0) return { title: "Complete First Interview", metric: "Baseline Discovery", action: "Start now" };
    if (avg < 6) return { title: "Communication Drills", metric: "Pacing & Clarity", action: "Practice" };
    if (bestScore >= 9) return { title: "Advanced Arena", metric: "Edge Cases", action: "Enter arena" };
    return { title: "STAR Method Lab", metric: "Structure", action: "Refine" };
  };

  const aiRecommendation = getAiRecommendation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-fuchsia-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 max-w-6xl py-12 relative overflow-hidden bg-background">
      <AnimatePresence>
        {showWelcome && <ScreenCrack onComplete={() => setShowWelcome(false)} userName={userName} />}
      </AnimatePresence>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 relative">
        <div className="relative">
          <SparkleDot delay={0} color="bg-fuchsia-400" />
          <SparkleDot delay={0.5} color="bg-cyan-400" />
          <SparkleDot delay={1} color="bg-amber-400" />
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            <span className="text-muted-foreground">Hi, </span>
            <span className="bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              {userName}
            </span>
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-fuchsia-400" /> {today}
          </p>
        </div>
        <div className="flex gap-3">
          <Button size="lg" asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow-xl shadow-fuchsia-500/20 group text-white">
            <Link to="/interview">
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" /> New Interview
            </Link>
          </Button>
        </div>
      </div>

      {/* USER TIER CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="relative mb-6 rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 overflow-hidden group"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-15 transition-opacity`} />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 w-full">
            <AnimatedTierObject color={tier.color} emoji={tier.emoji} />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-lg text-foreground">{userName}</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r ${tier.color} text-white font-bold tracking-wide shadow-sm`}>
                  {tier.name.toUpperCase()}
                </span>
                {stats?.current_streak ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3" /> {stats.current_streak}d Streak
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {userEmail}</span>
                <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500" /> {currentXp.toLocaleString()} XP</span>
              </div>
              {nextTier && (
                <div className="mt-3 max-w-md">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Next: <strong className="text-foreground">{nextTier.name}</strong></span>
                    <span className="text-fuchsia-500 font-bold">{xpProgress}%</span>
                  </div>
                  <Progress value={xpProgress} className="h-2" />
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-48 bg-muted/30 border border-border rounded-xl p-3 flex flex-col justify-between shrink-0">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-muted-foreground flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-500" /> AI Quota
              </span>
              <span className="text-foreground font-semibold">{used}/{limit}</span>
            </div>
            <Progress value={(used / limit) * 100} className="h-1.5" />
            <span className="text-[10px] text-muted-foreground mt-1.5 block">Resets automatically.</span>
          </div>
        </div>
      </motion.div>

      {/* AI RECOMMENDATION */}
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="mb-6 p-4 rounded-xl border border-fuchsia-500/20 bg-gradient-to-r from-fuchsia-500/5 via-cyan-500/5 to-transparent flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-fuchsia-500/10 text-fuchsia-500 shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-fuchsia-500 font-bold uppercase tracking-wider">AI Recommendation</div>
            <div className="text-sm font-semibold text-foreground mt-0.5">{aiRecommendation.title}</div>
            <div className="text-xs text-muted-foreground">Focus: {aiRecommendation.metric}</div>
          </div>
        </div>
        <Button size="sm" asChild variant="outline" className="border-fuchsia-500/30 hover:bg-fuchsia-500/10 text-foreground shrink-0">
          <Link to="/interview">{aiRecommendation.action}</Link>
        </Button>
      </motion.div>

      {/* STREAK AT RISK */}
      {stats && stats.current_streak > 0 && (() => {
        const last = stats.last_interview_at ? new Date(stats.last_interview_at) : null;
        const hoursLeft = last ? Math.max(0, 48 - (Date.now() - last.getTime()) / 3_600_000) : 48;
        const atRisk = hoursLeft > 0 && hoursLeft < getStreakReminderHours();
        if (atRisk && !sessionStorage.getItem("streak-notify-shown")) {
          sessionStorage.setItem("streak-notify-shown", "1");
          setTimeout(() => sfx.notify(), 400);
        }
        return atRisk ? (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="mb-6 rounded-2xl border border-orange-500/40 bg-gradient-to-r from-orange-500/10 to-red-500/10 p-4 flex items-center gap-3"
          >
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}
              className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center"
            >
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </motion.div>
            <div className="flex-1">
              <div className="font-semibold text-foreground">Streak at risk! 🔥</div>
              <div className="text-sm text-muted-foreground">Only {Math.ceil(hoursLeft)}h left.</div>
            </div>
            <Button asChild size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <Link to="/interview">Save streak</Link>
            </Button>
          </motion.div>
        ) : null;
      })()}

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { icon: Zap, label: "Total XP", value: currentXp.toLocaleString(), color: "from-amber-400 to-yellow-500", glow: "shadow-amber-500/20" },
          { icon: Flame, label: "Best Streak", value: `${stats?.best_streak ?? 0}d`, color: "from-orange-400 to-red-500", glow: "shadow-orange-500/20" },
          { icon: Clock, label: "Interviews", value: totalInterviews, color: "from-cyan-400 to-teal-500", glow: "shadow-cyan-500/20" },
          { icon: Star, label: "Best Score", value: `${bestScore}/10`, color: "from-fuchsia-400 to-pink-500", glow: "shadow-fuchsia-500/20" },
          { icon: TrendingUp, label: "Avg Score", value: `${avg}/10`, color: "from-emerald-400 to-green-500", glow: "shadow-emerald-500/20" },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.08, type: "spring", stiffness: 150 }}
            whileHover={{ y: -6, scale: 1.04 }}
            className="relative p-5 rounded-2xl border border-border bg-card/60 backdrop-blur text-center group cursor-pointer overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
            <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${s.glow}`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <SparkleDot delay={i * 0.3} color="bg-fuchsia-400" />
          </motion.div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { icon: Swords, label: "Arena", to: "/interview-arena", color: "from-fuchsia-500 to-pink-500", desc: "Battle AI legends" },
          { icon: Award, label: "SkillPass", to: "/skillpass", color: "from-amber-400 to-yellow-500", desc: "Get verified" },
          { icon: Trophy, label: "Leaderboard", to: "/leaderboard", color: "from-cyan-400 to-teal-500", desc: "See your rank" },
          { icon: Target, label: "Practice", to: "/interview", color: "from-emerald-400 to-green-500", desc: "Start interview" },
        ].map((a, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }} whileHover={{ y: -4, scale: 1.03 }} whileTap={{ scale: 0.97 }}
          >
            <Link to={a.to}>
              <Card className="p-4 bg-card/60 backdrop-blur hover:shadow-elegant transition-all cursor-pointer border-border group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                    <a.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{a.label}</div>
                    <div className="text-xs text-muted-foreground">{a.desc}</div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* MINI SCORE BAR */}
      {scores.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="p-6 mb-8 bg-card/60 backdrop-blur border-border">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-fuchsia-400" /> Recent Scores
            </h3>
            <div className="flex items-end gap-3 h-32">
              {scores.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }} animate={{ height: `${(s.score / 10) * 100}%` }}
                  transition={{ delay: 1 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-xs font-bold text-foreground">{s.score}</span>
                  <motion.div
                    className="w-full rounded-t-lg bg-gradient-to-t from-fuchsia-500 to-cyan-500"
                    style={{ height: "100%" }}
                  />
                  <span className="text-[10px] text-muted-foreground">{s.name}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* PAST INTERVIEWS */}
      <h2 className="text-xl font-semibold mb-4 text-foreground">Past Interviews</h2>
      {rows.length === 0 ? (
        <Card className="p-10 text-center bg-card/60 backdrop-blur flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-muted-foreground mb-4">No interviews yet. Run your first one!</p>
          <Button asChild className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white">
            <Link to="/interview"><Plus className="w-4 h-4 mr-2" /> Start interview</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {rows.slice(0, 10).map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ x: 4 }}
            >
              <Card className="p-4 flex items-center justify-between bg-card/40 backdrop-blur border-border hover:border-fuchsia-500/30 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground flex items-center gap-2">
                    {r.role}
                    {!r.completed_at && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold">In progress</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.started_at).toLocaleDateString()} · {r.model_used}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {r.final_score != null && (
                    <div className="text-right">
                      <div className={`text-xl font-bold ${r.final_score >= 7 ? "text-emerald-500" : r.final_score >= 5 ? "text-amber-500" : "text-red-500"}`}>
                        {r.final_score}/10
                      </div>
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="border-border hover:bg-card"
                    onClick={() => r.completed_at
                      ? router.navigate({ to: "/results/$id", params: { id: r.id } })
                      : router.navigate({ to: "/interview", search: { resume: r.id } })
                    }
                  >
                    {r.completed_at ? "Report" : "Resume"}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} className="hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-400" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
