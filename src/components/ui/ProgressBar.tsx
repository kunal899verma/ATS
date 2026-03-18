"use client";

import { useEffect, useState } from "react";

interface ProgressBarProps {
  value: number;
  label?: string;
  showValue?: boolean;
  delay?: number;
  height?: "sm" | "md";
}

export default function ProgressBar({ value, label, showValue = true, delay = 0, height = "sm" }: ProgressBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(Math.min(100, Math.max(0, value))), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  const getGradient = (v: number) => {
    if (v >= 75) return "linear-gradient(90deg, #00d4ff, #06b6d4)";
    if (v >= 55) return "linear-gradient(90deg, #34d399, #10b981)";
    if (v >= 35) return "linear-gradient(90deg, #f59e0b, #d97706)";
    return "linear-gradient(90deg, #f87171, #ef4444)";
  };

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-slate-400">{label}</span>}
          {showValue && <span className="text-xs font-semibold text-white">{value}%</span>}
        </div>
      )}
      <div className={`progress-track ${height === "md" ? "!h-2" : ""}`}>
        <div
          className="progress-fill"
          style={{ width: `${width}%`, background: getGradient(value) }}
        />
      </div>
    </div>
  );
}
