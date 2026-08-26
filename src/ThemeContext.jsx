import { createContext, useContext, useState, useEffect } from "react";
import { getTheme } from "./theme";

/**
 * Hisaab — Theme Context
 * ---------------------------------------------------
 * Save as: src/ThemeContext.jsx
 *
 * Wrap your app root (App.jsx, wherever <Dashboard /> is first
 * rendered after login) with <ThemeProvider>...</ThemeProvider>.
 * Any component inside can then call useTheme() to get:
 *   - theme        -> the current color object (theme.bg, theme.text, etc.)
 *   - mode         -> "dark" | "light"
 *   - toggleMode   -> flips mode and saves the choice
 */

const ThemeContext = createContext(null);

const STORAGE_KEY = "hisaab_theme_mode";

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : "dark";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
    // Drives the CSS variables in index.css ([data-theme="light"] selector)
    document.documentElement.setAttribute("data-theme", mode);
    // Keep the native status bar / browser chrome in sync with the theme
    document.body.style.backgroundColor = getTheme(mode).bg;
  }, [mode]);

  const toggleMode = () => setMode((m) => (m === "dark" ? "light" : "dark"));

  const value = {
    theme: getTheme(mode),
    mode,
    toggleMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
}
