import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { scheduleBillReminder, cancelBillReminder } from '../lib/notifications'
import { scheduleEmiReminders, cancelEmiReminders } from '../utils/emiNotifications'
import { useTheme } from '../ThemeContext'

const LOAN_TYPES = ['Gadget Loan', 'Home Loan', 'Auto Loan', 'Personal Loan', 'Education Loan', 'Other']
const BILL_CATEGORIES = ['Subscription', 'Utility', 'Insurance', 'Rent', 'Other']
const RECURRENCE_OPTIONS = ['monthly', 'yearly', 'one-time']

export default function EmiManager({ userId }) {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState('emis') // 'emis' | 'bills'

  return (
    <div>
      {/* Toggle */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 18, background: theme.card,
        padding: 5, borderRadius: 14, border: `1px solid ${theme.borderSoft}`,
      }}>
        <button
          onClick={() => setActiveTab('emis')}
          style={{
            flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: activeTab === 'emis' ? theme.purple : 'transparent',
            color: activeTab === 'emis' ? theme.bg : theme.textSubtle,
            fontWeight: 700, fontSize: 13.5,
          }}
        >
          EMIs
        </button>
        <button
          onClick={() => setActiveTab('bills')}
          style={{
            flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: activeTab === 'bills' ? theme.purple : 'transparent',
            color: activeTab === 'bills' ? theme.bg : theme.textSubtle,
            fontWeight: 700, fontSize: 13.5,
          }}
        >
          Bills
        </button>
      </div>

      {activeTab === 'emis' ? <EmiSection userId={userId} /> : <BillsSection userId={userId} />}
    </div>
  )
}

