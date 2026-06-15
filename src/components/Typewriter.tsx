import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  showCursor?: boolean;
  cursorBlinkCount?: number;
}

export function Typewriter({
  text,
  speed = 18,
  className,
  showCursor = true,
  cursorBlinkCount = 3,
}: TypewriterProps) {
  const [shown, setShown] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [blinkCount, setBlinkCount] = useState(0);

  // Typewriter effect
  useEffect(() => {
    setShown("");
    setIsComplete(false);
    setBlinkCount(0);
    if (!text) return;
    
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setIsComplete(true);
      }
    }, speed);
    
    return () => clearInterval(id);
  }, [text, speed]);

  // Cursor blink animation after completion
  useEffect(() => {
    if (!isComplete || blinkCount >= cursorBlinkCount) return;
    
    const blinkTimer = setTimeout(() => {
      setBlinkCount(prev => prev + 1);
    }, 400); // Each blink cycle is ~400ms
    
    return () => clearTimeout(blinkTimer);
  }, [isComplete, blinkCount, cursorBlinkCount]);

  return (
    <span className={className}>
      {shown}
      {showCursor && (
        <motion.span
          className="inline-block w-1 h-full ml-0.5 bg-current"
          animate={
            isComplete && blinkCount < cursorBlinkCount
              ? { opacity: [1, 0, 1, 0] }
              : { opacity: 1 }
          }
          transition={{
            duration: 0.4,
            times: [0, 0.25, 0.75, 1],
            repeat: isComplete && blinkCount < cursorBlinkCount ? 0 : Infinity,
          }}
          style={{
            display: shown.length === 0 ? "none" : "inline-block",
            marginLeft: "2px",
          }}
        />
      )}
    </span>
  );
}
