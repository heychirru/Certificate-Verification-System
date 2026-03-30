import { useSession } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clerkTokenExchange } from '../api/auth'
import { setAccessToken } from '../auth/token'
import { useAuth } from '../context/AuthContext'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { session, isLoaded } = useSession()
  const [error, setError] = useState(null)
  const { setUser } = useAuth()

  useEffect(() => {
    if (!isLoaded) return

    if (!session) {
      console.log('No session found, redirecting to sign-in')
      navigate('/sign-in', { replace: true })
      return
    }

    console.log('✓ Session loaded, exchanging token...')

    // Exchange Clerk token for JWT
    const exchangeToken = async () => {
      try {
        let token;
        
        // Try to get token with custom template first
        try {
          token = await session.getToken({ template: 'integration_jwt' })
          console.log('✓ Using integration_jwt template')
        } catch (templateErr) {
          console.log('⚠️ Custom template not found, using default Clerk token:', templateErr.message)
          // Fall back to default token without template
          token = await session.getToken()
        }

        console.log('✓ Clerk token obtained, length:', token?.length)

        if (!token) {
          throw new Error('Failed to get Clerk token')
        }

        const res = await clerkTokenExchange(token)
        console.log('✓ Token exchange successful:',res)

        setAccessToken(res.accessToken)
        // 3. UPDATE THE GLOBAL STATE! <-- ADD THIS LINE
        setUser(res.user)
        // Route them based on their role
        navigate(res.user?.role === 'admin' ? '/admin' : '/student', { replace: true })
        setTimeout(() => {
          navigate('/', { replace: true })
        }, 500)
      } catch (err) {
        console.error('❌ Token exchange error:', err)
        setError(err.message || 'Token exchange failed')
        setTimeout(() => {
          navigate('/sign-in', { replace: true })
        }, 2000)
      }
    }

    exchangeToken()
  }, [isLoaded, session, navigate])

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#dc3545', fontWeight: 'bold' }}>Error: {error}</p>
            <p style={{ color: '#666', marginTop: '10px' }}>Redirecting to sign in...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto',
          }}
        ></div>
        <p style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>Completing sign in...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}