/* ============ EMI SECTION (unchanged logic, just extracted) ============ */
function EmiSection({ userId }) {
  const { theme } = useTheme()
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

  const [emis, setEmis] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [loanName, setLoanName] = useState('')
  const [lender, setLender] = useState('')
  const [loanType, setLoanType] = useState(LOAN_TYPES[0])
  const [principal, setPrincipal] = useState('')
  const [installment, setInstallment] = useState('')
  const [dueDay, setDueDay] = useState('1')
  const [totalInstallments, setTotalInstallments] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchEmis = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('emis')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) console.error('Error fetching EMIs:', error.message)
    else setEmis(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchEmis()
  }, [])

  const handleAddEmi = async (e) => {
    e.preventDefault()
    setSaving(true)

    const { data, error } = await supabase.from('emis').insert({
      user_id: userId,
      loan_name: loanName,
      lender,
      loan_type: loanType,
      principal_amount: Number(principal),
      monthly_installment: Number(installment),
      due_day: Number(dueDay),
      total_installments: Number(totalInstallments),
      installments_paid: 0,
    }).select().single()

    if (error) {
      console.error('Error adding EMI:', error.message)
    } else {
      // Schedule the monthly due-day reminders for this EMI
      try {
        await scheduleEmiReminders(data)
      } catch (notifErr) {
        console.error('Error scheduling EMI reminder:', notifErr.message)
      }
      setLoanName(''); setLender(''); setPrincipal(''); setInstallment(''); setTotalInstallments('')
      setShowForm(false)
      fetchEmis()
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('emis').delete().eq('id', id)
    if (!error) {
      // Cancel the recurring reminders so they don't keep firing for a deleted EMI
      try {
        await cancelEmiReminders(id)
      } catch (notifErr) {
        console.error('Error cancelling EMI reminder:', notifErr.message)
      }
      fetchEmis()
    }
  }

  const monthlyCommitment = emis.reduce((sum, e) => sum + Number(e.monthly_installment), 0)
  const totalPrincipal = emis.reduce((sum, e) => sum + Number(e.principal_amount), 0)
  const remainingLiability = emis.reduce((sum, e) => {
    const remainingInstallments = Math.max(0, e.total_installments - e.installments_paid)
    return sum + remainingInstallments * Number(e.monthly_installment)
  }, 0)
  const completedLoans = emis.filter((e) => e.installments_paid >= e.total_installments).length

  return (
    <div>
      {/* Hero card */}
      <div style={{
        background: theme.card, borderRadius: 20, padding: '22px', marginBottom: 18,
        border: `1px solid ${theme.purple}4D`,
        boxShadow: `0 0 40px ${theme.purple}14`,
      }}>
        <span style={{
          fontSize: 11, background: `${theme.purple}24`, padding: '4px 10px',
          borderRadius: 20, color: theme.purple,
        }}>Debt & Loan Portfolio</span>
        <h2 style={{ fontSize: 24, fontWeight: 600, margin: '10px 0 4px', color: theme.textOnAccent }}>EMI Manager</h2>
        <p style={{ fontSize: 12.5, color: theme.textSubtle, marginBottom: 16 }}>
          Track auto loans, gadgets & credit card EMIs with due reminders.
        </p>
        <button onClick={() => setShowForm(!showForm)} style={{
          width: '100%', padding: 12, borderRadius: 12, border: 'none',
          background: theme.purple, color: theme.bg, fontWeight: 700, fontSize: 13.5,
          boxShadow: `0 0 20px ${theme.purple}66`,
        }}>
          + Add New EMI
        </button>
      </div>

      {/* Add EMI form */}
      {showForm && (
        <form onSubmit={handleAddEmi} style={{
          background: theme.card, borderRadius: 16, padding: 18, marginBottom: 18,
          border: `1px solid ${theme.purple}33`,
        }}>
          <input placeholder="Loan Name (e.g. Laptop)" value={loanName} onChange={(e) => setLoanName(e.target.value)} required style={inputStyle} />
          <input placeholder="Lender (e.g. Bajaj)" value={lender} onChange={(e) => setLender(e.target.value)} style={inputStyle} />
          <select value={loanType} onChange={(e) => setLoanType(e.target.value)} style={inputStyle}>
            {LOAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="number" placeholder="Total Principal (₹)" value={principal} onChange={(e) => setPrincipal(e.target.value)} required min="0" style={inputStyle} />
          <input type="number" placeholder="Monthly Installment (₹)" value={installment} onChange={(e) => setInstallment(e.target.value)} required min="0" style={inputStyle} />
          <input type="number" placeholder="Due Day of Month (1-31)" value={dueDay} onChange={(e) => setDueDay(e.target.value)} required min="1" max="31" style={inputStyle} />
          <input type="number" placeholder="Total Number of Installments" value={totalInstallments} onChange={(e) => setTotalInstallments(e.target.value)} required min="1" style={{ ...inputStyle, marginBottom: 16 }} />
          <button type="submit" disabled={saving} style={{
            width: '100%', padding: '14px', borderRadius: 14, border: 'none',
            background: theme.purple, color: theme.bg, fontWeight: 700, fontSize: 14.5,
            opacity: saving ? 0.6 : 1,
          }}>
            {saving ? 'Saving...' : 'Save EMI'}
          </button>
        </form>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
        <StatCard label="Monthly EMI Commitment" value={`₹${monthlyCommitment.toLocaleString()}`} sub={`${emis.length} Active Loans`} accent={theme.purple} />
        <StatCard label="Remaining Liability" value={`₹${remainingLiability.toLocaleString()}`} sub="Total Outstanding" accent={theme.danger} />
        <StatCard label="Total Principal Financed" value={`₹${totalPrincipal.toLocaleString()}`} sub="Original Borrowed" accent={theme.textOnAccent} />
        <StatCard label="Completed Loans" value={`${completedLoans} Loans`} sub="Fully Repaid" accent={theme.success} />
      </div>

      {/* EMI list */}
      {loading ? (
        <p style={{ color: theme.textMuted, fontSize: 13.5, textAlign: 'center', padding: 20 }}>Loading EMIs...</p>
      ) : emis.length === 0 ? (
        <p style={{ color: theme.textMuted, fontSize: 13.5, textAlign: 'center', padding: 20 }}>No EMIs added yet.</p>
      ) : (
        emis.map((emi) => {
          const remaining = Math.max(0, emi.total_installments - emi.installments_paid)
          const remainingBalance = remaining * Number(emi.monthly_installment)
          const progressPct = Math.min(100, Math.round((emi.installments_paid / emi.total_installments) * 100))
          return (
            <div key={emi.id} style={{
              background: theme.card, borderRadius: 16, padding: 18, marginBottom: 12,
              border: `1px solid ${theme.borderSoft}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Tag color={theme.purple}>{emi.loan_type}</Tag>
                <Tag color={theme.textSubtle}>Due on {emi.due_day}th</Tag>
                <button
                  onClick={() => handleDelete(emi.id)}
                  style={{
                    marginLeft: 'auto', width: 26, height: 26, borderRadius: 8, border: 'none',
                    background: theme.borderSoft, color: theme.textMuted, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  🗑
                </button>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: theme.text }}>{emi.loan_name}</h3>
              <p style={{ fontSize: 12.5, color: theme.textMuted, margin: '2px 0 12px' }}>{emi.lender}</p>

              <div style={{ height: 6, background: theme.borderSoft, borderRadius: 4, marginBottom: 14, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${progressPct}%`, background: theme.purple, borderRadius: 4,
                  boxShadow: `0 0 8px ${theme.purple}99`,
                }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 13 }}>
                <div>
                  <div style={{ color: theme.textMuted, fontSize: 11, marginBottom: 3 }}>Monthly Installment</div>
                  <div style={{ color: theme.purple, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    ₹{Number(emi.monthly_installment).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ color: theme.textMuted, fontSize: 11, marginBottom: 3 }}>Due Day Each Month</div>
                  <div style={{ fontWeight: 700, color: theme.text }}>Day {emi.due_day}</div>
                </div>
                <div>
                  <div style={{ color: theme.textMuted, fontSize: 11, marginBottom: 3 }}>Installments Left</div>
                  <div style={{ color: theme.warning, fontWeight: 700 }}>{remaining} Months</div>
                </div>
                <div>
                  <div style={{ color: theme.textMuted, fontSize: 11, marginBottom: 3 }}>Remaining Balance</div>
                  <div style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: theme.text }}>
                    ₹{remainingBalance.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

/* ============ BILLS SECTION (new) ============ */
function BillsSection({ userId }) {
  const { theme } = useTheme()
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

  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState('')
  const [category, setCategory] = useState(BILL_CATEGORIES[0])
  const [amount, setAmount] = useState('')
  const [recurrence, setRecurrence] = useState(RECURRENCE_OPTIONS[0])
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchBills = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('planned_payments')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true })

    if (error) console.error('Error fetching bills:', error.message)
    else setBills(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchBills()
  }, [])

  const handleAddBill = async (e) => {
    e.preventDefault()
    setSaving(true)

    const { data, error } = await supabase.from('planned_payments').insert({
      user_id: userId,
      name,
      category,
      amount: amount === '' ? null : Number(amount),
      recurrence,
      due_date: dueDate,
      is_paid: false,
    }).select().single()

    if (error) {
      console.error('Error adding bill:', error.message)
    } else {
      // Schedule a reminder notification for this new bill
      try {
        await scheduleBillReminder(data)
      } catch (notifErr) {
        console.error('Error scheduling reminder:', notifErr.message)
      }
      setName(''); setAmount(''); setDueDate('')
      setShowForm(false)
      fetchBills()
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('planned_payments').delete().eq('id', id)
    if (!error) {
      // Cancel any pending reminder for this bill so it doesn't fire after deletion
      try {
        await cancelBillReminder(id)
      } catch (notifErr) {
        console.error('Error cancelling reminder:', notifErr.message)
      }
      fetchBills()
    }
  }

  // Marks paid, and if recurring, rolls the due_date forward and resets is_paid
  const handleMarkPaid = async (bill) => {
    // Cancel today's reminder either way — it's done its job
    try {
      await cancelBillReminder(bill.id)
    } catch (notifErr) {
      console.error('Error cancelling reminder:', notifErr.message)
    }

    if (bill.recurrence === 'one-time') {
      const { error } = await supabase
        .from('planned_payments')
        .update({ is_paid: true })
        .eq('id', bill.id)
      if (!error) fetchBills()
      return
    }

    const nextDate = new Date(bill.due_date)
    if (bill.recurrence === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1)
    if (bill.recurrence === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1)

    const nextDueDate = nextDate.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('planned_payments')
      .update({ is_paid: false, due_date: nextDueDate })
      .eq('id', bill.id)
      .select()
      .single()

    if (!error) {
      // Schedule the reminder for the next cycle
      try {
        await scheduleBillReminder(data)
      } catch (notifErr) {
        console.error('Error scheduling next reminder:', notifErr.message)
      }
      fetchBills()
    }
  }

  const daysUntil = (dateStr) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(dateStr)
    due.setHours(0, 0, 0, 0)
    return Math.round((due - today) / (1000 * 60 * 60 * 24))
  }

  const unpaidBills = bills.filter((b) => !b.is_paid)
  const totalDueThisCycle = unpaidBills.reduce((sum, b) => sum + Number(b.amount || 0), 0)
  const overdueCount = unpaidBills.filter((b) => daysUntil(b.due_date) < 0).length
  const dueSoonCount = unpaidBills.filter((b) => {
    const d = daysUntil(b.due_date)
    return d >= 0 && d <= 3
  }).length

  return (
    <div>
      {/* Hero card */}
      <div style={{
        background: theme.card, borderRadius: 20, padding: '22px', marginBottom: 18,
        border: `1px solid ${theme.purple}4D`,
        boxShadow: `0 0 40px ${theme.purple}14`,
      }}>
        <span style={{
          fontSize: 11, background: `${theme.purple}24`, padding: '4px 10px',
          borderRadius: 20, color: theme.purple,
        }}>Bills & Subscriptions</span>
        <h2 style={{ fontSize: 24, fontWeight: 600, margin: '10px 0 4px', color: theme.textOnAccent }}>Planned Payments</h2>
        <p style={{ fontSize: 12.5, color: theme.textSubtle, marginBottom: 16 }}>
          Track recurring bills, subscriptions & one-time payments.
        </p>
        <button onClick={() => setShowForm(!showForm)} style={{
          width: '100%', padding: 12, borderRadius: 12, border: 'none',
          background: theme.purple, color: theme.bg, fontWeight: 700, fontSize: 13.5,
          boxShadow: `0 0 20px ${theme.purple}66`,
        }}>
          + Add New Payment
        </button>
      </div>

      {/* Add Bill form */}
      {showForm && (
        <form onSubmit={handleAddBill} style={{
          background: theme.card, borderRadius: 16, padding: 18, marginBottom: 18,
          border: `1px solid ${theme.purple}33`,
        }}>
          <input placeholder="Payment Name (e.g. Netflix)" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
            {BILL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="number" placeholder="Amount (₹) — leave blank if it varies" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" style={inputStyle} />
          <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} style={inputStyle}>
            {RECURRENCE_OPTIONS.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
          <input type="date" placeholder="Due Date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required style={{ ...inputStyle, marginBottom: 16 }} />
          <button type="submit" disabled={saving} style={{
            width: '100%', padding: '14px', borderRadius: 14, border: 'none',
            background: theme.purple, color: theme.bg, fontWeight: 700, fontSize: 14.5,
            opacity: saving ? 0.6 : 1,
          }}>
            {saving ? 'Saving...' : 'Save Payment'}
          </button>
        </form>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
        <StatCard label="Due This Cycle" value={`₹${totalDueThisCycle.toLocaleString()}`} sub={`${unpaidBills.length} Unpaid`} accent={theme.purple} />
        <StatCard label="Overdue" value={`${overdueCount}`} sub="Past due date" accent={theme.danger} />
        <StatCard label="Due Soon" value={`${dueSoonCount}`} sub="Within 3 days" accent={theme.warning} />
        <StatCard label="Total Tracked" value={`${bills.length}`} sub="All payments" accent={theme.textOnAccent} />
      </div>

      {/* Bills list */}
      {loading ? (
        <p style={{ color: theme.textMuted, fontSize: 13.5, textAlign: 'center', padding: 20 }}>Loading payments...</p>
      ) : bills.length === 0 ? (
        <p style={{ color: theme.textMuted, fontSize: 13.5, textAlign: 'center', padding: 20 }}>No planned payments added yet.</p>
      ) : (
        bills.map((bill) => {
          const days = daysUntil(bill.due_date)
          const isOverdue = days < 0 && !bill.is_paid
          const isDueSoon = days >= 0 && days <= 3 && !bill.is_paid

          let statusColor = theme.textMuted
          let statusText = `Due in ${days} days`
          if (bill.is_paid) { statusColor = theme.success; statusText = 'Paid' }
          else if (isOverdue) { statusColor = theme.danger; statusText = `Overdue by ${Math.abs(days)} days` }
          else if (isDueSoon) { statusColor = theme.warning; statusText = days === 0 ? 'Due today' : `Due in ${days} days` }

          return (
            <div key={bill.id} style={{
              background: theme.card, borderRadius: 16, padding: 18, marginBottom: 12,
              border: `1px solid ${isOverdue ? theme.danger + '4D' : theme.borderSoft}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Tag color={theme.purple}>{bill.category}</Tag>
                <Tag color={statusColor}>{statusText}</Tag>
                <button
                  onClick={() => handleDelete(bill.id)}
                  style={{
                    marginLeft: 'auto', width: 26, height: 26, borderRadius: 8, border: 'none',
                    background: theme.borderSoft, color: theme.textMuted, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  🗑
                </button>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: theme.text }}>{bill.name}</h3>
              <p style={{ fontSize: 12.5, color: theme.textMuted, margin: '2px 0 12px' }}>
                {bill.recurrence.charAt(0).toUpperCase() + bill.recurrence.slice(1)} · Due {new Date(bill.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: theme.textMuted, fontSize: 11, marginBottom: 3 }}>Amount</div>
                  <div style={{ color: theme.purple, fontWeight: 700, fontSize: 16, fontVariantNumeric: 'tabular-nums' }}>
                    {bill.amount ? `₹${Number(bill.amount).toLocaleString()}` : 'Varies'}
                  </div>
                </div>
                {!bill.is_paid && (
                  <button
                    onClick={() => handleMarkPaid(bill)}
                    style={{
                      padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: theme.success, color: theme.successBg, fontWeight: 700, fontSize: 12.5,
                    }}
                  >
                    Mark as Paid
                  </button>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

function StatCard({ label, value, sub, accent }) {
  const { theme } = useTheme()
  return (
    <div style={{
      background: theme.card, borderRadius: 14, padding: '14px 16px',
      border: `1px solid ${theme.borderSoft}`,
    }}>
      <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: accent, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: 10.5, color: theme.textFaint, marginTop: 3 }}>{sub}</div>
    </div>
  )
}

function Tag({ children, color }) {
  const { theme } = useTheme()
  const c = color || theme.textSubtle
  return (
    <span style={{
      fontSize: 10.5, padding: '4px 9px', borderRadius: 20,
      background: `${c}22`, color: c, fontWeight: 500,
    }}>
      {children}
    </span>
  )
}
