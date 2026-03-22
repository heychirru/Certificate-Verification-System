import { Link } from 'react-router-dom'
import './Home.css'

export default function Home() {
  return (
    <div className="home">
      <header className="home-header">
        <span className="home-logo">Certificate Verification</span>
        <nav className="home-nav" aria-label="Account">
          <Link to="/sign-in" className="home-nav-link">
            Sign in
          </Link>
          <Link to="/sign-up" className="home-nav-cta">
            Sign up
          </Link>
        </nav>
      </header>
      <main className="home-main">
        <h1 className="home-title">Verify credentials with confidence</h1>
        <p className="home-lead">
          Issue digital certificates and let employers or institutions confirm
          them instantly—without exposing more data than necessary.
        </p>
        <div className="home-actions">
          <Link to="/sign-up" className="home-btn home-btn-primary">
            Get started
          </Link>
          <Link to="/sign-in" className="home-btn home-btn-ghost">
            I have an account
          </Link>
        </div>
      </main>
    </div>
  )
}
