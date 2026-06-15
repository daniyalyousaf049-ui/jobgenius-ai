import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface GradientShiftTextProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}

/**
 * Text with animated gradient shift (left-to-right shimmer)
 * Gold gradient subtly moves across the text every 4 seconds
 */
export function GradientShiftText({
  children,
  className = "",
  duration = 4,
}: GradientShiftTextProps) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    mq.addEventListener("change", (e) => setReduced(e.matches));
    return () => mq.removeEventListener("change", (e) => setReduced(e.matches));
  }, []);

  if (reduced) {
    return (
      <span
        className={`bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 bg-clip-text text-transparent ${className}`}
      >
        {children}
      </span>
    );
  }

  return (
    <motion.span
      className={`inline-block bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 bg-clip-text text-transparent ${className}`}
      animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{ backgroundSize: "200% 100%" }}
    >
      {children}
    </motion.span>
  );
}
