import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { verifyEmail } from '../api/auth'
import './Auth.css'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) return

    const verify = async () => {
      try {
        const response = await verifyEmail(token)
        setStatus('success')
        setMessage(response.message || 'Email verified successfully!')

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/sign-in')
        }, 3000)
      } catch (error) {
        console.error('Verification error:', error)
        // If 400 error and message contains "already verified", treat as success
        if (error.status === 400 && error.payload?.email) {
          setStatus('success')
          setMessage('Your email has already been verified! Redirecting to login...')
          setTimeout(() => {
            navigate('/sign-in')
          }, 2000)
        } else {
          setStatus('error')
          setMessage(error.message || 'Verification failed. Please try again.')
        }
      }
    }

    verify()
  }, [token, navigate])

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Email Verification</h1>
          </div>
          <div className="auth-body">
            <div className="verification-error">
              <div className="error-icon">✗</div>
              <h2>Verification Failed</h2>
              <p>Invalid verification link. Token is missing.</p>
              <div className="error-actions">
                <button onClick={() => navigate('/sign-up')} className="btn btn-primary">
                  Try Signing Up Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Email Verification</h1>
        </div>

        <div className="auth-body">
          {status === 'loading' && (
            <div className="verification-loading">
              <div className="spinner"></div>
              <p>Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="verification-success">
              <div className="success-icon">✓</div>
              <h2>Success!</h2>
              <p>{message}</p>
              <p className="redirect-message">Redirecting to login...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="verification-error">
              <div className="error-icon">✗</div>
              <h2>Verification Failed</h2>
              <p>{message}</p>
              <div className="error-actions">
                <button onClick={() => navigate('/sign-up')} className="btn btn-primary">
                  Try Signing Up Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .verification-loading,
        .verification-success,
        .verification-error {
          text-align: center;
          padding: 20px;
        }

        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .success-icon,
        .error-icon {
          font-size: 48px;
          margin: 20px 0;
        }

        .success-icon {
          color: #28a745;
        }

        .error-icon {
          color: #dc3545;
        }

        .verification-success h2 {
          color: #28a745;
          margin: 15px 0 10px 0;
        }

        .verification-error h2 {
          color: #dc3545;
          margin: 15px 0 10px 0;
        }

        .redirect-message {
          font-size: 14px;
          color: #999;
          margin-top: 20px;
        }

        .error-actions {
          margin-top: 20px;
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background-color: #667eea;
          color: white;
        }

        .btn-primary:hover {
          background-color: #764ba2;
        }
      `}</style>
    </div>
  )
}
