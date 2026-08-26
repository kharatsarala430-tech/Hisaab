import { useTheme } from '../ThemeContext'

export default function PaywallScreen({ featureName }) {
  const { theme } = useTheme()
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      minHeight: '300px'
    }}>
      <h2 style={{ marginBottom: '12px', color: theme.text }}>🔒 Premium Feature</h2>
      <p style={{ color: theme.textMuted, marginBottom: '20px' }}>
        {featureName ? `"${featureName}" is a premium feature.` : 'This is a premium feature.'}
      </p>
      <button style={{
        padding: '12px 24px',
        background: theme.accent,
        color: theme.bg,
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold'
      }}>
        Upgrade to Premium
      </button>
    </div>
  );
}
