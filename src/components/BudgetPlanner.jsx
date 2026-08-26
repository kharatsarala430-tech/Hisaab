import { getCategoryGroup } from '../lib/categories'
import { useTheme } from '../ThemeContext'

export default function BudgetPlanner({ transactions }) {
  const { theme } = useTheme()

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
    { label: 'Needs (50%)', spent: needsSpent, target: needsTarget, pct: pct(needsSpent), color: theme.success, icon: '🏠', desc: 'Rent, Bills, Groceries, Healthcare & Loan EMIs' },
    { label: 'Wants (30%)', spent: wantsSpent, target: wantsTarget, pct: pct(wantsSpent), color: theme.warning, icon: '🛍️', desc: 'Shopping, Entertainment, Travel & other lifestyle spends' },
    { label: 'Savings (20%)', spent: saved > 0 ? saved : 0, target: savingsTarget, pct: pct(saved > 0 ? saved : 0), color: theme.accent, icon: '💰', desc: 'Income left after all expenses' },
  ]

  return (
    <div>
      {/* Hero card */}
      <div style={{
        background: theme.card, borderRadius: 20, padding: '22px', marginBottom: 18,
        border: `1px solid ${theme.success}40`,
        boxShadow: `0 0 40px ${theme.success}0F`,
      }}>
        <span style={{
          fontSize: 11, background: `${theme.success}1F`, padding: '4px 10px',
          borderRadius: 20, color: theme.greenSoft,
        }}>Golden 50/30/20 Framework</span>
        <h2 style={{ fontSize: 22, fontWeight: 600, margin: '10px 0 8px', color: theme.textOnAccent }}>50/30/20 Budget Planner</h2>
        <p style={{ fontSize: 12.5, color: theme.textSubtle }}>
          Automatically calculates your Needs, Wants, and Savings from real transactions.
        </p>
      </div>

      {/* Cashflow overview card */}
      <div style={{
        background: theme.card, borderRadius: 16, padding: 18, marginBottom: 18,
        border: `1px solid ${theme.borderSoft}`,
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: theme.text }}>Monthly Cashflow Distribution</h3>
        <p style={{ fontSize: 13, color: theme.textSubtle, marginBottom: 12, fontVariantNumeric: 'tabular-nums' }}>
          Income: ₹{totalIncome.toLocaleString()} | Spent: ₹{totalSpent.toLocaleString()} | Saved: ₹{(saved > 0 ? saved : 0).toLocaleString()}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 12.5 }}>
          <LegendDot color={theme.success} label={`Needs (${pct(needsSpent)}%)`} />
          <LegendDot color={theme.warning} label={`Wants (${pct(wantsSpent)}%)`} />
          <LegendDot color={theme.accent} label={`Savings (${pct(saved > 0 ? saved : 0)}%)`} />
        </div>
      </div>

      {/* Rows */}
      {rows.map((row) => {
        const isSafe = row.spent <= row.target
        return (
          <div key={row.label} style={{
            background: theme.card, borderRadius: 16, padding: 16, marginBottom: 12,
            border: `1px solid ${theme.borderSoft}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 14.5, color: theme.text }}>{row.icon} {row.label}</span>
              <span style={{
                fontSize: 10.5, padding: '4px 10px', borderRadius: 20,
                background: isSafe ? `${theme.success}22` : `${theme.danger}22`,
                color: isSafe ? theme.success : theme.danger, fontWeight: 600,
              }}>
                {isSafe ? 'Safe Zone' : 'Over Budget'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: theme.textSubtle, marginBottom: 8 }}>
              <span>Target Allocation: ₹{row.target.toLocaleString()}</span>
              <span>Actual: ₹{row.spent.toLocaleString()}</span>
            </div>
            <div style={{ height: 8, background: theme.borderSoft, borderRadius: 4, marginBottom: 10, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min((row.spent / (row.target || 1)) * 100, 100)}%`,
                background: row.color, borderRadius: 4,
                boxShadow: `0 0 8px ${row.color}99`,
              }} />
            </div>
            <p style={{ fontSize: 11.5, color: theme.textMuted, margin: 0 }}>{row.desc}</p>
          </div>
        )
      })}
    </div>
  )
}

function LegendDot({ color, label }) {
  const { theme } = useTheme()
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
      <span style={{ color: theme.textSubtle }}>{label}</span>
    </span>
  )
        }
