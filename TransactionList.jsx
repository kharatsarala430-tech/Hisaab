import { supabase } from '../lib/supabase'

export default function TransactionList({ transactions, loading, onTransactionChanged }) {
  const handleDelete = async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) {
      console.error('Error deleting transaction:', error.message)
    } else {
      onTransactionChanged()
    }
  }

  if (loading) return <p className="loading-text">Loading transactions...</p>

  if (transactions.length === 0) {
    return <p className="empty-state">No transactions yet. Add your first one above!</p>
  }

  return (
    <div className="transaction-list">
      <h2>Recent Transactions</h2>
      {transactions.map((tx) => (
        <div key={tx.id} className={`transaction-item ${tx.type}`}>
          <div className="tx-details">
            <span className="tx-category">{tx.category}</span>
            <span className="tx-date">{tx.date}</span>
            {tx.note && <span className="tx-note">{tx.note}</span>}
          </div>
          <div className="tx-right">
            <span className={`tx-amount ${tx.type}`}>
              {tx.type === 'income' ? '+' : '-'}₹{tx.amount}
            </span>
            <button onClick={() => handleDelete(tx.id)} className="delete-btn">✕</button>
          </div>
        </div>
      ))}
    </div>
  )
}
