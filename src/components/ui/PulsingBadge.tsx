"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function PulsingBadge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative inline-flex ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-full opacity-50"
        style={{ background: "inherit" }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {children}
    </div>
  );
}
