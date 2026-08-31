import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../lib/categories'
import { useTheme } from '../ThemeContext'
import { useLanguage } from '../LanguageContext'
import { makeLocalId, enqueue } from '../lib/offlineStore'
import { drainQueue } from '../lib/syncManager'

const CATEGORIES = {
  income: INCOME_CATEGORIES,
  expense: EXPENSE_CATEGORIES.map((c) => c.name),
}

export default function AddTransaction({ userId, onTransactionAdded }) {
  const { theme } = useTheme()
  const { t } = useLanguage()
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(CATEGORIES.expense[0])
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)

  const inputStyle = {
    width: '100%',
    padding: '13px 14px',
    marginBottom: 12,
    background: theme.card,
    border: `1px solid ${theme.borderSoft}`,
    borderRadius: 12,
    color: theme.text,
    fontSize: 14.5,
    outline: 'none',
  }

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
    const payload = {
      user_id: userId,
      type,
      amount: Number(amount),
      category,
      note,
      date,
      is_recurring: isRecurring,
      recurring_day: recurringDay,
    }

    // Queues this transaction locally with a temporary id, so the UI can
    // show it right away and it'll sync automatically once connectivity
    // is actually back — used both for the "known offline" case and as a
    // fallback below when the online path unexpectedly fails.
    const queueOffline = async () => {
      const localId = makeLocalId()
      await enqueue({ action: 'add', localId, payload: { ...payload, _localId: localId } })
    }

    if (navigator.onLine) {
      // Online path — but navigator.onLine can briefly report true right
      // after connectivity actually drops (stale browser state), so if the
      // real network call fails, fall back to the offline queue instead of
      // losing the transaction.
      try {
        const { error } = await supabase.from('transactions').insert(payload)
        if (error) throw error
      } catch (err) {
        console.error('Online insert failed, queuing for later sync:', err.message)
        await queueOffline()
      }
    } else {
      // Offline path — known offline, queue directly.
      await queueOffline()
    }

    setAmount('')
    setNote('')
    setIsRecurring(false)
    onTransactionAdded() // refresh the list in Dashboard (reads local cache + live data)

    if (navigator.onLine) {
      drainQueue() // in case older items were still waiting from a previous offline spell
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{
      background: theme.card, borderRadius: 16, padding: 18, marginBottom: 22,
      border: `1px solid ${theme.border}`,
    }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button
          type="button"
          onClick={() => handleTypeChange('expense')}
          style={{
            flex: 1, padding: '11px', borderRadius: 12, border: 'none',
            fontSize: 14, fontWeight: 600,
            background: type === 'expense' ? theme.danger : theme.borderSoft,
            color: type === 'expense' ? theme.dangerBg : theme.textSubtle,
          }}
        >
          {t('addTransaction.expense')}
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('income')}
          style={{
            flex: 1, padding: '11px', borderRadius: 12, border: 'none',
            fontSize: 14, fontWeight: 600,
            background: type === 'income' ? theme.success : theme.borderSoft,
            color: type === 'income' ? theme.successBg : theme.textSubtle,
          }}
        >
          {t('addTransaction.income')}
        </button>
      </div>

      <input
        type="number"
        placeholder={t('addTransaction.amountPlaceholder')}
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
        marginBottom: 12, color: theme.textSubtle, fontSize: 14, cursor: 'pointer',
      }}>
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          style={{ width: 18, height: 18, accentColor: type === 'income' ? theme.success : theme.danger }}
        />
        {t('addTransaction.repeatMonthly')}
      </label>

      <input
        type="text"
        placeholder={t('addTransaction.notePlaceholder')}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{ ...inputStyle, marginBottom: 16 }}
      />

      <button type="submit" disabled={saving} style={{
        width: '100%', padding: '14px', borderRadius: 14, border: 'none',
        background: theme.accent, color: theme.bg, fontWeight: 700, fontSize: 14.5,
        boxShadow: saving ? 'none' : `0 0 24px ${theme.accentBg}`,
        opacity: saving ? 0.6 : 1,
      }}>
        {saving ? t('addTransaction.adding') : t('addTransaction.submit')}
      </button>
    </form>
  )
      }
