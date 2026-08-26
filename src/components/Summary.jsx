import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useTheme } from '../ThemeContext'

export default function Summary({ transactions }) {
  const { theme } = useTheme()

  // Category colors now come from theme.chart (7-color rotating palette) so
  // they stay readable in both dark and light mode. Same category always
  // gets the same color because we hash the name to a stable index.
  const getCategoryColor = (name) => {
    const idx = Math.abs(hashString(name)) % theme.chart.length
    return theme.chart[idx]
  }

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const balance = totalIncome - totalExpense

  // Group expenses by category for the pie chart
  const categoryTotals = {}
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount)
    })

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }))

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
        <div style={{
          background: theme.card, borderRadius: 14, padding: '14px 8px', textAlign: 'center',
          border: `1px solid ${theme.border}`, minWidth: 0,
        }}>
          <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 6 }}>Balance</div>
          <div style={{
            fontSize: 'clamp(12px, 3.6vw, 16px)', fontWeight: 700, color: theme.accent,
            fontVariantNumeric: 'tabular-nums', wordBreak: 'break-all', lineHeight: 1.2,
          }}>
            ₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div style={{
          background: theme.card, borderRadius: 14, padding: '14px 8px', textAlign: 'center',
          border: `1px solid ${theme.borderSoft}`, minWidth: 0,
        }}>
          <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 6 }}>Income</div>
          <div style={{
            fontSize: 'clamp(12px, 3.6vw, 16px)', fontWeight: 700, color: theme.success,
            fontVariantNumeric: 'tabular-nums', wordBreak: 'break-all', lineHeight: 1.2,
          }}>
            ₹{totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div style={{
          background: theme.card, borderRadius: 14, padding: '14px 8px', textAlign: 'center',
          border: `1px solid ${theme.borderSoft}`, minWidth: 0,
        }}>
          <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 6 }}>Expenses</div>
          <div style={{
            fontSize: 'clamp(12px, 3.6vw, 16px)', fontWeight: 700, color: theme.danger,
            fontVariantNumeric: 'tabular-nums', wordBreak: 'break-all', lineHeight: 1.2,
          }}>
            ₹{totalExpense.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Pie chart — labels live in a legend list below, never on the chart itself.
          This is the fix for the old overlapping-label problem. */}
      {chartData.length > 0 && (
        <div style={{
          background: theme.card, borderRadius: 16, padding: '18px 14px',
          border: `1px solid ${theme.borderSoft}`, marginBottom: 22,
        }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: theme.textMuted, letterSpacing: '0.04em',
            textTransform: 'uppercase', marginBottom: 12,
          }}>
            Spending by Category
          </div>

          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  stroke={theme.card}
                  strokeWidth={2}
                  // No `label` prop here on purpose — on-chart labels are what caused
                  // the old overlap. The legend below does that job cleanly instead.
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={getCategoryColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                  contentStyle={{ background: theme.bgElevated, border: `1px solid ${theme.border}`, borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: theme.text }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend as a wrapping list — scales to any number of categories without collision */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 10, justifyContent: 'center' }}>
            {chartData.map(({ name, value }) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: getCategoryColor(name), flexShrink: 0,
                }} />
                <span style={{ color: theme.textSubtle }}>{name}</span>
                <span style={{ color: theme.textMuted, fontVariantNumeric: 'tabular-nums' }}>
                  ₹{Number(value).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Simple stable string hash so the same category name always maps to the
// same chart color, without needing a fixed category list.
function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash
                }
