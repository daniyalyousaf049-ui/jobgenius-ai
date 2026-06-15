import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

/** Beautiful per-question reveal panel with typewriter + animated points. */
export function QuestionCard({
  index, total, question, points,
}: {
  index: number;        // 1-based
  total: number;
  question: string;
  points: number;       // XP/points reward for this question
}) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    setTyped("");
    if (!question) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(question.slice(0, i));
      if (i >= question.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [question]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
        className="relative rounded-3xl p-6 md:p-8 border border-border bg-gradient-card overflow-hidden"
      >
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-fuchsia-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Question {index} / {total}
          </div>
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.15 }}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold shadow-elegant"
          >
            +{points} XP
          </motion.div>
        </div>

        <h2 className="font-display text-2xl md:text-3xl leading-snug font-semibold">
          <span className="text-fluid">{typed}</span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="inline-block w-[3px] h-6 align-middle ml-1 bg-primary"
          />
        </h2>

        <div className="mt-5 flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: i < index ? 1 : i === index - 1 ? 0.5 : 0 }}
              transition={{ duration: 0.5, delay: i * 0.04 }}
              className={`h-1.5 flex-1 rounded-full origin-left ${i < index - 1 ? "bg-gradient-hero" : "bg-muted"}`}
              style={i === index - 1 ? { background: "linear-gradient(90deg,#a855f7,#06b6d4)" } : {}}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
