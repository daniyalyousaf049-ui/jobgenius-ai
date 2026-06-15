import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// Minimal types for the Web Speech API
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

export function VoiceRecorder({
  onTranscript,
  disabled,
}: {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const [supported, setSupported] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [volume, setVolume] = useState(0); // 0..1, smoothed
  const recRef = useRef<SR | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptRef = useRef("");

  // audio-reactive
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const Ctor = getRecognitionCtor();
    setSupported(Boolean(Ctor));
  }, []);

  const stopAudio = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    analyserRef.current = null;
    setVolume(0);
  };

  const stop = () => {
    if (recRef.current) {
      try { recRef.current.stop(); } catch {}
    }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    stopAudio();
    setRecording(false);
    setSeconds(0);
    const text = transcriptRef.current.trim();
    if (text) onTranscript(text);
    transcriptRef.current = "";
  };

  const startAudioReactive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      analyserRef.current = analyser;

      const timeData = new Uint8Array(analyser.fftSize);
      const freqData = new Uint8Array(analyser.frequencyBinCount);
      let smoothed = 0;

      const tick = () => {
        if (!analyserRef.current) return;
        analyser.getByteTimeDomainData(timeData);
        analyser.getByteFrequencyData(freqData);

        // RMS volume
        let sum = 0;
        for (let i = 0; i < timeData.length; i++) {
          const v = (timeData[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / timeData.length);
        smoothed = smoothed * 0.8 + rms * 0.2;
        const norm = Math.min(1, smoothed * 4);
        setVolume(norm);

        // draw waveform
        const canvas = canvasRef.current;
        if (canvas) {
          const dpr = window.devicePixelRatio || 1;
          const w = canvas.clientWidth;
          const h = canvas.clientHeight;
          if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
            canvas.width = w * dpr;
            canvas.height = h * dpr;
          }
          const c = canvas.getContext("2d")!;
          c.setTransform(dpr, 0, 0, dpr, 0, 0);
          c.clearRect(0, 0, w, h);

          // Hue based on volume: green (low) → yellow → red (loud)
          const hue = 140 - norm * 140; // 140 green -> 0 red
          const bars = 48;
          const barW = w / bars;
          const step = Math.floor(freqData.length / bars);
          for (let i = 0; i < bars; i++) {
            const v = freqData[i * step] / 255;
            const bh = Math.max(2, v * h * 0.95);
            const x = i * barW;
            const y = (h - bh) / 2;
            const grad = c.createLinearGradient(0, y, 0, y + bh);
            grad.addColorStop(0, `hsl(${hue + 30}, 90%, 65%)`);
            grad.addColorStop(1, `hsl(${hue}, 85%, 45%)`);
            c.fillStyle = grad;
            const r = Math.min(barW / 2, 3);
            const bw = barW - 2;
            c.beginPath();
            // rounded bar
            c.moveTo(x + r, y);
            c.lineTo(x + bw - r, y);
            c.quadraticCurveTo(x + bw, y, x + bw, y + r);
            c.lineTo(x + bw, y + bh - r);
            c.quadraticCurveTo(x + bw, y + bh, x + bw - r, y + bh);
            c.lineTo(x + r, y + bh);
            c.quadraticCurveTo(x, y + bh, x, y + bh - r);
            c.lineTo(x, y + r);
            c.quadraticCurveTo(x, y, x + r, y);
            c.closePath();
            c.fill();
          }
        }

        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      // mic blocked — recognition can still work in some browsers
    }
  };

  const start = async () => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const consent = localStorage.getItem("voice-consent");
    if (consent !== "true") {
      const ok = confirm(
        "Voice recording uses your microphone and your browser's speech recognition. Audio is processed locally by your browser. Continue?",
      );
      if (!ok) return;
      localStorage.setItem("voice-consent", "true");
    }
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    transcriptRef.current = "";
    rec.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      transcriptRef.current = text;
    };
    rec.onerror = () => stop();
    rec.onend = () => {
      if (recording) stop();
    };
    rec.start();
    recRef.current = rec;
    setRecording(true);
    setSeconds(0);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= 60) { stop(); return 0; }
        return s + 1;
      });
    }, 1000);
    startAudioReactive();
  };

  useEffect(() => () => { stopAudio(); }, []);

  if (!supported) {
    return (
      <p className="text-xs text-muted-foreground">
        Voice input isn't supported in this browser. Use Chrome/Edge for the voice mode.
      </p>
    );
  }

  // sentiment color (green confident -> yellow -> red nervous)
  const hue = 140 - volume * 140;
  const sentiment = volume < 0.15 ? "Listening…" : volume < 0.5 ? "Confident" : volume < 0.8 ? "Engaged" : "Loud";

  return (
    <div className="space-y-3">
      {recording && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card/50 p-3 backdrop-blur"
        >
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="font-medium" style={{ color: `hsl(${hue}, 85%, 55%)` }}>
              ● {sentiment}
            </span>
            <span className="font-mono text-muted-foreground">{60 - seconds}s</span>
          </div>
          <canvas ref={canvasRef} className="w-full h-14 rounded-md" />
          {/* live confidence meter */}
          <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full transition-[width,background] duration-75"
              style={{ width: `${volume * 100}%`, background: `hsl(${hue}, 85%, 55%)` }}
            />
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative">
          {/* pulsing volume rings */}
          {recording && (
            <>
              <span
                className="pointer-events-none absolute inset-0 rounded-md"
                style={{
                  boxShadow: `0 0 0 ${4 + volume * 18}px hsla(${hue}, 90%, 55%, ${0.15 + volume * 0.25})`,
                  transition: "box-shadow 80ms linear",
                }}
              />
              <motion.span
                className="pointer-events-none absolute inset-0 rounded-md"
                animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                style={{ boxShadow: `0 0 0 2px hsla(${hue}, 90%, 55%, 0.5)` }}
              />
            </>
          )}
          <Button
            type="button"
            size="lg"
            variant={recording ? "destructive" : "default"}
            onClick={recording ? stop : start}
            disabled={disabled}
            className={recording ? "relative" : "relative bg-gradient-hero hover:opacity-90"}
          >
            {recording ? <Square className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
            {recording ? `Stop` : "Record answer"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  } catch {}
}
