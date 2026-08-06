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
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

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

  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
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
