import { useEffect, useRef } from "react";

/** Soft radial spotlight that follows the cursor. Desktop only. */
export function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "1";
    let raf = 0;
    let nx = 0, ny = 0;
    const onMove = (e: MouseEvent) => {
      nx = e.clientX; ny = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${nx - 200}px, ${ny - 200}px, 0)`;
        raf = 0;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div
      aria-hidden
      ref={ref}
      className="pointer-events-none fixed top-0 left-0 z-[1] w-[400px] h-[400px] rounded-full opacity-0 transition-opacity duration-500 hidden md:block"
      style={{
        background:
          "radial-gradient(circle, rgba(168,139,250,0.18) 0%, rgba(45,212,191,0.08) 35%, transparent 70%)",
        mixBlendMode: "screen",
      }}
    />
  );
}
