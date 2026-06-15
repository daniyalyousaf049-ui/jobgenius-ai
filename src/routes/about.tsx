import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { 
  Code2, Users, Sparkles, Trophy,
  Terminal, Database, Cloud, Brain, Mic
} from "lucide-react";
import { sfx } from "@/lib/sfx";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — JobGenius AI" },
      { name: "description", content: "Built by SPARTANS, BSAI-2B. Prove your Skills." },
      { property: "og:title", content: "About JobGenius AI" },
      { property: "og:description", content: "AI Interview Assistant — Prove your Skills." },
    ],
  }),
  component: About,
});

const HELPERS = ["Abdullah Zafar", "Umair Ahmad", "Mohsin Nawaz"];

const TECH_STACK = [
  { icon: Terminal, label: "Frontend", desc: "React 19, TanStack Start, Tailwind CSS, Framer Motion", color: "from-sky-400 to-blue-600" },
  { icon: Brain, label: "AI Engine", desc: "Groq Cloud — LLaMA 3 70B, Mixtral 8x7B, Gemma 2 9B", color: "from-violet-400 to-indigo-600" },
  { icon: Mic, label: "Voice", desc: "Web Speech API — recognition + synthesis", color: "from-emerald-400 to-teal-600" },
  { icon: Database, label: "Backend", desc: "Postgres + Row-Level Security + Server Functions", color: "from-orange-400 to-red-600" },
  { icon: Cloud, label: "Deployment", desc: "Vercel — automatic CI/CD, edge network", color: "from-cyan-400 to-sky-600" },
];

const gradientAnimationStyle = `
@keyframes gradient-x {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.animate-gradient-x {
  background-size: 200% 200%;
  animation: gradient-x 4s ease infinite;
}
`;

function PageReveal({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    try { sfx.reveal(); } catch {}
    const timer = setTimeout(onComplete, 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0], 
            scale: [0, 1.2, 0], 
            x: (Math.random() - 0.5) * 180, 
            y: (Math.random() - 0.5) * 180 
          }}
          transition={{ duration: 1.3, delay: 0.2 + Math.random() * 0.7 }}
          className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-sky-400 to-violet-400"
        />
      ))}
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 1.4, opacity: 0 }}
        transition={{ type: "spring", stiffness: 170, damping: 15 }}
        className="text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-sky-500 via-violet-500 to-emerald-500 flex items-center justify-center text-5xl shadow-2xl mb-4"
        >
          ⚡
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-foreground"
        >
          About the Project
        </motion.h2>
      </motion.div>
    </motion.div>
  );
}

function Sparkle({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 0.7, 0], scale: [0, 1, 0] }}
      transition={{ duration: 2, delay, repeat: Infinity, repeatDelay: 3 }}
      className="absolute w-1.5 h-1.5 rounded-full bg-sky-400/60"
      style={{ left: `${x}%`, top: `${y}%` }}
    />
  );
}

function About() {
  const [showReveal, setShowReveal] = useState(true);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <style>{gradientAnimationStyle}</style>
      
      <AnimatePresence>
        {showReveal && <PageReveal onComplete={() => setShowReveal(false)} />}
      </AnimatePresence>

      <Sparkle delay={0} x={8} y={15} />
      <Sparkle delay={0.6} x={85} y={10} />
      <Sparkle delay={1.2} x={15} y={75} />
      <Sparkle delay={1.8} x={78} y={72} />
      <Sparkle delay={2.4} x={45} y={8} />
      <Sparkle delay={3} x={92} y={45} />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:60px_60px] -z-10" />

      <div className="container mx-auto px-6 max-w-3xl py-20">
        
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-500/20 bg-sky-500/5 text-xs font-medium text-sky-400 dark:text-sky-300 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" /> Behind the Product
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            <span className="text-foreground">About </span>
            <span className="bg-gradient-to-r from-sky-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient-x inline-block">
              JobGenius AI
            </span>
          </h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            An AI-powered interview practice platform that combines real-time voice interaction, 
            gamified progression, and verified credentials — built to make interview preparation 
            accessible to everyone, everywhere.
          </motion.p>
        </motion.div>

        {/* MISSION */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-border/40 dark:border-white/5 bg-card/50 backdrop-blur p-8 mb-10 text-center transition-all hover:border-sky-500/20 dark:hover:border-sky-500/10"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-sky-500 via-violet-500 to-emerald-500 flex items-center justify-center text-2xl mb-4 shadow-lg cursor-default"
          >
            🎯
          </motion.div>
          <h2 className="text-xl font-bold text-foreground mb-3">Why This Exists</h2>
          <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Most people don't have access to professional interview coaching. This platform 
            bridges that gap — <span className="text-sky-500 dark:text-sky-400 font-semibold">free AI-powered practice</span>, 
            real-time feedback, and credentials that actually prove what you can do.
          </p>
        </motion.div>

        {/* SPARTANS CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-border/40 dark:border-white/5 bg-card/50 backdrop-blur p-8 mb-10 text-center transition-all hover:border-sky-500/20 dark:hover:border-sky-500/10"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-sky-500 via-violet-500 to-emerald-500 flex items-center justify-center text-2xl mb-4 shadow-lg cursor-default"
          >
            🛡️
          </motion.div>
          <h2 className="text-3xl font-extrabold text-foreground mb-2 tracking-wide">
            <span className="bg-gradient-to-r from-sky-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient-x">
              SPARTANS
            </span>
          </h2>
          <p className="text-muted-foreground text-lg mb-1 font-medium">BSAI-2B</p>
          <p className="text-sky-500 dark:text-sky-400 text-sm font-semibold">Prove Your Skills</p>
        </motion.div>

        {/* CONTRIBUTORS */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-border/40 dark:border-white/5 bg-card/50 backdrop-blur p-8 mb-10 transition-all hover:border-sky-500/20 dark:hover:border-sky-500/10"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Contributors</h2>
          </div>
          <p className="text-muted-foreground mb-5 text-sm">Thank you to everyone who helped shape this project:</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {HELPERS.map((h, i) => (
              <motion.div
                key={h}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, scale: 1.03, borderColor: "rgba(56,189,248,0.4)" }}
                className="rounded-xl border border-border/40 dark:border-white/5 bg-muted/30 px-4 py-4 text-center text-sm font-medium text-foreground hover:text-sky-500 transition-all cursor-default"
              >
                <Trophy className="w-4 h-4 text-amber-500 mx-auto mb-2" />
                {h}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* TECH STACK */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-border/40 dark:border-white/5 bg-card/50 backdrop-blur p-8 transition-all hover:border-sky-500/20 dark:hover:border-sky-500/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <Code2 className="w-5 h-5 text-sky-500" />
            <h2 className="text-xl font-bold text-foreground">Technology</h2>
          </div>
          <div className="space-y-3">
            {TECH_STACK.map((tech, i) => (
              <motion.div
                key={tech.label}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ x: 4, borderColor: "rgba(56,189,248,0.3)" }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/40 dark:border-white/5 bg-muted/20 hover:bg-muted/40 transition-all group"
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tech.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <tech.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">{tech.label}</div>
                  <div className="text-xs text-muted-foreground">{tech.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-muted-foreground text-sm mt-12"
        >
          Built with dedication • University Project 2026
        </motion.p>
      </div>
    </div>
  );
}