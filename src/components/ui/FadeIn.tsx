"use client";
import { motion, type Variant } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  className?: string;
  once?: boolean;
}

export function FadeIn({
  children,
  delay = 0,
  direction = "up",
  duration = 0.6,
  className = "",
  once = true,
}: FadeInProps) {
  const hidden: Variant = {
    opacity: 0,
    y: direction === "up" ? 32 : direction === "down" ? -32 : 0,
    x: direction === "left" ? 32 : direction === "right" ? -32 : 0,
  };
  const show: Variant = { opacity: 1, y: 0, x: 0 };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-60px" }}
      variants={{ hidden, show }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
