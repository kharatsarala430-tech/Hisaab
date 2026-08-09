export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'emi', label: 'EMI', icon: '💳' },
    { id: 'budget', label: '50/30/20', icon: '📊' },
    { id: 'savings', label: 'Savings', icon: '🎯' },
  ]

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(5,5,5,0.95)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(61,169,255,0.15)',
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
              color: active ? '#3DA9FF' : '#5C5C5C',
              padding: '4px 10px',
            }}
          >
            <span style={{ fontSize: 20, filter: active ? 'drop-shadow(0 0 6px rgba(61,169,255,0.6))' : 'none' }}>
              {tab.icon}
            </span>
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
