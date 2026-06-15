import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { 
  ArrowRight, Brain, Mic, Sparkles, Target, BarChart3, Zap,
  Swords, Shield, CheckCircle2, ChevronDown, Play,
  Trophy, Star, MessageSquare, UserCheck, Award, Clock, Globe
} from "lucide-react";
import { MentorsBlog } from "@/components/MentorsBlog";
import { AnimatedButton, SecondaryButton } from "@/components/AnimatedButton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JobGenius AI — Land your next role with AI mock interviews" },
      { name: "description", content: "Realistic AI-powered mock interviews. Voice + text, instant feedback, XP, streaks, and a global leaderboard — powered by Groq." },
      { property: "og:title", content: "JobGenius AI — AI Interview Assistant" },
      { property: "og:description", content: "Realistic AI mock interviews with instant feedback." },
    ],
  }),
  component: Landing,
});

const gradientStyle = `
@keyframes gradient-x {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
.animate-gradient-x {
  background-size: 200% 200%;
  animation: gradient-x 3s ease infinite;
}
`;

function ParticleField() {
  const particles = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 10 + Math.random() * 15,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <style>{gradientStyle}</style>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 rounded-full bg-fuchsia-400/40"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{ y: [0, -30, 0], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function TypewriterText({ texts }: { texts: string[] }) {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentText.length) setCharIndex(charIndex + 1);
        else setTimeout(() => setIsDeleting(true), 2000);
      } else {
        if (charIndex > 0) setCharIndex(charIndex - 1);
        else { setIsDeleting(false); setTextIndex((textIndex + 1) % texts.length); }
      }
    }, isDeleting ? 30 : 60);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts]);

  const longestText = texts.reduce((a, b) => (a.length > b.length ? a : b), "");

  return (
    <span className="relative inline-block">
      <span className="invisible block" aria-hidden="true">{longestText}</span>
      <span className="absolute inset-0 text-left bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap">
        {texts[textIndex].slice(0, charIndex)}
        <span className="text-fuchsia-400 animate-pulse">|</span>
      </span>
    </span>
  );
}

const highlights = [
  { icon: Brain, title: "AI-Powered", desc: "Groq · LLaMA 3 · Mixtral · Gemma", color: "from-fuchsia-500 to-pink-500" },
  { icon: Mic, title: "Voice + Text", desc: "Speak or type your answers", color: "from-cyan-500 to-teal-500" },
  { icon: Target, title: "Instant Scoring", desc: "Feedback on every answer", color: "from-amber-500 to-yellow-500" },
  { icon: Shield, title: "Free to Start", desc: "No credit card required", color: "from-emerald-500 to-green-500" },
];

const faqs = [
  { q: "How is this different from ChatGPT?", a: "ChatGPT asks questions. JobGenius AI tracks progress, gives verified credentials, gamifies with XP and tiers, and lets employers discover you through SkillPass." },
  { q: "Is it really free?", a: "Yes! Start practicing immediately. No credit card required. Premium features available on Pro plans." },
  { q: "What is SkillPass?", a: "A verified digital credential proving your interview skills with scores across 5 dimensions, leader endorsements, and consistency data." },
  { q: "Can employers find me?", a: "Yes. Your public SkillPass profile is discoverable. Employers filter by role and score. Blind mode available." },
  { q: "What if I score poorly?", a: "You get specific feedback and recommendations. Low scores don't lose XP. We want you to learn and improve." },
];

