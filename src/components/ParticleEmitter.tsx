import { motion } from "framer-motion";
import { useRef, useEffect, useCallback } from "react";
import { randomBetween, randomChoice, ANIMATION_COLORS } from "@/lib/animations";

interface ParticleEmitterProps {
  isActive: boolean;
  position: { x: number; y: number };
  count?: number;
  color?: string;
  size?: number;
  speed?: number;
  duration?: number;
}

/**
 * Particle emitter that creates particles bursting from a point
 * Used for button clicks and special effects
 */
export function ParticleEmitter({
  isActive,
  position,
  count = 8,
  color = ANIMATION_COLORS.GOLD,
  size = 3,
  speed = 300,
  duration = 800,
}: ParticleEmitterProps) {
  const particles = useRef<Array<{
    id: number;
    angle: number;
    velocity: number;
  }>>([]);

  useEffect(() => {
    if (!isActive) return;

    // Generate particles
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      angle: (360 / count) * i + randomBetween(-15, 15),
      velocity: randomBetween(speed * 0.8, speed * 1.2),
    }));

    particles.current = newParticles;
  }, [isActive, count, speed]);

  if (!isActive || particles.current.length === 0) {
    return null;
  }

  return (
    <div className="fixed pointer-events-none z-50">
      {particles.current.map((particle) => {
        const rad = (particle.angle * Math.PI) / 180;
        const x = Math.cos(rad) * particle.velocity;
        const y = Math.sin(rad) * particle.velocity;

        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full pointer-events-none"
            initial={{
              left: position.x,
              top: position.y,
              width: size,
              height: size,
              backgroundColor: color,
              opacity: 1,
              boxShadow: `0 0 ${size * 2}px ${color}`,
            }}
            animate={{
              left: position.x + x,
              top: position.y + y,
              opacity: 0,
            }}
            transition={{
              duration: duration / 1000,
              ease: "easeOut",
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Burst particle effect (like confetti or explosion)
 */
export function BurstEffect({
  isActive,
  position,
  count = 12,
  colors = [
    ANIMATION_COLORS.GOLD,
    ANIMATION_COLORS.TEAL,
    ANIMATION_COLORS.LAVENDER,
  ],
  duration = 1200,
}: {
  isActive: boolean;
  position: { x: number; y: number };
  count?: number;
  colors?: string[];
  duration?: number;
}) {
  const particles = useRef<Array<{
    id: number;
    angle: number;
    color: string;
  }>>([]);

  useEffect(() => {
    if (!isActive) return;

    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      angle: (360 / count) * i,
      color: randomChoice(colors),
    }));

    particles.current = newParticles;
  }, [isActive, count, colors]);

  if (!isActive || particles.current.length === 0) {
    return null;
  }

  return (
    <div className="fixed pointer-events-none z-50">
      {particles.current.map((particle) => {
        const rad = (particle.angle * Math.PI) / 180;
        const distance = randomBetween(100, 300);
        const x = Math.cos(rad) * distance;
        const y = Math.sin(rad) * distance;

        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full pointer-events-none"
            initial={{
              left: position.x,
              top: position.y,
              width: 4,
              height: 4,
              backgroundColor: particle.color,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              left: position.x + x,
              top: position.y + y + randomBetween(50, 150),
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: duration / 1000,
              ease: "easeOut",
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Confetti effect (celebration)
 */
export function ConfettiEffect({
  isActive,
  position,
  count = 30,
}: {
  isActive: boolean;
  position: { x: number; y: number };
  count?: number;
}) {
  const colors = [
    ANIMATION_COLORS.GOLD,
    ANIMATION_COLORS.TEAL,
    "#ec4899",
    "#8b5cf6",
  ];
  const particles = useRef<Array<{
    id: number;
    angle: number;
    color: string;
    rotation: number;
  }>>([]);

  useEffect(() => {
    if (!isActive) return;

    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      angle: randomBetween(0, 360),
      color: randomChoice(colors),
      rotation: randomBetween(0, 360),
    }));

    particles.current = newParticles;
  }, [isActive, count]);

  if (!isActive || particles.current.length === 0) {
    return null;
  }

  return (
    <div className="fixed pointer-events-none z-50">
      {particles.current.map((particle) => {
        const rad = (particle.angle * Math.PI) / 180;
        const distance = randomBetween(80, 250);
        const x = Math.cos(rad) * distance;
        const y = Math.sin(rad) * distance;
        const drift = randomBetween(-100, 100);

        return (
          <motion.div
            key={particle.id}
            className="absolute pointer-events-none"
            initial={{
              left: position.x,
              top: position.y,
              opacity: 1,
              scale: 1,
              rotate: particle.rotation,
            }}
            animate={{
              left: position.x + x + drift,
              top: position.y + y + 200,
              opacity: 0,
              scale: 0,
              rotate: particle.rotation + 360,
            }}
            transition={{
              duration: 2,
              ease: "easeOut",
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: particle.color }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
