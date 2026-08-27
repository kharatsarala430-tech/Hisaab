import { useState } from 'react'
import { supabase } from '../lib/supabase'
import QuickGuideModal from './QuickGuideModal'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showGuide, setShowGuide] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isSignUp) {
      // Create a new account
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage(error.message)
      } else {
        setMessage('Account created! You can now log in.')
        setIsSignUp(false)
      }
    } else {
      // Log in to existing account
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage(error.message)
      }
      // If successful, App.jsx automatically detects the session and shows Dashboard
    }

    setLoading(false)
  }

  return (
    <div className="auth-container">
      <h1>Hisaab</h1>
      <p className="tagline">Your Smart Personal Finance Companion</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Log In'}
        </button>

        {message && <p className="auth-message">{message}</p>}

        <button
          type="button"
          className="toggle-mode"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? 'Already have an account? Log in' : "New here? Create an account"}
        </button>
      </form>

      {/* Floating Quick Guide button */}
      <button
        onClick={() => setShowGuide(true)}
        aria-label="Quick Guide"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 20,
          width: 52,
          height: 52,
          borderRadius: '50%',
          border: 'none',
          background: '#5b6ee8',
          color: '#fff',
          fontSize: 20,
          fontWeight: 600,
          boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          zIndex: 900,
        }}
      >
        ?
      </button>

      {showGuide && <QuickGuideModal onClose={() => setShowGuide(false)} />}
    </div>
  )
}
