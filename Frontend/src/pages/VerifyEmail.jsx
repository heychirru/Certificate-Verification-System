import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../api/auth';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Token is missing.');
      return;
    }

    let cancelled = false;

    const verify = async () => {
      try {
        const response = await verifyEmail(token);

        if (cancelled) return;

        // Handle both "just verified" and "already verified" responses
        if (response.alreadyVerified) {
          setStatus('success');
          setMessage('Your email is already verified! Redirecting to login...');
        } else {
          setStatus('success');
          setMessage(response.message || 'Email verified successfully!');
        }

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/sign-in');
        }, 3000);
      } catch (error) {
        if (cancelled) return;
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Verification failed. The link may have expired.');
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [searchParams, navigate]);

  return (
    <div className="text-center py-8">
      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Tailwind animated spinner */}
          <div className="w-12 h-12 border-4 border-gray-100 border-t-purple-600 rounded-full animate-spin"></div>
          <h2 className="text-xl font-semibold text-gray-700">Verifying your email...</h2>
          <p className="text-sm text-gray-500">Please wait a moment.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <h2 className="text-2xl font-bold text-green-600">Verified!</h2>
          <p className="text-gray-600">{message}</p>
          <p className="text-sm text-gray-400 mt-4">Redirecting you to sign in...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <h2 className="text-2xl font-bold text-red-600">Verification Failed</h2>
          <p className="text-gray-600">{message}</p>
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => navigate('/sign-up')}
              className="px-4 py-2 border border-purple-600 text-purple-600 font-medium rounded-md hover:bg-purple-50 transition-colors"
            >
              Sign Up Again
            </button>
            <button
              onClick={() => navigate('/sign-in')}
              className="px-4 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}