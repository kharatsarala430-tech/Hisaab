import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const LOAN_TYPES = ['Gadget Loan', 'Home Loan', 'Auto Loan', 'Personal Loan', 'Education Loan', 'Other']
const BILL_CATEGORIES = ['Subscription', 'Utility', 'Insurance', 'Rent', 'Other']
const RECURRENCE_OPTIONS = ['monthly', 'yearly', 'one-time']

const NEON_PURPLE = '#A78BFA'
const NEON_RED = '#FF3D6E'
const NEON_GREEN = '#39FF94'
const NEON_AMBER = '#FFD23D'

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

export default function EmiManager({ userId }) {
  const [activeTab, setActiveTab] = useState('emis') // 'emis' | 'bills'

  return (
    <div>
      {/* Toggle */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 18, background: '#0D0D0D',
        padding: 5, borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <button
          onClick={() => setActiveTab('emis')}
          style={{
            flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: activeTab === 'emis' ? NEON_PURPLE : 'transparent',
            color: activeTab === 'emis' ? '#150F2E' : '#9A9A9A',
            fontWeight: 700, fontSize: 13.5,
          }}
        >
          EMIs
        </button>
        <button
          onClick={() => setActiveTab('bills')}
          style={{
            flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: activeTab === 'bills' ? NEON_PURPLE : 'transparent',
            color: activeTab === 'bills' ? '#150F2E' : '#9A9A9A',
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

    const { error } = await supabase.from('emis').insert({
      user_id: userId,
      loan_name: loanName,
      lender,
      loan_type: loanType,
      principal_amount: Number(principal),
      monthly_installment: Number(installment),
      due_day: Number(dueDay),
      total_installments: Number(totalInstallments),
      installments_paid: 0,
    })

    if (error) {
      console.error('Error adding EMI:', error.message)
    } else {
      setLoanName(''); setLender(''); setPrincipal(''); setInstallment(''); setTotalInstallments('')
      setShowForm(false)
      fetchEmis()
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('emis').delete().eq('id', id)
    if (!error) fetchEmis()
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
        background: '#0D0D0D', borderRadius: 20, padding: '22px', marginBottom: 18,
        border: `1px solid rgba(167,139,250,0.3)`,
        boxShadow: '0 0 40px rgba(167,139,250,0.08)',
      }}>
        <span style={{
          fontSize: 11, background: 'rgba(167,139,250,0.14)', padding: '4px 10px',
          borderRadius: 20, color: '#C4B5FD',
        }}>Debt & Loan Portfolio</span>
        <h2 style={{ fontSize: 24, fontWeight: 600, margin: '10px 0 4px', color: '#F5F5F5' }}>EMI Manager</h2>
        <p style={{ fontSize: 12.5, color: '#9A9A9A', marginBottom: 16 }}>
          Track auto loans, gadgets & credit card EMIs with due reminders.
        </p>
        <button onClick={() => setShowForm(!showForm)} style={{
          width: '100%', padding: 12, borderRadius: 12, border: 'none',
          background: NEON_PURPLE, color: '#150F2E', fontWeight: 700, fontSize: 13.5,
          boxShadow: '0 0 20px rgba(167,139,250,0.4)',
        }}>
          + Add New EMI
        </button>
      </div>

      {/* Add EMI form */}
      {showForm && (
        <form onSubmit={handleAddEmi} style={{
          background: '#0D0D0D', borderRadius: 16, padding: 18, marginBottom: 18,
          border: '1px solid rgba(167,139,250,0.2)',
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
            background: NEON_PURPLE, color: '#150F2E', fontWeight: 700, fontSize: 14.5,
            opacity: saving ? 0.6 : 1,
          }}>
            {saving ? 'Saving...' : 'Save EMI'}
          </button>
        </form>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
        <StatCard label="Monthly EMI Commitment" value={`₹${monthlyCommitment.toLocaleString()}`} sub={`${emis.length} Active Loans`} accent={NEON_PURPLE} />
        <StatCard label="Remaining Liability" value={`₹${remainingLiability.toLocaleString()}`} sub="Total Outstanding" accent={NEON_RED} />
        <StatCard label="Total Principal Financed" value={`₹${totalPrincipal.toLocaleString()}`} sub="Original Borrowed" accent="#F5F5F5" />
        <StatCard label="Completed Loans" value={`${completedLoans} Loans`} sub="Fully Repaid" accent={NEON_GREEN} />
      </div>

      {/* EMI list */}
      {loading ? (
        <p style={{ color: '#7A7A7A', fontSize: 13.5, textAlign: 'center', padding: 20 }}>Loading EMIs...</p>
      ) : emis.length === 0 ? (
        <p style={{ color: '#7A7A7A', fontSize: 13.5, textAlign: 'center', padding: 20 }}>No EMIs added yet.</p>
      ) : (
        emis.map((emi) => {
          const remaining = Math.max(0, emi.total_installments - emi.installments_paid)
          const remainingBalance = remaining * Number(emi.monthly_installment)
          const progressPct = Math.min(100, Math.round((emi.installments_paid / emi.total_installments) * 100))
          return (
            <div key={emi.id} style={{
              background: '#0D0D0D', borderRadius: 16, padding: 18, marginBottom: 12,
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Tag color={NEON_PURPLE}>{emi.loan_type}</Tag>
                <Tag>Due on {emi.due_day}th</Tag>
                <button
                  onClick={() => handleDelete(emi.id)}
                  style={{
                    marginLeft: 'auto', width: 26, height: 26, borderRadius: 8, border: 'none',
                    background: 'rgba(255,255,255,0.06)', color: '#7A7A7A', fontSize: 13, cursor: 'pointer',
                  }}
                >
                  🗑
                </button>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{emi.loan_name}</h3>
              <p style={{ fontSize: 12.5, color: '#7A7A7A', margin: '2px 0 12px' }}>{emi.lender}</p>

              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: 14, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${progressPct}%`, background: NEON_PURPLE, borderRadius: 4,
                  boxShadow: '0 0 8px rgba(167,139,250,0.6)',
                }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 13 }}>
                <div>
                  <div style={{ color: '#7A7A7A', fontSize: 11, marginBottom: 3 }}>Monthly Installment</div>
                  <div style={{ color: NEON_PURPLE, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    ₹{Number(emi.monthly_installment).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#7A7A7A', fontSize: 11, marginBottom: 3 }}>Due Day Each Month</div>
                  <div style={{ fontWeight: 700 }}>Day {emi.due_day}</div>
                </div>
                <div>
                  <div style={{ color: '#7A7A7A', fontSize: 11, marginBottom: 3 }}>Installments Left</div>
                  <div style={{ color: NEON_AMBER, fontWeight: 700 }}>{remaining} Months</div>
                </div>
                <div>
                  <div style={{ color: '#7A7A7A', fontSize: 11, marginBottom: 3 }}>Remaining Balance</div>
                  <div style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
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

    const { error } = await supabase.from('planned_payments').insert({
      user_id: userId,
      name,
      category,
      amount: amount === '' ? null : Number(amount),
      recurrence,
      due_date: dueDate,
      is_paid: false,
    })

    if (error) {
      console.error('Error adding bill:', error.message)
    } else {
      setName(''); setAmount(''); setDueDate('')
      setShowForm(false)
      fetchBills()
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('planned_payments').delete().eq('id', id)
    if (!error) fetchBills()
  }

  // Marks paid, and if recurring, rolls the due_date forward and resets is_paid
  const handleMarkPaid = async (bill) => {
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

    const { error } = await supabase
      .from('planned_payments')
      .update({ is_paid: false, due_date: nextDueDate })
      .eq('id', bill.id)

    if (!error) fetchBills()
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
        background: '#0D0D0D', borderRadius: 20, padding: '22px', marginBottom: 18,
        border: `1px solid rgba(167,139,250,0.3)`,
        boxShadow: '0 0 40px rgba(167,139,250,0.08)',
      }}>
        <span style={{
          fontSize: 11, background: 'rgba(167,139,250,0.14)', padding: '4px 10px',
          borderRadius: 20, color: '#C4B5FD',
        }}>Bills & Subscriptions</span>
        <h2 style={{ fontSize: 24, fontWeight: 600, margin: '10px 0 4px', color: '#F5F5F5' }}>Planned Payments</h2>
        <p style={{ fontSize: 12.5, color: '#9A9A9A', marginBottom: 16 }}>
          Track recurring bills, subscriptions & one-time payments.
        </p>
        <button onClick={() => setShowForm(!showForm)} style={{
          width: '100%', padding: 12, borderRadius: 12, border: 'none',
          background: NEON_PURPLE, color: '#150F2E', fontWeight: 700, fontSize: 13.5,
          boxShadow: '0 0 20px rgba(167,139,250,0.4)',
        }}>
          + Add New Payment
        </button>
      </div>

      {/* Add Bill form */}
      {showForm && (
        <form onSubmit={handleAddBill} style={{
          background: '#0D0D0D', borderRadius: 16, padding: 18, marginBottom: 18,
          border: '1px solid rgba(167,139,250,0.2)',
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
            background: NEON_PURPLE, color: '#150F2E', fontWeight: 700, fontSize: 14.5,
            opacity: saving ? 0.6 : 1,
          }}>
            {saving ? 'Saving...' : 'Save Payment'}
          </button>
        </form>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
        <StatCard label="Due This Cycle" value={`₹${totalDueThisCycle.toLocaleString()}`} sub={`${unpaidBills.length} Unpaid`} accent={NEON_PURPLE} />
        <StatCard label="Overdue" value={`${overdueCount}`} sub="Past due date" accent={NEON_RED} />
        <StatCard label="Due Soon" value={`${dueSoonCount}`} sub="Within 3 days" accent={NEON_AMBER} />
        <StatCard label="Total Tracked" value={`${bills.length}`} sub="All payments" accent="#F5F5F5" />
      </div>

      {/* Bills list */}
      {loading ? (
        <p style={{ color: '#7A7A7A', fontSize: 13.5, textAlign: 'center', padding: 20 }}>Loading payments...</p>
      ) : bills.length === 0 ? (
        <p style={{ color: '#7A7A7A', fontSize: 13.5, textAlign: 'center', padding: 20 }}>No planned payments added yet.</p>
      ) : (
        bills.map((bill) => {
          const days = daysUntil(bill.due_date)
          const isOverdue = days < 0 && !bill.is_paid
          const isDueSoon = days >= 0 && days <= 3 && !bill.is_paid

          let statusColor = '#7A7A7A'
          let statusText = `Due in ${days} days`
          if (bill.is_paid) { statusColor = NEON_GREEN; statusText = 'Paid' }
          else if (isOverdue) { statusColor = NEON_RED; statusText = `Overdue by ${Math.abs(days)} days` }
          else if (isDueSoon) { statusColor = NEON_AMBER; statusText = days === 0 ? 'Due today' : `Due in ${days} days` }

          return (
            <div key={bill.id} style={{
              background: '#0D0D0D', borderRadius: 16, padding: 18, marginBottom: 12,
              border: `1px solid ${isOverdue ? 'rgba(255,61,110,0.3)' : 'rgba(255,255,255,0.08)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Tag color={NEON_PURPLE}>{bill.category}</Tag>
                <Tag color={statusColor}>{statusText}</Tag>
                <button
                  onClick={() => handleDelete(bill.id)}
                  style={{
                    marginLeft: 'auto', width: 26, height: 26, borderRadius: 8, border: 'none',
                    background: 'rgba(255,255,255,0.06)', color: '#7A7A7A', fontSize: 13, cursor: 'pointer',
                  }}
                >
                  🗑
                </button>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{bill.name}</h3>
              <p style={{ fontSize: 12.5, color: '#7A7A7A', margin: '2px 0 12px' }}>
                {bill.recurrence.charAt(0).toUpperCase() + bill.recurrence.slice(1)} · Due {new Date(bill.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: 
