import { Link, Outlet, useLocation } from 'react-router-dom';
import logo from '../assets/logo.jpeg'; 

export function AuthLayout() {
  const location = useLocation();
  const isSignUp = location.pathname === '/sign-up';

  return (
    <div className="min-h-screen bg-gh-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      
      {/* Back to Home Button */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link 
          to="/" 
          className="flex items-center text-sm font-medium text-gh-muted hover:text-gh-link transition-colors group"
        >
          <svg className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img src={logo} alt="Credify Logo" className="h-16 w-auto mx-auto mb-4 rounded-md shadow-sm" />
        <h2 className="text-2xl font-light text-gh-text tracking-tight">
          {isSignUp ? 'Create your account' : 'Sign in to Credify'}
        </h2>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-gh-canvas py-6 px-4 shadow-sm rounded-md border border-gh-border sm:px-6">
          <Outlet />
        </div>
        
        {/* DYNAMIC FOOTER */}
        <div className="mt-4 text-center p-4 border border-gh-border rounded-md bg-transparent">
          <p className="text-sm text-gh-text">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <Link to="/sign-in" className="text-gh-link hover:underline">
                  Sign in.
                </Link>
              </>
            ) : (
              <>
                New to Credify?{' '}
                <Link to="/sign-up" className="text-gh-link hover:underline">
                  Create an account.
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}