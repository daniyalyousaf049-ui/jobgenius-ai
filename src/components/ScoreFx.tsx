import { AnimatePresence, motion } from "framer-motion";

export function FloatingPoints({ items }: { items: { id: number; value: number }[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-end justify-center">
      <AnimatePresence>
        {items.map((it) => {
          const color =
            it.value >= 8 ? "text-emerald-400" : it.value >= 5 ? "text-amber-400" : "text-rose-400";
          return (
            <motion.div
              key={it.id}
              initial={{ opacity: 0, y: 0, scale: 0.6 }}
              animate={{ opacity: 1, y: -120, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              className={`absolute bottom-2 text-3xl font-extrabold drop-shadow-lg ${color}`}
              style={{ textShadow: "0 0 24px currentColor" }}
            >
              +{it.value}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function ScoreBurst({ score, keyId }: { score: number; keyId: number }) {
  const color =
    score >= 8 ? "from-emerald-400 to-emerald-600" : score >= 5 ? "from-amber-400 to-orange-500" : "from-rose-400 to-rose-600";
  return (
    <motion.div
      key={keyId}
      initial={{ scale: 0, rotate: -10, opacity: 0 }}
      animate={{ scale: [0, 1.5, 1], rotate: [0, 5, 0], opacity: 1 }}
      transition={{ duration: 0.6, times: [0, 0.6, 1] }}
      className={`inline-flex items-center justify-center px-3 py-1 rounded-lg bg-gradient-to-br ${color} text-white font-bold shadow-lg`}
    >
      {score}/10
    </motion.div>
  );
}
