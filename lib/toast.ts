export type ToastKind = "success" | "info" | "error";

export function showToast(message: string, kind: ToastKind = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("daheim:toast", { detail: { message, kind } }));
}
