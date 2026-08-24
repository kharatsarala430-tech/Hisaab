import { useState } from "react";

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

const ACCENT = "#3DA9FF";
const BG_PANEL = "#0A0A0A";
const BORDER = "rgba(61,169,255,0.15)";
const TEXT_MUTED = "#7A7A7A";

export default function SettingsPage({ session, onLogout }) {
  // Theme toggle is local UI state for now — wire to your real theme
  // context/provider once dark/light theming is actually built.
  const [darkMode, setDarkMode] = useState(true);
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );

  const requestNotifPermission = async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
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

  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>Settings</h2>

      {/* ---- Account ---- */}
      <Section title="Account">
        <SettingsRow
          icon="👤"
          label="Email"
          rightText={session?.user?.email}
        />
        <SettingsRow
          icon="🚪"
          label="Logout"
          onClick={onLogout}
          danger
        />
      </Section>

      {/* ---- Appearance ---- */}
      <Section title="Appearance">
        <SettingsRow
          icon="🌗"
          label="Dark Mode"
          toggle
          checked={darkMode}
          onToggle={() => setDarkMode((v) => !v)}
        />
      </Section>

      {/* ---- Permissions ---- */}
      <Section title="Permissions">
        <SettingsRow
          icon="🔔"
          label="Notifications"
          rightText={
            notifPermission === "granted"
              ? "Allowed"
              : notifPermission === "denied"
              ? "Blocked"
              : "Not set"
          }
          onClick={notifPermission === "default" ? requestNotifPermission : undefined}
        />
      </Section>

      {/* ---- Help & Sharing ---- */}
      <Section title="Help">
        <SettingsRow icon="📖" label="Quick Guide" comingSoon />
        <SettingsRow icon="🤝" label="Invite Friends" onClick={handleInvite} />
      </Section>

      <div style={styles.footerNote}>Hisaab · Made in India 🇮🇳</div>
    </div>
  );
}

/* ---------- Section wrapper — groups related rows under a label ---------- */
function Section({ title, children }) {
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
function SettingsRow({ icon, label, onClick, toggle, checked, onToggle, rightText, comingSoon, danger, isLast }) {
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
      <span style={{ flex: 1, fontSize: 14.5, color: danger ? "#FF6B6B" : "#EAEAEA" }}>
        {label}
      </span>

      {toggle && (
        <div
          style={{
            ...styles.toggleTrack,
            backgroundColor: checked ? ACCENT : "rgba(255,255,255,0.12)",
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
        <span style={{ fontSize: 12.5, color: TEXT_MUTED, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {rightText}
        </span>
      )}

      {comingSoon && <span style={{ fontSize: 10.5, color: TEXT_MUTED }}>Soon</span>}

      {clickable && !toggle && (
        <span style={{ fontSize: 16, color: TEXT_MUTED, marginLeft: 4 }}>›</span>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: "4px 2px 24px",
  },
  pageTitle: {
    fontFamily: "'Georgia', serif",
    fontSize: 22,
    fontWeight: 600,
    color: ACCENT,
    margin: "4px 0 18px",
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    color: TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    padding: "0 4px 8px",
  },
  sectionCard: {
    background: BG_PANEL,
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
    overflow: "hidden",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "13px 14px",
    borderBottom: `1px solid ${BORDER}`,
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
    color: TEXT_MUTED,
    fontSize: 11,
    textAlign: "center",
    padding: "16px 0 0",
  },
};
