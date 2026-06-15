import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  startInterview,
  getInterview,
  saveInterviewProgress,
  completeInterview,
} from "@/lib/interviews.functions";
import { askInterviewer, generateFinalReport, type AiTurn } from "@/lib/groq.functions";
import { ROLES } from "@/lib/question-bank";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { VoiceRecorder, speak } from "@/components/VoiceRecorder";
import { Sparkles, Volume2, VolumeX, Send, Loader2, Mic, MessageSquare, ArrowLeft, Shuffle, Zap, Play, Star } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ThinkingDots } from "@/components/ThinkingDots";
import { Typewriter } from "@/components/Typewriter";
import { FloatingPoints, ScoreBurst } from "@/components/ScoreFx";
import { CoachKai } from "@/components/CoachKai";
import { VoiceAgentMode } from "@/components/VoiceAgentMode";
import { AnimatedWaves } from "@/components/AnimatedWaves";
import { QuestionCard } from "@/components/QuestionCard";
import { sfx } from "@/lib/sfx";
import { Bot } from "lucide-react";

const GROQ_MODELS = [
  { id: "llama-3.3-70b-versatile", label: "LLaMA 3.3 70B", icon: "🦙" },
  { id: "llama-3.1-8b-instant", label: "LLaMA 3.1 8B", icon: "⚡" },
  { id: "gemma2-9b-it", label: "Gemma 2 9B", icon: "💎" },
];

const TOTAL_QUESTIONS = 7;

type Turn = { question: string; answer: string; score?: number; feedback?: string; idealAnswer?: string };

export const Route = createFileRoute("/_authenticated/interview")({
  head: () => ({ meta: [{ title: "Interview — JobGenius AI" }] }),
  validateSearch: (search) =>
    z.object({ resume: z.string().uuid().optional() }).parse(search),
  component: Interview,
});

// ═══════════ PAGE ENTRY ANIMATION ═══════════
function PageEntryOverlay({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    try { sfx.reveal(); } catch {}
    const timer = setTimeout(() => onComplete(), 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a1a]/95 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0, rotate: -20, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 1.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 14 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-400 blur-xl"
        />
        <motion.div
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 1.5, delay: 0.4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 blur-2xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="relative w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center text-6xl shadow-2xl mb-4"
        >
          🎯
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent"
        >
          Preparing Interview
        </motion.h2>
      </motion.div>
    </motion.div>
  );
}

// ═══════════ START CELEBRATION ═══════════
function StartCelebration({ role, model, onComplete }: { role: string; model: string; onComplete: () => void }) {
  useEffect(() => {
    try { sfx.correct(); } catch {}
    const timer = setTimeout(() => onComplete(), 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md"
    >
      {Array.from({ length: 25 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: "50%", y: "50%", opacity: 1, scale: 0 }}
          animate={{
            x: `${40 + Math.random() * 20}%`,
            y: `${25 + Math.random() * 50}%`,
            opacity: 0,
            scale: 2.5,
          }}
          transition={{ duration: 0.8 + Math.random() * 0.7, delay: 0.1, ease: "easeOut" }}
          className="absolute w-2 h-2 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-400"
        />
      ))}
      <motion.div
        initial={{ scale: 0, rotate: -15, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 1.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="text-center z-10"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-7xl mb-4"
        >
          ⚡
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-white mb-2"
        >
          Interview Ready!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-slate-300 text-lg"
        >
          {role} · {model}
        </motion.p>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="h-1 bg-gradient-to-r from-fuchsia-500 to-cyan-500 rounded-full mt-4 mx-auto w-48"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.2 }}
          className="text-slate-500 text-sm mt-4 animate-pulse"
        >
          Starting soon...
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

// ═══════════ MODEL SHUFFLER ═══════════
function ModelShuffler({ onShuffle }: { onShuffle: (model: typeof GROQ_MODELS[0]) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startShuffle();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const startShuffle = () => {
    setIsShuffling(true);
    let count = 0;
    const maxShuffles = 15;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % GROQ_MODELS.length);
      count++;
      if (count >= maxShuffles) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsShuffling(false);
        const finalModel = GROQ_MODELS[Math.floor(Math.random() * GROQ_MODELS.length)];
        setCurrentIndex(GROQ_MODELS.indexOf(finalModel));
        onShuffle(finalModel);
      }
    }, 80);
  };

  const model = GROQ_MODELS[currentIndex];

  return (
    <motion.div
      animate={isShuffling ? { scale: [1, 1.03, 1] } : {}}
      transition={{ duration: 0.08, repeat: isShuffling ? Infinity : 0 }}
    >
      <Card className="p-5 bg-gradient-to-br from-fuchsia-500/5 to-cyan-500/5 border-fuchsia-500/20 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Shuffle className={`w-4 h-4 ${isShuffling ? "text-fuchsia-400 animate-spin" : "text-cyan-400"}`} />
          <span className="text-xs text-muted-foreground font-medium">
            {isShuffling ? "Selecting best model..." : "AI Model Selected"}
          </span>
        </div>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3"
        >
          <span className="text-3xl">{model.icon}</span>
          <div className="text-left">
            <div className="font-bold text-lg">{model.label}</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Powered by Groq
            </div>
          </div>
        </motion.div>
        <button
          onClick={startShuffle}
          disabled={isShuffling}
          className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          🔄 Reshuffle
        </button>
      </Card>
    </motion.div>
  );
}

