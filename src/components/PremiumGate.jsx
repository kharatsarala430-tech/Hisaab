import { usePremium } from '../hooks/usePremium';
import PaywallScreen from './PaywallScreen';

export default function PremiumGate({ children, featureName }) {
  const { isPremium, loading } = usePremium();

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;

  if (!isPremium) {
    return <PaywallScreen featureName={featureName} />;
  }

  return children;
}
