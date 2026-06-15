import { motion } from "framer-motion";
import { ReactNode, useState } from "react";

// ═══════════ INLINE CONSTANTS ═══════════
const ANIMATION_TIMINGS = {
  PULSE: 2,
  FAST: 0.3,
  MEDIUM: 0.5,
  SLOW: 0.8,
};

// ═══════════ INLINE RIPPLE EFFECT ═══════════
function createRippleEffect(
  e: React.MouseEvent<HTMLButtonElement>,
  options?: { color?: string; duration?: number }
) {
  const button = e.currentTarget;
  const rect = button.getBoundingClientRect();
  const ripple = document.createElement("span");
  const diameter = Math.max(rect.width, rect.height);
  const radius = diameter / 2;

  ripple.style.width = ripple.style.height = `${diameter}px`;
  ripple.style.left = `${e.clientX - rect.left - radius}px`;
  ripple.style.top = `${e.clientY - rect.top - radius}px`;
  ripple.style.position = "absolute";
  ripple.style.borderRadius = "50%";
  ripple.style.background = options?.color || "rgba(255, 255, 255, 0.3)";
  ripple.style.transform = "scale(0)";
  ripple.style.animation = `ripple ${options?.duration || 600}ms ease-out forwards`;
  ripple.style.pointerEvents = "none";
  ripple.style.zIndex = "1";

  button.style.position = "relative";
  button.style.overflow = "hidden";
  button.appendChild(ripple);

  setTimeout(() => ripple.remove(), options?.duration || 600);
}

// ═══════════ INTERFACE (without extending HTMLButtonAttributes) ═══════════
interface AnimatedButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "cta";
  isPulsing?: boolean;
  withGlow?: boolean;
  withRipple?: boolean;
  isLoading?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

// ═══════════ ANIMATED BUTTON ═══════════
export function AnimatedButton({
  children,
  variant = "primary",
  isPulsing = true,
  withGlow = true,
  withRipple = true,
  isLoading = false,
  className = "",
  disabled,
  onClick,
}: AnimatedButtonProps) {
  const [isHovering, setIsHovering] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (withRipple && !isLoading && !disabled) {
      createRippleEffect(e, {
        color: variant === "primary" ? "rgba(212, 168, 83, 0.3)" : "rgba(255, 255, 255, 0.2)",
        duration: 600,
      });
    }
    onClick?.(e);
  };

  const baseClass =
    variant === "primary"
      ? "bg-gradient-to-r from-purple-600 to-violet-600 hover:opacity-90 text-white"
      : variant === "cta"
        ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 text-white"
        : variant === "secondary"
          ? "border border-border hover:bg-muted"
          : "hover:bg-muted/50";

  return (
    <motion.button
      className={`relative px-4 py-2 rounded-lg font-semibold overflow-hidden transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${baseClass} ${className}`}
      disabled={isLoading || disabled}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleClick}
      whileTap={!isLoading && !disabled ? { scale: 0.93 } : {}}
    >
      {/* Pulse glow */}
      {variant === "primary" && isPulsing && withGlow && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          animate={{
            boxShadow: isHovering
              ? [
                  "0 0 15px rgba(212, 168, 83, 0.4)",
                  "0 0 30px rgba(212, 168, 83, 0.6)",
                  "0 0 15px rgba(212, 168, 83, 0.4)",
                ]
              : [
                  "0 0 10px rgba(212, 168, 83, 0.3)",
                  "0 0 20px rgba(212, 168, 83, 0.4)",
                  "0 0 10px rgba(212, 168, 83, 0.3)",
                ],
          }}
          transition={{
            duration: ANIMATION_TIMINGS.PULSE,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Loading shimmer */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading && (
          <motion.div
            className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        {children}
      </span>
    </motion.button>
  );
}

// ═══════════ CTA BUTTON ═══════════
export function CTAButton({
  children,
  isPrimary = true,
  className = "",
  ...props
}: AnimatedButtonProps & { isPrimary?: boolean }) {
  return (
    <motion.div
      animate={{
        scale: isPrimary ? [1, 1.02, 1] : 1,
        opacity: !isPrimary ? [0.8, 1, 0.8] : 1,
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <AnimatedButton variant={isPrimary ? "primary" : "secondary"} className={className} {...props}>
        {children}
      </AnimatedButton>
    </motion.div>
  );
}

// ═══════════ ICON BUTTON ═══════════
export function AnimatedIconButton({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      className={`relative p-2 rounded-lg hover:bg-muted/50 transition-colors ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <motion.div
        className="relative z-10"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </motion.button>
  );
}

// ═══════════ SECONDARY BUTTON ═══════════
export function SecondaryButton({
  children,
  className = "",
  onClick,
  disabled,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <motion.button
      className={`relative px-4 py-2 rounded-lg font-semibold border border-border overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
    >
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        animate={{
          boxShadow: isHovering
            ? "inset 0 0 20px rgba(212, 168, 83, 0.2), 0 0 20px rgba(212, 168, 83, 0.3)"
            : "inset 0 0 0px rgba(212, 168, 83, 0), 0 0 0px rgba(212, 168, 83, 0)",
        }}
        transition={{ duration: 0.3 }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}