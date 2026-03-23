import { Routes, Route, Navigate } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import VerifyEmail from './pages/VerifyEmail'
import AuthCallback from './pages/AuthCallback'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPubKey) {
  console.error('❌ VITE_CLERK_PUBLISHABLE_KEY not found in .env.local')
  console.error('Please create Frontend/.env.local with: VITE_CLERK_PUBLISHABLE_KEY=your_key')
} else {
  console.log('✓ Clerk Public Key loaded:', clerkPubKey.substring(0, 20) + '...')
}

function App() {
  if (!clerkPubKey) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>❌ Configuration Error</h1>
        <p>VITE_CLERK_PUBLISHABLE_KEY is missing from Frontend/.env.local</p>
        <p>Please create the file and add your Clerk public key.</p>
      </div>
    )
  }

  return (
    <ClerkProvider 
      publishableKey={clerkPubKey}
      afterSignOutUrl="/sign-in"
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/auth-callback" element={<AuthCallback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ClerkProvider>
  )
}

export default App
