import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getLeaderboard } from "@/lib/gamification.functions";
import { Card } from "@/components/ui/card";
import { Trophy, Flame, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { AnimatedWaves } from "@/components/AnimatedWaves";
import { MedalsSection } from "@/components/MedalsSection";
import { sfx } from "@/lib/sfx";

// Add this style block for gradient animation
const gradientStyles = `
@keyframes gradient-x {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
.animate-gradient-x {
  background-size: 200% 200%;
  animation: gradient-x 3s ease infinite;
}
`;

export const Route = createFileRoute("/_authenticated/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — JobGenius AI" },
      { name: "description", content: "See how you rank against every player on JobGenius AI by XP." },
    ],
  }),
  component: Leaderboard,
});

type Row = {
  rank: number;
  user_id: string;
  display_name: string | null;
  xp: number;
  current_streak: number;
  best_streak: number;
};

// XP tiers
const TIERS = [
  { name: "Rookie", xp: 0, color: "from-slate-400 to-slate-600", emoji: "🟢" },
  { name: "Bronze", xp: 100, color: "from-amber-600 to-orange-700", emoji: "🟤" },
  { name: "Silver", xp: 500, color: "from-slate-300 to-slate-500", emoji: "⚪" },
  { name: "Gold", xp: 1500, color: "from-yellow-400 to-amber-500", emoji: "🟡" },
  { name: "Platinum", xp: 3500, color: "from-cyan-300 to-sky-500", emoji: "⚪" },
  { name: "Diamond", xp: 7000, color: "from-sky-400 to-indigo-500", emoji: "💎" },
  { name: "Legend", xp: 15000, color: "from-fuchsia-400 to-pink-600", emoji: "🏆" },
];

function getTierForXp(xp: number) {
  return TIERS.reduce((prev, curr) => (xp >= curr.xp ? curr : prev), TIERS[0]);
}

// ---- Firecracker Particle ----
function Firecracker({ delay, x, y, color }: { delay: number; x: number; y: number; color: string }) {
  const particles = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    angle: (i / 8) * 360,
    distance: 40 + Math.random() * 60,
  }));

  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
            y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.7 + Math.random() * 0.5, delay, ease: "easeOut" }}
          className={`absolute w-2 h-2 rounded-full ${color}`}
        />
      ))}
      {/* Center flash */}
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 0.4, delay }}
        className={`absolute w-3 h-3 rounded-full ${color} -translate-x-1/2 -translate-y-1/2`}
      />
    </div>
  );
}

