import { useEffect, useState, useCallback } from "react";
import { isPageVisible, usePageVisibility as usePageVisibilityUtil } from "@/lib/animations";

/**
 * Hook to detect if page is visible (focused)
 * Used to pause heavy animations when tab is inactive
 */
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(isPageVisible());

    const unsubscribe = usePageVisibilityUtil((visible) => {
      setIsVisible(visible);
    });

    return unsubscribe;
  }, []);

  return isVisible;
}

/**
 * Hook for viewport intersection with animation support
 */
export function useInViewAnimation(ref: React.RefObject<HTMLElement>, options = {}) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1, ...options });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, options]);

  return inView;
}

/**
 * Hook to detect device type with resize support
 */
export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">("desktop");

  useEffect(() => {
    const updateDeviceType = () => {
      if (window.innerWidth < 768) {
        setDeviceType("mobile");
      } else if (window.innerWidth < 1024) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }
    };

    updateDeviceType();
    window.addEventListener("resize", updateDeviceType);
    return () => window.removeEventListener("resize", updateDeviceType);
  }, []);

  return deviceType;
}

/**
 * Hook for scroll direction
 */
export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down");
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let rafId: number;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      if (Math.abs(scrollY - lastScrollY) < 5) {
        return;
      }

      setScrollDirection(scrollY > lastScrollY ? "down" : "up");
      setLastScrollY(scrollY);
    };

    const onScroll = () => {
      rafId = requestAnimationFrame(updateScrollDirection);
    };

    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [lastScrollY]);

  return scrollDirection;
}

/**
 * Hook to detect reduced motion preference
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);

    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
