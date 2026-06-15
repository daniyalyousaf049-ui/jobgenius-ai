const KEY = "streak-reminder-hours";
export const DEFAULT_HOURS = 12;

export function getStreakReminderHours(): number {
  if (typeof window === "undefined") return DEFAULT_HOURS;
  const raw = localStorage.getItem(KEY);
  const n = raw ? parseInt(raw, 10) : DEFAULT_HOURS;
  return Number.isFinite(n) && n > 0 && n <= 47 ? n : DEFAULT_HOURS;
}

export function setStreakReminderHours(h: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, String(h));
  window.dispatchEvent(new CustomEvent("streak-reminder-changed", { detail: h }));
}
