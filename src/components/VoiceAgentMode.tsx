import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, X, Send } from "lucide-react";
import { speak } from "@/components/VoiceRecorder";

type SR = {
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> & { length: number } }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
};

function getRecognitionCtor(): (new () => SR) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Full-screen Siri/Jarvis-style voice agent overlay.
 * - Speaks the current question via TTS.
 * - Listens continuously, shows live transcription at the bottom.
 * - User taps "Send" to submit, or "X" to close.
 */
export function VoiceAgentMode({
  open,
  question,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  question: string;
  loading: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}) {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  const recRef = useRef<SR | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastQRef = useRef("");

  // Speak the question when it changes
  useEffect(() => {
    if (!open || !question || question === lastQRef.current) return;
    lastQRef.current = question;
    setTranscript("");
    setAiSpeaking(true);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(question);
      u.rate = 1;
      u.pitch = 1.05;
      u.onend = () => {
        setAiSpeaking(false);
        startListening();
      };
      u.onerror = () => {
        setAiSpeaking(false);
        startListening();
      };
      window.speechSynthesis.speak(u);
    } else {
      setAiSpeaking(false);
      startListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, open]);

  useEffect(() => {
    if (!open) cleanup();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function cleanup() {
    try { recRef.current?.stop(); } catch {}
    recRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    setListening(false);
    setVolume(0);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  async function startListening() {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      ctxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      const buf = new Uint8Array(analyser.fftSize);
      let smooth = 0;
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let s = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          s += v * v;
        }
        const rms = Math.sqrt(s / buf.length);
        smooth = smooth * 0.8 + rms * 0.2;
        setVolume(Math.min(1, smooth * 4));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {}

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      setTranscript(t);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    try {
      rec.start();
      recRef.current = rec;
      setListening(true);
    } catch {}
  }

  const handleSend = () => {
    const t = transcript.trim();
    if (!t) return;
    cleanup();
    onSubmit(t);
  };

  // Bubble color shifts with volume & speaking state
  const hue = aiSpeaking ? 270 : 180 + volume * 100;
  const scale = aiSpeaking ? 1.05 + Math.sin(Date.now() / 200) * 0.04 : 1 + volume * 0.4;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { cleanup(); onClose(); }}
            className="absolute top-4 right-4"
            aria-label="Close voice agent"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Animated orb */}
          <div className="relative flex items-center justify-center mb-8">
            {/* outer rings */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border"
                style={{
                  width: 200 + i * 60,
                  height: 200 + i * 60,
                  borderColor: `hsla(${hue}, 90%, 65%, ${0.25 - i * 0.06})`,
                }}
                animate={{
                  scale: [1, 1.08, 1],
                  opacity: [0.4, 0.15, 0.4],
                }}
                transition={{ duration: 2.4 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
            <motion.div
              animate={{ scale }}
              transition={{ duration: 0.08 }}
              className="relative w-44 h-44 rounded-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle at 30% 30%, hsl(${hue}, 90%, 75%), hsl(${(hue + 60) % 360}, 90%, 45%))`,
                boxShadow: `0 0 80px hsla(${hue}, 90%, 60%, 0.6), inset 0 0 40px hsla(${hue}, 90%, 80%, 0.4)`,
              }}
            >
              <Mic className="w-12 h-12 text-white drop-shadow-lg" />
            </motion.div>
          </div>

          <div className="text-center px-6 max-w-2xl">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
              {aiSpeaking ? "AI Interviewer speaking…" : listening ? "Listening" : loading ? "Thinking…" : "Tap send when done"}
            </div>
            <div className="text-2xl md:text-3xl font-semibold leading-snug min-h-[3rem]">
              {question || "…"}
            </div>
          </div>

          {/* Live transcription bottom */}
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-background to-transparent">
            <div className="max-w-3xl mx-auto">
              <div className="text-xs text-muted-foreground mb-2 text-center">
                Your spoken answer (live transcription)
              </div>
              <div className="rounded-2xl border border-border bg-card/80 backdrop-blur p-4 min-h-[80px] text-base">
                {transcript || <span className="text-muted-foreground italic">Start speaking after the question…</span>}
              </div>
              <div className="flex justify-center mt-3 gap-2">
                <Button
                  variant="outline"
                  onClick={() => { setTranscript(""); }}
                  disabled={!transcript}
                  size="sm"
                >
                  Clear
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={!transcript.trim() || loading || aiSpeaking}
                  className="bg-gradient-hero hover:opacity-90"
                >
                  <Send className="w-4 h-4 mr-2" /> Send answer
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Re-export so callers don't need a separate import
export { speak };
