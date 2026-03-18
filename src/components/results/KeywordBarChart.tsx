"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { KeywordMatch } from "@/types";

interface Props {
  matches: KeywordMatch[];
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; payload: { keyword: string; status: string } }[];
}) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="glass rounded-lg px-3 py-2 border border-white/10 text-xs">
        <p className="text-white font-medium mb-0.5">{d.keyword}</p>
        <p className={d.status === "matched" ? "text-emerald-400" : d.status === "synonym" ? "text-amber-400" : "text-red-400"}>
          {d.status === "matched" ? "Exact match" : d.status === "synonym" ? "Synonym match" : "Missing — add this"}
        </p>
        <p className="text-slate-500 mt-0.5">Occurrences: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function KeywordBarChart({ matches }: Props) {
  // Top 15: prioritize critical/high importance + all missing first
  const sorted = [...matches]
    .sort((a, b) => {
      const imp = { critical: 4, high: 3, medium: 2, low: 1 };
      return imp[b.importance] - imp[a.importance];
    })
    .slice(0, 15)
    .map((m) => ({
      keyword: m.keyword.length > 14 ? m.keyword.slice(0, 12) + "…" : m.keyword,
      fullKeyword: m.keyword,
      count: m.found ? Math.max(m.count, 1) : 0,
      status: m.found ? (m.matchType === "synonym" ? "synonym" : "matched") : "missing",
      importance: m.importance,
    }));

  const colorMap: Record<string, string> = {
    matched: "#34d399",
    synonym: "#fbbf24",
    missing: "#f87171",
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
        barSize={10}
      >
        <XAxis
          type="number"
          tick={{ fill: "#475569", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          domain={[0, "auto"]}
        />
        <YAxis
          type="category"
          dataKey="keyword"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={88}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} minPointSize={3}>
          {sorted.map((entry, i) => (
            <Cell
              key={`kw-${i}`}
              fill={colorMap[entry.status]}
              fillOpacity={entry.status === "missing" ? 0.45 : 0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
