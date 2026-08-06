import { getCategoryGroup } from '../lib/categories'

export default function BudgetPlanner({ transactions }) {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expenses = transactions.filter((t) => t.type === 'expense')

  const needsSpent = expenses
    .filter((t) => getCategoryGroup(t.category) === 'Need')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const wantsSpent = expenses
    .filter((t) => getCategoryGroup(t.category) === 'Want')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalSpent = needsSpent + wantsSpent
  const saved = totalIncome - totalSpent

  const pct = (amount) => (totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0)

  const needsTarget = totalIncome * 0.5
  const wantsTarget = totalIncome * 0.3
  const savingsTarget = totalIncome * 0.2

  const rows = [
    { label: 'Needs (50%)', spent: needsSpent, target: needsTarget, pct: pct(needsSpent), color: '#10b981', icon: '🏠', desc: 'Rent, Bills, Groceries, Healthcare & Loan EMIs' },
    { label: 'Wants (30%)', spent: wantsSpent, target: wantsTarget, pct: pct(wantsSpent), color: '#f59e0b', icon: '🛍️', desc: 'Shopping, Entertainment, Travel & other lifestyle spends' },
    { label: 'Savings (20%)', spent: saved > 0 ? saved : 0, target: savingsTarget, pct: pct(saved > 0 ? saved : 0), color: '#3b82f6', icon: '💰', desc: 'Income left after all expenses' },
  ]

  return (
    <div className="module-section">
      <div className="module-hero green">
        <span className="module-badge">Golden 50/30/20 Framework</span>
        <h2>50/30/20 Budget Planner</h2>
        <p>Automatically calculates your Needs, Wants, and Savings from real transactions.</p>
      </div>

      <div className="cashflow-card">
        <h3>Monthly Cashflow Distribution</h3>
        <p className="cashflow-line">
          Income: ₹{totalIncome.toLocaleString()} | Spent: ₹{totalSpent.toLocaleString()} | Saved: ₹{(saved > 0 ? saved : 0).toLocaleString()}
        </p>
        <div className="cashflow-legend">
          <span><span className="dot" style={{ background: '#10b981' }}></span>Needs ({pct(needsSpent)}%)</span>
          <span><span className="dot" style={{ background: '#f59e0b' }}></span>Wants ({pct(wantsSpent)}%)</span>
          <span><span className="dot" style={{ background: '#3b82f6' }}></span>Savings ({pct(saved > 0 ? saved : 0)}%)</span>
        </div>
      </div>

      {rows.map((row) => (
        <div key={row.label} className="budget-row-card">
          <div className="budget-row-header">
            <span>{row.icon} {row.label}</span>
            <span className={`tag ${row.spent <= row.target ? 'safe-tag' : 'over-tag'}`}>
              {row.spent <= row.target ? 'Safe Zone' : 'Over Budget'}
            </span>
          </div>
          <div className="budget-row-numbers">
            <span>Target Allocation: ₹{row.target.toLocaleString()}</span>
            <span>Actual: ₹{row.spent.toLocaleString()}</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min((row.spent / (row.target || 1)) * 100, 100)}%`,
                background: row.color,
              }}
            />
          </div>
          <p className="budget-desc">{row.desc}</p>
        </div>
      ))}
    </div>
  )
}
