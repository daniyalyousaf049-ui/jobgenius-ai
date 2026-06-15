/**
 * Ripple effect system for click animations
 * GPU-accelerated using clip-path and transform
 */

export interface RippleConfig {
  color?: string;
  duration?: number;
  easing?: string;
}

const DEFAULT_CONFIG: Required<RippleConfig> = {
  color: "rgba(255, 255, 255, 0.5)",
  duration: 600,
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
};

/**
 * Create and animate a ripple effect at the click point
 * Performance: Uses clip-path + transform for GPU acceleration
 */
export function createRippleEffect(
  event: React.MouseEvent<HTMLElement>,
  config: RippleConfig = {}
) {
  const element = event.currentTarget;
  if (!element) return;
  
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Get click position relative to element
  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // Create ripple element
  const ripple = document.createElement("span");
  ripple.className = "ripple-effect";
  
  const size = Math.max(rect.width, rect.height) * 2;
  const duration = finalConfig.duration;
  
  Object.assign(ripple.style, {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "50%",
    backgroundColor: finalConfig.color,
    transform: "translate(-50%, -50%) scale(0)",
    pointerEvents: "none",
    zIndex: "0",
  });
  
  // Add to element (ensure relative positioning)
  if (getComputedStyle(element).position === "static") {
    element.style.position = "relative";
  }
  element.appendChild(ripple);
  
  // Trigger animation
  const animation = ripple.animate(
    [
      { transform: "translate(-50%, -50%) scale(0)", opacity: 1 },
      { transform: "translate(-50%, -50%) scale(1)", opacity: 0 },
    ],
    {
      duration,
      easing: finalConfig.easing,
      fill: "forwards",
    }
  );
  
  // Clean up after animation
  animation.onfinish = () => {
    ripple.remove();
  };
  
  // Fallback cleanup if animations not supported
  setTimeout(() => {
    if (ripple.parentNode) ripple.remove();
  }, duration + 100);
}

/**
 * CSS class-based ripple (alternative for buttons without JS)
 * Used as a utility class that creates ripple with CSS animations
 */
export const RIPPLE_STYLES = `
  .ripple-container {
    position: relative;
    overflow: hidden;
  }
  
  .ripple-effect {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    transform: scale(0);
    animation: ripple-expand var(--ripple-duration, 0.6s) cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  
  @keyframes ripple-expand {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
