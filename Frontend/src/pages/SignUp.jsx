import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignIn, useClerk } from '@clerk/clerk-react';
import { register } from '../api/auth';
import { formatApiError } from '../api/client';

export default function SignUp() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  // Clerk hooks for Google Sign-Up
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { loaded: clerkLoaded } = useClerk();

  const handleGoogleSignUp = async () => {
    try {
      if (!signIn || !clerkLoaded) return;
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: `${window.location.origin}/auth-callback`,
        redirectUrlComplete: `${window.location.origin}/auth-callback`,
      });
    } catch (err) {
      setError('Failed to initialize Google Sign-Up.');
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const form = e.target;
    const data = new FormData(form);
    
    const password = String(data.get('password'));
    const confirm = String(data.get('confirm'));
    
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setPending(true);
    const name = String(data.get('name')).trim();
    const email = String(data.get('email')).trim();

    try {
      await register({ name, email, password });
      // Redirect to sign-in and pass the email state to trigger the green notice
      navigate('/sign-in', { state: { registeredEmail: email } });
    } catch (err) {
      setError(formatApiError(err));
      setPending(false);
    }
  }

 return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-gh-dangerBg border border-[#fac7cb] text-gh-danger text-sm rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gh-text mb-1">Full Name</label>
          <input
            name="name"
            type="text"
            required
            className="appearance-none block w-full px-3 py-1.5 border border-gh-border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gh-link text-sm bg-gh-bg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gh-text mb-1">Email address</label>
          <input
            name="email"
            type="email"
            required
            className="appearance-none block w-full px-3 py-1.5 border border-gh-border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gh-link text-sm bg-gh-bg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gh-text mb-1">Password</label>
          <input
            name="password"
            type="password"
            required
            className="appearance-none block w-full px-3 py-1.5 border border-gh-border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gh-link text-sm bg-gh-bg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gh-text mb-1">Confirm Password</label>
          <input
            name="confirm"
            type="password"
            required
            className="appearance-none block w-full px-3 py-1.5 border border-gh-border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gh-link text-sm bg-gh-bg"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full flex justify-center py-1.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gh-green hover:bg-gh-greenHover focus:outline-none disabled:opacity-50"
        >
          {pending ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div className="relative mt-6 mb-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gh-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gh-canvas text-gh-muted font-medium">OR</span>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleGoogleSignUp}
          type="button"
          className="w-full flex items-center justify-center px-4 py-1.5 border border-gh-border shadow-sm text-sm font-medium rounded-md text-gh-text bg-gh-bg hover:bg-gray-50 focus:outline-none transition-colors"
        >
          {/* Same Google SVG as SignIn */}
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16v-3.4h3.53c.47 1.4 1.79 2.42 3.34 2.42z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V6.51H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 5.49l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.51l3.66 2.84c.87-2.6 3.3-4.47 6.16-4.47z" fill="#EA4335"/>
          </svg>
          Sign up with Google
        </button>
      </div>
    </>
  );
}