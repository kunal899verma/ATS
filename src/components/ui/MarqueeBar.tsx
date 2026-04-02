"use client";
import { motion } from "framer-motion";

interface Props {
  items: string[];
  speed?: number;
  label?: string;
}

export function MarqueeBar({ items, speed = 40, label = "Helped land jobs at" }: Props) {
  const doubled = [...items, ...items, ...items];
  return (
    <div className="overflow-hidden" aria-hidden="true">
      <div className="flex items-center gap-4 mb-3">
        <div className="flex-1 h-px bg-white/5" />
        <p className="text-slate-500 text-xs font-medium whitespace-nowrap tracking-wider uppercase">{label}</p>
        <div className="flex-1 h-px bg-white/5" />
      </div>
      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[var(--bg-primary)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[var(--bg-primary)] to-transparent z-10 pointer-events-none" />
        <motion.div
          className="flex gap-12 whitespace-nowrap"
          animate={{ x: ["0%", "-33.33%"] }}
          transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        >
          {doubled.map((item, i) => (
            <span
              key={i}
              className="text-slate-600 text-sm font-bold tracking-wide hover:text-slate-400 transition-colors cursor-default flex-shrink-0 grayscale hover:grayscale-0"
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
