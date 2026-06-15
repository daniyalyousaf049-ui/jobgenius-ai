import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getInterview } from "@/lib/interviews.functions";
import type { FinalReport } from "@/lib/groq.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Printer, ArrowLeft, ExternalLink, Trophy } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/results/$id")({
  head: () => ({ meta: [{ title: "Results — Interviewly" }] }),
  component: Results,
});

type Turn = { question: string; answer: string; score?: number; feedback?: string; idealAnswer?: string };

function Results() {
  const { id } = Route.useParams();
  const fetchFn = useServerFn(getInterview);
  const [data, setData] = useState<{
    role: string;
    model_used: string;
    started_at: string;
    transcript: Turn[];
    final_score: number | null;
    feedback_summary: string | null;
  } | null>(null);

  useEffect(() => {
    fetchFn({ data: { id } })
      .then((r) => setData(r as never))
      .catch((e) => toast.error(e.message));
  }, [fetchFn, id]);

  if (!data) return <div className="container mx-auto px-6 py-20 text-center text-muted-foreground">Loading…</div>;

  let report: FinalReport | null = null;
  if (data.feedback_summary) {
    try { report = JSON.parse(data.feedback_summary); } catch {}
  }

  return (
    <div className="container mx-auto px-6 max-w-4xl py-12 print:py-4">
      <div className="flex items-center justify-between mb-8 print:hidden">
        <Button variant="ghost" asChild>
          <Link to="/dashboard"><ArrowLeft className="w-4 h-4 mr-2" /> Dashboard</Link>
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Export as PDF
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-hero p-10 text-center mb-8 shadow-elegant"
      >
        <Trophy className="w-12 h-12 text-primary-foreground mx-auto mb-3" />
        <div className="text-primary-foreground/90 text-sm uppercase tracking-wider mb-1">Final Score</div>
        <div className="text-8xl font-bold text-primary-foreground mb-2">
          {data.final_score ?? "—"}
          <span className="text-3xl text-primary-foreground/70">/10</span>
        </div>
        <div className="text-primary-foreground/90">{data.role} · {data.model_used}</div>
      </motion.div>

      {report && (
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-3 text-success">
              <CheckCircle2 className="w-5 h-5" /> Strengths
            </h3>
            <ul className="space-y-2 text-sm">
              {report.strengths.map((s, i) => <li key={i}>• {s}</li>)}
            </ul>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-3 text-destructive">
              <AlertCircle className="w-5 h-5" /> Areas to improve
            </h3>
            <ul className="space-y-2 text-sm">
              {report.weaknesses.map((s, i) => <li key={i}>• {s}</li>)}
            </ul>
          </Card>
        </div>
      )}

      {report?.summary && (
        <Card className="p-6 mb-8 bg-gradient-card">
          <h3 className="font-semibold mb-2">Summary</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{report.summary}</p>
        </Card>
      )}

      {report?.resources && report.resources.length > 0 && (
        <Card className="p-6 mb-8">
          <h3 className="font-semibold mb-3">Recommended resources</h3>
          <ul className="space-y-2">
            {report.resources.map((r, i) => (
              <li key={i}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1.5">
                  {r.title} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <h2 className="text-xl font-semibold mb-4">Full transcript</h2>
      <div className="space-y-4">
        {data.transcript.map((t, i) => (
          <Card key={i} className="p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Question {i + 1}</div>
            <div className="font-medium mb-3">{t.question}</div>
            <div className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">{t.answer}</div>
            {t.score != null && (
              <div className="flex items-center gap-3 pt-3 border-t border-border">
                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-sm font-semibold">{t.score}/10</span>
                <span className="text-sm text-muted-foreground italic">{t.feedback}</span>
              </div>
            )}
            {t.idealAnswer && (
              <div className="mt-3 p-3 rounded-lg bg-success/10 border border-success/30">
                <div className="text-xs uppercase tracking-wider text-success font-semibold mb-1">✓ Ideal answer</div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{t.idealAnswer}</div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
