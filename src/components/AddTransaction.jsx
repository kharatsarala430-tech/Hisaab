import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../lib/categories'

const CATEGORIES = {
  income: INCOME_CATEGORIES,
  expense: EXPENSE_CATEGORIES.map((c) => c.name),
}

const NEON_BLUE = '#3DA9FF'
const NEON_RED = '#FF3D6E'
const NEON_GREEN = '#39FF94'

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

export default function AddTransaction({ userId, onTransactionAdded }) {
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(CATEGORIES.expense[0])
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)

  const handleTypeChange = (newType) => {
    setType(newType)
    setCategory(CATEGORIES[newType][0]) // reset category when switching type
    setIsRecurring(false) // reset recurring toggle on any type switch — keeps behaviour predictable
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return

    setSaving(true)

    const recurringDay = isRecurring ? new Date(date).getDate() : null

    const { error } = await supabase.from('transactions').insert({
      user_id: userId,
      type,
      amount: Number(amount),
      category,
      note,
      date,
      is_recurring: isRecurring,
      recurring_day: recurringDay,
    })

    if (error) {
      console.error('Error adding transaction:', error.message)
      alert('DEBUG ERROR: ' + error.message) // TEMPORARY — remove after debugging
    } else {
      setAmount('')
      setNote('')
      setIsRecurring(false)
      onTransactionAdded() // refresh the list in Dashboard
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{
      background: '#0D0D0D', borderRadius: 16, padding: 18, marginBottom: 22,
      border: '1px solid rgba(61,169,255,0.2)',
    }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button
          type="button"
          onClick={() => handleTypeChange('expense')}
          style={{
            flex: 1, padding: '11px', borderRadius: 12, border: 'none',
            fontSize: 14, fontWeight: 600,
            background: type === 'expense' ? NEON_RED : 'rgba(255,255,255,0.06)',
            color: type === 'expense' ? '#1A0508' : '#B8B8B8',
          }}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('income')}
          style={{
            flex: 1, padding: '11px', borderRadius: 12, border: 'none',
            fontSize: 14, fontWeight: 600,
            background: type === 'income' ? NEON_GREEN : 'rgba(255,255,255,0.06)',
            color: type === 'income' ? '#052014' : '#B8B8B8',
          }}
        >
          Income
        </button>
      </div>

      <input
        type="number"
        placeholder="Amount (₹)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        min="0"
        step="0.01"
        style={inputStyle}
      />

      <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
        {CATEGORIES[type].map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        style={inputStyle}
      />

      <label style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 12, color: '#B8B8B8', fontSize: 14, cursor: 'pointer',
      }}>
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          style={{ width: 18, height: 18, accentColor: type === 'income' ? NEON_GREEN : NEON_RED }}
        />
        🔁 Repeat every month
      </label>

      <input
        type="text"
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{ ...inputStyle, marginBottom: 16 }}
      />

      <button type="submit" disabled={saving} style={{
        width: '100%', padding: '14px', borderRadius: 14, border: 'none',
        background: NEON_BLUE, color: '#050505', fontWeight: 700, fontSize: 14.5,
        boxShadow: saving ? 'none' : '0 0 24px rgba(61,169,255,0.4)',
        opacity: saving ? 0.6 : 1,
      }}>
        {saving ? 'Adding...' : 'Add Transaction'}
      </button>
    </form>
  )
}
