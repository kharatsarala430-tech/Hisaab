export default function PaywallScreen({ featureName }) {
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
      <h2 style={{ marginBottom: '12px' }}>🔒 Premium Feature</h2>
      <p style={{ color: '#888', marginBottom: '20px' }}>
        {featureName ? `"${featureName}" is a premium feature.` : 'This is a premium feature.'}
      </p>
      <button style={{
        padding: '12px 24px',
        background: '#0F766E',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold'
      }}>
        Upgrade to Premium
      </button>
    </div>
  );
}