function Interview() {
  const navigate = useNavigate();
  const { resume } = Route.useSearch();
  const startFn = useServerFn(startInterview);
  const fetchFn = useServerFn(getInterview);
  const askFn = useServerFn(askInterviewer);
  const saveFn = useServerFn(saveInterviewProgress);
  const completeFn = useServerFn(completeInterview);
  const reportFn = useServerFn(generateFinalReport);

  const [setupOpen, setSetupOpen] = useState(!resume);
  const [role, setRole] = useState(ROLES[0]);
  const [model, setModel] = useState(GROQ_MODELS[0].id);
  const [selectedModel, setSelectedModel] = useState<typeof GROQ_MODELS[0] | null>(null);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [voiceMode, setVoiceMode] = useState(false);
  const [agentMode, setAgentMode] = useState(false);
  const [ttsOn, setTtsOn] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [showEntry, setShowEntry] = useState(!resume);
  const [showStartCelebration, setShowStartCelebration] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [floats, setFloats] = useState<{ id: number; value: number }[]>([]);
  const floatId = useRef(0);

  const lastScore = turns.length ? turns[turns.length - 1].score ?? 0 : 0;
  const combo = (() => {
    let c = 0;
    for (let i = turns.length - 1; i >= 0; i--) {
      if ((turns[i].score ?? 0) >= 7) c++;
      else break;
    }
    return c;
  })();
  const kaiMood: "idle" | "happy" | "sad" | "fire" | "level" =
    lastScore === 0 ? "idle"
    : lastScore <= 3 ? "sad"
    : combo >= 3 ? "fire"
    : lastScore >= 8 ? "happy"
    : "idle";

  const fireConfetti = (score: number) => {
    const intensity = score >= 10 ? 1.4 : 1;
    confetti({
      particleCount: Math.round(80 * intensity),
      spread: 75,
      origin: { y: 0.7 },
      colors: ["#6366f1", "#8b5cf6", "#22d3ee", "#10b981", "#f59e0b"],
    });
    if (score >= 10) {
      setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } }), 200);
      setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } }), 400);
    }
  };

  useEffect(() => {
    if (!resume) return;
    fetchFn({ data: { id: resume } })
      .then((row) => {
        setInterviewId(row.id);
        setRole(row.role);
        setModel(row.model_used);
        const t = (row.transcript as Turn[]) ?? [];
        setTurns(t);
        setSetupOpen(false);
        setShowEntry(false);
        bootstrap(row.id, row.role, row.model_used, t);
      })
      .catch((e) => toast.error(e.message));
  }, [resume]);

  useEffect(() => {
    if (setupOpen || finalizing) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [setupOpen, finalizing]);

  useEffect(() => {
    if (!interviewId) return;
    localStorage.setItem(`iv:${interviewId}`, JSON.stringify({ turns, currentQuestion }));
  }, [interviewId, turns, currentQuestion]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, currentQuestion, loading]);

  const buildMessages = (history: Turn[]) => {
    const msgs: { role: "user" | "assistant" | "system"; content: string }[] = [];
    for (const t of history) {
      msgs.push({ role: "assistant", content: JSON.stringify({ question: t.question }) });
      msgs.push({ role: "user", content: t.answer });
    }
    return msgs;
  };

  async function askNext(history: Turn[]) {
    setLoading(true);
    try {
      const turn = await askFn({
        data: { model, role, messages: buildMessages(history), questionIndex: history.length },
      });
      setCurrentQuestion(turn.question);
      sfx.reveal();
      if (ttsOn) speak(turn.question);
      if (turn.fallback) toast.warning("Using local fallback questions (AI gateway unreachable).");
      return turn;
    } catch (e) {
      toast.error((e as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function bootstrap(id: string, r: string, m: string, history: Turn[]) {
    setInterviewId(id);
    setRole(r);
    setModel(m);
    setTurns(history);
    await askNext(history);
  }

  const onStart = async () => {
    setLoading(true);
    setShowStartCelebration(true);
  };

  const onCelebrationComplete = async () => {
    setShowStartCelebration(false);
    try {
      const row = await startFn({ data: { role, model: selectedModel?.id || model } });
      setSetupOpen(false);
      setShowEntry(false);
      await bootstrap(row.id, role, selectedModel?.id || model, []);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    const text = answer.trim();
    if (!text) { toast.error("Please enter an answer first."); return; }
    if (!interviewId) return;
    setLoading(true);
    const messages = [
      ...buildMessages(turns),
      { role: "assistant" as const, content: JSON.stringify({ question: currentQuestion }) },
      { role: "user" as const, content: text },
    ];
    let turn: AiTurn & { fallback: boolean };
    try {
      turn = await askFn({ data: { model, role, messages, questionIndex: turns.length + 1 } });
    } catch (e) {
      toast.error((e as Error).message);
      setLoading(false);
      return;
    }
    const newTurn: Turn = { question: currentQuestion, answer: text, score: turn.score, feedback: turn.feedback };
    const newTurns = [...turns, newTurn];
    setTurns(newTurns);
    setAnswer("");
    setLoading(false);
    if (typeof turn.score === "number") {
      const id = ++floatId.current;
      setFloats((f) => [...f, { id, value: turn.score! }]);
      setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1500);
      if (turn.score >= 8) { fireConfetti(turn.score); sfx.correct(); }
      else if (turn.score >= 5) sfx.average();
      else sfx.poor();
    }
    saveFn({ data: { id: interviewId, transcript: newTurns } }).catch(() => {});
    if (newTurns.length >= TOTAL_QUESTIONS) {
      await finalize(newTurns);
    } else {
      setCurrentQuestion(turn.question);
      sfx.reveal();
      if (ttsOn) speak(turn.question);
    }
  };

  async function finalize(finalTurns: Turn[]) {
    if (!interviewId) return;
    setFinalizing(true);
    try {
      const report = await reportFn({ data: { model, role, transcript: finalTurns } });
      await completeFn({ data: { id: interviewId, transcript: finalTurns, finalScore: report.finalScore, summary: JSON.stringify(report) } });
      localStorage.removeItem(`iv:${interviewId}`);
      navigate({ to: "/results/$id", params: { id: interviewId } });
    } catch (e) {
      toast.error((e as Error).message);
      setFinalizing(false);
    }
  }

  // ═══════════ SETUP SCREEN ═══════════
  if (setupOpen) {
    return (
      <div className="relative min-h-screen">
        {/* Page Entry Overlay */}
        <AnimatePresence>
          {showEntry && <PageEntryOverlay onComplete={() => setShowEntry(false)} />}
        </AnimatePresence>

        {/* Start Celebration */}
        <AnimatePresence>
          {showStartCelebration && selectedModel && (
            <StartCelebration
              role={role}
              model={selectedModel.label}
              onComplete={onCelebrationComplete}
            />
          )}
        </AnimatePresence>

        <div className="container mx-auto px-6 max-w-2xl py-16">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_200%]">
            New Interview
          </h1>
          <p className="text-muted-foreground mb-10">Pick a role. We'll auto-select the best AI model for you.</p>
          
          <Card className="p-8 space-y-6">
            {/* Role Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Auto Model Selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">AI Model — Auto Selected</label>
              <ModelShuffler onShuffle={setSelectedModel} />
              <p className="text-[11px] text-muted-foreground mt-2 text-center">
                We pick the best Groq model for sub-second responses.
              </p>
            </div>

            {/* Start Button */}
            <Button
              onClick={onStart}
              disabled={loading}
              size="lg"
              className="w-full bg-gradient-to-r from-fuchsia-600 via-pink-600 to-cyan-600 hover:opacity-90 shadow-xl shadow-fuchsia-500/20 text-lg py-7 rounded-2xl group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              )}
              Start Interview
            </Button>

            {selectedModel && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-muted-foreground"
              >
                Role: <span className="text-fuchsia-400 font-bold">{role}</span> · 
                Model: <span className="text-cyan-400 font-bold">{selectedModel.label}</span>
              </motion.p>
            )}
          </Card>
        </div>
      </div>
    );
  }

  if (finalizing) {
    return (
      <div className="container mx-auto px-6 max-w-2xl py-32 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold">Generating your report…</h2>
        <p className="text-muted-foreground mt-2">Crunching scores, identifying strengths and gaps.</p>
      </div>
    );
  }

  const progress = (turns.length / TOTAL_QUESTIONS) * 100;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <>
    <div className="container mx-auto px-6 max-w-3xl py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">{role}</div>
          <h1 className="text-xl font-semibold">Question {turns.length + 1} of {TOTAL_QUESTIONS}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-muted-foreground">{mm}:{ss}</span>
          <Button variant="ghost" size="icon" onClick={() => setTtsOn((v) => !v)} title="Text-to-speech">
            {ttsOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setVoiceMode((v) => !v)}>
            {voiceMode ? <MessageSquare className="w-4 h-4 mr-1" /> : <Mic className="w-4 h-4 mr-1" />}
            {voiceMode ? "Text" : "Voice"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAgentMode(true)} title="Hands-free voice agent">
            <Bot className="w-4 h-4 mr-1" /> Agent
          </Button>
        </div>
      </div>
      <Progress value={progress} className="mb-6" />

      {currentQuestion && (
        <div className="mb-5">
          <QuestionCard
            index={turns.length + 1}
            total={TOTAL_QUESTIONS}
            question={currentQuestion}
            points={Math.round((10 - turns.length) * 12 + combo * 5)}
          />
        </div>
      )}

      <Card ref={scrollRef} className="p-6 max-h-[40vh] overflow-y-auto space-y-4 mb-4 bg-gradient-card">
        <AnimatePresence initial={false}>
          {turns.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              <Bubble role="ai">{t.question}</Bubble>
              <Bubble role="me">{t.answer}</Bubble>
              {t.feedback && (
                <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-3 ml-2 text-sm">
                  {typeof t.score === "number" && <ScoreBurst score={t.score} keyId={i} />}
                  <span className="text-muted-foreground italic flex-1">
                    {i === turns.length - 1 ? <Typewriter text={t.feedback} /> : t.feedback}
                  </span>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {turns.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground text-center py-6">Your answers will appear here as you progress.</p>
        )}
        {loading && <ThinkingDots />}
      </Card>

      <div className="space-y-3">
        {voiceMode ? (
          <VoiceRecorder disabled={loading} onTranscript={(text) => setAnswer((prev) => (prev ? prev + " " + text : text))} />
        ) : null}
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={voiceMode ? "Your spoken answer will appear here…" : "Type your answer…"}
          rows={4}
          className="resize-none"
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitAnswer(); }}
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Tip: ⌘/Ctrl + Enter to submit</span>
          <div className="relative">
            <FloatingPoints items={floats} />
            <Button
              onClick={() => { sfx.submit(); submitAnswer(); }}
              disabled={loading || !answer.trim()}
              className="bg-gradient-hero hover:opacity-90 transition-transform active:scale-95"
            >
              <Send className="w-4 h-4 mr-2" /> Submit answer
            </Button>
          </div>
        </div>
      </div>
    </div>

    <CoachKai mood={kaiMood} streak={combo} />

    <VoiceAgentMode
      open={agentMode}
      question={currentQuestion}
      loading={loading}
      onClose={() => setAgentMode(false)}
      onSubmit={(text) => {
        setAnswer(text);
        setAgentMode(false);
        setTimeout(() => submitAnswer(), 50);
      }}
    />
    </>
  );
}

function Bubble({ role, children }: { role: "ai" | "me"; children: React.ReactNode }) {
  return (
    <div className={`flex ${role === "me" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
          role === "me"
            ? "bg-gradient-hero text-primary-foreground rounded-br-sm"
            : "bg-card border border-border rounded-bl-sm"
        }`}
      >
        {children}
      </div>
    </div>
  );
}