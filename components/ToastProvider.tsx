"use client";

import { useEffect, useState } from "react";
import type { ToastKind } from "@/lib/toast";

type Toast = { id: number; message: string; kind: ToastKind; leaving: boolean };

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<{ message: string; kind: ToastKind }>).detail;
      setToast({ ...detail, id: Date.now(), leaving: false });
    };
    window.addEventListener("daheim:toast", onToast);
    return () => window.removeEventListener("daheim:toast", onToast);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const fadeTimer = window.setTimeout(() => setToast(current => current ? { ...current, leaving: true } : null), 3600);
    const removeTimer = window.setTimeout(() => setToast(null), 4000);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [toast?.id]);

  return <>
    {children}
    {toast && <div className={`toast toast-${toast.kind}${toast.leaving ? " toast-leaving" : ""}`} role={toast.kind === "error" ? "alert" : "status"} aria-live={toast.kind === "error" ? "assertive" : "polite"}>
      <span className="toast-mark" aria-hidden="true">{toast.kind === "error" ? "!" : "✓"}</span>
      <span>{toast.message}</span>
      <button className="toast-close" aria-label="Meldung schließen" onClick={() => setToast(null)}>×</button>
    </div>}
  </>;
}
