import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  Award, Lock, ShieldCheck, ArrowLeft, Send, Sparkles, Share2,
  Eye, EyeOff, Briefcase, Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SKILL_ROLES, getRole, type SkillRole } from "@/lib/skillpass-roles";
import {
  submitSkillPass, listMySkillPasses, updateSkillPass,
} from "@/lib/skillpass.functions";
import { getMyStats } from "@/lib/gamification.functions";
import { sfx } from "@/lib/sfx";
import { toast } from "sonner";
import { BadgeAwardAnimation, AnimatedRadarChart, TierBadgeAnimated } from "@/components/SkillPassAnimations";

export const Route = createFileRoute("/_authenticated/skillpass")({
  head: () => ({
    meta: [
      { title: "SkillPass — JobGenius AI" },
      { name: "description", content: "Earn a verified, shareable SkillPass that proves your real interview skills." },
    ],
  }),
  component: SkillPassPage,
});

const GOLD_GATE = 1500;

type Pass = {
  id: string;
  role: string;
  overall_score: number;
  stage_scores: number[];
  passed: boolean;
  slug: string | null;
  published: boolean;
  open_to_work: boolean;
  created_at: string;
  expires_at: string;
};

// ---- Firecracker ----
function Firecracker({ delay, x, y, color }: { delay: number; x: number; y: number; color: string }) {
  const particles = Array.from({ length: 10 }).map((_, i) => ({
    id: i,
    angle: (i / 10) * 360,
    distance: 35 + Math.random() * 70,
  }));

  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
            y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.6 + Math.random() * 0.6, delay, ease: "easeOut" }}
          className={`absolute w-2 h-2 rounded-full ${color}`}
        />
      ))}
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 0.4, delay }}
        className={`absolute w-3 h-3 rounded-full ${color} -translate-x-1/2 -translate-y-1/2`}
      />
    </div>
  );
}

