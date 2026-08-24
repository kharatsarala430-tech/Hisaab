import { useState } from "react";

/**
 * Hisaab — Sidebar / Drawer Navigation (v2 — matched to real app)
 * ---------------------------------------------------
 * Save as: src/components/Sidebar.jsx
 *
 * Props:
 *   session         -> the session object (same one Dashboard already has)
 *   activeTab       -> current tab string ('dashboard' | 'emi' | 'budget' | 'savings')
 *   onTabChange     -> function(tabKey) — same setActiveTab you already use
 *   onDownloadReport-> your existing handleDownloadReport function
 *   onExportCSV     -> handleExportCSV function (exports current month's transactions as CSV)
 *   onLogout        -> your existing handleLogout function
 */

const ACCENT = "#3DA9FF";
const BG_PANEL = "#0A0A0A";
const BORDER = "rgba(61,169,255,0.15)";
const TEXT_MUTED = "#7A7A7A";

const ROUTES = [
  { key: "dashboard", label: "Dashboard", icon: "🏠" },
  { key: "emi", label: "EMI Manager", icon: "💳" },
  { key: "budget", label: "Budget Planner", icon: "📊" },
  { key: "savings", label: "Savings Goals", icon: "🎯" },
  { key: "udhaar", label: "Udhaar / Khata", icon: "🤝" },
];

const SETTINGS_ROUTE = { key: "settings", label: "Settings", icon: "⚙️" };

const COMING_SOON = [
  { label: "Bill Reminders", icon: "🔔" },
];

export default function Sidebar({ session, activeTab, onTabChange, onDownloadReport, onExportCSV, onLogout }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      {/* Hamburger trigger — sits in your header, left of the "Hisaab" title */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        style={styles.hamburgerBtn}
      >
        <span style={styles.hamburgerLine} />
        <span style={styles.hamburgerLine} />
        <span style={styles.hamburgerLine} />
      </button>

      {open && <div style={styles.backdrop} onClick={close} aria-hidden="true" />}

      <aside
        style={{
          ...styles.drawer,
          transform: open ? "translateX(0)" : "translateX(-105%)",
        }}
        aria-hidden={!open}
      >
        {/* Account card */}
        <div style={styles.accountCard}>
          <div style={styles.avatar}>
            {session?.user?.email ? session.user.email.charAt(0).toUpperCase() : "?"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.accountEmail}>{session?.user?.email}</div>
            <button
              onClick={() => {
                onLogout?.();
                close();
              }}
              style={styles.logoutBtn}
            >
              Logout
            </button>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Working routes */}
        <nav>
          {ROUTES.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onTabChange?.(item.key);
                  close();
                }}
                style={{
                  ...styles.menuItem,
                  backgroundColor: isActive ? "rgba(61,169,255,0.08)" : "transparent",
                  color: isActive ? ACCENT : "#EAEAEA",
                  borderLeft: isActive ? `3px solid ${ACCENT}` : "3px solid transparent",
                }}
              >
                <span style={{ fontSize: 18, width: 24 }}>{item.icon}</span>
                <span style={{ fontSize: 15 }}>{item.label}</span>
              </button>
            );
          })}

          {/* Download report — action, not a tab */}
          <button
            onClick={() => {
              onDownloadReport?.();
              close();
            }}
            style={styles.menuItem}
          >
            <span style={{ fontSize: 18, width: 24 }}>📄</span>
            <span style={{ fontSize: 15, color: "#EAEAEA" }}>Download Report</span>
          </button>

          {/* Export CSV — separate from PDF report, raw data for Excel/Sheets */}
          <button
            onClick={() => {
              onExportCSV?.();
              close();
            }}
            style={styles.menuItem}
          >
            <span style={{ fontSize: 18, width: 24 }}>🧾</span>
            <span style={{ fontSize: 15, color: "#EAEAEA" }}>Export CSV</span>
          </button>
        </nav>

        <div style={styles.divider} />

        {/* Settings — separate from the main tabs since it's app config, not a content view */}
        <nav>
          {(() => {
            const isActive = activeTab === SETTINGS_ROUTE.key;
            return (
              <button
                onClick={() => {
                  onTabChange?.(SETTINGS_ROUTE.key);
                  close();
                }}
                style={{
                  ...styles.menuItem,
                  backgroundColor: isActive ? "rgba(61,169,255,0.08)" : "transparent",
                  color: isActive ? ACCENT : "#EAEAEA",
                  borderLeft: isActive ? `3px solid ${ACCENT}` : "3px solid transparent",
                }}
              >
                <span style={{ fontSize: 18, width: 24 }}>{SETTINGS_ROUTE.icon}</span>
                <span style={{ fontSize: 15 }}>{SETTINGS_ROUTE.label}</span>
              </button>
            );
          })()}
        </nav>

        <div style={styles.divider} />

        {/* Not built yet — visible so user knows what's coming, but disabled */}
        <div style={styles.comingSoonLabel}>Coming Soon</div>
        {COMING_SOON.map((item) => (
          <div key={item.label} style={styles.disabledItem}>
            <span style={{ fontSize: 18, width: 24, opacity: 0.4 }}>{item.icon}</span>
            <span style={{ fontSize: 14, color: TEXT_MUTED }}>{item.label}</span>
          </div>
        ))}

        <div style={{ flex: 1 }} />
        <div style={styles.footerNote}>Hisaab · Made in India 🇮🇳</div>
      </aside>
    </>
  );
}

const styles = {
  hamburgerBtn: {
    width: 36,
    height: 36,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  hamburgerLine: {
    width: 20,
    height: 2,
    backgroundColor: "#EAEAEA",
    borderRadius: 2,
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 40,
  },
  drawer: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: "78%",
    maxWidth: 300,
    backgroundColor: BG_PANEL,
    borderRight: `1px solid ${BORDER}`,
    zIndex: 50,
    display: "flex",
    flexDirection: "column",
    padding: "20px 12px 16px",
    transition: "transform 0.28s ease",
    boxShadow: "4px 0 24px rgba(0,0,0,0.6)",
    overflowY: "auto",
  },
  accountCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "6px 8px",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    backgroundColor: "#0D0D0D",
    border: `1px solid ${ACCENT}`,
    color: ACCENT,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 600,
    flexShrink: 0,
  },
  accountEmail: {
    color: "#EAEAEA",
    fontSize: 12.5,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    marginBottom: 6,
  },
  logoutBtn: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#B8B8B8",
    fontSize: 11.5,
    padding: "4px 10px",
    borderRadius: 14,
    cursor: "pointer",
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    margin: "12px 4px",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    padding: "12px 12px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    textAlign: "left",
    borderRadius: 6,
    marginBottom: 2,
  },
  comingSoonLabel: {
    fontSize: 11,
    color: TEXT_MUTED,
    padding: "4px 12px 6px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  disabledItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
  },
  footerNote: {
    color: TEXT_MUTED,
    fontSize: 11,
    textAlign: "center",
    padding: "8px 0 0",
  },
};
