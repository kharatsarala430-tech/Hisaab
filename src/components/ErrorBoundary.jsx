import { Component } from 'react'

/**
 * Hisaab — Error Boundary (diagnostic tool)
 * ---------------------------------------------------
 * Save as: src/components/ErrorBoundary.jsx
 *
 * Wraps any component. If that component crashes during render,
 * this catches it and shows the real error message on-screen
 * instead of a blank/black screen — no computer/console needed.
 *
 * Usage in Dashboard.jsx:
 *   <ErrorBoundary>
 *     <UdhaarTracker userId={session.user.id} />
 *   </ErrorBoundary>
 */

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Caught by ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: 16, margin: '10px 0', borderRadius: 12,
          background: '#1A0A0A', border: '1px solid #F87171',
          color: '#F87171', fontSize: 13, lineHeight: 1.5,
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            ⚠️ Screen crash hui — yeh error hai:
          </div>
          <div>{this.state.error.message || String(this.state.error)}</div>
          {this.state.error.stack && (
            <div style={{ marginTop: 10, fontSize: 11, color: '#B87171', opacity: 0.8 }}>
              {this.state.error.stack.split('\n').slice(0, 4).join('\n')}
            </div>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