// ---- Tier Plate Celebration (Shows EVERY time page opens) ----
function TierCelebration({ xp, onComplete }: { xp: number; onComplete: () => void }) {
  const tier = getTierForXp(xp);

  useEffect(() => {
    try {
      sfx.correct();
    } catch {}

    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md overflow-hidden"
      onClick={onComplete}
    >
      {/* Firecrackers */}
      <Firecracker delay={0.1} x={20} y={20} color="bg-yellow-400" />
      <Firecracker delay={0.25} x={80} y={15} color="bg-fuchsia-400" />
      <Firecracker delay={0.4} x={15} y={75} color="bg-cyan-400" />
      <Firecracker delay={0.55} x={85} y={80} color="bg-amber-400" />
      <Firecracker delay={0.7} x={50} y={10} color="bg-pink-400" />
      <Firecracker delay={0.85} x={10} y={50} color="bg-emerald-400" />
      <Firecracker delay={1.0} x={90} y={45} color="bg-orange-400" />
      <Firecracker delay={1.15} x={50} y={90} color="bg-purple-400" />

      {/* Floating sparkles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: "110%", 
            opacity: 0,
            scale: 0
          }}
          animate={{ 
            y: "-10%",
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{ 
            duration: 2 + Math.random() * 1.5, 
            delay: 0.3 + Math.random() * 0.8,
            ease: "easeOut"
          }}
          className={`absolute w-1.5 h-1.5 rounded-full ${
            ["bg-yellow-300", "bg-fuchsia-400", "bg-cyan-300", "bg-amber-400"][i % 4]
          }`}
        />
      ))}

      <motion.div
        initial={{ scale: 0, rotate: -25, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 0, rotate: 25, opacity: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.15 }}
        className="text-center relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Expanding celebration rings */}
        <motion.div
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2.8, opacity: 0 }}
          transition={{ duration: 1.3, delay: 0.2 }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-gradient-to-br ${tier.color} blur-xl`}
        />
        <motion.div
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 3.5, opacity: 0 }}
          transition={{ duration: 1.7, delay: 0.35 }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full bg-gradient-to-br ${tier.color} blur-2xl`}
        />
        <motion.div
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-br from-yellow-400/30 to-fuchsia-400/30 blur-3xl"
        />

        {/* Tier Plate */}
        <motion.div
          animate={{
            scale: [1, 1.06, 1],
            rotate: [0, 3, -3, 0],
          }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          className={`relative w-40 h-40 mx-auto rounded-3xl bg-gradient-to-br ${tier.color} flex items-center justify-center text-7xl shadow-2xl mb-6`}
        >
          {tier.emoji}
        </motion.div>

        {/* Tier Name */}
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`text-5xl font-extrabold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent mb-3`}
        >
          {tier.name}
        </motion.h2>

        {/* XP */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-slate-300 text-xl font-medium"
        >
          {xp.toLocaleString()} XP
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-slate-400 text-sm mt-2"
        >
          Compete to climb the ranks!
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.8 }}
          className="text-slate-500 text-sm mt-6 animate-pulse"
        >
          Tap anywhere to view Leaderboard
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

// ---- Animated Badge for leaderboard rows ----
function AnimatedBadge({
  xp,
  rank,
  totalUsers,
  isCurrentUser,
  children,
}: {
  xp: number;
  rank: number;
  totalUsers: number;
  isCurrentUser?: boolean;
  children: React.ReactNode;
}) {
  const isTop3 = rank <= 3;
  const isTop10 = rank / totalUsers <= 0.1;
  const isNewBronze = xp >= 100 && xp < 200;
  const isNewSilver = xp >= 500 && xp < 650;
  const isNewGold = xp >= 1500 && xp < 1700;
  const isMilestone = isNewBronze || isNewSilver || isNewGold;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -15, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 18,
        delay: isTop3 ? rank * 0.2 : isTop10 ? 0.6 : isMilestone ? 0.9 : rank * 0.03,
      }}
      whileHover={{ scale: 1.15, rotate: 5 }}
      className="relative inline-block"
    >
      {children}

      {isTop3 && (
        <>
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.8, delay: rank * 0.2 + 0.3 }}
            className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/40 to-amber-500/40"
          />
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1, delay: rank * 0.2 + 0.5 }}
            className="absolute inset-0 rounded-full bg-gradient-to-br from-fuchsia-400/30 to-pink-500/30"
          />
        </>
      )}

      {isMilestone && (
        <motion.div
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(217, 70, 239, 0)",
              "0 0 15px 3px rgba(217, 70, 239, 0.5)",
              "0 0 0 0 rgba(217, 70, 239, 0)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full"
        />
      )}

      {isCurrentUser && (
        <motion.div
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(6, 182, 212, 0)",
              "0 0 0 8px rgba(6, 182, 212, 0.3)",
              "0 0 0 0 rgba(6, 182, 212, 0)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full"
        />
      )}
    </motion.div>
  );
}

