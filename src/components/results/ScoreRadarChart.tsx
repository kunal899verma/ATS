"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ScoreBreakdown } from "@/types";

interface Props {
  breakdown: ScoreBreakdown;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; payload: { label: string } }[];
}) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-lg px-3 py-2 border border-white/10 text-xs">
        <p className="text-slate-400">{payload[0].payload.label}</p>
        <p className="text-cyan-400 font-bold text-sm">{payload[0].value}/100</p>
      </div>
    );
  }
  return null;
};

export default function ScoreRadarChart({ breakdown }: Props) {
  const data = [
    { subject: "Keywords", label: "Keywords (35%)", value: breakdown.keywords, fullMark: 100 },
    { subject: "Skills", label: "Skills (20%)", value: breakdown.skills, fullMark: 100 },
    { subject: "Experience", label: "Experience (15%)", value: breakdown.experience, fullMark: 100 },
    { subject: "Education", label: "Education (10%)", value: breakdown.education, fullMark: 100 },
    { subject: "Formatting", label: "Formatting (10%)", value: breakdown.formatting, fullMark: 100 },
    { subject: "ATS Compat.", label: "ATS Compatibility (10%)", value: breakdown.atsCompatibility, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid
          stroke="rgba(255,255,255,0.06)"
          radialLines={false}
        />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
          tickLine={false}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke="#00d4ff"
          fill="#00d4ff"
          fillOpacity={0.12}
          strokeWidth={2}
          dot={{ r: 3, fill: "#00d4ff", strokeWidth: 0 }}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
