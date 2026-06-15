import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft, Award, Mail, Briefcase } from "lucide-react";
import { getPublicSkillPass } from "@/lib/skillpass.functions";
import { getRole } from "@/lib/skillpass-roles";

export const Route = createFileRoute("/verified/$slug")({
  loader: async ({ params }) => {
    const data = await getPublicSkillPass({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const role = getRole(loaderData.role)?.title ?? loaderData.role;
    const name = loaderData.display_name ?? "JobGenius candidate";
    const title = `${name} — Verified ${role} | JobGenius`;
    const desc = `Verified ${role} with a ${loaderData.overall_score}% SkillPass score on JobGenius AI.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "profile" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-3xl font-bold mb-2">Profile not found</h1>
      <p className="text-muted-foreground mb-6">This SkillPass is private or doesn't exist.</p>
      <Link to="/" className="text-primary hover:underline">← Back home</Link>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="container mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-2xl font-bold mb-2">Couldn't load profile</h1>
      <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
      <button onClick={reset} className="text-primary hover:underline">Try again</button>
    </div>
  ),
  component: VerifiedPage,
});

function VerifiedPage() {
  const pass = Route.useLoaderData();
  const role = getRole(pass.role);
  const stageScores = pass.stage_scores as number[];
  const created = new Date(pass.created_at);
  const expires = new Date(pass.expires_at);

  return (
    <div className="container mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> JobGenius AI
      </Link>

      <motion.section
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card border-rainbow p-8 text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 text-xs font-bold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> JOBGENIUS VERIFIED
        </div>
        <div className="text-6xl mb-3">{role?.emoji ?? "🎖️"}</div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-1">{pass.display_name ?? "Anonymous Candidate"}</h1>
        <p className="text-lg text-muted-foreground mb-5">Verified {role?.title ?? pass.role}</p>

        <div className="text-6xl sm:text-7xl font-bold text-fluid">{pass.overall_score}%</div>
        <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mt-2">Overall SkillPass score</p>

        {pass.open_to_work && (
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-600 dark:text-amber-300 text-sm font-semibold">
            <Briefcase className="w-4 h-4" /> Open to opportunities
          </div>
        )}
      </motion.section>

      <section className="glass-card p-6 mb-6">
        <h2 className="font-bold mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-amber-400" /> Stage-by-stage</h2>
        <div className="space-y-3">
          {["Technical Competence", "Behavioral & Soft Skills", "Live Problem-Solving"].map((name, i) => {
            const s = stageScores[i] ?? 0;
            return (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{name}</span>
                  <span className={`font-bold ${s >= 75 ? "text-emerald-500" : "text-amber-500"}`}>{s}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${s}%` }}
                    transition={{ duration: 1, delay: 0.2 + i * 0.15 }}
                    className={`h-full rounded-full ${s >= 75 ? "bg-gradient-to-r from-emerald-400 to-emerald-600" : "bg-gradient-to-r from-amber-400 to-orange-500"}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="glass-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Verified on {created.toLocaleDateString()} · Valid until {expires.toLocaleDateString()}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          SkillPass ID: <span className="font-mono">{pass.id.slice(0, 8)}</span>
        </p>
        {pass.open_to_work && (
          <a
            href={`mailto:hello@jobgenius.ai?subject=Opportunity for ${pass.display_name ?? "candidate"}&body=I saw your verified SkillPass for ${role?.title ?? pass.role}.`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <Mail className="w-4 h-4" /> Contact candidate
          </a>
        )}
      </section>

      <p className="text-center text-xs text-muted-foreground mt-8">
        Want your own verified credential? <Link to="/" className="text-primary hover:underline">Try JobGenius AI →</Link>
      </p>
    </div>
  );
}
