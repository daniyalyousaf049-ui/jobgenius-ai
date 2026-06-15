import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { pickFallbackQuestion } from "./question-bank";

const SYSTEM_PROMPT = `You are a professional job interviewer. Ask concise, role-relevant questions. After each candidate answer, provide a score (1-10), one sentence of feedback, AND a model "ideal_answer" (2-4 sentences) showing what a strong candidate would have said.

CRITICAL: Respond ONLY with a JSON object — no prose, no markdown, no code fences:
{"question": "your next question", "score": 1-10 (optional, only when scoring), "feedback": "one sentence (optional)", "ideal_answer": "a strong reference answer to the PREVIOUS question (optional, only when scoring)"}

- First turn: only "question".
- Subsequent turns: include "score", "feedback", and "ideal_answer" for the previous answer, plus the next "question".`;

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

const InputSchema = z.object({
  model: z.string().min(1),
  role: z.string().min(1),
  messages: z.array(MessageSchema).max(50),
  questionIndex: z.number().int().min(0).max(20),
});

export type AiTurn = {
  question: string;
  score?: number;
  feedback?: string;
  idealAnswer?: string;
};

function safeParseAiTurn(raw: string): AiTurn | null {
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const obj = JSON.parse(match[0]);
    if (typeof obj.question !== "string") return null;
    return {
      question: obj.question,
      score: typeof obj.score === "number" ? Math.max(1, Math.min(10, Math.round(obj.score))) : undefined,
      feedback: typeof obj.feedback === "string" ? obj.feedback : undefined,
      idealAnswer: typeof obj.ideal_answer === "string" ? obj.ideal_answer : (typeof obj.idealAnswer === "string" ? obj.idealAnswer : undefined),
    };
  } catch {
    return null;
  }
}

export const askInterviewer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<AiTurn & { fallback: boolean }> => {
    const key = process.env.GROQ_API_KEY;
    const messages = [
      { role: "system" as const, content: `${SYSTEM_PROMPT}\n\nThe candidate is interviewing for: ${data.role}.` },
      ...data.messages,
    ];

    if (!key) {
      return {
        question: pickFallbackQuestion(data.role, data.questionIndex),
        fallback: true,
      };
    }

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: data.model,
          messages,
          temperature: 0.7,
          max_tokens: 400,
          response_format: { type: "json_object" },
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("Groq API error", res.status, text);
        return {
          question: pickFallbackQuestion(data.role, data.questionIndex),
          fallback: true,
        };
      }

      const json = await res.json();
      const content: string = json.choices?.[0]?.message?.content ?? "";
      const parsed = safeParseAiTurn(content);
      if (!parsed) {
        return {
          question: pickFallbackQuestion(data.role, data.questionIndex),
          fallback: true,
        };
      }
      return { ...parsed, fallback: false };
    } catch (err) {
      console.error("Groq fetch failed", err);
      return {
        question: pickFallbackQuestion(data.role, data.questionIndex),
        fallback: true,
      };
    }
  });

const ReportSchema = z.object({
  model: z.string(),
  role: z.string(),
  transcript: z.array(z.object({
    question: z.string(),
    answer: z.string(),
    score: z.number().optional(),
    feedback: z.string().optional(),
  })),
});

export type FinalReport = {
  finalScore: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
  resources: { title: string; url: string }[];
};

export const generateFinalReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ReportSchema.parse(input))
  .handler(async ({ data }): Promise<FinalReport> => {
    const scores = data.transcript.map((t) => t.score).filter((s): s is number => typeof s === "number");
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 5;

    const key = process.env.GROQ_API_KEY;
    if (!key) {
      return {
        finalScore: avg,
        strengths: ["Completed the full interview", "Provided structured answers"],
        weaknesses: ["Connect to AI gateway for detailed analysis"],
        summary: `Average score: ${avg}/10. Connect to the Groq API for personalised feedback.`,
        resources: defaultResources(data.role),
      };
    }

    try {
      const prompt = `You evaluated this ${data.role} interview. Transcript:\n${data.transcript
        .map((t, i) => `Q${i + 1}: ${t.question}\nA: ${t.answer}\nScore: ${t.score ?? "-"}\nFeedback: ${t.feedback ?? "-"}`)
        .join("\n\n")}\n\nReturn ONLY this JSON: {"finalScore": 1-10, "strengths": [3 short bullets], "weaknesses": [3 short bullets], "summary": "2-3 sentence overall summary", "resources": [{"title": "...", "url": "..."}, ...3 real high-quality YouTube/course links relevant to the weak areas]}`;

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: data.model,
          messages: [
            { role: "system", content: "You are a senior hiring manager writing a final interview report. Respond with JSON only." },
            { role: "user", content: prompt },
          ],
          temperature: 0.5,
          max_tokens: 800,
          response_format: { type: "json_object" },
        }),
      });

      if (!res.ok) throw new Error(`Groq ${res.status}`);
      const json = await res.json();
      const content: string = json.choices?.[0]?.message?.content ?? "";
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("no json");
      const obj = JSON.parse(match[0]);
      return {
        finalScore: Math.max(1, Math.min(10, Math.round(obj.finalScore ?? avg))),
        strengths: Array.isArray(obj.strengths) ? obj.strengths.slice(0, 5) : [],
        weaknesses: Array.isArray(obj.weaknesses) ? obj.weaknesses.slice(0, 5) : [],
        summary: typeof obj.summary === "string" ? obj.summary : "",
        resources: Array.isArray(obj.resources) ? obj.resources.slice(0, 5) : defaultResources(data.role),
      };
    } catch (err) {
      console.error("Report generation failed", err);
      return {
        finalScore: avg,
        strengths: ["Completed the full interview"],
        weaknesses: ["AI summary unavailable — try again later"],
        summary: `Average score: ${avg}/10.`,
        resources: defaultResources(data.role),
      };
    }
  });

function defaultResources(role: string) {
  return [
    { title: `Top ${role} interview questions`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(role + " interview questions")}` },
    { title: "Cracking the Coding Interview", url: "https://www.crackingthecodinginterview.com/" },
    { title: "STAR method explained", url: "https://www.themuse.com/advice/star-interview-method" },
  ];
}
