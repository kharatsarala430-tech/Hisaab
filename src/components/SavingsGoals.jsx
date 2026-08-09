import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const NEON_CYAN = '#00E5FF'

const inputStyle = {
  width: '100%',
  padding: '13px 14px',
  marginBottom: 12,
  background: '#0D0D0D',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  color: '#EAEAEA',
  fontSize: 14.5,
  outline: 'none',
}

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
    <div>
      {/* Hero card */}
      <div style={{
        background: '#0D0D0D', borderRadius: 20, padding: '22px', marginBottom: 18,
        border: '1px solid rgba(0,229,255,0.3)',
        boxShadow: '0 0 40px rgba(0,229,255,0.08)',
      }}>
        <span style={{
          fontSize: 11, background: 'rgba(0,229,255,0.12)', padding: '4px 10px',
          borderRadius: 20, color: '#8FEFFF',
        }}>Future Milestones</span>
        <h2 style={{ fontSize: 22, fontWeight: 600, margin: '10px 0 4px', color: '#F5F5F5' }}>Savings & Wealth Goals</h2>
        <p style={{ fontSize: 12.5, color: '#9A9A9A', marginBottom: 16 }}>
          Build emergency funds, save for trips, and big buys.
        </p>
        <button onClick={() => setShowForm(!showForm)} style={{
          width: '100%', padding: 12, borderRadius: 12, border: 'none',
          background: NEON_CYAN, color: '#00252B', fontWeight: 700, fontSize: 13.5,
          boxShadow: '0 0 20px rgba(0,229,255,0.4)',
        }}>
          + Create Goal
        </button>
      </div>

      {/* Create goal form */}
      {showForm && (
        <form onSubmit={handleCreateGoal} style={{
          background: '#0D0D0D', borderRadius: 16, padding: 18, marginBottom: 18,
          border: '1px solid rgba(0,229,255,0.2)',
        }}>
          <input placeholder="Goal Name (e.g. Emergency Fund)" value={goalName} onChange={(e) => setGoalName(e.target.value)} required style={inputStyle} />
          <input type="number" placeholder="Target Amount (₹)" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} required min="0" style={inputStyle} />
          <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }} />
          <button type="submit" disabled={saving} style={{
            width: '100%', padding: '14px', borderRadius: 14, border: 'none',
            background: NEON_CYAN, color: '#00252B', fontWeight: 700, fontSize: 14.5,
            opacity: saving ? 0.6 : 1,
          }}>
            {saving ? 'Creating...' : 'Create Goal'}
          </button>
        </form>
      )}

      {/* Goals list */}
      {loading ? (
        <p style={{ color: '#7A7A7A', fontSize: 13.5, textAlign: 'center', padding: 20 }}>Loading goals...</p>
      ) : goals.length === 0 ? (
        <p style={{ color: '#7A7A7A', fontSize: 13.5, textAlign: 'center', padding: 20 }}>
          No savings goals yet. Create your first one above!
        </p>
      ) : (
        goals.map((goal) => {
          const pct = Math.min(Math.round((goal.current_saved / goal.target_amount) * 100), 100)
          return (
            <div key={goal.id} style={{
              background: '#0D0D0D', borderRadius: 16, padding: 18, marginBottom: 12,
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>{goal.goal_name}</h3>
                  {goal.target_date && (
                    <p style={{ fontSize: 12, color: '#7A7A7A', margin: '3px 0 0' }}>Target Date: {goal.target_date}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(goal.id)}
                  style={{
                    width: 26, height: 26, borderRadius: 8, border: 'none',
                    background: 'rgba(255,255,255,0.06)', color: '#7A7A7A', fontSize: 13, cursor: 'pointer',
                  }}
                >
                  🗑
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: '#B8B8B8' }}>Saved Progress</span>
                <span style={{ color: NEON_CYAN, fontWeight: 600 }}>{pct}%</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: 12, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct}%`, background: NEON_CYAN, borderRadius: 4,
                  boxShadow: '0 0 8px rgba(0,229,255,0.6)',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9A9A9A', marginBottom: 16, fontVariantNumeric: 'tabular-nums' }}>
                <span>Current: ₹{Number(goal.current_saved).toLocaleString()}</span>
                <span>Target: ₹{Number(goal.target_amount).toLocaleString()}</span>
              </div>
              <button onClick={() => handleDeposit(goal)} style={{
                width: '100%', padding: 11, borderRadius: 12, background: 'transparent',
                border: `1px solid ${NEON_CYAN}`, color: NEON_CYAN, fontSize: 13, fontWeight: 600,
              }}>
                + Add Savings Deposit
              </button>
            </div>
          )
        })
      )}
    </div>
  )
          }
