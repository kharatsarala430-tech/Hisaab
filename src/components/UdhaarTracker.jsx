import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { scheduleUdhaarReminders, cancelUdhaarReminders } from '../utils/udhaarNotifications'
import { useTheme } from '../ThemeContext'

/**
 * Hisaab — Udhaar / Khata Tracker
 * ---------------------------------------------------
 * Save as: src/components/UdhaarTracker.jsx
 * Requires: udhaar_entries table (run udhaar_setup.sql in Supabase first)
 *
 * Usage in Dashboard.jsx:
 *   {activeTab === 'udhaar' && <UdhaarTracker userId={session.user.id} />}
 */

export default function UdhaarTracker({ userId }) {
  const { theme } = useTheme()
  const inputStyle = {
    width: '100%', padding: '11px 12px', marginBottom: 10,
    background: theme.bg, border: `1px solid ${theme.borderSoft}`,
    borderRadius: 8, color: theme.text, fontSize: 14, outline: 'none',
  }

  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedPerson, setExpandedPerson] = useState(null)

  // Add-entry form state
  const [showForm, setShowForm] = useState(false)
  const [personName, setPersonName] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('lent') // 'lent' = maine diya, 'borrowed' = maine liya
  const [note, setNote] = useState('')
  const [reason, setReason] = useState('')
  const [expectedReturnDate, setExpectedReturnDate] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchEntries = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('udhaar_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })

    if (error) {
      console.error('Error fetching udhaar entries:', error.message)
    } else {
      setEntries(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  // Group entries by person, compute net balance.
  // Positive balance = they owe you. Negative = you owe them.
  const grouped = {}
  for (const e of entries) {
    if (!grouped[e.person_name]) {
      grouped[e.person_name] = { entries: [], balance: 0 }
    }
    grouped[e.person_name].entries.push(e)
    grouped[e.person_name].balance += e.type === 'lent' ? Number(e.amount) : -Number(e.amount)
  }
  const people = Object.keys(grouped).sort()

  const handleAddEntry = async (e) => {
    e.preventDefault()
    if (!personName.trim() || !amount || Number(amount) <= 0) return

    setSaving(true)
    const { data, error } = await supabase.from('udhaar_entries').insert({
      user_id: userId,
      person_name: personName.trim(),
      amount: Number(amount),
      type,
      note: note.trim() || null,
      reason: reason.trim() || null,
      entry_date: new Date().toISOString().slice(0, 10),
      expected_return_date: expectedReturnDate || null,
    }).select().single()

    if (error) {
      console.error('Error adding udhaar entry:', error.message)
      alert('Entry save nahi hui. Dobara try karo.')
    } else {
      if (data.expected_return_date) {
        scheduleUdhaarReminders(data)
      }
      setPersonName('')
      setAmount('')
      setNote('')
      setReason('')
      setExpectedReturnDate('')
      setType('lent')
      setShowForm(false)
      fetchEntries()
    }
    setSaving(false)
  }

  const handleDeleteEntry = async (id) => {
    await cancelUdhaarReminders(id)
    const { error } = await supabase.from('udhaar_entries').delete().eq('id', id)
    if (error) {
      console.error('Error deleting entry:', error.message)
    } else {
      fetchEntries()
    }
  }

  // Settle: adds a closing entry that zeroes out the current balance for that person.
  const handleSettle = async (person, currentBalance) => {
    if (currentBalance === 0) return
    const settleType = currentBalance > 0 ? 'borrowed' : 'lent' // reverse of the net direction
    const { error } = await supabase.from('udhaar_entries').insert({
      user_id: userId,
      person_name: person,
      amount: Math.abs(currentBalance),
      type: settleType,
      note: 'Settled',
      entry_date: new Date().toISOString().slice(0, 10),
    })
    if (error) {
      console.error('Error settling:', error.message)
    } else {
      fetchEntries()
    }
  }

  if (loading) {
    return <p style={{ color: theme.textMuted, fontSize: 13, padding: '20px 0' }}>Loading...</p>
  }

  return (
    <div style={{ paddingBottom: 20 }}>
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          width: '100%', padding: '12px', borderRadius: 12, marginBottom: 16,
          background: showForm ? 'transparent' : theme.accent,
          color: showForm ? theme.accent : theme.bg,
          border: `1px solid ${theme.accent}`, fontSize: 14, fontWeight: 600,
        }}
      >
        {showForm ? 'Cancel' : '+ Naya Udhaar Entry'}
      </button>

      {showForm && (
        <form onSubmit={handleAddEntry} style={{
          background: theme.card, border: `1px solid ${theme.border}`,
          borderRadius: 12, padding: 14, marginBottom: 16,
        }}>
          <input
            type="text" placeholder="Naam (e.g. Ravi)" value={personName}
            onChange={(e) => setPersonName(e.target.value)} required
            style={inputStyle}
          />
          <input
            type="number" placeholder="Amount (₹)" value={amount}
            onChange={(e) => setAmount(e.target.value)} required min="1"
            style={inputStyle}
          />

          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button type="button" onClick={() => setType('lent')} style={{
              flex: 1, padding: 10, borderRadius: 8, fontSize: 13,
              background: type === 'lent' ? theme.accent : 'transparent',
              color: type === 'lent' ? theme.bg : theme.textSubtle,
              border: `1px solid ${theme.borderSoft}`,
            }}>
              Maine Diya
            </button>
            <button type="button" onClick={() => setType('borrowed')} style={{
              flex: 1, padding: 10, borderRadius: 8, fontSize: 13,
              background: type === 'borrowed' ? theme.accent : 'transparent',
              color: type === 'borrowed' ? theme.bg : theme.textSubtle,
              border: `1px solid ${theme.borderSoft}`,
            }}>
              Maine Liya
            </button>
          </div>

          <input
            type="text" placeholder="Note (optional)" value={note}
            onChange={(e) => setNote(e.target.value)}
            style={inputStyle}
          />

          <input
            type="text" placeholder="Kis liye? (e.g. Medical emergency)" value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={inputStyle}
          />

          <label style={{ fontSize: 12, color: theme.textMuted, display: 'block', marginBottom: 4 }}>
            Kab tak lautana/lena hai? (optional — reminder milega)
          </label>
          <input
            type="date" value={expectedReturnDate}
            onChange={(e) => setExpectedReturnDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            style={{ ...inputStyle, marginBottom: 12 }}
          />

          <button type="submit" disabled={saving} style={{
            width: '100%', padding: 11, borderRadius: 10,
            background: theme.accent, color: theme.bg, fontSize: 14, fontWeight: 600,
            border: 'none', opacity: saving ? 0.6 : 1,
          }}>
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </form>
      )}

      {people.length === 0 && (
        <p style={{ color: theme.textMuted, fontSize: 13, textAlign: 'center', padding: '30px 0' }}>
          Koi udhaar entry nahi hai abhi. Upar button se add karo.
        </p>
      )}

      {people.map((person) => {
        const { entries: personEntries, balance } = grouped[person]
        const isExpanded = expandedPerson === person
        const balanceColor = balance > 0 ? theme.success : balance < 0 ? theme.danger : theme.textMuted
        const balanceText = balance > 0
          ? `${person} ko ₹${balance.toFixed(0)} lene hain`
          : balance < 0
            ? `${person} ko ₹${Math.abs(balance).toFixed(0)} dene hain`
            : 'Settled ✓'

        return (
          <div key={person} style={{
            background: theme.card, border: `1px solid ${theme.borderSoft}`,
            borderRadius: 12, marginBottom: 10, overflow: 'hidden',
          }}>
            <button
              onClick={() => setExpandedPerson(isExpanded ? null : person)}
              style={{
                width: '100%', padding: '14px 16px', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center',
                background: 'transparent', border: 'none', textAlign: 'left',
              }}
            >
              <span style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}>{person}</span>
              <span style={{ color: balanceColor, fontSize: 13, fontWeight: 600 }}>{balanceText}</span>
            </button>

            {isExpanded && (
              <div style={{ padding: '0 16px 14px' }}>
                {personEntries.map((e) => (
                  <div key={e.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderTop: `1px solid ${theme.borderSoft}`,
                    fontSize: 12.5,
                  }}>
                    <div>
                      <span style={{ color: e.type === 'lent' ? theme.success : theme.danger }}>
                        {e.type === 'lent' ? 'Diya' : 'Liya'} ₹{e.amount}
                      </span>
                      <span style={{ color: theme.textMuted, marginLeft: 8 }}>{e.entry_date}</span>
                      {e.reason && <div style={{ color: theme.textSubtle, marginTop: 2 }}>📝 {e.reason}</div>}
                      {e.note && <div style={{ color: theme.textMuted, marginTop: 2 }}>{e.note}</div>}
                      {e.expected_return_date && (
                        <div style={{ color: theme.accent, marginTop: 2, fontSize: 11.5 }}>
                          ⏰ Wapas: {e.expected_return_date}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteEntry(e.id)}
                      style={{ background: 'transparent', border: 'none', color: theme.textMuted, fontSize: 16 }}
                    >
                      ×
                    </button>
                  </div>
                ))}

                {balance !== 0 && (
                  <button
                    onClick={() => handleSettle(person, balance)}
                    style={{
                      width: '100%', marginTop: 10, padding: 9, borderRadius: 8,
                      background: 'transparent', border: `1px solid ${theme.accent}`,
                      color: theme.accent, fontSize: 12.5, fontWeight: 600,
                    }}
                  >
                    ✓ Mark as Settled
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
            }
