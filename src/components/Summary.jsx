import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

// Neon palette matching the confirmed design
const NEON_BLUE = '#3DA9FF'
const NEON_GREEN = '#39FF94'
const NEON_CYAN = '#00E5FF'
const NEON_RED = '#FF3D6E'

// One distinct neon color per category slice (falls back to grey for unlisted ones)
const CATEGORY_COLORS = {
  Rent: NEON_BLUE,
  Groceries: NEON_GREEN,
  Bills: '#FFD23D',
  Healthcare: NEON_RED,
  'Loan/EMI': '#A78BFA',
  Food: '#FF9F3D',
  Shopping: NEON_CYAN,
  Entertainment: '#FF3DE0',
  Travel: '#8C7BFF',
  Other: '#7A7A7A',
}

export default function Summary({ transactions }) {
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
          background: '#0D0D0D', borderRadius: 14, padding: '14px 10px', textAlign: 'center',
          border: '1px solid rgba(61,169,255,0.25)',
        }}>
          <div style={{ fontSize: 11, color: '#7A7A7A', marginBottom: 6 }}>Balance</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: NEON_BLUE, fontVariantNumeric: 'tabular-nums' }}>
            ₹{balance.toFixed(2)}
          </div>
        </div>
        <div style={{
          background: '#0D0D0D', borderRadius: 14, padding: '14px 10px', textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ fontSize: 11, color: '#7A7A7A', marginBottom: 6 }}>Income</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: NEON_GREEN, fontVariantNumeric: 'tabular-nums' }}>
            ₹{totalIncome.toFixed(2)}
          </div>
        </div>
        <div style={{
          background: '#0D0D0D', borderRadius: 14, padding: '14px 10px', textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ fontSize: 11, color: '#7A7A7A', marginBottom: 6 }}>Expenses</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: NEON_RED, fontVariantNumeric: 'tabular-nums' }}>
            ₹{totalExpense.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Pie chart — labels live in a legend list below, never on the chart itself.
          This is the fix for the old overlapping-label problem. */}
      {chartData.length > 0 && (
        <div style={{
          background: '#0D0D0D', borderRadius: 16, padding: '18px 14px',
          border: '1px solid rgba(255,255,255,0.08)', marginBottom: 22,
        }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: '#7A7A7A', letterSpacing: '0.04em',
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
                  stroke="#0D0D0D"
                  strokeWidth={2}
                  // No `label` prop here on purpose — on-chart labels are what caused
                  // the old overlap. The legend below does that job cleanly instead.
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={CATEGORY_COLORS[entry.name] || '#7A7A7A'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                  contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: '#EAEAEA' }}
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
                  background: CATEGORY_COLORS[name] || '#7A7A7A', flexShrink: 0,
                }} />
                <span style={{ color: '#B8B8B8' }}>{name}</span>
                <span style={{ color: '#7A7A7A', fontVariantNumeric: 'tabular-nums' }}>
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
