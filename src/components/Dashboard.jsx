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
import Sidebar from './Sidebar'
import UdhaarTracker from './UdhaarTracker'
import ErrorBoundary from './ErrorBoundary'
import { exportTransactionsToCSV } from '../utils/exportCSV'
import { getWeeklyNudge } from '../utils/spendingNudges'
import { checkAndAddRecurringIncomes } from '../utils/recurringIncome'

export default function Dashboard({ session }) {
  const [transactions, setTransactions] = useState([])
  const [emis, setEmis] = useState([])
  const [savingsGoals, setSavingsGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [generatingReport, setGeneratingReport] = useState(false)
  // Tracks whether the initial emis/savingsGoals fetch has finished, so the
  // report button can't fire before that data is actually in state.
  const [initialDataLoaded, setInitialDataLoaded] = useState(false)

  // Month selector — defaults to the current month, e.g. "2026-08"
  const currentMonthKey = new Date().toISOString().slice(0, 7)
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey)

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

  // Build the list of months that actually have data, so the dropdown never shows
  // empty months. Always includes the current month even if it has no transactions yet.
  const monthsWithData = Array.from(
    new Set(transactions.map(t => t.date.slice(0, 7)))
  )
  if (!monthsWithData.includes(currentMonthKey)) monthsWithData.push(currentMonthKey)
  monthsWithData.sort().reverse() // newest first

  const formatMonthLabel = (monthKey) => {
    const [year, month] = monthKey.split('-')
    const date = new Date(Number(year), Number(month) - 1)
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  }

  // Nothing is ever deleted — this just filters what's shown for the selected month.
  // EMIs and Savings Goals are intentionally NOT filtered by month; they persist
  // until the loan/goal itself is finished, independent of the monthly transaction view.
  const filteredTransactions = transactions.filter(t => t.date.slice(0, 7) === selectedMonth)

  // This-week vs last-week split — used only for the spending reflection nudge.
  // Independent of the month selector on purpose (a nudge should always talk
  // about "this week" regardless of which month the user is browsing).
  const isoDaysAgo = (n) => {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d.toISOString().slice(0, 10)
  }
  const todayStr = isoDaysAgo(0)
  const weekAgoStr = isoDaysAgo(7)
  const twoWeeksAgoStr = isoDaysAgo(14)
  const thisWeekTxns = transactions.filter(t => t.date >= weekAgoStr && t.date <= todayStr)
  const lastWeekTxns = transactions.filter(t => t.date >= twoWeeksAgoStr && t.date < weekAgoStr)
  const weeklyNudge = getWeeklyNudge(thisWeekTxns, lastWeekTxns)

  useEffect(() => {
    fetchTransactions()
    // Wait for BOTH emis and savingsGoals to actually resolve before marking
    // initial data as loaded. Without this, hitting "Download Report" right
    // after the screen opens can fire generateReport() while emis/savingsGoals
    // are still their default empty arrays — the report shows 0 EMIs even
    // though the EMI tab has data, because the fetch just hadn't finished yet.
    Promise.all([fetchEmis(), fetchSavingsGoals()]).then(() => {
      setInitialDataLoaded(true)
    })
    checkAndAddRecurringIncomes(session.user.id).then(() => {
      fetchTransactions() // refresh list in case a recurring income was just auto-added
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleDownloadReport = async () => {
    setGeneratingReport(true)
    try {
      await generateReport({
        period: formatMonthLabel(selectedMonth),
        transactions: filteredTransactions,
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

  const handleExportCSV = async () => {
    try {
      await exportTransactionsToCSV(
        filteredTransactions,
        `hisaab-${selectedMonth}.csv`
      )
    } catch (error) {
      console.error('CSV export failed:', error)
      alert('Kuch gadbad ho gayi CSV export mein. Dobara try karo.')
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#050505',
      color: '#EAEAEA',
      fontFamily: "'Inter', -apple-system, sans-serif",
      paddingBottom: 90,
      overflowX: 'hidden',
      width: '100%',
    }}>
      {/* Sidebar renders its own hamburger button + drawer — just drop it in */}
      <Sidebar
        session={session}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onDownloadReport={handleDownloadReport}
        onExportCSV={handleExportCSV}
        onLogout={handleLogout}
      />

      <header style={{
        padding: '18px 18px 20px',
        background: '#0A0A0A',
        borderBottom: '1px solid rgba(61,169,255,0.15)',
        marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Georgia', serif",
            fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em',
            color: '#3DA9FF', textShadow: '0 0 18px rgba(61,169,255,0.5)',
            margin: 0,
          }}>
            Hisaab
          </h1>
          <p style={{ fontSize: 12, color: '#7A7A7A', marginTop: 2 }}>{session.user.email}</p>
        </div>
      </header>

      <div style={{ padding: '0 18px' }}>
        {/* Month selector — only affects the Dashboard/Transactions view and the report.
            EMI and Savings tabs are unaffected since those aren't month-based. */}
        {activeTab === 'dashboard' && (
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px', marginBottom: 14,
              background: '#0D0D0D', border: '1px solid rgba(61,169,255,0.25)',
              borderRadius: 12, color: '#3DA9FF', fontSize: 14, fontWeight: 600,
              outline: 'none',
            }}
          >
            {monthsWithData.map((monthKey) => (
              <option key={monthKey} value={monthKey}>
                {formatMonthLabel(monthKey)}{monthKey === currentMonthKey ? ' (Current)' : ''}
              </option>
            ))}
          </select>
        )}

        {activeTab === 'dashboard' && (
          <>
            {weeklyNudge && (
              <div style={{
                padding: '12px 14px', marginBottom: 14, borderRadius: 12,
                background: 'rgba(61,169,255,0.06)', border: '1px solid rgba(61,169,255,0.2)',
                fontSize: 13, color: '#B8D9F0', lineHeight: 1.4,
              }}>
                💡 {weeklyNudge.text}
              </div>
            )}
            <Summary transactions={filteredTransactions} />
            <AddTransaction
              userId={session.user.id}
              onTransactionAdded={fetchTransactions}
            />
            <TransactionList
              transactions={filteredTransactions}
              loading={loading}
              onTransactionChanged={fetchTransactions}
            />
          </>
        )}

        {activeTab === 'emi' && <EmiManager userId={session.user.id} />}

        {activeTab === 'budget' && <BudgetPlanner transactions={filteredTransactions} />}

        {activeTab === 'savings' && <SavingsGoals userId={session.user.id} />}

        {activeTab === 'udhaar' && (
          <ErrorBoundary>
            <UdhaarTracker userId={session.user.id} />
          </ErrorBoundary>
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
  }
