import { useState, useEffect } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import { useTheme } from "../ThemeContext";
import QuickGuideModal from "./QuickGuideModal";

/**
 * Hisaab — Settings Page
 * ---------------------------------------------------
 * Save as: src/components/SettingsPage.jsx
 *
 * Props:
 *   session   -> the session object (for showing account email)
 *   onLogout  -> your existing handleLogout function
 *
 * Structure: grouped sections, each a list of SettingsRow items.
 * A row either (a) navigates to sub-content, (b) toggles a value,
 * or (c) triggers an action (share sheet, mailto, etc).
 * Only ONE of these three per row — keeps each row predictable.
 */

export default function SettingsPage({ session, onLogout, onStartTour }) {
  const { theme, mode, toggleMode } = useTheme();

  // 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale' | 'checking'
  const [notifPermission, setNotifPermission] = useState("checking");
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    LocalNotifications.checkPermissions()
      .then((result) => setNotifPermission(result.display))
      .catch(() => setNotifPermission("prompt"));
  }, []);

  const requestNotifPermission = async () => {
    try {
      const result = await LocalNotifications.requestPermissions();
      setNotifPermission(result.display);
    } catch (error) {
      console.error("Notification permission request failed:", error);
    }
  };

  const handleInvite = async () => {
    const shareData = {
      title: "Hisaab",
      text: "Apna paisa track karo Hisaab app se — free, simple, private.",
      url: "https://hisaab.app", // replace with real Play Store link once live
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled the share sheet — do nothing
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      alert("Link copied! Ab kisi ko bhej do.");
    }
  };

  const styles = getStyles(theme);

  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>Settings</h2>

      {/* ---- Account ---- */}
      <Section title="Account" theme={theme}>
        <SettingsRow
          theme={theme}
          icon="👤"
          label="Email"
          rightText={session?.user?.email}
        />
        <SettingsRow
          theme={theme}
          icon="🚪"
          label="Logout"
          onClick={onLogout}
          danger
        />
      </Section>

      {/* ---- Appearance ---- */}
      <Section title="Appearance" theme={theme}>
        <SettingsRow
          theme={theme}
          icon="🌗"
          label="Dark Mode"
          toggle
          checked={mode === "dark"}
          onToggle={toggleMode}
        />
      </Section>

      {/* ---- Permissions ---- */}
      <Section title="Permissions" theme={theme}>
        <SettingsRow
          theme={theme}
          icon="🔔"
          label="Notifications"
          rightText={
            notifPermission === "granted"
              ? "Allowed"
              : notifPermission === "denied"
              ? "Blocked — enable in Android Settings"
              : notifPermission === "checking"
              ? "Checking…"
              : "Not set"
          }
          onClick={
            notifPermission === "granted" || notifPermission === "checking"
              ? undefined
              : notifPermission === "denied"
              ? undefined // Android blocks re-prompting once denied — must go to system Settings
              : requestNotifPermission
          }
        />
      </Section>

      {/* ---- Help & Sharing ---- */}
      <Section title="Help" theme={theme}>
        <SettingsRow theme={theme} icon="📖" label="Quick Guide" onClick={() => setShowGuide(true)} />
        {onStartTour && (
          <SettingsRow theme={theme} icon="🧭" label="Replay Dashboard Tour" onClick={onStartTour} />
        )}
        <SettingsRow theme={theme} icon="🤝" label="Invite Friends" onClick={handleInvite} />
      </Section>

      <div style={styles.footerNote}>Hisaab · Made in India 🇮🇳</div>

      {showGuide && <QuickGuideModal onClose={() => setShowGuide(false)} />}
    </div>
  );
}

/* ---------- Section wrapper — groups related rows under a label ---------- */
function Section({ title, theme, children }) {
  const styles = getStyles(theme);
  const rows = Array.isArray(children) ? children : [children];
  return (
    <div style={styles.section}>
      <div style={styles.sectionLabel}>{title}</div>
      <div style={styles.sectionCard}>
        {rows.map((row, i) =>
          i === rows.length - 1
            ? { ...row, props: { ...row.props, isLast: true } }
            : row
        )}
      </div>
    </div>
  );
}

/* ---------- SettingsRow — ONE reusable row for all three variants ----------
   Pass exactly one of: onClick (action/nav), toggle+checked+onToggle, or
   rightText (read-only display). comingSoon disables the row entirely. */
function SettingsRow({ theme, icon, label, onClick, toggle, checked, onToggle, rightText, comingSoon, danger, isLast }) {
  const styles = getStyles(theme);
  const clickable = !comingSoon && (onClick || toggle);

  return (
    <div
      onClick={comingSoon ? undefined : toggle ? onToggle : onClick}
      style={{
        ...styles.row,
        cursor: clickable ? "pointer" : "default",
        opacity: comingSoon ? 0.45 : 1,
        borderBottom: isLast ? "none" : styles.row.borderBottom,
      }}
    >
      <span style={{ fontSize: 18, width: 26 }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 14.5, color: danger ? theme.danger : theme.text }}>
        {label}
      </span>

      {toggle && (
        <div
          style={{
            ...styles.toggleTrack,
            backgroundColor: checked ? theme.accent : theme.borderSoft,
          }}
        >
          <div
            style={{
              ...styles.toggleThumb,
              transform: checked ? "translateX(18px)" : "translateX(0)",
            }}
          />
        </div>
      )}

      {!toggle && rightText && (
        <span style={{ fontSize: 12.5, color: theme.textMuted, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {rightText}
        </span>
      )}

      {comingSoon && <span style={{ fontSize: 10.5, color: theme.textMuted }}>Soon</span>}

      {clickable && !toggle && (
        <span style={{ fontSize: 16, color: theme.textMuted, marginLeft: 4 }}>›</span>
      )}
    </div>
  );
}

function getStyles(theme) {
  return {
    page: {
      padding: "4px 2px 24px",
    },
    pageTitle: {
      fontFamily: "'Georgia', serif",
      fontSize: 22,
      fontWeight: 600,
      color: theme.accent,
      margin: "4px 0 18px",
    },
    section: {
      marginBottom: 20,
    },
    sectionLabel: {
      fontSize: 11,
      color: theme.textMuted,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      padding: "0 4px 8px",
    },
    sectionCard: {
      background: theme.bgElevated,
      border: `1px solid ${theme.border}`,
      borderRadius: 14,
      overflow: "hidden",
    },
    row: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "13px 14px",
      borderBottom: `1px solid ${theme.border}`,
    },
    toggleTrack: {
      width: 38,
      height: 20,
      borderRadius: 999,
      padding: 2,
      transition: "background-color 0.2s ease",
    },
    toggleThumb: {
      width: 16,
      height: 16,
      borderRadius: "50%",
      backgroundColor: "#fff",
      transition: "transform 0.2s ease",
    },
    footerNote: {
      color: theme.textMuted,
      fontSize: 11,
      textAlign: "center",
      padding: "16px 0 0",
    },
  };
}
