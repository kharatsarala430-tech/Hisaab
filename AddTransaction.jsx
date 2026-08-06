import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../lib/categories'

const CATEGORIES = {
  income: INCOME_CATEGORIES,
  expense: EXPENSE_CATEGORIES.map((c) => c.name),
}

export default function AddTransaction({ userId, onTransactionAdded }) {
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(CATEGORIES.expense[0])
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)

  const handleTypeChange = (newType) => {
    setType(newType)
    setCategory(CATEGORIES[newType][0]) // reset category when switching type
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return

    setSaving(true)
    const { error } = await supabase.from('transactions').insert({
      user_id: userId,
      type,
      amount: Number(amount),
      category,
      note,
      date,
    })

    if (error) {
      console.error('Error adding transaction:', error.message)
    } else {
      setAmount('')
      setNote('')
      onTransactionAdded() // refresh the list in Dashboard
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="add-transaction-form">
      <div className="type-toggle">
        <button
          type="button"
          className={type === 'expense' ? 'active expense' : ''}
          onClick={() => handleTypeChange('expense')}
        >
          Expense
        </button>
        <button
          type="button"
          className={type === 'income' ? 'active income' : ''}
          onClick={() => handleTypeChange('income')}
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
      />

      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        {CATEGORIES[type].map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <button type="submit" disabled={saving} className="submit-btn">
        {saving ? 'Adding...' : 'Add Transaction'}
      </button>
    </form>
  )
}
