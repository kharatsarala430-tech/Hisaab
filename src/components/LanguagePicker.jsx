import { useLanguage } from "../LanguageContext";
import { LANGUAGES } from "../guideContent";

/**
 * Hisaab — First-time Language Picker
 * ---------------------------------------------------
 * Save as: src/components/LanguagePicker.jsx
 *
 * Shown once, before the Auth screen, on a fresh install (i.e. when
 * LanguageContext's hasChosenLanguage is still false). Reuses the
 * same LANGUAGES list as the Quick Guide so both stay in sync.
 */

export default function LanguagePicker() {
  const { setLanguage } = useLanguage();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>हिसाब · Hisaab</h1>
      <p style={styles.subtitle}>Choose your language / अपनी भाषा चुनें / तुमची भाषा निवडा</p>

      <div style={styles.optionList}>
        {LANGUAGES.map((lang) => (
          <button key={lang.code} style={styles.option} onClick={() => setLanguage(lang.code)}>
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0f1016",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 24px",
    boxSizing: "border-box",
  },
  title: {
    fontFamily: "'Georgia', serif",
    fontSize: 28,
    color: "#5b6ee8",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13.5,
    color: "#9a9ba8",
    textAlign: "center",
    marginBottom: 32,
  },
  optionList: {
    width: "100%",
    maxWidth: 340,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  option: {
    padding: "16px 0",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "#eaeaef",
    fontSize: 17,
    cursor: "pointer",
  },
};
