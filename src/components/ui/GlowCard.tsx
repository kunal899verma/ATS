"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import type { ReactNode, MouseEvent } from "react";

const GLOW_COLORS: Record<string, string> = {
  indigo:  "rgba(99,102,241,0.18)",
  violet:  "rgba(139,92,246,0.18)",
  cyan:    "rgba(6,182,212,0.18)",
  pink:    "rgba(236,72,153,0.18)",
  emerald: "rgba(34,197,94,0.18)",
  amber:   "rgba(245,158,11,0.18)",
  red:     "rgba(239,68,68,0.18)",
};

interface Props {
  children: ReactNode;
  className?: string;
  glow?: keyof typeof GLOW_COLORS;
  tilt?: boolean;
}

export function GlowCard({ children, className = "", glow = "indigo", tilt = false }: Props) {
  const glowColor = GLOW_COLORS[glow] ?? GLOW_COLORS.indigo;
  const prefersReducedMotion = useReducedMotion();
  const [supportsHover, setSupportsHover] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setSupportsHover(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const interactiveTilt = tilt && supportsHover && !prefersReducedMotion;
  const hoverEffectsEnabled = supportsHover && !prefersReducedMotion;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], interactiveTilt ? [4, -4] : [0, 0]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], interactiveTilt ? [-4, 4] : [0, 0]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!interactiveTilt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => {
    if (!interactiveTilt) return;
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      className={className}
      style={interactiveTilt ? { rotateX, rotateY, transformStyle: "preserve-3d" } : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={hoverEffectsEnabled ? {
        y: -4,
        boxShadow: `0 20px 40px ${glowColor}, 0 0 0 1px ${glowColor}`,
      } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
