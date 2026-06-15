import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";
type Ctx = { theme: Theme; resolved: "light" | "dark"; setTheme: (t: Theme) => void; toggle: () => void };

const ThemeCtx = createContext<Ctx>({ theme: "system", resolved: "dark", setTheme: () => {}, toggle: () => {} });

function systemPref(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("dark");

  // initial
  useEffect(() => {
    const stored = (typeof window !== "undefined" && (localStorage.getItem("theme") as Theme | null)) || "system";
    setThemeState(stored);
    const r = stored === "system" ? systemPref() : stored;
    setResolved(r);
    document.documentElement.classList.toggle("dark", r === "dark");
  }, []);

  // follow OS when in system mode
  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const update = () => {
      const r = mq.matches ? "light" : "dark";
      setResolved(r);
      document.documentElement.classList.toggle("dark", r === "dark");
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
    const r = t === "system" ? systemPref() : t;
    setResolved(r);
    document.documentElement.classList.toggle("dark", r === "dark");
  };

  // Direct toggle between light <-> dark. System is selected explicitly from the menu.
  const toggle = () => setTheme(resolved === "dark" ? "light" : "dark");

  return <ThemeCtx.Provider value={{ theme, resolved, setTheme, toggle }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
