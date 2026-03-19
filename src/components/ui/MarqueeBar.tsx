"use client";
import { motion } from "framer-motion";

interface Props {
  items: string[];
  speed?: number;
  label?: string;
}

export function MarqueeBar({ items, speed = 25, label = "Our users got hired at" }: Props) {
  const doubled = [...items, ...items, ...items];
  return (
    <div className="overflow-hidden">
      <div className="flex items-center gap-4 mb-3">
        <div className="flex-1 h-px bg-white/5" />
        <p className="text-slate-500 text-xs font-medium whitespace-nowrap tracking-wider uppercase">{label}</p>
        <div className="flex-1 h-px bg-white/5" />
      </div>
      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#020817] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#020817] to-transparent z-10 pointer-events-none" />
        <motion.div
          className="flex gap-10 whitespace-nowrap"
          animate={{ x: ["0%", "-33.33%"] }}
          transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        >
          {doubled.map((item, i) => (
            <span
              key={i}
              className="text-slate-500 text-sm font-bold tracking-wide hover:text-slate-300 transition-colors cursor-default flex-shrink-0"
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
