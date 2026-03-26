import { Routes, Route, Navigate } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import VerifyEmail from './pages/VerifyEmail'
import AuthCallback from './pages/AuthCallback'
import PublicVerify from './pages/PublicVerify'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPubKey) {
  console.error('❌ VITE_CLERK_PUBLISHABLE_KEY not found in .env.local')
  console.error('Please create Frontend/.env.local with: VITE_CLERK_PUBLISHABLE_KEY=your_key')
} else {
  console.log('✓ Clerk Public Key loaded:', clerkPubKey.substring(0, 20) + '...')
}

function App() {
  const appRoutes = (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify" element={<PublicVerify />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/auth-callback" element={<AuthCallback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )

  if (!clerkPubKey) return appRoutes

  return (
    <ClerkProvider 
      publishableKey={clerkPubKey}
      afterSignOutUrl="/sign-in"
    >
      {appRoutes}
    </ClerkProvider>
  )
}

export default App
