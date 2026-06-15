import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ANIMATION_TIMINGS, hasReducedMotion, randomBetween } from "@/lib/animations";

/**
 * Victory screen with confetti, score counter, and VICTORY stamp
 */
export function VictoryScreen({
  score,
  xpGained,
  onAnimationComplete,
}: {
  score: number;
  xpGained: number;
  onAnimationComplete?: () => void;
}) {
  const [showStamp, setShowStamp] = useState(false);
  const [showParticles, setShowParticles] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowStamp(true), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  if (hasReducedMotion()) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60">
        <div className="text-center">
          <div className="text-6xl font-bold text-green-400 mb-4">VICTORY</div>
          <div className="text-2xl text-white mb-2">Score: {score}</div>
          <div className="text-xl text-green-300">+{xpGained} XP</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Screen shake effect */}
      <motion.div
        className="absolute inset-0 bg-black/0"
        animate={{ boxShadow: ["inset 0 0 0 0 rgba(0,0,0,0)", "inset 0 0 100px 20px rgba(0,0,0,0.3)"] }}
        transition={{ duration: 0.3, times: [0, 1] }}
      />

      {/* Confetti */}
      {showParticles && (
        <>
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={`confetti-${i}`}
              className="absolute w-2 h-2 rounded-full pointer-events-none"
              style={{
                left: "50%",
                top: "50%",
                backgroundColor: ["#d4a853", "#2dd4bf", "#a78bfa", "#ec4899"][i % 4],
              }}
              animate={{
                x: randomBetween(-300, 300),
                y: randomBetween(-300, 300),
                rotate: 360,
                opacity: [1, 0],
              }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          ))}
        </>
      )}

      {/* Victory stamp */}
      <motion.div
        className="absolute text-center"
        initial={{ scale: 0, rotate: -45, opacity: 0 }}
        animate={
          showStamp
            ? { scale: 1, rotate: 0, opacity: 1 }
            : { scale: 0, rotate: -45, opacity: 0 }
        }
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
        }}
      >
        <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 drop-shadow-lg">
          VICTORY
        </div>
      </motion.div>

      {/* Score display */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="text-4xl font-bold text-white mb-4">Score: {score}</div>
        <motion.div
          className="text-2xl font-semibold text-green-400"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          +{xpGained} XP
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * Defeat screen with ash particles and DEFEAT stamp
 */
export function DefeatScreen({
  score,
  xpLost,
  onAnimationComplete,
}: {
  score: number;
  xpLost: number;
  onAnimationComplete?: () => void;
}) {
  const [showStamp, setShowStamp] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowStamp(true), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  if (hasReducedMotion()) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60">
        <div className="text-center">
          <div className="text-6xl font-bold text-red-500 mb-4">DEFEAT</div>
          <div className="text-2xl text-white mb-2">Score: {score}</div>
          <div className="text-xl text-red-400">-{xpLost} XP</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Dim overlay */}
      <motion.div
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Ash particles falling */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`ash-${i}`}
          className="absolute w-2 h-2 rounded-full pointer-events-none opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-20px`,
            backgroundColor: "#8b7355",
          }}
          animate={{
            y: window.innerHeight + 20,
            x: randomBetween(-50, 50),
            opacity: [0.6, 0.3, 0],
          }}
          transition={{
            duration: randomBetween(3, 5),
            ease: "easeIn",
            delay: randomBetween(0, 0.5),
          }}
        />
      ))}

      {/* Defeat stamp */}
      <motion.div
        className="absolute text-center"
        initial={{ scale: 0, rotate: -45, opacity: 0 }}
        animate={
          showStamp
            ? { scale: 1, rotate: 0, opacity: 1 }
            : { scale: 0, rotate: -45, opacity: 0 }
        }
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 25,
        }}
      >
        <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600 drop-shadow-lg">
          DEFEAT
        </div>
      </motion.div>

      {/* Score display */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="text-4xl font-bold text-white mb-4">Score: {score}</div>
        <motion.div
          className="text-2xl font-semibold text-red-400"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          -{xpLost} XP
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * Derank animation - rare, dramatic effect
 */
export function DerankScreen({
  leaderName,
  previousTier,
  newTier,
  onAnimationComplete,
}: {
  leaderName: string;
  previousTier: string;
  newTier: string;
  onAnimationComplete?: () => void;
}) {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowMessage(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  if (hasReducedMotion()) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500 mb-4">
            {leaderName} found you unworthy.
          </div>
          <div className="text-xl text-white">
            Deranked from {previousTier} to {newTier}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Screen dim */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 0.5 }}
      />

      {/* Glass shatter effect */}
      <motion.div
        className="absolute w-32 h-32 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-red-500"
        initial={{
          opacity: 1,
          scale: 1,
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        }}
        animate={{
          opacity: 0,
          scale: 1.5,
          clipPath:
            "polygon(0% 0%, 15% 5%, 30% 2%, 45% 8%, 60% 3%, 75% 7%, 90% 2%, 100% 5%, 98% 20%, 95% 35%, 100% 50%, 95% 65%, 100% 80%, 95% 95%, 80% 100%, 65% 98%, 50% 100%, 35% 98%, 20% 100%, 5% 95%, 0% 80%, 2% 65%, 0% 50%, 5% 35%, 0% 20%)",
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Message */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={showMessage ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-3xl font-bold text-red-500 mb-4">
          {leaderName} found you unworthy.
        </div>
        <div className="text-lg text-white">
          Deranked: {previousTier} → {newTier}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Leader card with rotating glow ring
 */
export function LeaderCardAnimated({
  leader,
  isUnlocked,
  onClick,
  className = "",
}: {
  leader: any;
  isUnlocked: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const [ringRotation, setRingRotation] = useState(0);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (!isUnlocked) return;

    const interval = setInterval(() => {
      setRingRotation((r) => (r + (hovering ? 2 : 0.5)) % 360);
    }, 16);

    return () => clearInterval(interval);
  }, [isUnlocked, hovering]);

  return (
    <motion.div
      className={`relative cursor-pointer ${className}`}
      onClick={onClick}
      onHoverStart={() => setHovering(true)}
      onHoverEnd={() => setHovering(false)}
      whileHover={isUnlocked ? { scale: 1.05 } : {}}
    >
      {/* Rotating glow ring (unlocked only) */}
      {isUnlocked && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from ${ringRotation}deg, ${leader.theme.split(" ")[1]}, transparent)`,
            boxShadow: `0 0 20px ${leader.theme.split(" ")[1]}`,
            opacity: hovering ? 0.8 : 0.4,
            zIndex: 0,
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: hovering ? 4 : 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}

      {/* Card content */}
      <div className={`relative z-10 ${isUnlocked ? "" : "opacity-50 grayscale"}`}>
        {/* Your existing leader card component here */}
        <div className={`bg-card rounded-lg p-4 border border-border ${leader.theme}`}>
          <div className="text-4xl mb-2">{leader.emoji}</div>
          <div className="font-bold">{leader.name}</div>
          <div className="text-sm text-muted-foreground">{leader.title}</div>
        </div>
      </div>

      {/* Lock badge */}
      {!isUnlocked && (
        <div className="absolute top-2 right-2 z-20">
          <div className="bg-red-500/80 rounded-full p-2">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Battle screen energy barrier with pulsing leader avatar
 */
export function BattleScreenAnimation({
  leader,
  isActive,
}: {
  leader: any;
  isActive: boolean;
}) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Energy barrier dividing line */}
      <motion.div
        className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2"
        style={{
          background: `linear-gradient(to bottom, ${leader.theme.split(" ")[1]}, transparent)`,
          boxShadow: `0 0 20px ${leader.theme.split(" ")[1]}`,
        }}
        animate={isActive ? { boxShadow: [`0 0 20px`, `0 0 40px`, `0 0 20px`] } : {}}
        transition={{ duration: ANIMATION_TIMINGS.PULSE, repeat: Infinity }}
      />

      {/* Leader avatar with breathing animation */}
      <motion.div
        className="absolute left-0 top-1/2 -translate-y-1/2 p-4"
        animate={isActive ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: ANIMATION_TIMINGS.FLOAT, repeat: Infinity }}
      >
        <div className="text-6xl">{leader.emoji}</div>
      </motion.div>
    </div>
  );
}
