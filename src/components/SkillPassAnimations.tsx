import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ANIMATION_TIMINGS } from "@/lib/animations";
import { ConfettiEffect } from "@/components/ParticleEmitter";

/**
 * Badge award animation - forge effect with confetti
 */
export function BadgeAwardAnimation({
  badgeIcon,
  badgeName,
  badgeDescription,
  onComplete,
}: {
  badgeIcon: string;
  badgeName: string;
  badgeDescription: string;
  onComplete?: () => void;
}) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    // Metal clang sound timing
    const clangTimer = setTimeout(() => {
      setShowBadge(true);
      setShowConfetti(true);
    }, 300);

    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, 2500);

    return () => {
      clearTimeout(clangTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const badgeRect = {
    x: window.innerWidth / 2 - 40,
    y: window.innerHeight / 2 - 40,
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Confetti effect */}
      <ConfettiEffect
        isActive={showConfetti}
        position={{
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        }}
      />

      {/* Forge glow effect */}
      <motion.div
        className="absolute w-32 h-32 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(212, 168, 83, 0.6), transparent)",
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={
          showBadge
            ? { opacity: 1, scale: 1.5 }
            : { opacity: 0.5, scale: 0.8 }
        }
        transition={{ duration: 0.4 }}
      />

      {/* Badge with animation */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0, rotate: -45 }}
        animate={
          showBadge
            ? { scale: 1, rotate: 0 }
            : { scale: 0, rotate: -45 }
        }
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
      >
        {/* Badge background with holographic effect */}
        <motion.div
          className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-2xl"
          animate={
            showBadge
              ? {
                  backgroundPosition: ["0%", "100%", "0%"],
                  boxShadow: [
                    "0 0 20px rgba(212, 168, 83, 0.6)",
                    "0 0 40px rgba(212, 168, 83, 0.8)",
                    "0 0 20px rgba(212, 168, 83, 0.6)",
                  ],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ backgroundSize: "200% 100%" }}
        >
          {/* Badge icon */}
          <div className="text-6xl animate-holographic">{badgeIcon}</div>

          {/* Stamp effect overlay */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-white/30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              showBadge
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.8 }
            }
            transition={{ delay: 0.3 }}
          />
        </motion.div>
      </motion.div>

      {/* Badge info */}
      <motion.div
        className="absolute top-1/2 translate-y-20 text-center pointer-events-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={showBadge ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-2xl font-bold text-white mb-2">{badgeName}</h3>
        <p className="text-muted-foreground">{badgeDescription}</p>
      </motion.div>
    </div>
  );
}

/**
 * Radar chart animation
 */
export function AnimatedRadarChart({
  data,
  labels,
  className = "",
}: {
  data: number[];
  labels: string[];
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const size = 300;
  const center = size / 2;
  const radius = (size / 2) * 0.7;
  const angleSlice = (Math.PI * 2) / labels.length;

  // Calculate points
  const points = data.map((d, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const x = center + (radius * d) * Math.cos(angle);
    const y = center + (radius * d) * Math.sin(angle);
    return { x, y };
  });

  const pathData = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <div className={`flex justify-center ${className}`}>
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        {/* Axes - draw one by one */}
        {labels.map((label, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);

          return (
            <g key={`axis-${i}`}>
              {/* Axis line */}
              <motion.line
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="rgba(212, 168, 83, 0.3)"
                strokeWidth={1}
                initial={{ pathLength: 0 }}
                animate={isVisible ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
              />

              {/* Label */}
              <motion.text
                x={x * 1.15}
                y={y * 1.15}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(212, 168, 83, 0.8)"
                fontSize="12"
                initial={{ opacity: 0 }}
                animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
                transition={{
                  duration: 0.3,
                  delay: i * 0.1 + 0.4,
                }}
              >
                {label}
              </motion.text>
            </g>
          );
        })}

        {/* Data polygon - fills with glow */}
        <motion.path
          d={pathData + " Z"}
          fill="rgba(212, 168, 83, 0.2)"
          stroke="rgba(212, 168, 83, 0.6)"
          strokeWidth={2}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isVisible ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.5,
            ease: "easeOut",
          }}
          filter="drop-shadow(0 0 10px rgba(212, 168, 83, 0.4))"
        />

        {/* Data points - pop animation */}
        {points.map((point, i) => (
          <motion.circle
            key={`point-${i}`}
            cx={point.x}
            cy={point.y}
            r={4}
            fill="rgba(212, 168, 83, 0.8)"
            initial={{ scale: 0, opacity: 0 }}
            animate={isVisible ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{
              duration: 0.3,
              delay: 0.7 + i * 0.05,
              type: "spring",
              stiffness: 300,
            }}
            style={{ cursor: "pointer" }}
            whileHover={{
              scale: 1.5,
              boxShadow: `0 0 10px rgba(212, 168, 83, 0.8)`,
            }}
          />
        ))}

        {/* Center circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={3}
          fill="rgba(212, 168, 83, 0.6)"
          initial={{ scale: 0 }}
          animate={isVisible ? { scale: 1 } : { scale: 0 }}
          transition={{ delay: 0.5 }}
        />
      </motion.svg>
    </div>
  );
}

/**
 * Skill progress animation
 */
export function SkillProgressBar({
  skill,
  current,
  target,
  color = "from-yellow-400 to-amber-500",
}: {
  skill: string;
  current: number;
  target: number;
  color?: string;
}) {
  const percentage = Math.min(100, (current / target) * 100);

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">{skill}</span>
        <motion.span className="text-sm font-semibold">
          {current}/{target}
        </motion.span>
      </div>

      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 1.2,
            ease: "easeOut",
          }}
        />
      </div>

      {/* Particles orbiting near filled edge */}
      {percentage > 0 && (
        <motion.div
          className="absolute -top-2 w-2 h-2 rounded-full bg-yellow-400"
          style={{
            left: `${percentage}%`,
            opacity: 0.8,
          }}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
}

/**
 * Tier badge animation
 */
export function TierBadgeAnimated({
  tier,
  xp,
  nextTierXp,
}: {
  tier: string;
  xp: number;
  nextTierXp: number;
}) {
  const progress = Math.min(1, xp / nextTierXp);

  return (
    <motion.div
      className="relative w-24 h-24"
      animate={{ y: [0, -4, 0] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Badge background */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center"
        animate={{
          boxShadow: [
            "0 0 20px rgba(212, 168, 83, 0.4)",
            "0 0 40px rgba(212, 168, 83, 0.6)",
            "0 0 20px rgba(212, 168, 83, 0.4)",
          ],
        }}
        transition={{
          duration: ANIMATION_TIMINGS.PULSE,
          repeat: Infinity,
        }}
      >
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{tier.charAt(0)}</div>
          <div className="text-xs font-semibold text-white/80">{tier.slice(0, 3)}</div>
        </div>
      </motion.div>

      {/* Progress ring */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={48} fill="none" stroke="rgba(212, 168, 83, 0.2)" strokeWidth={2} />
        <motion.circle
          cx={50}
          cy={50}
          r={48}
          fill="none"
          stroke="rgba(212, 168, 83, 0.8)"
          strokeWidth={2}
          strokeDasharray={301.59}
          initial={{ strokeDashoffset: 301.59 }}
          animate={{ strokeDashoffset: 301.59 * (1 - progress) }}
          transition={{ duration: 1 }}
          style={{
            filter: "drop-shadow(0 0 2px rgba(212, 168, 83, 0.6))",
          }}
        />
      </svg>
    </motion.div>
  );
}
