/**
 * Animation utilities, constants, and helpers for JobGenius AI
 */

// ============================================================================
// ANIMATION TIMINGS & EASING
// ============================================================================

export const ANIMATION_TIMINGS = {
  // Micro interactions
  QUICK: 0.15,
  FAST: 0.25,
  NORMAL: 0.3,
  SLOW: 0.5,
  SLOWER: 0.75,
  
  // Long duration animations
  DRIFT: 3,
  FLOAT: 3,
  PULSE: 2,
  ORBS: 8,
  GRADIENT_SHIFT: 4,
  PARTICLES: 18,
  PAGE_TRANSITION: 0.4,
  MODAL_ENTER: 0.3,
  MODAL_EXIT: 0.2,
  COUNTER: 1.5,
  TYPEWRITER: 0.018,
  SCROLL_REVEAL: 0.5,
  CARD_HOVER: 0.3,
  BUTTON_PULSE: 2,
  RIBBON_WAVE: 18,
  ARENA_TENSION: 2,
  VICTORY: 2,
};

export const EASING = {
  // Ease curves
  SMOOTH: "easeInOut",
  SPRING: [0.34, 1.56, 0.64, 1], // cubic-bezier for spring effect
  BOUNCE: [0.68, -0.55, 0.265, 1.55],
  EASE_OUT_CUBIC: [0.215, 0.61, 0.355, 1],
  EASE_IN_QUAD: [0.11, 0, 0.5, 0],
  EASE_OUT_QUAD: [0.5, 1, 0.89, 1],
  LINEAR: "linear",
};

// ============================================================================
// COLOR PALETTE FOR ANIMATIONS
// ============================================================================

export const ANIMATION_COLORS = {
  // Particle colors
  GOLD: "#d4a853",
  TEAL: "#2dd4bf",
  LAVENDER: "#a78bfa",
  WHITE: "#ffffff",
  
  // UI glow colors
  PRIMARY_GLOW: "oklch(0.78 0.2 310)",
  SUCCESS_GLOW: "oklch(0.7 0.17 155)",
  DESTRUCTIVE_GLOW: "oklch(0.65 0.24 25)",
  
  // Background gradient
  DARK_NAVY: "#0a0a1a",
  DEEP_INDIGO: "#1a0a2e",
  MIDNIGHT_BLUE: "#061826",
};

// ============================================================================
// PARTICLE CONFIGURATIONS
// ============================================================================

export const PARTICLE_CONFIG = {
  DEFAULT_COUNT_DESKTOP: 36,
  DEFAULT_COUNT_TABLET: 25,
  DEFAULT_COUNT_MOBILE: 15,
  
  SIZE_MIN: 2,
  SIZE_MAX: 6,
  
  SWAY_MIN: 4,
  SWAY_MAX: 14,
  
  DURATION_MIN: 18,
  DURATION_MAX: 40,
  
  OPACITY_MIN: 0.08,
  OPACITY_MAX: 0.3,
};

// ============================================================================
// RESPONSIVE BREAKPOINTS
// ============================================================================

export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
};

// ============================================================================
// DETECTION & PREFERENCE UTILITIES
// ============================================================================

export function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  
  const width = window.innerWidth;
  if (width < BREAKPOINTS.TABLET) return "mobile";
  if (width < BREAKPOINTS.DESKTOP) return "tablet";
  return "desktop";
}

export function hasReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function getParticleCount(): number {
  if (hasReducedMotion()) return 0;
  
  const device = getDeviceType();
  switch (device) {
    case "mobile":
      return PARTICLE_CONFIG.DEFAULT_COUNT_MOBILE;
    case "tablet":
      return PARTICLE_CONFIG.DEFAULT_COUNT_TABLET;
    case "desktop":
      return PARTICLE_CONFIG.DEFAULT_COUNT_DESKTOP;
  }
}

export function getAnimationDuration(base: number): number {
  const device = getDeviceType();
  // Mobile animations 30% faster
  if (device === "mobile") return base * 0.7;
  return base;
}

// ============================================================================
// ANIMATION PRESET VARIANTS
// ============================================================================

