"use client";

import { useEffect, useState } from "react";
import type { ATSResult } from "@/types";

export interface HistoryEntry {
  id: string;
  fileName: string;
  score: number;
  grade: string;
  matchedCount: number;
  missingCount: number;
  timestamp: number;
  result: ATSResult;
}

const STORAGE_KEY = "ats_history";
const MAX_ENTRIES = 5;

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      // localStorage unavailable (private browsing etc.)
    }
  }, []);

  const saveEntry = (entry: Omit<HistoryEntry, "id">) => {
    setHistory((prev) => {
      const updated = [
        { ...entry, id: Date.now().toString() },
        ...prev,
      ].slice(0, MAX_ENTRIES);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return { history, saveEntry, clearHistory };
}
