import { useClerk, useSignIn, useSignUp } from '@clerk/clerk-react'
import { useCallback, useState } from 'react'
import './ClerkAuthButtons.css'

export function ClerkSignInButton() {
  const { signIn, isLoaded: signInLoaded } = useSignIn()
  const { loaded: clerkLoaded } = useClerk()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleOAuthSignIn = useCallback(
    async (provider) => {
      try {
        setLoading(true)
        setError(null)

        if (!signIn || !clerkLoaded) {
          throw new Error('Clerk is not loaded yet. Please wait a moment.')
        }

        await signIn.authenticateWithRedirect({
          strategy: `oauth_${provider}`,
          redirectUrl: `${window.location.origin}/auth-callback`,
          redirectUrlComplete: `${window.location.origin}/auth-callback`,
        })
      } catch (err) {
        console.error('❌ OAuth error:', err)
        setError(err?.message || 'Failed to sign in. Please try again.')
        setLoading(false)
      }
    },
    [signIn, clerkLoaded]
  )

  const isReady = signInLoaded && clerkLoaded && signIn

  return (
    <div className="clerk-auth-buttons">
      <p className="divider">Or continue with</p>
      {error && (
        <p style={{ color: '#dc3545', fontSize: '12px', textAlign: 'center', marginBottom: '10px' }}>
          ⚠️ {error}
        </p>
      )}
      <div className="oauth-buttons">
        <button
          type="button"
          className="oauth-button github"
          onClick={() => handleOAuthSignIn('github')}
          disabled={loading || !isReady}
          title={!isReady ? 'Clerk is loading...' : 'Sign in with GitHub'}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span>{loading ? 'Signing in...' : 'GitHub'}</span>
        </button>
        <button
          type="button"
          className="oauth-button google"
          onClick={() => handleOAuthSignIn('google')}
          disabled={loading || !isReady}
          title={!isReady ? 'Clerk is loading...' : 'Sign in with Google'}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032 0-3.331 2.701-6.032 6.033-6.032 1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.675-1.566-3.884-2.527-6.735-2.527-5.566 0-10.082 4.516-10.082 10.082s4.516 10.082 10.082 10.082c5.326 0 9.844-3.853 10.845-9.023h-10.845z" />
          </svg>
          <span>{loading ? 'Signing in...' : 'Google'}</span>
        </button>
      </div>
    </div>
  )
}

export function ClerkSignUpButton() {
  const { signUp, isLoaded: signUpLoaded } = useSignUp()
  const { loaded: clerkLoaded } = useClerk()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleOAuthSignUp = useCallback(
    async (provider) => {
      try {
        setLoading(true)
        setError(null)

        if (!signUp || !clerkLoaded) {
          throw new Error('Clerk is not loaded yet. Please wait a moment.')
        }

        await signUp.authenticateWithRedirect({
          strategy: `oauth_${provider}`,
          redirectUrl: `${window.location.origin}/auth-callback`,
          redirectUrlComplete: `${window.location.origin}/auth-callback`,
        })
      } catch (err) {
        console.error('❌ OAuth error:', err)
        setError(err?.message || 'Failed to sign up. Please try again.')
        setLoading(false)
      }
    },
    [signUp, clerkLoaded]
  )

  const isReady = signUpLoaded && clerkLoaded && signUp

  return (
    <div className="clerk-auth-buttons">
      <p className="divider">Or sign up with</p>
      {error && (
        <p style={{ color: '#dc3545', fontSize: '12px', textAlign: 'center', marginBottom: '10px' }}>
          ⚠️ {error}
        </p>
      )}
      <div className="oauth-buttons">
        <button
          type="button"
          className="oauth-button github"
          onClick={() => handleOAuthSignUp('github')}
          disabled={loading || !isReady}
          title={!isReady ? 'Clerk is loading...' : 'Sign up with GitHub'}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span>{loading ? 'Signing up...' : 'GitHub'}</span>
        </button>
        <button
          type="button"
          className="oauth-button google"
          onClick={() => handleOAuthSignUp('google')}
          disabled={loading || !isReady}
          title={!isReady ? 'Clerk is loading...' : 'Sign up with Google'}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032 0-3.331 2.701-6.032 6.033-6.032 1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.675-1.566-3.884-2.527-6.735-2.527-5.566 0-10.082 4.516-10.082 10.082s4.516 10.082 10.082 10.082c5.326 0 9.844-3.853 10.845-9.023h-10.845z" />
          </svg>
          <span>{loading ? 'Signing up...' : 'Google'}</span>
        </button>
      </div>
    </div>
  )
}