// ---- SkillPass Unlock Celebration (EVERY time) ----
function SkillPassCelebration({ xp, onComplete }: { xp: number; onComplete: () => void }) {
  const remainingXP = Math.max(0, GOLD_GATE - xp);
  const progressPercent = Math.min(100, Math.round((xp / GOLD_GATE) * 100));
  const isUnlocked = xp >= GOLD_GATE;

  useEffect(() => {
    try {
      isUnlocked ? sfx.correct() : sfx.reveal();
    } catch {}
    const timer = setTimeout(() => onComplete(), 3500);
    return () => clearTimeout(timer);
  }, [onComplete, isUnlocked]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md overflow-hidden"
      onClick={onComplete}
    >
      {/* Firecrackers */}
      <Firecracker delay={0.1} x={15} y={18} color="bg-yellow-400" />
      <Firecracker delay={0.3} x={85} y={12} color="bg-amber-400" />
      <Firecracker delay={0.5} x={10} y={80} color="bg-fuchsia-400" />
      <Firecracker delay={0.7} x={90} y={75} color="bg-cyan-400" />
      <Firecracker delay={0.9} x={50} y={8} color="bg-pink-400" />
      <Firecracker delay={1.1} x={25} y={85} color="bg-emerald-400" />
      <Firecracker delay={1.3} x={75} y={85} color="bg-orange-400" />
      <Firecracker delay={1.5} x={50} y={92} color="bg-purple-400" />

      {/* Floating sparkles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: Math.random() * 100 + "%", y: "115%", opacity: 0, scale: 0 }}
          animate={{ y: "-15%", opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
          transition={{ duration: 2.5 + Math.random() * 1.5, delay: 0.2 + Math.random() * 1, ease: "easeOut" }}
          className={`absolute w-1.5 h-1.5 rounded-full ${["bg-yellow-300", "bg-amber-400", "bg-fuchsia-400", "bg-cyan-300"][i % 4]}`}
        />
      ))}

      <motion.div
        initial={{ scale: 0, rotate: -20, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 0, rotate: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.2 }}
        className="text-center relative z-10 max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow rings */}
        <motion.div
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full ${
            isUnlocked ? "bg-gradient-to-br from-amber-400 to-yellow-500" : "bg-gradient-to-br from-fuchsia-400 to-cyan-400"
          } blur-xl`}
        />
        <motion.div
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 3.8, opacity: 0 }}
          transition={{ duration: 1.8, delay: 0.5 }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full ${
            isUnlocked ? "bg-gradient-to-br from-yellow-400/40 to-amber-500/40" : "bg-gradient-to-br from-fuchsia-400/30 to-cyan-400/30"
          } blur-2xl`}
        />

        {/* Icon */}
        <motion.div
          animate={isUnlocked ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : { scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
          className={`relative w-36 h-36 mx-auto rounded-3xl flex items-center justify-center text-7xl shadow-2xl mb-6 ${
            isUnlocked ? "bg-gradient-to-br from-amber-400 to-yellow-500" : "bg-gradient-to-br from-slate-600 to-slate-800"
          }`}
        >
          {isUnlocked ? "🎖️" : "🔒"}
        </motion.div>

        {isUnlocked ? (
          <>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-4xl font-extrabold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent mb-3"
            >
              SkillPass Unlocked!
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="text-slate-300 text-lg">
              You're eligible to earn your verified credential!
            </motion.p>
          </>
        ) : (
          <>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-3xl font-extrabold text-white mb-3">
              SkillPass Locked
            </motion.h2>

            {/* XP Progress Ring */}
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }} className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                <motion.circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke="url(#goldGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 264" }}
                  animate={{ strokeDasharray: `${(progressPercent / 100) * 264} 264` }}
                  transition={{ duration: 1.2, delay: 1, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-amber-400">{progressPercent}%</span>
              </div>
            </motion.div>

            {/* Remaining XP */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Current XP</span>
                <span className="text-white font-bold">{xp.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Required XP</span>
                <span className="text-amber-400 font-bold">{GOLD_GATE.toLocaleString()}</span>
              </div>
              <div className="border-t border-white/10 my-2" />
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Remaining</span>
                <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-fuchsia-400 font-bold text-xl">
                  {remainingXP.toLocaleString()} XP
                </motion.span>
              </div>
            </motion.div>
          </>
        )}

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 2 }} className="text-slate-500 text-sm mt-6 animate-pulse">
          Tap anywhere to continue
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

function SkillPassPage() {
  const fetchStats = useServerFn(getMyStats);
  const fetchPasses = useServerFn(listMySkillPasses);
  const submit = useServerFn(submitSkillPass);
  const updatePass = useServerFn(updateSkillPass);

  const [xp, setXp] = useState(0);
  const [passes, setPasses] = useState<Pass[]>([]);
  const [open, setOpen] = useState<SkillRole | null>(null);
  const [active, setActive] = useState<SkillRole | null>(null);
  const [awarded, setAwarded] = useState<Pass | null>(null);
  const [showCelebration, setShowCelebration] = useState(true); // EVERY time

  useEffect(() => {
    fetchStats().then((s: any) => setXp(s?.xp ?? 0));
    fetchPasses().then((p: any) => setPasses(p ?? []));
  }, [fetchStats, fetchPasses]);

  const locked = xp < GOLD_GATE;

  const onComplete = async (role: SkillRole, stageScores: number[]) => {
    try {
      const row: any = await submit({ data: { role: role.id, stageScores } });
      setAwarded(row);
      sfx.correct();
      if (row.xpAwarded) setXp((v) => v + row.xpAwarded);
      const fresh: any = await fetchPasses();
      setPasses(fresh ?? []);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save SkillPass");
    }
    setActive(null);
  };

  const togglePublish = async (id: string, current: boolean) => {
    try {
      const row: any = await updatePass({ data: { id, published: !current } });
      setPasses((ps) => ps.map((p) => (p.id === id ? row : p)));
      toast.success(row.published ? "Profile is now public" : "Profile is private");
    } catch (e: any) { toast.error(e?.message ?? "Could not update"); }
  };

  const toggleOTW = async (id: string, current: boolean) => {
    try {
      const row: any = await updatePass({ data: { id, open_to_work: !current } });
      setPasses((ps) => ps.map((p) => (p.id === id ? row : p)));
    } catch (e: any) { toast.error(e?.message ?? "Could not update"); }
  };

  if (active) {
    return <SkillPassInterview role={active} onExit={() => setActive(null)} onComplete={onComplete} />;
  }

  if (awarded) {
    return <SkillPassAward pass={awarded} onClose={() => setAwarded(null)} />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-6xl py-10">
      {/* Celebration Overlay — EVERY time */}
      <AnimatePresence>
        {showCelebration && (
          <SkillPassCelebration xp={xp} onComplete={() => setShowCelebration(false)} />
        )}
      </AnimatePresence>

      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-xs font-semibold mb-3">
          <Award className="w-3.5 h-3.5 text-amber-400" /> NEW · Credential System
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
          🎖️ Earn Your <span className="text-fluid">SkillPass</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Prove your skills. Replace your resume. Get discovered through verified, role-specific interview performance.
        </p>
      </motion.div>

      {locked && (
        <div className="glass-card p-6 mb-8 text-center border-amber-400/30">
          <Lock className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h2 className="font-bold text-lg mb-1">Reach Gold Tier to unlock SkillPass</h2>
          <p className="text-sm text-muted-foreground mb-3">
            You're at <span className="font-semibold text-foreground">{xp.toLocaleString()} XP</span> — reach{" "}
            <span className="font-semibold text-foreground">{GOLD_GATE.toLocaleString()} XP</span> to prove your consistency.
          </p>
          <Progress value={(xp / GOLD_GATE) * 100} className="max-w-md mx-auto" />
        </div>
      )}

      {passes.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-400" /> Your SkillPasses</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {passes.map((p) => {
              const role = getRole(p.role);
              return (
                <div key={p.id} className="glass-card glass-hover p-5 border-rainbow-soft">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-2xl">{role?.emoji ?? "🎖️"}</div>
                      <div className="font-bold mt-1">JobGenius Verified {role?.title ?? p.role}</div>
                      <div className="text-xs text-muted-foreground">
                        Earned {new Date(p.created_at).toLocaleDateString()} · valid until {new Date(p.expires_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${p.passed ? "text-emerald-500" : "text-amber-500"}`}>
                      {p.overall_score}%
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 my-3">
                    {p.stage_scores.map((s, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-muted">
                        Stage {i + 1}: {s}%
                      </span>
                    ))}
                    {p.passed ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-semibold">VERIFIED</span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 font-semibold">NEEDS WORK</span>
                    )}
                  </div>
                  {p.passed && (
                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <div className="flex items-center justify-between text-sm">
                        <Label className="flex items-center gap-2 font-normal">
                          {p.published ? <Eye className="w-3.5 h-3.5 text-emerald-500" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                          Public profile
                        </Label>
                        <Switch checked={p.published} onCheckedChange={() => togglePublish(p.id, p.published)} />
                      </div>
                      {p.published && (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <Label className="flex items-center gap-2 font-normal">
                              <Briefcase className="w-3.5 h-3.5" /> Open to work
                            </Label>
                            <Switch checked={p.open_to_work} onCheckedChange={() => toggleOTW(p.id, p.open_to_work)} />
                          </div>
                          <div className="flex gap-2 pt-1">
                            <Link to="/verified/$slug" params={{ slug: p.slug ?? "" }} className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
                              <Share2 className="w-3 h-3" /> View public page
                            </Link>
                            <button
                              onClick={() => {
                                const url = `${window.location.origin}/verified/${p.slug}`;
                                navigator.clipboard?.writeText(url);
                                toast.success("Link copied");
                              }}
                              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                            >
                              Copy link
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold mb-1">Pick a role</h2>
        <p className="text-sm text-muted-foreground mb-5">A verified 3-stage interview. ~45 min. Your performance defines the credential.</p>
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${locked ? "opacity-60 pointer-events-none" : ""}`}>
          {SKILL_ROLES.map((r, i) => {
            const holders = 100 + (r.id.charCodeAt(0) * 7 + r.id.length * 13) % 2400;
            return (
              <motion.button
                key={r.id}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: Math.min(0.4, i * 0.05) }}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setOpen(r)}
                className="glass-card glass-hover text-left p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{r.emoji}</div>
                  <div className="text-amber-400 text-xs tracking-widest">{"★".repeat(r.difficulty)}{"☆".repeat(5 - r.difficulty)}</div>
                </div>
                <div className="font-bold text-lg mb-1">{r.title}</div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{r.description}</p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>⏱ {r.duration}</span>
                  <span>{holders.toLocaleString()} holders</span>
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
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full rounded-3xl bg-card border border-border p-7 text-center"
            >
              <div className="text-6xl mb-3">{open.emoji}</div>
              <h3 className="text-2xl font-bold mb-2">{open.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This is a verified <strong>3-stage</strong> interview. Your performance will be visible on your SkillPass (private by default). Ready?
              </p>
              <ul className="text-left text-sm space-y-2 mb-5">
                {open.stages.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <span><strong>{s.name}</strong> — {s.questions.length} {s.questions.length === 1 ? "scenario" : "questions"}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button className="flex-1" onClick={() => { sfx.reveal(); setOpen(null); setActive(open); }}>
                  <ShieldCheck className="w-4 h-4 mr-1" /> Begin verified interview
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setOpen(null)}>Cancel</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function scoreAnswer(answer: string) {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const unique = new Set(words.map((w) => w.toLowerCase())).size;
  const raw = 20 + words.length * 2.2 + unique * 1.4;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function SkillPassInterview({
  role, onExit, onComplete,
}: {
  role: SkillRole;
  onExit: () => void;
  onComplete: (r: SkillRole, stageScores: number[]) => void;
}) {
  const allQuestions = useMemo(
    () => role.stages.flatMap((s, si) => s.questions.map((q) => ({ stageIndex: si, stageName: s.name, q }))),
    [role],
  );
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [scores, setScores] = useState<number[]>([]);

  const total = allQuestions.length;
  const curr = allQuestions[idx];
  const stageIdx = curr.stageIndex;

  const submit = () => {
    if (!answer.trim()) { toast.error("Type your answer first"); return; }
    sfx.submit();
    const s = scoreAnswer(answer);
    const next = [...scores, s];
    setScores(next);
    setAnswer("");
    if (idx + 1 >= total) {
      const byStage: number[][] = [[], [], []];
      next.forEach((sc, i) => byStage[allQuestions[i].stageIndex].push(sc));
      const stageAvgs = byStage.map((arr) => Math.round(arr.reduce((a, b) => a + b, 0) / Math.max(1, arr.length)));
      onComplete(role, stageAvgs);
    } else {
      setIdx(idx + 1);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <button onClick={onExit} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-6">
        <ArrowLeft className="w-4 h-4" /> Forfeit attempt
      </button>

      <div className="mb-4 flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest font-bold text-primary">
          Stage {stageIdx + 1} of 3 · {role.stages[stageIdx].name}
        </div>
        <div className="text-xs text-muted-foreground">Question {idx + 1} / {total}</div>
      </div>
      <Progress value={((idx + 1) / total) * 100} className="mb-6" />

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.35 }}
          className="glass-card p-7"
        >
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-fuchsia-500">
            <Sparkles className="w-3.5 h-3.5" /> Verified question
          </div>
          <h2 className="text-xl sm:text-2xl font-bold leading-snug mb-5">{curr.q}</h2>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Take your time. Score is revealed only after all 3 stages."
            className="w-full min-h-[160px] rounded-xl border border-border bg-background/60 backdrop-blur p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="flex justify-end mt-4">
            <Button onClick={submit}>
              <Send className="w-4 h-4 mr-1" /> {idx + 1 >= total ? "Finish & reveal" : "Next question"}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SkillPassAward({ pass, onClose }: { pass: Pass; onClose: () => void }) {
  const role = getRole(pass.role);
  return (
    <div className="container mx-auto max-w-2xl px-4 sm:px-6 py-12">
      {pass.passed ? (
        <motion.div
          initial={{ scale: 0.85, opacity: 0, rotateY: -25 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 14 }}
          className="glass-card border-rainbow p-8 text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 4, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl mb-3"
          >🏅</motion.div>
          <div className="text-xs uppercase tracking-widest font-bold text-amber-500 mb-1">JobGenius Verified</div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{role?.title ?? pass.role}</h1>
          <div className="text-6xl font-bold text-fluid mb-2">{pass.overall_score}%</div>
          <p className="text-sm text-muted-foreground mb-6">+{500} XP awarded · valid 1 year</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {pass.stage_scores.map((s, i) => (
              <div key={i} className="rounded-xl bg-muted/40 p-3">
                <div className="text-[10px] uppercase text-muted-foreground">Stage {i + 1}</div>
                <div className="text-xl font-bold">{s}%</div>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Your SkillPass is <strong>private</strong>. Toggle "Public profile" on the SkillPass page to share it.
          </p>
          <Button onClick={onClose} className="w-full sm:w-auto">View my SkillPasses</Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-7 text-center"
        >
          <div className="text-5xl mb-3">🎯</div>
          <h1 className="text-2xl font-bold mb-2">You're close — {pass.overall_score}%</h1>
          <p className="text-sm text-muted-foreground mb-4">You need 75% across stages. Here's the breakdown:</p>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {pass.stage_scores.map((s, i) => (
              <div key={i} className="rounded-xl bg-muted/40 p-3">
                <div className="text-[10px] uppercase text-muted-foreground">Stage {i + 1}</div>
                <div className={`text-xl font-bold ${s >= 75 ? "text-emerald-500" : "text-amber-500"}`}>{s}%</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mb-5">
            Use the Arena and regular interviews to strengthen your weakest stage. Try again any time — your unsuccessful attempts stay private.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={onClose}>Back to SkillPass</Button>
            <Button variant="outline" asChild><Link to="/interview-arena">Train in Arena</Link></Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}