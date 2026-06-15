import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type Mood = "idle" | "happy" | "sad" | "fire" | "level" | "wave";

const MESSAGES = [
  "You're crushing it! 🔥",
  "One more question! 💪",
  "That was amazing! ⭐",
  "Keep the streak alive! 📅",
  "I believe in you! 🎯",
  "Practice makes perfect! 📚",
  "You're getting better every day! 📈",
  "Let's go! 🚀",
  "Boss level incoming! 👑",
  "You're a legend! 🏆",
];

export function CoachKai({ mood = "idle", streak = 0 }: { mood?: Mood; streak?: number }) {
  const [bubble, setBubble] = useState<string | null>(null);
  const [bubbleText, setBubbleText] = useState("");
  const isWeekend = [0, 6].includes(new Date().getDay());
  const showCrown = streak > 7;

  useEffect(() => {
    if (!bubble) return;
    setBubbleText("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setBubbleText(bubble.slice(0, i));
      if (i >= bubble.length) clearInterval(id);
    }, 30);
    const t = setTimeout(() => setBubble(null), 5000);
    return () => { clearInterval(id); clearTimeout(t); };
  }, [bubble]);

  const onClick = () => setBubble(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);

  // mood reactions
  const moodAnim: Record<Mood, { y: number[] | number; rotate: number[]; scale?: number[] }> = {
    idle:  { y: [0, -6, 0], rotate: [0, 0, 0] },
    happy: { y: [0, -16, 0], rotate: [-6, 6, -6, 0] },
    sad:   { y: [0, 4, 0], rotate: [-2, 2, -2, 0] },
    fire:  { y: [0, -10, 0], rotate: [-4, 4, -4, 0], scale: [1, 1.05, 1] },
    level: { y: [0, -30, 0], rotate: [0, 360, 360] },
    wave:  { rotate: [0, 12, -12, 0], y: 0 },
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 select-none">
      <AnimatePresence>
        {bubble && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            className="relative max-w-[220px] rounded-2xl bg-card border border-border shadow-elegant px-4 py-3 text-sm font-medium"
          >
            {bubbleText}
            <span className="absolute -bottom-1 right-8 w-3 h-3 rotate-45 bg-card border-r border-b border-border" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={onClick}
        animate={moodAnim[mood]}
        transition={{
          duration: mood === "idle" ? 3 : 1.2,
          repeat: mood === "idle" || mood === "fire" ? Infinity : 0,
          ease: "easeInOut",
        }}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        className="relative w-20 h-20 rounded-full bg-gradient-hero shadow-elegant flex items-center justify-center cursor-pointer"
        aria-label="Coach Kai"
      >
        {showCrown && <span className="absolute -top-3 text-xl">👑</span>}
        {isWeekend && !showCrown && <span className="absolute -top-3 text-xl">🎉</span>}
        {mood === "fire" && (
          <motion.span
            className="absolute inset-0 rounded-full"
            animate={{ boxShadow: ["0 0 0 0 #f59e0b80", "0 0 0 18px #f59e0b00"] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
        <KaiSVG mood={mood} />
        {mood === "happy" && <Hearts />}
        {mood === "sad" && <Tear />}
      </motion.button>
    </div>
  );
}

function KaiSVG({ mood }: { mood: Mood }) {
  // friendly owl/robot, purple+orange
  const eyeY = mood === "sad" ? 32 : 30;
  const mouth =
    mood === "happy" ? "M22 40 Q32 50 42 40" :
    mood === "sad"   ? "M22 44 Q32 36 42 44" :
    mood === "fire"  ? "M22 42 Q32 48 42 42" :
    "M24 42 Q32 46 40 42";
  return (
    <svg viewBox="0 0 64 64" className="w-14 h-14 drop-shadow-md">
      {/* ears */}
      <circle cx="14" cy="14" r="6" fill="#f59e0b" />
      <circle cx="50" cy="14" r="6" fill="#f59e0b" />
      {/* head */}
      <circle cx="32" cy="32" r="22" fill="#fff" />
      <circle cx="32" cy="32" r="22" fill="#8b5cf6" opacity="0.15" />
      {/* eyes */}
      <motion.g
        animate={{ scaleY: [1, 1, 0.1, 1] }}
        transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 2.6 }}
        style={{ transformOrigin: "32px 32px" }}
      >
        <circle cx="24" cy={eyeY} r="3.5" fill={mood === "fire" ? "#f59e0b" : "#1e1b4b"} />
        <circle cx="40" cy={eyeY} r="3.5" fill={mood === "fire" ? "#f59e0b" : "#1e1b4b"} />
        <circle cx="25" cy={eyeY - 1} r="1" fill="white" />
        <circle cx="41" cy={eyeY - 1} r="1" fill="white" />
      </motion.g>
      {/* beak */}
      <polygon points="30,36 34,36 32,40" fill="#f59e0b" />
      {/* mouth */}
      <path d={mouth} stroke="#1e1b4b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* cheeks */}
      <circle cx="20" cy="40" r="2" fill="#fda4af" opacity="0.7" />
      <circle cx="44" cy="40" r="2" fill="#fda4af" opacity="0.7" />
    </svg>
  );
}

function Hearts() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute text-pink-500 text-lg pointer-events-none"
          initial={{ y: 0, x: 0, opacity: 1 }}
          animate={{ y: -50 - i * 10, x: i * 8 - 8, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
        >❤️</motion.span>
      ))}
    </>
  );
}

function Tear() {
  return (
    <motion.span
      className="absolute left-4 top-10 text-blue-400 pointer-events-none"
      animate={{ y: [0, 14, 14], opacity: [1, 1, 0] }}
      transition={{ duration: 1.6, repeat: Infinity }}
    >💧</motion.span>
  );
}
