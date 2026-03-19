"use client";
import { motion } from "framer-motion";

const ORBS = [
  { size: 400, x: "10%",  y: "20%", color: "bg-cyan-500/6",    dur: 8,  delay: 0 },
  { size: 500, x: "75%",  y: "60%", color: "bg-violet-500/5",  dur: 10, delay: 2 },
  { size: 300, x: "45%",  y: "80%", color: "bg-pink-500/5",    dur: 7,  delay: 1 },
  { size: 250, x: "85%",  y: "10%", color: "bg-emerald-500/4", dur: 9,  delay: 3 },
  { size: 350, x: "5%",   y: "70%", color: "bg-amber-500/4",   dur: 11, delay: 1.5 },
];

export function FloatingOrbs({ count = 5 }: { count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {ORBS.slice(0, count).map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${orb.color} blur-[80px]`}
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: orb.dur,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
