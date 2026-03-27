import { Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';

// Auth Pages 
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import VerifyEmail from './pages/VerifyEmail';
import AuthCallback from './pages/AuthCallback';
import { AuthLayout } from './pages/AuthLayout';

// Feature Pages 
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import CertificateView from './pages/CertificateView';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  if (!clerkPubKey) {
    return (
      <div className="p-8 text-center mt-20">
        <h1 className="text-2xl font-bold text-red-600">❌ Configuration Error</h1>
        <p className="mt-2 text-gray-600">VITE_CLERK_PUBLISHABLE_KEY is missing from Frontend/.env</p>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey} afterSignOutUrl="/sign-in">
      <Routes>
        {/* Public / Student Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/certificate/:id" element={<CertificateView />} />
        
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>
        
        {/* Clerk's hidden callback route for Google Login */}
        <Route path="/auth-callback" element={<AuthCallback />} />
        
        {/* Dashboards (Unprotected for now so we can design them) */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Fallback 404 Route */}
        <Route path="*" element={<div className="text-center mt-20"><h2 className="text-2xl font-bold">404 - Page Not Found</h2></div>} />
      </Routes>
    </ClerkProvider>
  );
}

export default App;