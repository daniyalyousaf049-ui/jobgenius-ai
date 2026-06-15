import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** XP earned for a finished interview. */
export function xpForScore(score: number, streak: number) {
  const base = Math.max(10, score * 12);
  const streakBonus = Math.min(streak * 5, 100);
  return base + streakBonus;
}

/** Awards XP, updates streak, returns new totals. Call from completeInterview only. */
export const awardInterviewXp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ finalScore: z.number().int().min(1).max(10) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: prof } = await supabase
      .from("profiles")
      .select("xp, current_streak, best_streak, last_interview_at")
      .eq("user_id", userId)
      .maybeSingle();

    const now = new Date();
    const last = prof?.last_interview_at ? new Date(prof.last_interview_at as string) : null;
    let streak = prof?.current_streak ?? 0;
    if (!last) {
      streak = 1;
    } else {
      const oneDay = 86_400_000;
      const diff = now.getTime() - last.getTime();
      const sameDay = now.toDateString() === last.toDateString();
      if (sameDay) {
        streak = Math.max(streak, 1);
      } else if (diff < 2 * oneDay) {
        streak = streak + 1;
      } else {
        streak = 1;
      }
    }
    const gained = xpForScore(data.finalScore, streak);
    const newXp = (prof?.xp ?? 0) + gained;
    const best = Math.max(prof?.best_streak ?? 0, streak);

    await supabase
      .from("profiles")
      .update({
        xp: newXp,
        current_streak: streak,
        best_streak: best,
        last_interview_at: now.toISOString(),
      })
      .eq("user_id", userId);

    return { gained, xp: newXp, currentStreak: streak, bestStreak: best };
  });

export const getMyStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("profiles")
      .select("xp, current_streak, best_streak, last_interview_at, display_name")
      .eq("user_id", userId)
      .maybeSingle();
    return data ?? { xp: 0, current_streak: 0, best_streak: 0, last_interview_at: null, display_name: null };
  });

export const getLeaderboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, display_name, xp, current_streak, best_streak")
      .order("xp", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r, i) => ({ rank: i + 1, ...r }));
  });
