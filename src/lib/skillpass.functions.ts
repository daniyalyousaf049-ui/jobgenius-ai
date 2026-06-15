import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function makeSlug(name: string | null | undefined) {
  const base = (name || "ace")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24) || "ace";
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

export const submitSkillPass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      role: z.string().min(1).max(64),
      stageScores: z.array(z.number().int().min(0).max(100)).length(3),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const overall = Math.round(data.stageScores.reduce((a, b) => a + b, 0) / 3);
    const passed = overall >= 75;

    const { data: prof } = await supabase
      .from("profiles")
      .select("display_name, xp")
      .eq("user_id", userId)
      .maybeSingle();

    const slug = makeSlug(prof?.display_name);
    const { data: row, error } = await supabase
      .from("skillpasses")
      .insert({
        user_id: userId,
        role: data.role,
        overall_score: overall,
        stage_scores: data.stageScores,
        passed,
        slug,
        display_name: prof?.display_name ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    if (passed) {
      const bonus = 500;
      await supabase
        .from("profiles")
        .update({ xp: (prof?.xp ?? 0) + bonus })
        .eq("user_id", userId);
      return { ...row, xpAwarded: bonus };
    }
    return { ...row, xpAwarded: 0 };
  });

export const listMySkillPasses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("skillpasses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateSkillPass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      id: z.string().uuid(),
      published: z.boolean().optional(),
      open_to_work: z.boolean().optional(),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const patch: { published?: boolean; open_to_work?: boolean } = {};
    if (data.published !== undefined) patch.published = data.published;
    if (data.open_to_work !== undefined) patch.open_to_work = data.open_to_work;
    const { data: row, error } = await supabase
      .from("skillpasses")
      .update(patch)
      .eq("id", data.id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const getPublicSkillPass = createServerFn({ method: "GET" })
  .inputValidator((i: unknown) => z.object({ slug: z.string().min(1).max(64) }).parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("skillpasses")
      .select("id, role, overall_score, stage_scores, passed, slug, published, open_to_work, display_name, expires_at, created_at")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });
