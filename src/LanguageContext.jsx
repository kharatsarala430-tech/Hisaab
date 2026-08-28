import { createContext, useContext, useState } from "react";
import { translations, APP_LANG_STORAGE_KEY } from "./translations";

/**
 * Hisaab — Language Context
 * ---------------------------------------------------
 * Save as: src/LanguageContext.jsx
 *
 * Mirrors the shape of ThemeContext.jsx on purpose, so the two
 * providers feel consistent to work with:
 *   - language      -> "english" | "hindi" | "marathi"
 *   - setLanguage   -> changes it and saves the choice
 *   - t(path)       -> looks up a translation by dotted path,
 *                       e.g. t("dashboard.balance")
 *   - hasChosenLanguage -> false until the user has picked once;
 *                       App.jsx uses this to show the first-time
 *                       language picker before anything else.
 *
 * Falls back to English automatically if a key is missing in the
 * selected language, so a partially-translated screen never shows
 * a blank label while more strings are still being migrated.
 */

const LanguageContext = createContext(null);

function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem(APP_LANG_STORAGE_KEY) || null);

  const setLanguage = (code) => {
    localStorage.setItem(APP_LANG_STORAGE_KEY, code);
    setLanguageState(code);
  };

  const t = (path, ...args) => {
    const active = language || "english";
    let value = getByPath(translations[active], path);
    if (value === undefined) {
      // Fall back to English for any string not yet translated for this language.
      value = getByPath(translations.english, path);
    }
    if (value === undefined) return path;
    // Some translations are functions (e.g. t("emi.dueInDays", 3)) so they can
    // interpolate a number/name into the right place for each language's word order.
    return typeof value === "function" ? value(...args) : value;
  };

  const value = {
    language: language || "english",
    hasChosenLanguage: !!language,
    setLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return ctx;
}
