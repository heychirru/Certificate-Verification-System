import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { formatApiError } from '../api/client'
import { ClerkSignUpButton } from '../components/ClerkAuthButtons'
import { PasswordField } from '../components/PasswordField'
import { AuthLayout } from './AuthLayout'

export default function SignUp() {
  const showClerk = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)
  const [fieldError, setFieldError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setFieldError(null)
    const form = e.target
    const data = new FormData(form)
    const password = String(data.get('password'))
    const confirm = String(data.get('confirm'))
    if (password !== confirm) {
      setFieldError('Passwords do not match.')
      return
    }

    setPending(true)
    const name = String(data.get('name')).trim()
    const email = String(data.get('email')).trim()

    try {
      await register({ name, email, password })
      navigate('/sign-in', {
        replace: false,
        state: { registeredEmail: email },
      })
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Register your organization to start issuing certificates learners can verify."
      footer={
        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/sign-in" className="auth-link">
            Sign in
          </Link>
        </p>
      }
    >
      {showClerk ? <ClerkSignUpButton /> : null}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {fieldError ? (
          <p className="auth-message auth-message--error" role="alert">
            {fieldError}
          </p>
        ) : null}
        {error ? (
          <p className="auth-message auth-message--error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="auth-field">
          <label htmlFor="signup-name">Full name</label>
          <input
            id="signup-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            minLength={2}
            maxLength={100}
            required
          />
        </div>
        <div className="auth-field">
          <label htmlFor="signup-email">Work email</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@organization.edu"
            required
          />
        </div>
        <PasswordField
          id="signup-password"
          name="password"
          label="Password"
          autoComplete="new-password"
          placeholder="Strong password"
          minLength={8}
          required
        />
        <p className="auth-hint">
          Use at least 8 characters with one uppercase letter, one number, and one
          special character (@$!%*?&#).
        </p>
        <PasswordField
          id="signup-confirm"
          name="confirm"
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Repeat password"
          minLength={8}
          required
        />
        <label className="auth-checkbox">
          <input name="terms" type="checkbox" required />
          <span>
            I agree to the terms of service and understand that credentials are
            stored according to your organization&apos;s policy.
          </span>
        </label>
        <button className="auth-submit" type="submit" disabled={pending}>
          {pending ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}
