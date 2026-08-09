import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const LOAN_TYPES = ['Gadget Loan', 'Home Loan', 'Auto Loan', 'Personal Loan', 'Education Loan', 'Other']
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

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: '#0D0D0D', borderRadius: 14, padding: '14px 16px',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{ fontSize: 11, color: '#7A7A7A', marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: accent, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: 10.5, color: '#5C5C5C', marginTop: 3 }}>{sub}</div>
    </div>
  )
}

function Tag({ children, color = '#B8B8B8' }) {
  return (
    <span style={{
      fontSize: 10.5, padding: '4px 9px', borderRadius: 20,
      background: `${color}22`, color, fontWeight: 500,
    }}>
      {children}
    </span>
  )
          }
