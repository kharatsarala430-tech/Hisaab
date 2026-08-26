import { useTheme } from '../ThemeContext'

export default function BottomNav({ activeTab, onTabChange }) {
  const { theme } = useTheme()
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'emi', label: 'EMI', icon: '💳' },
    { id: 'budget', label: '50/30/20', icon: '📊' },
    { id: 'savings', label: 'Savings', icon: '🎯' },
  ]

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: theme.mode === 'dark' ? 'rgba(5,5,5,0.95)' : 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(10px)',
      borderTop: `1px solid ${theme.border}`,
      display: 'flex', justifyContent: 'space-around',
      padding: '10px 0 18px',
      zIndex: 50,
    }}>
      {tabs.map((tab) => {
        const active = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              background: 'none', border: 'none',
              color: active ? theme.accent : theme.textFaint,
              padding: '4px 10px',
            }}
          >
            <span style={{ fontSize: 20, filter: active ? `drop-shadow(0 0 6px ${theme.accentBg})` : 'none' }}>
              {tab.icon}
            </span>
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