function AnimatedCharacter({ emoji, name, color, delay = 0 }: { emoji: string; name: string; color: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="flex flex-col items-center gap-2"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay }}
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-xl sm:text-2xl shadow-lg`}
      >
        {emoji}
      </motion.div>
      <span className="text-xs font-medium text-muted-foreground">{name}</span>
    </motion.div>
  );
}

function WelcomePopup({ onComplete }: { onComplete: () => void }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a1a]/92 backdrop-blur-sm"
      onClick={onComplete}
    >
      {["👋", "✨", "🚀", "💪"].map((emoji, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 2], x: (i - 1.5) * 60, y: -70 }}
          transition={{ duration: 1.2, delay: 0.3 + i * 0.15 }}
          className="absolute text-3xl"
        >
          {emoji}
        </motion.div>
      ))}
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
        className="text-center"
      >
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-slate-400 text-xl mb-2">{greeting}</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="text-5xl font-extrabold bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          Welcome to JobGenius AI
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="text-slate-300 text-lg mt-4">Ready to prove your skills today?</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1.5 }}
          className="text-slate-500 text-sm mt-6 animate-pulse">Tap to continue</motion.p>
      </motion.div>
    </motion.div>
  );
}

function DailyPopupController() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem("dailyPopupDate");
    
    if (lastShown !== today) {
      setShow(true);
      localStorage.setItem("dailyPopupDate", today);
    }
  }, []);

  return (
    <AnimatePresence>
      {show && <WelcomePopup onComplete={() => setShow(false)} />}
    </AnimatePresence>
  );
}

function Landing() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [arenaStep, setArenaStep] = useState(0);
  const [skillpassStep, setSkillpassStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setArenaStep((prev) => (prev + 1) % 4), 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setSkillpassStep((prev) => (prev + 1) % 4), 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-hidden relative">
      <DailyPopupController />
      <ParticleField />

      {/* HERO */}
      <section className="relative pt-24 pb-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[80%] h-[500px] bg-gradient-hero opacity-20 blur-[140px] rounded-full" />
          <motion.div
            className="absolute top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-fuchsia-500/15 to-cyan-500/15 blur-3xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/50 backdrop-blur text-xs font-medium mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Powered by Groq · LLaMA 3 · Mixtral · Gemma
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            Prove Your Skills.{" "}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              <TypewriterText texts={["Replace Your Resume.", "Get Discovered.", "Get Hired."]} />
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Realistic role-based mock interviews. Speak or type your answers, get scored instantly, earn XP, unlock AI leaders, and earn verified credentials.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            {/* ANIMATED CTA BUTTON */}
            <Link to="/signup" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-sky-600 hover:opacity-90 text-white font-semibold text-base h-12 px-7 rounded-lg shadow-elegant">
              Start practicing free <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            {/* SECONDARY BUTTON */}
            <SecondaryButton className="text-base h-12 px-7">
              <Link to="/interview-arena" className="flex items-center gap-2"><Play className="w-4 h-4 mr-2" /> Explore Arena</Link>
            </SecondaryButton>
          </motion.div>
          <p className="text-xs text-muted-foreground mt-6">Free tier: 50 interviews per account · No credit card</p>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>Free forever plan</span></div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>No credit card required</span></div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>50 free interviews</span></div>
          </motion.div>
        </div>
      </section>

      {/* FEATURE HIGHLIGHTS */}
      <section className="container mx-auto px-6 max-w-6xl pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {highlights.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-5 rounded-2xl border border-border bg-card/50 backdrop-blur text-center group"
            >
              <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <div className="font-bold text-lg mb-1">{item.title}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW INTERVIEW ARENA WORKS */}
      <section className="container mx-auto px-6 max-w-6xl pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 text-xs font-medium text-fuchsia-300 mb-4">
            <Swords className="w-3.5 h-3.5" /> Interview Arena
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-3">
            Face{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-rose-400 bg-clip-text text-transparent animate-gradient-x">Legends</span>{" "}
            in Battle
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Challenge AI versions of iconic leaders. Earn XP. Climb the ranks. Share your victories.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="relative">
            <div className="rounded-2xl border border-border bg-card/30 backdrop-blur-xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-rose-500/5" />
              <div className="relative">
                <div className="flex justify-center gap-4 sm:gap-6 mb-8">
                  <AnimatedCharacter emoji="🎤" name="Oprah" color="from-purple-500 to-pink-500" delay={0} />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-rose-500 flex items-center justify-center text-2xl sm:text-3xl shadow-xl shadow-fuchsia-500/20">
                      ⚔️
                    </div>
                    <span className="text-xs font-bold text-fuchsia-400">VS</span>
                  </div>
                  <AnimatedCharacter emoji="🍎" name="Steve Jobs" color="from-zinc-400 to-zinc-700" delay={0.5} />
                </div>
                <div className="space-y-3">
                  {[
                    { step: 1, icon: Play, text: "Choose your opponent from Oprah to Elon Musk", color: "text-cyan-400" },
                    { step: 2, icon: MessageSquare, text: "Answer tough questions under pressure", color: "text-amber-400" },
                    { step: 3, icon: Trophy, text: "Get scored, earn XP, and unlock harder leaders", color: "text-emerald-400" },
                    { step: 4, icon: Star, text: "Share your battle card. Challenge friends.", color: "text-fuchsia-400" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        arenaStep === i ? "border border-fuchsia-500/30 bg-fuchsia-500/5" : "border border-transparent"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500/20 to-rose-500/20 flex items-center justify-center flex-shrink-0">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <span className="text-sm">{item.text}</span>
                      {arenaStep === i && (
                        <span className="ml-auto text-xs text-fuchsia-400 font-bold">NOW</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-3">The Arena is Your Training Ground</h3>
              <p className="text-muted-foreground leading-relaxed">
                Not just practice — it's a game. Each leader has a unique personality, difficulty level, and interview style.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "7 Tiers", desc: "Rookie to Legend" },
                { label: "8 Leaders", desc: "Unique personas" },
                { label: "Real XP", desc: "Lose or gain" },
                { label: "Shareable", desc: "Battle cards" },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl border border-border bg-card/30 text-center">
                  <div className="font-bold text-fuchsia-400">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              ))}
            </div>
            <Link to="/interview-arena">
              {/* ANIMATED ARENA BUTTON */}
              <div className="w-full bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:opacity-90 text-white font-semibold text-base h-12 rounded-lg flex items-center justify-center gap-2 shadow-elegant">
                Enter the Arena <Swords className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* HOW SKILLPASS WORKS */}
      <section className="container mx-auto px-6 max-w-6xl pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs font-medium text-amber-300 mb-4">
            <Award className="w-3.5 h-3.5" /> SkillPass
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-3">
            The Credential That{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent animate-gradient-x">Replaces Resumes</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Pass a 3-stage verified interview. Earn a permanent digital badge. Get discovered by employers.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 order-2 lg:order-1">
            <div>
              <h3 className="text-2xl font-bold mb-3">Proof Beats Promises</h3>
              <p className="text-muted-foreground leading-relaxed">
                Anyone can write "great communicator" on a resume. A SkillPass proves it with verified scores across 5 dimensions.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { icon: Shield, title: "Verified 3-Stage Interview", desc: "Technical, behavioral, and problem-solving — all in one sitting." },
                { icon: UserCheck, title: "AI Leader Endorsements", desc: "Defeated Steve Jobs in the Arena? He endorses your SkillPass." },
                { icon: Globe, title: "Shareable & Discoverable", desc: "Put it on LinkedIn. Employers find you through verified scores." },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl border border-border/50 bg-card/20">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="rounded-2xl border border-amber-500/20 bg-card/30 backdrop-blur-xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-yellow-500/5" />
              <div className="relative">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/30">
                  🎖️
                </div>
                <div className="space-y-3">
                  {[
                    { step: 1, icon: Target, text: "Reach Gold Tier (1,500 XP) to unlock", color: "text-cyan-400" },
                    { step: 2, icon: Clock, text: "Complete 3-stage interview in 45 minutes", color: "text-amber-400" },
                    { step: 3, icon: Award, text: "Score 75%+ to earn your SkillPass badge", color: "text-emerald-400" },
                    { step: 4, icon: Globe, text: "Share on LinkedIn. Employers discover you.", color: "text-fuchsia-400" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        skillpassStep === i ? "border border-amber-500/30 bg-amber-500/5" : "border border-transparent"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center flex-shrink-0">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <span className="text-sm">{item.text}</span>
                      {skillpassStep === i && (
                        <span className="ml-auto text-xs text-amber-400 font-bold">STEP</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 text-center">
                  <div className="text-xs text-amber-300 font-bold mb-1">SKILLPASS PREVIEW</div>
                  <div className="text-2xl font-bold text-amber-400">87%</div>
                  <div className="text-xs text-muted-foreground">Overall Score</div>
                  <div className="flex justify-center gap-2 mt-2">
                    {["Technical", "Communication", "Leadership"].map((s, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container mx-auto px-6 max-w-6xl pb-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-12"
        >
          Everything You Need to{" "}
          <span className="bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-gradient-x">Win Interviews</span>
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Brain, title: "Dynamic AI interviewer", desc: "Questions adapt to your role and follow up on what you actually say." },
            { icon: Mic, title: "Voice + text modes", desc: "Speak your answers naturally with Web Speech, or type them." },
            { icon: Target, title: "Instant 1–10 scoring", desc: "Every answer gets scored with a one-line actionable tip." },
            { icon: BarChart3, title: "Full performance reports", desc: "End-of-interview summary with strengths and weak areas." },
            { icon: Zap, title: "Powered by Groq", desc: "LLaMA 3, Mixtral, and Gemma — sub-second responses." },
            { icon: Sparkles, title: "Auto-save & resume", desc: "Close the tab and come back later. Progress is preserved." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl border border-border bg-card bg-gradient-card hover:shadow-elegant transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-hero flex items-center justify-center mb-4 shadow-elegant">
                <f.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="container mx-auto px-6 max-w-4xl pb-24">
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-10"
        >
          Why We Beat the{" "}
          <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-amber-400 bg-clip-text text-transparent animate-gradient-x">Competition</span>
        </motion.h2>
        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-muted-foreground font-medium">Feature</th>
                <th className="p-4 text-center text-primary font-bold bg-primary/5">JobGenius AI</th>
                <th className="p-4 text-center text-muted-foreground">Otavo.ai</th>
                <th className="p-4 text-center text-muted-foreground">ChatGPT</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["AI Interview Practice", true, true, true],
                ["Gamification (XP & Tiers)", true, false, false],
                ["AI Leader Personas", true, false, false],
                ["Verified Credentials", true, false, false],
                ["Employer Discovery", true, false, false],
                ["Daily Streak System", true, false, false],
                ["Public SkillPass Profile", true, false, false],
                ["Real XP Loss Consequences", true, false, false],
              ].map(([feature, has, otavo, chatgpt], i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-card/30">
                  <td className="p-4 font-medium">{feature}</td>
                  <td className="p-4 text-center bg-primary/5">{has ? <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" /> : "—"}</td>
                  <td className="p-4 text-center">{otavo ? <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" /> : <span className="text-red-400">✕</span>}</td>
                  <td className="p-4 text-center">{chatgpt ? <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" /> : <span className="text-red-400">✕</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-6 max-w-2xl pb-24">
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-10"
        >
          Frequently Asked{" "}
          <span className="bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent animate-gradient-x">Questions</span>
        </motion.h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card/50 backdrop-blur overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full p-5 text-left flex items-center justify-between hover:bg-card/30"
              >
                <span className="font-medium text-sm pr-4">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${activeFaq === i ? "rotate-180" : ""}`} />
              </button>
              {activeFaq === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* MENTORS BLOG */}
      <MentorsBlog />

      {/* CTA */}
      <section className="container mx-auto px-6 max-w-4xl pb-24">
        <div className="rounded-3xl bg-gradient-hero p-12 text-center shadow-elegant relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 blur-3xl -z-10" />
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Ready to Prove Your Skills?</h2>
          <p className="text-primary-foreground/90 mb-8 max-w-xl mx-auto">Practice interviews. Earn credentials. Get hired.</p>
          {/* ANIMATED CTA BUTTON */}
          <Link to="/signup" className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-white/90 font-semibold text-base h-12 px-7 rounded-lg">
            Create free account <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <p className="text-xs text-primary-foreground/60 mt-4">No credit card required</p>
        </div>
      </section>
    </div>
  );
}