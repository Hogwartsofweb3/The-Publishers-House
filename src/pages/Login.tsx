import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

export function LoginPage() {
  const { user, loading, login } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: { pathname?: string } } | null)?.from
    ?.pathname

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    return <Navigate to={from || '/'} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email.trim(), password)
    } catch {
      setError('Sign-in failed. Check your email and password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <img src="/logo.png" alt="The Publishers House" className="login-logo" />
        <p className="login-brand">The Publishers House</p>
        <h1 className="login-title">Content Management System</h1>
        <p className="login-lead">
          Sign in to publish sermons, events, articles, programs, and leadership.
        </p>

        <form className="login-form" onSubmit={(e) => void handleSubmit(e)}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error ? <p className="login-error" role="alert">{error}</p> : null}

          <button type="submit" className="login-submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="login-tagline">Company of the Great</p>
      </div>
    </div>
  )
}
