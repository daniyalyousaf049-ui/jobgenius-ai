import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { xpForScore } from "./gamification.functions";

const FREE_TIER_LIMIT = 50;

const TranscriptEntry = z.object({
  question: z.string(),
  answer: z.string(),
  score: z.number().optional(),
  feedback: z.string().optional(),
  idealAnswer: z.string().optional(),
});

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { profile: data, freeTierLimit: FREE_TIER_LIMIT };
  });

export const listInterviews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Interview not found");
    return row;
  });

export const startInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ role: z.string().min(1).max(80), model: z.string().min(1).max(80) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    // enforce free tier
    const { data: prof } = await supabase
      .from("profiles")
      .select("interviews_used")
      .eq("user_id", userId)
      .maybeSingle();
    const used = prof?.interviews_used ?? 0;
    if (used >= FREE_TIER_LIMIT) {
      throw new Error(`Free tier limit reached (${FREE_TIER_LIMIT} interviews).`);
    }

    const { data: row, error } = await supabase
      .from("interviews")
      .insert({ user_id: userId, role: data.role, model_used: data.model, transcript: [] })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const saveInterviewProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      id: z.string().uuid(),
      transcript: z.array(TranscriptEntry),
    }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("interviews")
      .update({ transcript: data.transcript })
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const completeInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      id: z.string().uuid(),
      transcript: z.array(TranscriptEntry),
      finalScore: z.number().int().min(1).max(10),
      summary: z.string(),
    }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("interviews")
      .update({
        transcript: data.transcript,
        final_score: data.finalScore,
        feedback_summary: data.summary,
        completed_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);

    // gamification: streak + XP
    const { data: prof } = await supabase
      .from("profiles")
      .select("interviews_used, xp, current_streak, best_streak, last_interview_at")
      .eq("user_id", userId)
      .maybeSingle();
    const used = prof?.interviews_used ?? 0;

    const now = new Date();
    const last = prof?.last_interview_at ? new Date(prof.last_interview_at as string) : null;
    let streak = prof?.current_streak ?? 0;
    const oneDay = 86_400_000;
    if (!last) streak = 1;
    else {
      const sameDay = now.toDateString() === last.toDateString();
      const diff = now.getTime() - last.getTime();
      if (sameDay) streak = Math.max(streak, 1);
      else if (diff < 2 * oneDay) streak = streak + 1;
      else streak = 1;
    }
    const gained = xpForScore(data.finalScore, streak);
    const newXp = (prof?.xp ?? 0) + gained;
    const best = Math.max(prof?.best_streak ?? 0, streak);

    await supabase
      .from("profiles")
      .update({
        interviews_used: used + 1,
        xp: newXp,
        current_streak: streak,
        best_streak: best,
        last_interview_at: now.toISOString(),
      })
      .eq("user_id", userId);

    return { ok: true, xpGained: gained, xp: newXp, currentStreak: streak, bestStreak: best };
  });

export const deleteInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("interviews").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
