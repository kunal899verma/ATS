"use client";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { ReactNode, MouseEvent } from "react";

const GLOW_COLORS: Record<string, string> = {
  cyan:    "rgba(6,182,212,0.18)",
  violet:  "rgba(139,92,246,0.18)",
  pink:    "rgba(236,72,153,0.18)",
  emerald: "rgba(16,185,129,0.18)",
  amber:   "rgba(245,158,11,0.18)",
};

interface Props {
  children: ReactNode;
  className?: string;
  glow?: keyof typeof GLOW_COLORS;
  tilt?: boolean;
}

export function GlowCard({ children, className = "", glow = "cyan", tilt = false }: Props) {
  const glowColor = GLOW_COLORS[glow] ?? GLOW_COLORS.cyan;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], tilt ? [4, -4] : [0, 0]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], tilt ? [-4, 4] : [0, 0]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!tilt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{
        y: -6,
        boxShadow: `0 24px 48px ${glowColor}, 0 0 0 1px ${glowColor}`,
      }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}
