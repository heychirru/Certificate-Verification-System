import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Home = () => {
  const [searchId, setSearchId] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/certificate/${searchId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      
      {/* --- HERO SECTION (The Main Focus) --- */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          <span className="text-purple-600">CVS</span> Portal
        </h1>
        <p className="text-lg text-gray-600 mb-10 px-4">
          The secure platform for issuing, managing, and verifying internship certificates. 
          Join as a student to access your records, or log in as an admin to manage credentials.
        </p>
        
        {/* The Auth Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4 px-4">
          <Link 
            to="/sign-up" 
            className="w-full sm:w-auto flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 md:text-lg transition-colors shadow-sm"
          >
            Sign Up
          </Link>
          <Link 
            to="/sign-in" 
            className="w-full sm:w-auto flex justify-center items-center px-8 py-3 border-2 border-purple-600 text-base font-medium rounded-md text-purple-600 bg-transparent hover:bg-purple-50 md:text-lg transition-colors shadow-sm"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* --- DIVIDER --- */}
      <div className="w-full max-w-md border-t border-gray-200 mb-10 relative mt-4">
        <div className="absolute inset-0 flex items-center justify-center -mt-6">
          <span className="bg-gray-50 px-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">
            Public Verification
          </span>
        </div>
      </div>

      {/* --- PUBLIC SEARCH BOX (For HR/Recruiters) --- */}
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Verify a Certificate</h2>
        <p className="text-sm text-gray-600 mb-6">
          No account needed. Enter a Certificate ID to verify its authenticity instantly.
        </p>
        <form className="space-y-4" onSubmit={handleSearch}>
          <div>
            <label htmlFor="certificate-id" className="sr-only">Certificate ID</label>
            <input
              id="certificate-id"
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              placeholder="e.g., AMDOX-2026-XYZ"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none transition-colors"
          >
            Search Database
          </button>
        </form>
      </div>

    </div>
  );
};

export default Home;