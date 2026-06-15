import { motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { ANIMATION_TIMINGS } from "@/lib/animations";

interface AnimatedIconProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  glowColor?: string;
  bobbing?: boolean;
  onHover?: () => void;
  isFlame?: boolean;
  isCheckmark?: boolean;
  strokeLength?: number;
}

/**
 * Animated icon wrapper with bobbing, glow, and hover effects
 * Features:
 * - Subtle bobbing animation (2-3px, 3s cycle)
 * - Glow in accent color
 * - Hover: Spin 10-15°, intensify glow
 */
export function AnimatedIcon({
  children,
  className = "",
  glow = true,
  glowColor = "#d4a853",
  bobbing = true,
  onHover,
  isFlame = false,
  isCheckmark = false,
  strokeLength,
}: AnimatedIconProps) {
  const [hovering, setHovering] = useState(false);

  return (
    <motion.div
      className={`inline-block ${className}`}
      animate={
        bobbing
          ? {
              y: [0, -3, 0],
            }
          : {}
      }
      transition={{
        duration: ANIMATION_TIMINGS.FLOAT,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      onHoverStart={() => {
        setHovering(true);
        onHover?.();
      }}
      onHoverEnd={() => setHovering(false)}
      whileHover={bobbing ? { rotate: 12 } : {}}
    >
      {/* Flame flicker animation */}
      {isFlame && (
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: [0.7, 1, 0.8, 1, 0.75],
            filter: [
              `drop-shadow(0 0 5px ${glowColor})`,
              `drop-shadow(0 0 8px ${glowColor})`,
              `drop-shadow(0 0 5px ${glowColor})`,
              `drop-shadow(0 0 10px ${glowColor})`,
              `drop-shadow(0 0 6px ${glowColor})`,
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Checkmark SVG draw animation */}
      {isCheckmark && (
        <motion.g
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ originX: "50%", originY: "50%" }}
        />
      )}

      {/* Glow effect */}
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-full blur-md pointer-events-none"
          style={{
            background: glowColor,
            opacity: hovering ? 0.4 : 0.15,
          }}
          animate={{
            boxShadow: hovering
              ? `0 0 20px ${glowColor}`
              : `0 0 10px ${glowColor}`,
          }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Content */}
      <motion.div
        animate={
          hovering
            ? { scale: 1.1 }
            : bobbing
              ? {}
              : { scale: 1 }
        }
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/**
 * Specialized flame icon with realistic flicker
 */
export function FlameIcon({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`animate-fire-flicker ${className}`}
      animate={{
        filter: [
          "drop-shadow(0 0 5px #d4a853)",
          "drop-shadow(0 0 8px #d4a853)",
          "drop-shadow(0 0 5px #d4a853)",
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <path d="M12 2a9.75 9.75 0 0 0-1.5 19.5 8.993 8.993 0 0 1 1.5-.5 8.993 8.993 0 0 1 1.5.5A9.75 9.75 0 0 0 12 2z" />
    </motion.svg>
  );
}

/**
 * Checkmark with draw animation
 */
export function CheckmarkIcon({
  size = 24,
  className = "",
  animated = true,
}: {
  size?: number;
  className?: string;
  animated?: boolean;
}) {
  const pathLength = animated ? 56 : undefined;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      initial={animated ? { pathLength: 0, opacity: 0 } : {}}
      animate={
        animated
          ? { pathLength: 1, opacity: 1 }
          : {}
      }
      transition={
        animated
          ? { duration: 0.6, ease: "easeOut" }
          : undefined
      }
    >
      <polyline points="20 6 9 17 4 12" />
    </motion.svg>
  );
}
