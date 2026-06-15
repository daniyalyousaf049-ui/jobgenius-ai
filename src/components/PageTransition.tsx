import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { ANIMATION_TIMINGS, EASING } from "@/lib/animations";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps page content with entry/exit animations
 * - Exit: Fade out + slide down 10px (0.2s)
 * - Enter: Fade in + slide up 20px (0.4s spring)
 */
export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{
        duration: ANIMATION_TIMINGS.PAGE_TRANSITION,
        ease: EASING.SMOOTH,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Wrapper for multiple pages with AnimatePresence
 * Use this in route outlet
 */
export function PageTransitionContainer({
  children,
  layoutId = "page-container",
}: {
  children: ReactNode;
  layoutId?: string;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div key={layoutId} layoutId={layoutId}>
        <PageTransition>{children}</PageTransition>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Fade transition (minimal movement)
 */
export function FadeTransition({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: ANIMATION_TIMINGS.FAST }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scale in transition
 */
export function ScaleTransition({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: ANIMATION_TIMINGS.NORMAL }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Slide transition (left to right)
 */
export function SlideTransition({
  children,
  className = "",
  direction = "left",
}: {
  children: ReactNode;
  className?: string;
  direction?: "left" | "right" | "up" | "down";
}) {
  const directionConfig = {
    left: { x: -50, y: 0 },
    right: { x: 50, y: 0 },
    up: { x: 0, y: -50 },
    down: { x: 0, y: 50 },
  };

  const initial = directionConfig[direction];
  const animate = { x: 0, y: 0 };
  const exit = directionConfig[direction];

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...initial }}
      animate={{ opacity: 1, ...animate }}
      exit={{ opacity: 0, ...exit }}
      transition={{ duration: ANIMATION_TIMINGS.PAGE_TRANSITION }}
    >
      {children}
    </motion.div>
  );
}
