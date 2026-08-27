import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import { requestNotificationPermission } from './lib/notifications'
import { ThemeProvider, useTheme } from './ThemeContext'
import { LanguageProvider, useLanguage } from './LanguageContext'
import LanguagePicker from './components/LanguagePicker'

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppInner />
      </ThemeProvider>
    </LanguageProvider>
  )
}

function AppInner() {
  const { theme } = useTheme()
  const { hasChosenLanguage } = useLanguage()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in (from a previous session)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for login/logout events and update the app automatically
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  // First thing a brand-new install sees: pick a language before anything else loads.
  if (!hasChosenLanguage) {
    return <LanguagePicker />
  }

  if (loading) {
    return (
      <div className="loading-screen" style={{ background: theme.bg, color: theme.text }}>
        <p>Loading Hisaab...</p>
      </div>
    )
  }

  // If no session exists, show login/signup screen
  // If session exists, show the main dashboard
  return session ? <Dashboard session={session} /> : <Auth />
}
