import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function usePremium() {
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setSubscription(data);
        const now = new Date();
        const trialActive = data.status === 'trial' && new Date(data.trial_end) > now;
        const paidActive = data.status === 'active' && (!data.current_period_end || new Date(data.current_period_end) > now);
        setIsPremium(trialActive || paidActive);
      }
      setLoading(false);
    }
    checkStatus();
  }, []);

  return { isPremium, loading, subscription };
}
