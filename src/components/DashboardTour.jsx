import { useState, useEffect } from "react";
import { useTheme } from "../ThemeContext";
import { dashboardTourSteps, STORAGE_KEYS } from "../guideContent";

/**
 * Hisaab — Dashboard Tour (spotlight overlay)
 * ---------------------------------------------------
 * Save as: src/components/DashboardTour.jsx
 *
 * Props:
 *   onFinish -> called when the tour ends (Skip or last step's "Done")
 *
 * How it finds elements: each step has a targetId matching an `id`
 * attribute placed on the real Dashboard element (e.g. id="tour-summary").
 * getBoundingClientRect() gives its screen position, and we draw a
 * "hole" around it using box-shadow instead of clip-path — much simpler
 * and works even if the element is partially off-screen.
 */

export default function DashboardTour({ onFinish }) {
  const { theme } = useTheme();
  const language = localStorage.getItem(STORAGE_KEYS.language) || "english";
  const steps = dashboardTourSteps[language] || dashboardTourSteps.english;

  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const step = steps[stepIndex];

  useEffect(() => {
    const el = document.getElementById(step.targetId);
    if (el) {
      // Small delay lets layout settle (e.g. right after a tab switch) before measuring.
      const raf = requestAnimationFrame(() => {
        setRect(el.getBoundingClientRect());
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return () => cancelAnimationFrame(raf);
    } else {
      // Target not found on screen (e.g. user is on a different tab) — skip this step.
      setRect(null);
    }
  }, [stepIndex, step.targetId]);

  const finishTour = () => {
    localStorage.setItem(STORAGE_KEYS.tourSeen, "true");
    onFinish();
  };

  const handleNext = () => {
    if (stepIndex === steps.length - 1) {
      finishTour();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const padding = 8;
  const highlightBox = rect
    ? {
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      }
    : null;

  // Tooltip appears below the highlighted element, or above it if there's no room below.
  const tooltipTop = highlightBox
    ? highlightBox.top + highlightBox.height + 14 > window.innerHeight - 160
      ? Math.max(20, highlightBox.top - 150)
      : highlightBox.top + highlightBox.height + 14
    : window.innerHeight / 2 - 60;

  return (
    <div style={styles.overlay}>
      {highlightBox && (
        <div
          style={{
            position: "fixed",
            top: highlightBox.top,
            left: highlightBox.left,
            width: highlightBox.width,
            height: highlightBox.height,
            borderRadius: 14,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.72)",
            border: `2px solid ${theme.accent}`,
            pointerEvents: "none",
            transition: "all 0.25s ease",
          }}
        />
      )}
      {!highlightBox && <div style={styles.fullDim} />}

      <div style={{ ...styles.tooltip(theme), top: tooltipTop }}>
        <div style={styles.progressText(theme)}>
          {stepIndex + 1} / {steps.length}
        </div>
        <h4 style={styles.title(theme)}>{step.title}</h4>
        <p style={styles.text(theme)}>{step.text}</p>
        <div style={styles.footerRow}>
          <button style={styles.skipBtn(theme)} onClick={finishTour}>
            Skip
          </button>
          <button style={styles.nextBtn(theme)} onClick={handleNext}>
            {stepIndex === steps.length - 1 ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 2000,
  },
  fullDim: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.72)",
  },
  tooltip: (theme) => ({
    position: "fixed",
    left: 20,
    right: 20,
    maxWidth: 400,
    margin: "0 auto",
    background: theme.bgElevated,
    border: `1px solid ${theme.border}`,
    borderRadius: 16,
    padding: "16px 18px",
    boxSizing: "border-box",
    transition: "top 0.25s ease",
  }),
  progressText: (theme) => ({
    fontSize: 11,
    color: theme.textMuted,
    marginBottom: 6,
  }),
  title: (theme) => ({
    fontFamily: "'Georgia', serif",
    fontSize: 16.5,
    fontWeight: 600,
    color: theme.accent,
    margin: "0 0 6px",
  }),
  text: (theme) => ({
    fontSize: 13.5,
    color: theme.text,
    lineHeight: 1.45,
    margin: "0 0 14px",
  }),
  footerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipBtn: (theme) => ({
    background: "transparent",
    border: "none",
    color: theme.textMuted,
    fontSize: 13,
    cursor: "pointer",
    padding: "8px 4px",
  }),
  nextBtn: (theme) => ({
    padding: "10px 22px",
    borderRadius: 10,
    border: "none",
    background: theme.accent,
    color: theme.bg,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  }),
};
