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

  // Fetch all transactions belonging to the logged-in user
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

  // Fetch EMIs so the report (and any dashboard summary) has real data,
  // matching the same query EmiManager.jsx uses internally
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

  // Fetch Savings Goals so the report has real data,
  // matching the same query SavingsGoals.jsx uses internally
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
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Hisaab</h1>
          <p className="user-email">{session.user.email}</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <button onClick={handleDownloadReport} disabled={generatingReport} className="download-report-btn">
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

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
