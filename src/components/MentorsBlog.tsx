import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Quote, Share2 } from "lucide-react";

type Mentor = {
  name: string;
  field: string;
  quote: string;
  message: string;
  color: string;
  emoji: string;
};

const MENTORS: Mentor[] = [
  {
    name: "Steve Jobs", field: "Technology", emoji: "🍎", color: "from-slate-400 to-slate-600",
    quote: "Stay hungry, stay foolish. The only way to do great work is to love what you do.",
    message: "Steve Jobs taught the world that interviews are about passion, not perfection. When you walk into an interview, your interviewer can sense whether you genuinely care about the work. Cultivate curiosity in everything: read deeply, build side projects, and ask 'why' relentlessly. Connect dots looking backwards — every experience, even the irrelevant-seeming ones, becomes part of your unique story. Don't try to fit a mold; show them the human behind the resume. Practice articulating not just what you've done, but why it mattered to you. The best engineers and designers are storytellers first. Treat every interview as a chance to learn what excellent work looks like in that company. And remember: rejection is redirection. Stay hungry to grow, stay foolish enough to try things outside your comfort zone."
  },
  {
    name: "Elon Musk", field: "Engineering", emoji: "🚀", color: "from-orange-400 to-red-500",
    quote: "Work like hell. If others put in 40 hours and you put in 100, you'll achieve in 4 months what takes them a year.",
    message: "Elon's wisdom for interviews: out-prepare every other candidate. Study the company's products, read their engineering blog, understand their roadmap. When asked about a tough problem, walk through first-principles thinking — break the problem down to physics, not analogies. Demonstrate how you reason, not just what you know. Practice technical questions until the patterns are reflexive. But also: be honest about what you don't know. The smartest interviewers respect 'I don't know, but here's how I'd figure it out' more than confident bluffing. Build things in your own time — small rockets, small AI agents, small businesses. Experience compounds. The candidates who win at SpaceX, Tesla, and Neuralink are obsessed builders, not professional interviewees."
  },
  {
    name: "Oprah Winfrey", field: "Media & Communication", emoji: "🎤", color: "from-purple-400 to-pink-500",
    quote: "The biggest adventure you can take is to live the life of your dreams.",
    message: "Oprah's gift was making every guest feel heard. Apply this in interviews: listen actively, mirror back what you hear, and ask thoughtful follow-up questions. Communication is not just speaking — it's making the other person feel understood. Practice the STAR method (Situation, Task, Action, Result) until your stories flow naturally. Record yourself answering common questions and watch the playback. Notice your filler words, posture, and pace. Authenticity beats polish: share genuine moments of failure and what you learned. Confidence is not the absence of fear; it's showing up despite it. Walk into every room knowing your worth — your dreams are valid and the right opportunity will recognize you."
  },
  {
    name: "Albert Einstein", field: "Science", emoji: "🧠", color: "from-blue-400 to-indigo-500",
    quote: "Intellectual growth should commence at birth and cease only at death.",
    message: "Einstein's lesson for technical interviews: cultivate deep understanding over memorization. When you understand a concept truly, you can explain it to a child, derive it from scratch, and apply it to new contexts. In interviews, demonstrate this depth by working through problems aloud. Don't rush to the answer — show the path. Curiosity is your most valuable asset; never stop reading papers, taking courses, building proofs. Imagination matters more than knowledge because knowledge is finite. When given a constraint, reimagine it: 'What if we removed this constraint? What if we doubled it?' This thought-experiment approach impresses interviewers because it reveals how you think, not what you've memorized."
  },
  {
    name: "Ratan Tata", field: "Business & Leadership", emoji: "🏛️", color: "from-emerald-400 to-teal-600",
    quote: "If you want to walk fast, walk alone. If you want to walk far, walk together.",
    message: "Ratan Tata's interviews always centered on character. Companies hire skills but promote character. Demonstrate humility: credit teammates, acknowledge mentors, share lessons from failures without blame. Behavioral questions are your chance to reveal values. Tell stories where you chose long-term integrity over short-term gain. Show how you handle disagreement gracefully — describe a time you changed your mind based on data or empathy. Leadership isn't about being the loudest; it's about lifting others. Practice answering 'Tell me about a time you led a team' with stories that make your teammates the heroes. Walk slowly, walk together, and you'll be the candidate companies fight to keep."
  },
  {
    name: "Malala Yousafzai", field: "Education & Courage", emoji: "📚", color: "from-rose-400 to-fuchsia-500",
    quote: "One child, one teacher, one book, one pen can change the world.",
    message: "Malala reminds us that interviews are an act of courage. Walking into a room and advocating for yourself takes bravery — especially when imposter syndrome whispers you don't belong. You belong. Your perspective is valuable precisely because it is yours. Prepare for interviews by learning continuously: free courses, library books, YouTube tutorials, open-source contributions. Knowledge is power and access. When you face questions outside your expertise, say so honestly and explain how you'd learn. Speak up about what you care about — diversity, mentorship, community. The companies worth working for value candidates with conviction. One conversation, one connection, one yes can change the trajectory of your entire career."
  },
];

export function MentorsBlog() {
  const [open, setOpen] = useState<Mentor | null>(null);

  return (
    <section className="container mx-auto px-6 max-w-6xl py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary uppercase tracking-widest mb-4">
          <Quote className="w-3 h-3" /> Mentors' Corner
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Wisdom from <span className="text-fluid">legends</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Six voices that shaped industries — and their advice for owning your next interview.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MENTORS.map((m, i) => (
          <motion.button
            key={m.name}
            onClick={() => setOpen(m)}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group text-left rounded-2xl border border-border bg-card p-6 hover:shadow-elegant hover:border-primary/40 transition-all relative overflow-hidden"
          >
            <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${m.color} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`} />
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center text-3xl mb-4 shadow-elegant`}>
              {m.emoji}
            </div>
            <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">{m.field}</div>
            <h3 className="text-xl font-bold mb-3">{m.name}</h3>
            <p className="text-sm text-muted-foreground italic leading-relaxed mb-4">"{m.quote}"</p>
            <span className="text-sm font-medium text-primary group-hover:underline">Read wisdom →</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-card border border-border rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 shadow-elegant"
            >
              <button
                onClick={() => setOpen(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-muted hover:bg-accent flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${open.color} flex items-center justify-center text-5xl mb-5 shadow-elegant`}>
                {open.emoji}
              </div>
              <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">{open.field}</div>
              <h3 className="text-3xl font-bold mb-3">{open.name}</h3>
              <p className="text-lg italic text-muted-foreground border-l-2 border-primary pl-4 mb-6">"{open.quote}"</p>
              <p className="text-base leading-relaxed whitespace-pre-line">{open.message}</p>
              <div className="mt-6 flex gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${open.quote}" — ${open.name}\n\nGreat interview wisdom from InterviewAI Pro by Daniyal Yousaf`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
                >
                  <Share2 className="w-4 h-4" /> Share this wisdom
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