// ---- Tier Badge ----
function TierBadge({ xp }: { xp: number }) {
  const tier = getTierForXp(xp);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${tier.color} text-white shadow-lg`}
    >
      {tier.emoji} {tier.name}
    </span>
  );
}

function Leaderboard() {
  const fetchLB = useServerFn(getLeaderboard);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [showCelebration, setShowCelebration] = useState(true); // Show EVERY time

  useEffect(() => {
    fetchLB()
      .then((r) => setRows(r as Row[]))
      .finally(() => setLoading(false));
  }, [fetchLB]);

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);
  const myXp = rows.find((r) => r.user_id === user?.id)?.xp ?? 0;
  const totalUsers = rows.length;

  return (
    <div className="relative container mx-auto px-6 max-w-4xl py-12">
      <style>{gradientStyles}</style>
      <AnimatedWaves intensity={0.6} />

      {/* Tier Celebration Overlay — EVERY time page opens */}
      <AnimatePresence>
        {showCelebration && (
          <TierCelebration
            xp={myXp}
            onComplete={() => setShowCelebration(false)}
          />
        )}
      </AnimatePresence>

      <div className="text-center mb-10">
        <Trophy className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_200%]">
          Leaderboard
        </h1>
        <p className="text-muted-foreground mt-2">All players ranked by XP. Keep your streak alive to climb.</p>
      </div>

      {user && <MedalsSection xp={myXp} />}

      {loading ? (
        <p className="text-center text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-muted-foreground">No players yet. Be the first — complete an interview!</p>
        </Card>
      ) : (
        <>
          {top3.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-8">
              {top3.map((r) => (
                <motion.div
                  key={r.user_id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: r.rank * 0.15, type: "spring", stiffness: 200 }}
                  className={`p-5 rounded-2xl text-center border relative overflow-hidden ${
                    r.rank === 1
                      ? "border-yellow-500 bg-gradient-to-b from-yellow-500/10 to-transparent shadow-elegant"
                      : r.rank === 2
                      ? "border-slate-400 bg-gradient-to-b from-slate-400/10 to-transparent"
                      : "border-amber-700 bg-gradient-to-b from-amber-700/10 to-transparent"
                  }`}
                >
                  <AnimatedBadge xp={r.xp} rank={r.rank} totalUsers={totalUsers} isCurrentUser={r.user_id === user?.id}>
                    <div className="text-4xl mb-2">
                      {r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : "🥉"}
                    </div>
                  </AnimatedBadge>
                  <div className="font-semibold truncate">{r.display_name || "Anonymous"}</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent mt-1">
                    {r.xp.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">XP</div>
                  <div className="mt-2">
                    <TierBadge xp={r.xp} />
                  </div>
                  {r.current_streak > 0 && (
                    <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-xs">
                      <Flame className="w-3 h-3" /> {r.current_streak} day streak
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          <Card className="divide-y divide-border overflow-hidden">
            {rest.map((r, i) => {
              const me = r.user_id === user?.id;
              return (
                <motion.div
                  key={r.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-4 p-4 ${me ? "bg-primary/10 border-l-2 border-cyan-400" : ""}`}
                >
                  <div className="w-10 text-center">
                    <AnimatedBadge xp={r.xp} rank={r.rank} totalUsers={totalUsers} isCurrentUser={me}>
                      <span className={`font-mono font-bold text-lg ${r.rank <= 10 ? "text-amber-400" : "text-muted-foreground"}`}>
                        #{r.rank}
                      </span>
                    </AnimatedBadge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate flex items-center gap-2">
                      {r.display_name || "Anonymous"}
                      {me && <span className="text-cyan-400 text-xs font-bold ml-1">(YOU)</span>}
                      <TierBadge xp={r.xp} />
                    </div>
                    <div className="text-xs text-muted-foreground flex gap-3 mt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-400" /> streak {r.current_streak}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-amber-400" /> best {r.best_streak}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <AnimatedBadge xp={r.xp} rank={r.rank} totalUsers={totalUsers} isCurrentUser={me}>
                      <div className="font-bold text-lg inline-flex items-center gap-1 bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                        <Zap className="w-4 h-4 text-amber-400" /> {r.xp.toLocaleString()}
                      </div>
                    </AnimatedBadge>
                    <div className="text-xs text-muted-foreground">XP</div>
                  </div>
                </motion.div>
              );
            })}
          </Card>
        </>
      )}
    </div>
  );
}