import { useTheme } from '../ThemeContext'
import { useLanguage } from '../LanguageContext'

/**
 * Hisaab — Offline Banner
 * ---------------------------------------------------
 * Save as: src/components/OfflineBanner.jsx
 *
 * Props:
 *   status -> { online, pendingCount, syncing } from syncManager
 *
 * Shows nothing when online with an empty queue — the common case —
 * so it never adds visual noise when everything is already in sync.
 */

export default function OfflineBanner({ status }) {
  const { theme } = useTheme()
  const { t } = useLanguage()

  if (!status) return null
  const { online, pendingCount, syncing } = status

  // Nothing to say: online, nothing pending, not mid-sync.
  if (online && pendingCount === 0 && !syncing) return null

  let text
  let bg
  if (!online) {
    text = pendingCount > 0
      ? `${t('offline.offlineBanner')} · ${t('offline.pendingSync', pendingCount)}`
      : t('offline.offlineBanner')
    bg = theme.warning
  } else if (syncing) {
    text = t('offline.syncing')
    bg = theme.info
  } else if (pendingCount > 0) {
    text = t('offline.pendingSync', pendingCount)
    bg = theme.info
  } else {
    text = t('offline.syncedUp')
    bg = theme.success
  }

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 60,
      padding: '8px 14px',
      textAlign: 'center',
      fontSize: 12.5,
      fontWeight: 600,
      color: theme.bg,
      background: bg,
    }}>
      {text}
    </div>
  )
}
