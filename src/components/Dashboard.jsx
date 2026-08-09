import { generateReport } from './ReportGenerator';
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AddTransaction from './AddTransaction'
import TransactionList from './TransactionList'
import Summary from './Summary'
import EmiManager from './EmiManager'
import BudgetPlanner from './BudgetPlanner'
import SavingsGoals from './SavingsGoals'
import BottomNav from './BottomNav'

export default function Dashboard({ session }) {
  const [transactions, setTransactions] = useState([])
  const [emis, setEmis] = useState([])
  const [savingsGoals, setSavingsGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [generatingReport, setGeneratingReport] = useState(false)

  const fetchTransactions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error.message)
    } else {
      setTransactions(data)
    }
    setLoading(false)
  }

  const fetchEmis = async () => {
    const { data, error } = await supabase
      .from('emis')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching EMIs:', error.message)
    } else {
      setEmis(data)
    }
  }

  const fetchSavingsGoals = async () => {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching savings goals:', error.message)
    } else {
      setSavingsGoals(data)
    }
  }

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  useEffect(() => {
    fetchTransactions()
    fetchEmis()
    fetchSavingsGoals()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleDownloadReport = async () => {
    setGeneratingReport(true)
    try {
      await generateReport({
        period: 'This Month',
        transactions,
        emis,
        savingsGoals,
        userEmail: session.user.email,
      })
    } catch (error) {
      console.error('Report generation failed:', error)
      alert('Something went wrong while generating the report. Please try again.')
    } finally {
      setGeneratingReport(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050505',
      color: '#EAEAEA',
      fontFamily: "'Inter', -apple-system, sans-serif",
      paddingBottom: 90,
    }}>
      <header style={{
        padding: '22px 18px 20px',
        background: '#0A0A0A',
        borderBottom: '1px solid rgba(61,169,255,0.15)',
        marginBottom: 20,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Georgia', serif",
            fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em',
            color: '#3DA9FF', textShadow: '0 0 18px rgba(61,169,255,0.5)',
            margin: 0,
          }}>
            Hisaab
          </h1>
          <p style={{ fontSize: 12.5, color: '#7A7A7A', marginTop: 2 }}>{session.user.email}</p>
        </div>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
          color: '#B8B8B8', fontSize: 12.5, padding: '7px 12px', borderRadius: 20,
        }}>
          Logout
        </button>
      </header>

      <div style={{ padding: '0 18px' }}>
        <button onClick={handleDownloadReport} disabled={generatingReport} style={{
          width: '100%', padding: '11px', borderRadius: 12, marginBottom: 20,
          background: 'transparent', color: '#B8B8B8', fontSize: 13, fontWeight: 500,
          border: '1px solid rgba(255,255,255,0.15)',
          opacity: generatingReport ? 0.6 : 1,
        }}>
          📄 {generatingReport ? 'Generating Report...' : 'Download Report'}
        </button>

        {activeTab === 'dashboard' && (
          <>
            <Summary transactions={transactions} />
            <AddTransaction
              userId={session.user.id}
              onTransactionAdded={fetchTransactions}
            />
            <TransactionList
              transactions={transactions}
              loading={loading}
              onTransactionChanged={fetchTransactions}
            />
          </>
        )}

        {activeTab === 'emi' && <EmiManager userId={session.user.id} />}

        {activeTab === 'budget' && <BudgetPlanner transactions={transactions} />}

        {activeTab === 'savings' && <SavingsGoals userId={session.user.id} />}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
