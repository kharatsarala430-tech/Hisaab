import { supabase } from '../lib/supabase'

const NEON_GREEN = '#39FF94'
const NEON_RED = '#FF3D6E'

export default function TransactionList({ transactions, loading, onTransactionChanged }) {
  const handleDelete = async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) {
      console.error('Error deleting transaction:', error.message)
    } else {
      onTransactionChanged()
    }
  }

  if (loading) {
    return <p style={{ color: '#7A7A7A', fontSize: 13.5, textAlign: 'center', padding: 20 }}>Loading transactions...</p>
  }

  if (transactions.length === 0) {
    return (
      <p style={{ color: '#7A7A7A', fontSize: 13.5, textAlign: 'center', padding: 20 }}>
        No transactions yet. Add your first one above!
      </p>
    )
  }

  return (
    <div>
      <div style={{
        fontSize: 12, fontWeight: 600, color: '#7A7A7A', letterSpacing: '0.04em',
        textTransform: 'uppercase', marginBottom: 10,
      }}>
        Recent Transactions
      </div>

      {transactions.map((tx) => (
        <div key={tx.id} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '13px 14px', background: '#0D0D0D',
          borderRadius: 12, marginBottom: 8,
          border: '1px solid rgba(255,255,255,0.06)',
          borderLeft: `3px solid ${tx.type === 'income' ? NEON_GREEN : NEON_RED}`,
        }}>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 500 }}>{tx.category}</div>
            <div style={{ fontSize: 11.5, color: '#7A7A7A' }}>{tx.date}</div>
            {tx.note && <div style={{ fontSize: 11.5, color: '#5C5C5C', marginTop: 2 }}>{tx.note}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: 15, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
              color: tx.type === 'income' ? NEON_GREEN : NEON_RED,
            }}>
              {tx.type === 'income' ? '+' : '-'}₹{tx.amount}
            </span>
            <button
              onClick={() => handleDelete(tx.id)}
              style={{
                width: 26, height: 26, borderRadius: 8, border: 'none',
                background: 'rgba(255,255,255,0.06)', color: '#7A7A7A',
                fontSize: 13, lineHeight: 1, cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
