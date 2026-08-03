import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

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
    <div className="summary">
      <div className="summary-cards">
        <div className="summary-card balance">
          <span className="label">Balance</span>
          <span className="value">₹{balance.toFixed(2)}</span>
        </div>
        <div className="summary-card income">
          <span className="label">Income</span>
          <span className="value">₹{totalIncome.toFixed(2)}</span>
        </div>
        <div className="summary-card expense">
          <span className="label">Expenses</span>
          <span className="value">₹{totalExpense.toFixed(2)}</span>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="chart-container">
          <h3>Spending by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => entry.name}
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