export const ANIMATION_PRESETS = {
  // Card animations
  CARD_HOVER: {
    lift: 10,
    scale: 1.02,
    duration: ANIMATION_TIMINGS.CARD_HOVER,
    easing: EASING.SPRING,
  },
  
  // Button animations
  BUTTON_PRESS: {
    scale: 0.93,
    duration: ANIMATION_TIMINGS.FAST,
  },
  
  BUTTON_HOVER: {
    scale: 1.05,
    duration: ANIMATION_TIMINGS.FAST,
  },
  
  // Page transitions
  PAGE_EXIT: {
    opacity: 0,
    y: 10,
    duration: ANIMATION_TIMINGS.FAST,
  },
  
  PAGE_ENTER: {
    opacity: 1,
    y: 0,
    duration: ANIMATION_TIMINGS.PAGE_TRANSITION,
  },
  
  // Modal animations
  MODAL_OPEN: {
    opacity: 1,
    scale: 1,
    y: 0,
    duration: ANIMATION_TIMINGS.MODAL_ENTER,
  },
  
  MODAL_CLOSE: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    duration: ANIMATION_TIMINGS.MODAL_EXIT,
  },
  
  // Text animations
  TEXT_REVEAL: {
    opacity: 1,
    y: 0,
    duration: ANIMATION_TIMINGS.SCROLL_REVEAL,
  },
  
  // Icon animations
  ICON_BOB: {
    y: [0, -3, 0],
    duration: ANIMATION_TIMINGS.FLOAT,
  },
};

// ============================================================================
// PARTICLE GENERATOR
// ============================================================================

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  sway: number;
  duration: number;
  delay: number;
  color: string;
  opacity: number;
}

export function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: 100 + Math.random() * 40,
    size: PARTICLE_CONFIG.SIZE_MIN + Math.random() * (PARTICLE_CONFIG.SIZE_MAX - PARTICLE_CONFIG.SIZE_MIN),
    sway: PARTICLE_CONFIG.SWAY_MIN + Math.random() * (PARTICLE_CONFIG.SWAY_MAX - PARTICLE_CONFIG.SWAY_MIN),
    duration: PARTICLE_CONFIG.DURATION_MIN + Math.random() * (PARTICLE_CONFIG.DURATION_MAX - PARTICLE_CONFIG.DURATION_MIN),
    delay: Math.random() * -30,
    color: [ANIMATION_COLORS.GOLD, ANIMATION_COLORS.TEAL, ANIMATION_COLORS.LAVENDER][i % 3],
    opacity: PARTICLE_CONFIG.OPACITY_MIN + Math.random() * (PARTICLE_CONFIG.OPACITY_MAX - PARTICLE_CONFIG.OPACITY_MIN),
  }));
}

// ============================================================================
// STAGGER DELAY UTILITIES
// ============================================================================

export function getStaggerDelay(index: number, baseDelay: number = 0.05): number {
  return index * baseDelay;
}

export function createStaggerVariants(count: number, baseDelay: number = 0.05) {
  const variants: Record<string, any> = {};
  
  for (let i = 0; i < count; i++) {
    variants[`item-${i}`] = {
      transition: {
        delay: getStaggerDelay(i, baseDelay),
      },
    };
  }
  
  return variants;
}

// ============================================================================
// PAGE VISIBILITY DETECTOR
// ============================================================================

export function usePageVisibility(callback: (visible: boolean) => void) {
  if (typeof document === "undefined") return;
  
  const handleVisibilityChange = () => {
    callback(document.visibilityState === "visible");
  };
  
  document.addEventListener("visibilitychange", handleVisibilityChange);
  
  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}

export function isPageVisible(): boolean {
  if (typeof document === "undefined") return true;
  return document.visibilityState === "visible";
}

// ============================================================================
// SCROLL PROGRESS DETECTOR
// ============================================================================

export function getScrollProgress(): number {
  if (typeof window === "undefined") return 0;
  
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  
  return docHeight === 0 ? 0 : scrollTop / docHeight;
}

// ============================================================================
// VIEWPORT DETECTION
// ============================================================================

export interface ViewportEntry {
  isInViewport: boolean;
  progress: number; // 0 to 1, where 0.5 is center of viewport
}

export function detectViewport(element: Element): ViewportEntry {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  
  const isInViewport = rect.bottom > 0 && rect.top < viewportHeight;
  
  // Calculate how far down the viewport the element is (0 = top, 1 = bottom)
  const progress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / (viewportHeight + rect.height)));
  
  return { isInViewport, progress };
}

// ============================================================================
// RANDOM UTILITIES
// ============================================================================

export function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function randomDelay(min: number = 0, max: number = 0.5): number {
  return randomBetween(min, max);
}
