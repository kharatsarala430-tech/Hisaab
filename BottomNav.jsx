export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'emi', label: 'EMI', icon: '💳' },
    { id: 'budget', label: '50/30/20', icon: '📊' },
    { id: 'savings', label: 'Savings', icon: '🎯' },
  ]

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={activeTab === tab.id ? 'nav-item active' : 'nav-item'}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
