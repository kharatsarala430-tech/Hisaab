import { useState, useEffect } from "react";
import { useTheme } from "../ThemeContext";
import { dashboardTourSteps, STORAGE_KEYS } from "../guideContent";
import { guideAnimationCSS } from "./QuickGuideModal";

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
 * "hole" around it using box-shadow instead of clip-path.
 *
 * Tooltip positioning fix: the previous version always tried to place
 * the tooltip 14px below the highlighted element. For elements near
 * the top of the screen with little room below (e.g. the month
 * dropdown), the tooltip's fixed height pushed it past the bottom of
 * the viewport and it became invisible. This version clamps the
 * tooltip's top position to always stay within
 * [16px, viewport height - estimated tooltip height - 16px], flipping
 * above the target only when there's truly more room there.
 */

const TOOLTIP_HEIGHT_ESTIMATE = 190; // rough box height incl. padding, used for clamping only

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
      const raf = requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Re-measure after the scroll settles so the highlight box matches the final position.
        setTimeout(() => setRect(el.getBoundingClientRect()), 260);
      });
      return () => cancelAnimationFrame(raf);
    } else {
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

  const viewportH = typeof window !== "undefined" ? window.innerHeight : 800;
  const margin = 16;

  let tooltipTop;
  if (!highlightBox) {
    tooltipTop = viewportH / 2 - TOOLTIP_HEIGHT_ESTIMATE / 2;
  } else {
    const spaceBelow = viewportH - (highlightBox.top + highlightBox.height);
    const spaceAbove = highlightBox.top;
    const fitsBelow = spaceBelow >= TOOLTIP_HEIGHT_ESTIMATE + margin;
    const fitsAbove = spaceAbove >= TOOLTIP_HEIGHT_ESTIMATE + margin;

    if (fitsBelow) {
      tooltipTop = highlightBox.top + highlightBox.height + 14;
    } else if (fitsAbove) {
      tooltipTop = highlightBox.top - TOOLTIP_HEIGHT_ESTIMATE - 14;
    } else {
      // Neither side has full room (short screen / large element) — clamp inside viewport bounds.
      tooltipTop = viewportH - TOOLTIP_HEIGHT_ESTIMATE - margin;
    }
    // Final safety clamp so the box can never render above or below the visible screen.
    tooltipTop = Math.max(margin, Math.min(tooltipTop, viewportH - TOOLTIP_HEIGHT_ESTIMATE - margin));
  }

  return (
    <div style={styles.overlay}>
      <style>{guideAnimationCSS}</style>

      {highlightBox && (
        <div
          className="guide-fade-in"
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
            transition: "top 0.25s ease, left 0.25s ease, width 0.25s ease, height 0.25s ease",
          }}
        />
      )}
      {!highlightBox && <div style={styles.fullDim} />}

      <div
        key={stepIndex}
        className="guide-fade-in"
        style={{ ...styles.tooltip(theme), top: tooltipTop }}
      >
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
