import { Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages 
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import VerifyEmail from './pages/VerifyEmail';
import AuthCallback from './pages/AuthCallback';
import { AuthLayout } from './pages/AuthLayout';

// Feature Pages 
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard'; // We will create this next!
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
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/certificate/:id" element={<CertificateView />} />
          
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Route>
          <Route path="/auth-callback" element={<AuthCallback />} />
          
          {/* SECURE: Admin Dashboard */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* SECURE: Student Dashboard */}
          <Route 
            path="/student" 
            element={
              <ProtectedRoute requireAdmin={false}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Fallback 404 */}
          <Route path="*" element={<div className="text-center mt-20"><h2 className="text-2xl font-bold">404 - Page Not Found</h2></div>} />
        </Routes>
      </AuthProvider>
    </ClerkProvider>
  );
}

export default App;