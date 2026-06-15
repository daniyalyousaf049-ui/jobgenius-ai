import { motion } from "framer-motion";

export function ThinkingDots({ label = "AI is analyzing" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <div className="relative flex items-center gap-1.5 px-3 py-2 rounded-full bg-card border border-border overflow-hidden">
        {/* sweeping light beam */}
        <motion.span
          className="absolute inset-y-0 w-12 -left-12 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          animate={{ x: ["0%", "400%"] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        />
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="relative w-2 h-2 rounded-full bg-primary"
            animate={{
              y: [0, -4, 0],
              boxShadow: [
                "0 0 0 0 hsl(var(--primary) / 0)",
                "0 0 0 6px hsl(var(--primary) / 0.25)",
                "0 0 0 0 hsl(var(--primary) / 0)",
              ],
            }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
      <span>{label}…</span>
    </div>
  );
}
