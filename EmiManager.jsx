import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const LOAN_TYPES = ['Gadget Loan', 'Home Loan', 'Auto Loan', 'Personal Loan', 'Education Loan', 'Other']

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
    const remainingInstallments = e.total_installments - e.installments_paid
    return sum + remainingInstallments * Number(e.monthly_installment)
  }, 0)
  const completedLoans = emis.filter((e) => e.installments_paid >= e.total_installments).length

  return (
    <div className="module-section">
      <div className="module-hero purple">
        <span className="module-badge">Debt & Loan Portfolio</span>
        <h2>EMI Manager</h2>
        <p>Track auto loans, gadgets & credit card EMIs with due reminders.</p>
        <button className="hero-btn purple-btn" onClick={() => setShowForm(!showForm)}>
          + Add New EMI
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddEmi} className="add-transaction-form">
          <input placeholder="Loan Name (e.g. Laptop)" value={loanName} onChange={(e) => setLoanName(e.target.value)} required />
          <input placeholder="Lender (e.g. Bajaj)" value={lender} onChange={(e) => setLender(e.target.value)} />
          <select value={loanType} onChange={(e) => setLoanType(e.target.value)}>
            {LOAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="number" placeholder="Total Principal (₹)" value={principal} onChange={(e) => setPrincipal(e.target.value)} required min="0" />
          <input type="number" placeholder="Monthly Installment (₹)" value={installment} onChange={(e) => setInstallment(e.target.value)} required min="0" />
          <input type="number" placeholder="Due Day of Month (1-31)" value={dueDay} onChange={(e) => setDueDay(e.target.value)} required min="1" max="31" />
          <input type="number" placeholder="Total Number of Installments" value={totalInstallments} onChange={(e) => setTotalInstallments(e.target.value)} required min="1" />
          <button type="submit" disabled={saving} className="submit-btn">
            {saving ? 'Saving...' : 'Save EMI'}
          </button>
        </form>
      )}

      <div className="summary-cards two-col">
        <div className="summary-card">
          <span className="label">Monthly EMI Commitment</span>
          <span className="value purple-text">₹{monthlyCommitment.toLocaleString()}</span>
          <span className="sub-label">{emis.length} Active Loans</span>
        </div>
        <div className="summary-card">
          <span className="label">Remaining Liability</span>
          <span className="value expense">₹{remainingLiability.toLocaleString()}</span>
          <span className="sub-label">Total Outstanding</span>
        </div>
        <div className="summary-card">
          <span className="label">Total Principal Financed</span>
          <span className="value">₹{totalPrincipal.toLocaleString()}</span>
          <span className="sub-label">Original Borrowed</span>
        </div>
        <div className="summary-card">
          <span className="label">Completed Loans</span>
          <span className="value income">{completedLoans} Loans</span>
          <span className="sub-label">Fully Repaid</span>
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Loading EMIs...</p>
      ) : emis.length === 0 ? (
        <p className="empty-state">No EMIs added yet.</p>
      ) : (
        emis.map((emi) => {
          const remaining = emi.total_installments - emi.installments_paid
          const remainingBalance = remaining * Number(emi.monthly_installment)
          return (
            <div key={emi.id} className="emi-card">
              <div className="emi-tags">
                <span className="tag purple-tag">{emi.loan_type}</span>
                <span className="tag">Due on {emi.due_day}th</span>
                <button className="delete-btn" onClick={() => handleDelete(emi.id)}>🗑</button>
              </div>
              <h3>{emi.loan_name}</h3>
              <p className="emi-lender">{emi.lender}</p>
              <div className="emi-grid">
                <div>
                  <span className="sub-label">Monthly Installment</span>
                  <span className="value purple-text">₹{Number(emi.monthly_installment).toLocaleString()}</span>
                </div>
                <div>
                  <span className="sub-label">Due Day Each Month</span>
                  <span className="value">Day {emi.due_day}</span>
                </div>
                <div>
                  <span className="sub-label">Installments Left</span>
                  <span className="value warning-text">{remaining} Months</span>
                </div>
                <div>
                  <span className="sub-label">Remaining Balance</span>
                  <span className="value">₹{remainingBalance.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
