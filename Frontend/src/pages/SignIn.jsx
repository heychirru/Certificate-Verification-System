import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { formatApiError } from '../api/client'
import { setAccessToken } from '../auth/token'
import { ClerkSignInButton } from '../components/ClerkAuthButtons'
import { PasswordField } from '../components/PasswordField'
import { AuthLayout } from './AuthLayout'
import { useAuth } from '../context/AuthContext'

export default function SignIn() {
  const showClerk = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const location = useLocation()
  const prefilledEmail = location.state?.registeredEmail ?? ''
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(() =>
    location.state?.registeredEmail
      ? 'Account created. Sign in with your email and password.'
      : null,
  )

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setPending(true)
    const form = e.target
    const data = new FormData(form)
    const email = String(data.get('email')).trim()
    const password = String(data.get('password'))

    try {
      const res = await login({ email, password })
      setAccessToken(res.accessToken)
      setUser(res.user || null)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Access your dashboard to issue and manage verifiable certificates."
      footer={
        <p className="auth-footer">
          New here?{' '}
          <Link to="/sign-up" className="auth-link">
            Create an account
          </Link>
        </p>
      }
    >
      {showClerk ? <ClerkSignInButton /> : null}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error ? (
          <p className="auth-message auth-message--error" role="alert">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="auth-message" role="status">
            {notice}
          </p>
        ) : null}
        <div className="auth-field">
          <label htmlFor="signin-email">Email</label>
          <input
            id="signin-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@organization.edu"
            defaultValue={prefilledEmail}
            required
          />
        </div>
        <PasswordField
          id="signin-password"
          name="password"
          label="Password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
        <div className="auth-row">
          <span />
          <button
            type="button"
            className="auth-link"
            onClick={() =>
              setNotice(
                'Password reset is not wired up yet. Add a reset endpoint when your backend is ready.',
              )
            }
          >
            Forgot password?
          </button>
        </div>
        <button className="auth-submit" type="submit" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  )
}
