import { Link } from 'react-router-dom'
import './Auth.css'

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-card" role="region" aria-labelledby="auth-title">
        <Link to="/" className="auth-brand">
          Certificate Verification
        </Link>
        <h1 id="auth-title" className="auth-heading">
          {title}
        </h1>
        {subtitle ? <p className="auth-subtitle">{subtitle}</p> : null}
        {children}
        {footer}
      </div>
    </div>
  )
}
