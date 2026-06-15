import { motion } from "framer-motion";
import { ReactNode } from "react";
import { ANIMATION_TIMINGS } from "@/lib/animations";

/**
 * Skeleton loader with animated shimmer sweep
 */
export function SkeletonLoader({
  width = "w-full",
  height = "h-12",
  className = "",
  count = 1,
}: {
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`${width} ${height} ${className} rounded-lg bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[size:200%_100%]`}
          animate={{ backgroundPosition: ["0% center", "200% center"] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            marginBottom: i < count - 1 ? "12px" : "0",
          }}
        />
      ))}
    </>
  );
}

/**
 * Card skeleton with exact dimensions
 */
export function CardSkeleton({
  count = 3,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`grid md:grid-cols-${Math.min(count, 3)} gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-lg p-4 bg-card border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <motion.div
            className="w-12 h-12 rounded-lg bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[size:200%_100%] mb-4"
            animate={{ backgroundPosition: ["0% center", "200% center"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="h-4 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[size:200%_100%] rounded mb-3"
            animate={{ backgroundPosition: ["0% center", "200% center"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="h-3 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[size:200%_100%] rounded w-2/3"
            animate={{ backgroundPosition: ["0% center", "200% center"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Table skeleton with rows
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <motion.div
              key={`${rowIdx}-${colIdx}`}
              className="flex-1 h-8 rounded-lg bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[size:200%_100%]"
              animate={{ backgroundPosition: ["0% center", "200% center"] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
                delay: (rowIdx + colIdx) * 0.05,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state component with animated illustration
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: {
  icon?: any;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center py-12 text-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: ANIMATION_TIMINGS.NORMAL }}
    >
      {Icon && (
        <motion.div
          className="mb-4"
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: ANIMATION_TIMINGS.FLOAT,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
        </motion.div>
      )}

      <motion.h3
        className="text-lg font-semibold mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {title}
      </motion.h3>

      <motion.p
        className="text-muted-foreground max-w-sm mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {description}
      </motion.p>

      {action && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Loading spinner with pulsing ring
 */
export function LoadingSpinner({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer rotating ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner pulsing circle */}
      <motion.div
        className="absolute inset-2 rounded-full bg-primary/20"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}

/**
 * Shimmer effect for loading
 */
export function ShimmerEffect({
  className = "",
}: {
  className?: string;
}) {
  return (
    <motion.div
      className={`bg-gradient-to-r from-transparent via-white/20 to-transparent ${className}`}
      animate={{ x: ["-100%", "100%"] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

/**
 * Pulsing skeleton effect
 */
export function PulseEffect({
  className = "",
}: {
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/**
 * Animated loading bar (progress indicator)
 */
export function AnimatedLoadingBar({
  progress = 0,
  animated = true,
}: {
  progress?: number;
  animated?: boolean;
}) {
  return (
    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-primary to-primary/60"
        animate={{
          width: animated ? `${progress}%` : `${progress}%`,
          opacity: animated ? [0.8, 1, 0.8] : 1,
        }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}

/**
 * Content fade-in animation (replaces skeleton)
 */
export function ContentReveal({
  children,
  isLoaded,
  skeleton = null,
}: {
  children: ReactNode;
  isLoaded: boolean;
  skeleton?: ReactNode;
}) {
  return (
    <div>
      {!isLoaded && skeleton && (
        <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {skeleton}
        </motion.div>
      )}

      {isLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
