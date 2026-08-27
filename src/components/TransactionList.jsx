import { supabase } from '../lib/supabase'
import { useTheme } from '../ThemeContext'
import { useLanguage } from '../LanguageContext'

export default function TransactionList({ transactions, loading, onTransactionChanged }) {
  const { theme } = useTheme()
  const { t } = useLanguage()

  const handleDelete = async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) {
      console.error('Error deleting transaction:', error.message)
    } else {
      onTransactionChanged()
    }
  }

  if (loading) {
    return <p style={{ color: theme.textMuted, fontSize: 13.5, textAlign: 'center', padding: 20 }}>{t('transactions.loading')}</p>
  }

  if (transactions.length === 0) {
    return (
      <p style={{ color: theme.textMuted, fontSize: 13.5, textAlign: 'center', padding: 20 }}>
        {t('transactions.empty')}
      </p>
    )
  }

  return (
    <div>
      <div style={{
        fontSize: 12, fontWeight: 600, color: theme.textMuted, letterSpacing: '0.04em',
        textTransform: 'uppercase', marginBottom: 10,
      }}>
        {t('transactions.title')}
      </div>

      {transactions.map((tx) => (
        <div key={tx.id} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '13px 14px', background: theme.card,
          borderRadius: 12, marginBottom: 8,
          border: `1px solid ${theme.borderSoft}`,
          borderLeft: `3px solid ${tx.type === 'income' ? theme.success : theme.danger}`,
        }}>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 500, color: theme.text }}>{tx.category}</div>
            <div style={{ fontSize: 11.5, color: theme.textMuted }}>{tx.date}</div>
            {tx.note && <div style={{ fontSize: 11.5, color: theme.textFaint, marginTop: 2 }}>{tx.note}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: 15, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
              color: tx.type === 'income' ? theme.success : theme.danger,
            }}>
              {tx.type === 'income' ? '+' : '-'}₹{tx.amount}
            </span>
            <button
              onClick={() => handleDelete(tx.id)}
              style={{
                width: 26, height: 26, borderRadius: 8, border: 'none',
                background: theme.borderSoft, color: theme.textMuted,
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
