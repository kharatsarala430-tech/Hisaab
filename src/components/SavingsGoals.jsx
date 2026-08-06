import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function SavingsGoals({ userId }) {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [goalName, setGoalName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchGoals = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) console.error('Error fetching goals:', error.message)
    else setGoals(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  const handleCreateGoal = async (e) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase.from('savings_goals').insert({
      user_id: userId,
      goal_name: goalName,
      target_amount: Number(targetAmount),
      current_saved: 0,
      target_date: targetDate || null,
    })

    if (!error) {
      setGoalName(''); setTargetAmount(''); setTargetDate('')
      setShowForm(false)
      fetchGoals()
    } else {
      console.error('Error creating goal:', error.message)
    }
    setSaving(false)
  }

  const handleDeposit = async (goal) => {
    const amountStr = window.prompt(`How much do you want to add to "${goal.goal_name}"?`)
    if (!amountStr) return
    const amount = Number(amountStr)
    if (!amount || amount <= 0) return

    const { error } = await supabase
      .from('savings_goals')
      .update({ current_saved: Number(goal.current_saved) + amount })
      .eq('id', goal.id)

    if (!error) fetchGoals()
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('savings_goals').delete().eq('id', id)
    if (!error) fetchGoals()
  }

  return (
    <div className="module-section">
      <div className="module-hero blue">
        <span className="module-badge">Future Milestones</span>
        <h2>Savings & Wealth Goals</h2>
        <p>Build emergency funds, save for trips, and big buys.</p>
        <button className="hero-btn blue-btn" onClick={() => setShowForm(!showForm)}>
          + Create Goal
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateGoal} className="add-transaction-form">
          <input placeholder="Goal Name (e.g. Emergency Fund)" value={goalName} onChange={(e) => setGoalName(e.target.value)} required />
          <input type="number" placeholder="Target Amount (₹)" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} required min="0" />
          <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          <button type="submit" disabled={saving} className="submit-btn">
            {saving ? 'Creating...' : 'Create Goal'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="loading-text">Loading goals...</p>
      ) : goals.length === 0 ? (
        <p className="empty-state">No savings goals yet. Create your first one above!</p>
      ) : (
        goals.map((goal) => {
          const pct = Math.min(Math.round((goal.current_saved / goal.target_amount) * 100), 100)
          return (
            <div key={goal.id} className="goal-card">
              <div className="goal-header">
                <div>
                  <h3>{goal.goal_name}</h3>
                  {goal.target_date && <p className="sub-label">Target Date: {goal.target_date}</p>}
                </div>
                <button className="delete-btn" onClick={() => handleDelete(goal.id)}>🗑</button>
              </div>
              <div className="goal-progress-row">
                <span>Saved Progress</span>
                <span className="blue-text">{pct}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${pct}%`, background: '#22d3ee' }} />
              </div>
              <div className="budget-row-numbers">
                <span>Current: ₹{Number(goal.current_saved).toLocaleString()}</span>
                <span>Target: ₹{Number(goal.target_amount).toLocaleString()}</span>
              </div>
              <button className="deposit-btn" onClick={() => handleDeposit(goal)}>
                + Add Savings Deposit
              </button>
            </div>
          )
        })
      )}
    </div>
  )
}
