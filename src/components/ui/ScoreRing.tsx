"use client";

import { useEffect, useState } from "react";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  grade?: string;
}

export default function ScoreRing({ score, size = 180, strokeWidth = 10, grade }: ScoreRingProps) {
  const [animated, setAnimated] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;

  useEffect(() => {
    let start = 0;
    const target = score;
    const duration = 1400;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Ease out expo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      start = Math.round(eased * target);
      setAnimated(start);
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [score]);

  const getColor = (s: number) => {
    if (s >= 80) return "#00d4ff";
    if (s >= 65) return "#34d399";
    if (s >= 50) return "#f59e0b";
    if (s >= 35) return "#f97316";
    return "#ef4444";
  };

  const color = getColor(score);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Glow */}
      <div
        className="absolute rounded-full blur-2xl opacity-20"
        style={{ width: size * 0.7, height: size * 0.7, background: color }}
      />

      <svg width={size} height={size} className="relative z-10 -rotate-90">
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dashoffset 0.05s ease" }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold leading-none" style={{ fontSize: size * 0.24, color }}>
          {animated}
        </span>
        <span className="text-slate-500 text-[11px] mt-0.5">/ 100</span>
        {grade && (
          <span
            className="text-[11px] font-bold mt-1.5 px-2.5 py-0.5 rounded-full"
            style={{ color, background: `${color}18`, border: `1px solid ${color}35` }}
          >
            Grade {grade}
          </span>
        )}
      </div>
    </div>
  );
}
