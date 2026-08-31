import { supabase } from '../lib/supabase'
import { useTheme } from '../ThemeContext'
import { useLanguage } from '../LanguageContext'
import { isLocalId, enqueue } from '../lib/offlineStore'
import { drainQueue } from '../lib/syncManager'

export default function TransactionList({ transactions, loading, onTransactionChanged }) {
  const { theme } = useTheme()
  const { t } = useLanguage()

  const handleDelete = async (tx) => {
    // If this row was never synced (still carries a local_ id), there's
    // nothing on the server to delete regardless of connectivity — just
    // drop it locally.
    if (isLocalId(tx.id)) {
      onTransactionChanged({ removeLocalId: tx.id })
      return
    }

    // Queues this delete locally so it retries once connectivity is back —
    // used both for the "known offline" case and as a fallback below when
    // the online path unexpectedly fails.
    const queueOffline = async () => {
      await enqueue({
        action: 'delete',
        payload: { id: tx.id, wasSynced: true },
      })
    }

    if (navigator.onLine) {
      // Online path — but navigator.onLine can briefly report true right
      // after connectivity actually drops (stale browser state), so if the
      // real network call fails, fall back to the offline queue instead of
      // silently failing.
      try {
        const { error } = await supabase.from('transactions').delete().eq('id', tx.id)
        if (error) throw error
      } catch (err) {
        console.error('Online delete failed, queuing for later sync:', err.message)
        await queueOffline()
      }
    } else {
      // Offline path — known offline, queue directly.
      await queueOffline()
    }

    onTransactionChanged()
    if (navigator.onLine) drainQueue()
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14.5, fontWeight: 500, color: theme.text }}>{tx.category}</span>
              {isLocalId(tx.id) && (
                <span style={{
                  fontSize: 9.5, padding: '2px 7px', borderRadius: 20,
                  background: `${theme.warning}22`, color: theme.warning, fontWeight: 600,
                }}>
                  {t('offline.pendingTag')}
                </span>
              )}
            </div>
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
              onClick={() => handleDelete(tx)}
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
