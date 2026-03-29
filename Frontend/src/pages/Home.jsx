import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.jpeg'; 
import { searchCertificate } from '../api/search';

const Home = () => {
  const [searchId, setSearchId] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      try {
        // Silently ping the backend to trigger the analytics log
        await searchCertificate(searchId.trim());
      } catch (err) {
        // We ignore errors here so the user is still navigated to the view page
        // even if the background tracking ping fails
      }
      
      // Navigate to the certificate view
      navigate(`/certificate/${searchId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gh-bg flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      
      {/* --- HERO SECTION --- */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <img src={logo} alt="Credify Logo" className="h-20 w-auto mx-auto mb-6 rounded-lg shadow-md" />
        
        <p className="text-lg text-gh-muted mb-8 px-4">
          The secure platform for issuing, managing, and verifying internship credentials.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-4 px-4">
          <Link 
            to="/sign-up" 
            className="w-full sm:w-auto flex justify-center items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gh-green hover:bg-gh-greenHover transition-colors shadow-sm"
          >
            Sign up for free
          </Link>
          <Link 
            to="/sign-in" 
            className="w-full sm:w-auto flex justify-center items-center px-6 py-2 border border-gh-border text-sm font-medium rounded-md text-gh-text bg-gh-canvas hover:bg-[#21262d] transition-colors shadow-sm"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* --- DIVIDER --- */}
      <div className="w-full max-w-md border-t border-gh-border mb-8 mt-4 relative">
        <div className="absolute inset-0 flex items-center justify-center -mt-6">
          <span className="bg-gh-bg px-4 text-xs font-semibold text-gh-muted uppercase tracking-widest">
            Public Verification
          </span>
        </div>
      </div>

      {/* --- PUBLIC SEARCH BOX --- */}
      <div className="max-w-md w-full bg-gh-canvas p-6 rounded-md shadow-sm border border-gh-border">
        <h2 className="text-sm font-semibold text-gh-text mb-2">Find a credential</h2>
        <p className="text-xs text-gh-muted mb-4">
          Enter a Certificate ID to verify its authenticity instantly. No account required.
        </p>
        <form className="space-y-4" onSubmit={handleSearch}>
          <div>
            <input
              type="text"
              required
              className="appearance-none rounded-md block w-full px-3 py-1.5 border border-gh-border bg-gh-bg text-sm text-gh-text focus:outline-none focus:ring-2 focus:ring-gh-link transition-colors"
              placeholder="e.g., AMDOX-2026-XYZ"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-1.5 px-4 border border-gh-border text-sm font-medium rounded-md text-gh-text bg-gh-bg hover:bg-[#21262d] transition-colors shadow-sm"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;