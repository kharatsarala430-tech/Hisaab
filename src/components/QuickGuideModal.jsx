import { useState, useEffect } from "react";
import { useTheme } from "../ThemeContext";
import { LANGUAGES, authGuideSteps, STORAGE_KEYS } from "../guideContent";

/**
 * Hisaab — Quick Guide Modal (for the Auth / Login-Signup screen)
 * ---------------------------------------------------
 * Save as: src/components/QuickGuideModal.jsx
 *
 * Props:
 *   onClose -> called when the user closes the modal (X button or backdrop tap)
 *
 * Flow: if a language is already saved in localStorage, skip straight to
 * the step wizard. Otherwise show language chips first.
 *
 * Animation: the sheet fades + slides up once on mount, and the inner
 * content re-plays a shorter fade+slide each time the step changes
 * (keyed by `stepIndex` so React remounts it and the CSS animation
 * restarts). All animation lives in the injected <style> tag below —
 * one definition, reused everywhere, so no per-usage animation code
 * needs to be added later.
 */

export default function QuickGuideModal({ onClose }) {
  const { theme } = useTheme();
  const [language, setLanguage] = useState(
    () => localStorage.getItem(STORAGE_KEYS.language) || null
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [closing, setClosing] = useState(false);

  const steps = language ? authGuideSteps[language] : [];
  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const requestClose = () => {
    setClosing(true);
    setTimeout(onClose, 180); // matches guide-sheet-out duration below
  };

  const chooseLanguage = (code) => {
    localStorage.setItem(STORAGE_KEYS.language, code);
    setLanguage(code);
    setStepIndex(0);
  };

  const handleNext = () => {
    if (isLastStep) {
      requestClose();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const handleBack = () => setStepIndex((i) => Math.max(0, i - 1));

  return (
    <div style={styles.backdrop} onClick={requestClose}>
      <style>{guideAnimationCSS}</style>
      <div
        style={styles.sheet(theme)}
        className={closing ? "guide-sheet-out" : "guide-sheet-in"}
        onClick={(e) => e.stopPropagation()}
      >
        <button style={styles.closeBtn(theme)} onClick={requestClose} aria-label="Close">
          ✕
        </button>

        {!language ? (
          <div key="lang-select" className="guide-fade-in">
            <h3 style={styles.heading(theme)}>Choose your language</h3>
            <p style={styles.subtext(theme)}>अपनी भाषा चुनें / तुमची भाषा निवडा</p>
            <div style={styles.langRow}>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  style={styles.langChip(theme)}
                  onClick={() => chooseLanguage(lang.code)}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div key={stepIndex} className="guide-fade-in">
            <div style={styles.progressRow}>
              {steps.map((_, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.progressDot(theme),
                    background: i === stepIndex ? theme.accent : theme.borderSoft,
                    width: i === stepIndex ? 18 : 6,
                  }}
                />
              ))}
            </div>

            <h3 style={styles.heading(theme)}>{step.title}</h3>
            <p style={styles.bodyText(theme)}>{step.text}</p>

            <button
              style={styles.langSwitchLink(theme)}
              onClick={() => {
                localStorage.removeItem(STORAGE_KEYS.language);
                setLanguage(null);
              }}
            >
              Change language
            </button>

            <div style={styles.footerRow}>
              <button
                style={styles.secondaryBtn(theme)}
                onClick={handleBack}
                disabled={stepIndex === 0}
              >
                Back
              </button>
              <button style={styles.primaryBtn(theme)} onClick={handleNext}>
                {isLastStep ? "Got it" : "Next"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* One shared animation definition — reused by QuickGuideModal and DashboardTour
   so no additional animation work is needed when new guide screens are added. */
export const guideAnimationCSS = `
@keyframes guideSheetIn {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes guideSheetOut {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(24px); }
}
@keyframes guideFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.guide-sheet-in { animation: guideSheetIn 0.22s ease-out; }
.guide-sheet-out { animation: guideSheetOut 0.18s ease-in forwards; }
.guide-fade-in { animation: guideFadeIn 0.2s ease-out; }
`;

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 1000,
  },
  sheet: (theme) => ({
    width: "100%",
    maxWidth: 480,
    background: theme.bgElevated,
    border: `1px solid ${theme.border}`,
    borderRadius: "20px 20px 0 0",
    padding: "22px 20px 24px",
    position: "relative",
    boxSizing: "border-box",
  }),
  closeBtn: (theme) => ({
    position: "absolute",
    top: 14,
    right: 14,
    background: "transparent",
    border: "none",
    color: theme.textMuted,
    fontSize: 18,
    cursor: "pointer",
    lineHeight: 1,
    padding: 4,
  }),
  heading: (theme) => ({
    fontFamily: "'Georgia', serif",
    fontSize: 19,
    fontWeight: 600,
    color: theme.accent,
    margin: "6px 0 6px",
  }),
  subtext: (theme) => ({
    fontSize: 12.5,
    color: theme.textMuted,
    margin: "0 0 16px",
  }),
  bodyText: (theme) => ({
    fontSize: 14,
    color: theme.text,
    lineHeight: 1.5,
    margin: "0 0 14px",
  }),
  langRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 4,
  },
  langChip: (theme) => ({
    padding: "10px 18px",
    borderRadius: 999,
    border: `1px solid ${theme.border}`,
    background: theme.card,
    color: theme.text,
    fontSize: 14,
    cursor: "pointer",
  }),
  langSwitchLink: (theme) => ({
    background: "transparent",
    border: "none",
    color: theme.accent,
    fontSize: 12.5,
    padding: 0,
    marginBottom: 16,
    cursor: "pointer",
    textDecoration: "underline",
  }),
  progressRow: {
    display: "flex",
    gap: 5,
    marginBottom: 14,
  },
  progressDot: (theme) => ({
    height: 6,
    borderRadius: 999,
    transition: "all 0.2s ease",
  }),
  footerRow: {
    display: "flex",
    gap: 10,
    marginTop: 4,
  },
  primaryBtn: (theme) => ({
    flex: 1,
    padding: "12px 0",
    borderRadius: 12,
    border: "none",
    background: theme.accent,
    color: theme.bg,
    fontSize: 14.5,
    fontWeight: 600,
    cursor: "pointer",
  }),
  secondaryBtn: (theme) => ({
    flex: 1,
    padding: "12px 0",
    borderRadius: 12,
    border: `1px solid ${theme.border}`,
    background: "transparent",
    color: theme.text,
    fontSize: 14.5,
    fontWeight: 600,
    cursor: "pointer",
  }),
};
