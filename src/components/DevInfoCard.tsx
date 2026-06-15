import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Linkedin, GraduationCap, Sparkles, Star, Flame, Trophy } from "lucide-react";

function Counter({ to, suffix = "", duration = 1500 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setVal(Math.floor(p * to));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

const TYPED = "Building the future of interview preparation with AI";

export function DevInfoCard() {
  const [typed, setTyped] = useState("");
  useEffect(() => {
    let i = 0;
    let cycleTimer: ReturnType<typeof setTimeout>;
    const type = () => {
      i = 0;
      setTyped("");
      const id = setInterval(() => {
        i++;
        setTyped(TYPED.slice(0, i));
        if (i >= TYPED.length) {
          clearInterval(id);
          cycleTimer = setTimeout(type, 10000);
        }
      }, 40);
    };
    type();
    return () => clearTimeout(cycleTimer);
  }, []);

  return (
    <section className="container mx-auto px-4 sm:px-6 max-w-3xl py-8 sm:py-14">
      <div className="relative">
        {/* Particles */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl pointer-events-none">
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/40"
              initial={{ x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%` }}
              animate={{
                x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              }}
              transition={{ duration: 8 + Math.random() * 6, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            />
          ))}
        </div>

        <motion.div
          whileHover={{ scale: 1.015, y: -2 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative animate-float border-rainbow rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-9 shadow-elegant overflow-hidden"
        >
          <div className="absolute -inset-10 -z-10 bg-gradient-hero opacity-30 blur-3xl" />

          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium uppercase tracking-widest text-primary mb-2 sm:mb-3">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> About the developer
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
            <span className="text-fluid">DANIYAL YOUSAF</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-base mb-1">BSAI-2B · AI Interview Assistant Developer</p>
          <p className="text-[11px] sm:text-sm text-muted-foreground italic mb-4 sm:mb-6 min-h-[1.25em]">{typed}<span className="opacity-50">|</span></p>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {[
              { icon: Star, label: "Questions", to: 150, suffix: "+" },
              { icon: Flame, label: "Day Streak", to: 7, suffix: "" },
              { icon: Trophy, label: "Rating", to: 49, suffix: "", display: (v: number) => (v / 10).toFixed(1) },
            ].map((s) => (
              <motion.div
                key={s.label}
                whileHover={{ y: -3, scale: 1.04 }}
                className="rounded-xl sm:rounded-2xl bg-card/60 backdrop-blur border border-border/60 p-2 sm:p-4 text-center"
              >
                <s.icon className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 sm:mb-2 text-primary" />
                <div className="text-lg sm:text-2xl md:text-3xl font-bold text-fluid">
                  {s.display ? <CounterDecimal to={s.to} display={s.display} /> : <Counter to={s.to} suffix={s.suffix} />}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-primary/10 text-[11px] sm:text-sm">
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" /> Final Year Capstone
            </div>
            <motion.a
              href="https://www.linkedin.com/in/daniyal-yousaf-740593400"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-auto inline-flex items-center gap-1.5 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full bg-gradient-hero text-primary-foreground text-xs sm:text-sm font-medium shadow-elegant hover:shadow-glow transition-shadow"
            >
              <Linkedin className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Connect
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CounterDecimal({ to, display }: { to: number; display: (v: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / 1500);
      setVal(Math.floor(p * to));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <span ref={ref}>{display(val)}</span>;
}
