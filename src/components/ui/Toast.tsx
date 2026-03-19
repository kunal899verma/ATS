"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success: "border-emerald-500/30 bg-[#020817]/90 text-emerald-300",
  error:   "border-red-500/30   bg-[#020817]/90 text-red-300",
  warning: "border-amber-500/30 bg-[#020817]/90 text-amber-300",
  info:    "border-cyan-500/30  bg-[#020817]/90 text-cyan-300",
};

const ICON_COLOR = {
  success: "text-emerald-400",
  error:   "text-red-400",
  warning: "text-amber-400",
  info:    "text-cyan-400",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: "360px", width: "calc(100vw - 3rem)" }}>
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl animate-slide-up ${STYLES[t.type]}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${ICON_COLOR[t.type]}`} />
              <p className="text-sm flex-1 leading-snug">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): (type: ToastType, message: string) => void {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx.toast;
}
