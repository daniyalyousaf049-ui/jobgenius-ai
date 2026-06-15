import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useState, useRef } from "react";
import { createRippleEffect } from "@/lib/ripple-effect";
import { ANIMATION_TIMINGS, EASING } from "@/lib/animations";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  isLocked?: boolean;
  isLoading?: boolean;
  delay?: number;
  variant?: "default" | "locked";
  onHoverChange?: (hovering: boolean) => void;
}

/**
 * Animated card with hover lift, glow, and light sweep
 * Features:
 * - Lifts 10px on hover
 * - Glow expands with accent color
 * - Border transitions to accent color
 * - Inner light sweep effect
 * - Sibling cards dim on hover
 * - Click ripple effect
 * - Stagger load animation
 */
export function AnimatedCard({
  children,
  className = "",
  onClick,
  isLocked = false,
  isLoading = false,
  delay = 0,
  variant = "default",
  onHoverChange,
}: AnimatedCardProps) {
  const [hovering, setHovering] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleHoverStart = () => {
    setHovering(true);
    onHoverChange?.(true);
  };

  const handleHoverEnd = () => {
    setHovering(false);
    onHoverChange?.(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLocked && onClick) {
      createRippleEffect(e, {
        color: "rgba(212, 168, 83, 0.3)",
        duration: 600,
      });
      onClick();
    }
  };

  if (variant === "locked") {
    return (
      <motion.div
        ref={ref}
        className={`relative glass-card ${className}`}
        animate={{
          y: [0, -3, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-neutral-700/10 to-red-500/5 pointer-events-none" />
        <div className="relative grayscale opacity-60">{children}</div>
        <div className="absolute inset-0 rounded-xl border border-red-500/30 pointer-events-none" />
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={`relative glass-card overflow-hidden cursor-pointer group ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: ANIMATION_TIMINGS.NORMAL,
        delay,
        ease: EASING.SMOOTH,
      }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onClick={handleClick}
      whileHover={
        !isLocked
          ? {
              y: -10,
              boxShadow: "0 24px 60px -20px rgba(212, 168, 83, 0.4)",
              borderColor: "rgba(212, 168, 83, 0.4)",
            }
          : {}
      }
      whileTap={
        !isLocked && onClick
          ? {
              scale: 0.97,
            }
          : {}
      }
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      {/* Inner light sweep effect */}
      {hovering && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0, x: "-100%", y: "-100%" }}
          animate={{ opacity: 1, x: "100%", y: "100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent transform -rotate-45" />
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      )}
    </motion.div>
  );
}

/**
 * Card container that dims siblings on child hover
 */
export function AnimatedCardGroup({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={`group ${className}`}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div key={i} className="relative">
              <AnimatePresence>
                {hoveredIndex !== null && hoveredIndex !== i && (
                  <motion.div
                    className="absolute inset-0 z-20 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.15 }}
                    exit={{ opacity: 0 }}
                    style={{
                      background: "rgba(0, 0, 0, 0.4)",
                      borderRadius: "inherit",
                    }}
                  />
                )}
              </AnimatePresence>
              <div
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {child}
              </div>
            </div>
          ))
        : children}
    </div>
  );
}
