import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ANIMATION_TIMINGS } from "@/lib/animations";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  format?: "number" | "comma" | "percent";
  className?: string;
  showGlow?: boolean;
  suffix?: string;
  prefix?: string;
}

/**
 * Counter that animates from 0 to final value
 * Glows briefly when complete
 */
export function AnimatedCounter({
  value,
  duration = ANIMATION_TIMINGS.COUNTER,
  format = "number",
  className = "",
  showGlow = true,
  suffix = "",
  prefix = "",
}: AnimatedCounterProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!nodeRef.current) return;

    const target = value;
    const isInteger = Number.isInteger(target);
    const formatted = (n: number) => {
      let result: string;
      if (format === "comma") {
        result = Math.round(n).toLocaleString();
      } else if (format === "percent") {
        result = (n * 100).toFixed(0) + "%";
      } else {
        result = isInteger ? Math.round(n).toString() : n.toFixed(1);
      }
      return prefix + result + suffix;
    };

    // Create animation frame counter
    const startTime = performance.now();
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      // Easing: ease-out (starts fast, slows down)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const current = easeProgress * target;
      nodeRef.current!.textContent = formatted(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration, format, suffix, prefix]);

  return (
    <motion.span
      ref={nodeRef}
      className={className}
      animate={showGlow ? { textShadow: ["0 0 0px rgba(212, 168, 83, 0.5)", "0 0 12px rgba(212, 168, 83, 0.8), 0 0 24px rgba(212, 168, 83, 0.4)", "0 0 0px rgba(212, 168, 83, 0.5)"] } : {}}
      transition={
        showGlow
          ? {
              duration: 0.8,
              times: [0, 0.5, 1],
              delay: duration,
            }
          : undefined
      }
    >
      {prefix}
      {value}
      {suffix}
    </motion.span>
  );
}
