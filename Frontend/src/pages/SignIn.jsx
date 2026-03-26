import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSignIn, useClerk } from '@clerk/clerk-react';
import { login } from '../api/auth';
import { formatApiError } from '../api/client';
import { setAccessToken } from '../auth/token';

// --- NEW: A tiny utility to read the role inside the JWT token ---
const decodeJWT = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  
  const [notice, setNotice] = useState(
    location.state?.registeredEmail ? 'Account created! Please check your email for the verification link before signing in.' : null
  );

  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { loaded: clerkLoaded } = useClerk();

  const handleGoogleSignIn = async () => {
    try {
      if (!signIn || !clerkLoaded) return;
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: `${window.location.origin}/auth-callback`,
        redirectUrlComplete: `${window.location.origin}/auth-callback`,
      });
    } catch (err) {
      setError('Failed to initialize Google Sign-In.');
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setPending(true);
    
    const form = e.target;
    const data = new FormData(form);
    const email = String(data.get('email')).trim();
    const password = String(data.get('password'));

    try {
      const res = await login({ email, password });
      
      // 1. Save the token
      setAccessToken(res.accessToken);
      
      // 2. Decode the token to see who just logged in
      const decodedUser = decodeJWT(res.accessToken);
      
      // 3. Route them based on their role!
      if (decodedUser?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        // If they are a student, send them to the home page (or a student dashboard later)
        navigate('/', { replace: true }); 
      }
      
    } catch (err) {
      setError(formatApiError(err));
      setPending(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Sign in to your account</h2>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">{error}</div>}
      {notice && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-md border border-green-200">{notice}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email address</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            placeholder="you@university.edu"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            name="password"
            type="password"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
        >
          {pending ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleGoogleSignIn}
            type="button"
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/sign-up" className="font-medium text-purple-600 hover:text-purple-500">
          Sign up
        </Link>
      </p>
    </div>
  );
}