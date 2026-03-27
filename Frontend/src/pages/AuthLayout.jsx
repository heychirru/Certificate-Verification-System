import { Link, Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      
      {/* --- NEW: Back to Home Button --- */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link 
          to="/" 
          className="flex items-center text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors group"
        >
          <svg 
            className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>
      {/* -------------------------------- */}

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="text-3xl font-extrabold text-purple-600 hover:text-purple-700 transition-colors">
          CVS
        </Link>
        <h2 className="mt-2 text-sm text-gray-600">Certificate Verification System</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          {/* Outlet is where React Router injects SignIn, SignUp, or VerifyEmail */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}