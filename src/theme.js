/**
 * Hisaab — Theme Tokens
 * ---------------------------------------------------
 * Save as: src/theme.js
 *
 * Every color in the app should come from here — never hardcode
 * a hex value directly in a component. Each token has a NAME that
 * describes its ROLE (what it's used for), not its color. That's
 * what lets the same component work in both dark and light mode:
 * the component asks for "cardBg", and theme.js decides what that
 * actually looks like right now.
 *
 * When you need a new color somewhere, first check if an existing
 * token fits (e.g. reuse `textMuted` instead of inventing a new gray).
 * Only add a new token if nothing existing captures the role.
 */

export const darkTheme = {
  mode: "dark",

  // Backgrounds — from deepest (page) to raised (cards/panels)
  bg: "#050505",
  bgElevated: "#0A0A0A",
  card: "#0D0D0D",

  // Text
  text: "#EAEAEA",
  textMuted: "#7A7A7A",
  textFaint: "#5C5C5C",
  textSubtle: "#9A9A9A",
  textOnAccent: "#F5F5F5",

  // Borders / dividers
  border: "rgba(61,169,255,0.15)",
  borderSoft: "rgba(255,255,255,0.08)",

  // Brand / accent
  accent: "#3DA9FF",
  accentSoft: "#B8D9F0",
  accentBg: "rgba(61,169,255,0.08)",

  // Status colors
  success: "#39FF94",
  successBg: "#0A1F13",
  danger: "#FF3D6E",
  dangerBg: "#1A0508",
  warning: "#FFD23D",
  info: "#00E5FF",

  // Category / chart accent palette (pie charts, tags — order matters, keep stable)
  chart: ["#FF9F3D", "#00E5FF", "#A78BFA", "#FF3DE0", "#8C7BFF", "#39FF94", "#FFD23D"],

  // Misc used in specific components
  purple: "#C4B5FD",
  purpleSoft: "#A78BFA",
  tealBg: "#00252B",
  cyanSoft: "#8FEFFF",
  greenSoft: "#8FFFC3",
};

export const lightTheme = {
  mode: "light",

  bg: "#F7F8FA",
  bgElevated: "#FFFFFF",
  card: "#FFFFFF",

  text: "#161616",
  textMuted: "#6B6B6B",
  textFaint: "#8A8A8A",
  textSubtle: "#555555",
  textOnAccent: "#0A0A0A",

  border: "rgba(61,169,255,0.25)",
  borderSoft: "rgba(0,0,0,0.08)",

  accent: "#1E7FD6",
  accentSoft: "#1E5FA8",
  accentBg: "rgba(30,127,214,0.08)",

  success: "#12A150",
  successBg: "#E6F9EE",
  danger: "#E0244F",
  dangerBg: "#FCE8ED",
  warning: "#C98A00",
  info: "#0089A8",

  chart: ["#E07A2C", "#0089A8", "#7C5CD4", "#C22CA6", "#5A4CC2", "#12A150", "#C98A00"],

  purple: "#7C5CD4",
  purpleSoft: "#6A4CC2",
  tealBg: "#E3F6F8",
  cyanSoft: "#0089A8",
  greenSoft: "#12A150",
};

export function getTheme(mode) {
  return mode === "light" ? lightTheme : darkTheme;
}
