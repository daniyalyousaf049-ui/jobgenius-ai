import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { detectViewport } from "@/lib/animations";

interface ScrollRevealTextProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
}

/**
 * Text element that fades up + slides on scroll into viewport
 * Plays once when element enters viewport
 */
export function ScrollRevealText({
  children,
  className = "",
  delay = 0,
  stagger = 0.05,
}: ScrollRevealTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    // Initial check
    const { isInViewport } = detectViewport(ref.current);
    if (isInViewport) {
      setIsInView(true);
      return;
    }

    // Set up intersection observer for better performance
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered reveal for multiple text elements
 */
export function ScrollRevealTextStaggered({
  items,
  className = "",
  baseDelay = 0,
  itemDelay = 0.05,
}: {
  items: React.ReactNode[];
  className?: string;
  baseDelay?: number;
  itemDelay?: number;
}) {
  return (
    <>
      {items.map((item, i) => (
        <ScrollRevealText
          key={i}
          delay={baseDelay + i * itemDelay}
          className={className}
        >
          {item}
        </ScrollRevealText>
      ))}
    </>
  );
}
