import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpeg';
import logo1 from '../assets/logo1.jpeg';

export default function StudentDashboard() {
  const { user, signOutLocal } = useAuth();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/certificate/${searchId.trim()}`);
    }
  };

  const handleLogout = () => {
    signOutLocal();
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      {/* Top Navigation Bar (GitHub Style) */}
      <header className="bg-gh-bg border-b border-gh-border px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={logo1} alt="Credify" className="w-8 h-8 rounded" />
          <span className="font-semibold text-sm text-gh-text">Credify <span className="text-gh-muted font-normal">/ Student Portal</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gh-muted hidden sm:inline-block">
            Signed in as <span className="font-semibold text-gh-text">{user?.name || 'Student'}</span>
          </span>
          <button 
            onClick={handleLogout}
            className="text-sm text-gh-muted hover:text-gh-link transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto mt-8 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-normal text-gh-text border-b border-gh-border pb-2">
            Your Credentials
          </h1>
        </div>

        <div className="bg-gh-canvas border border-gh-border rounded-md overflow-hidden">
          <div className="bg-gh-bg border-b border-gh-border px-4 py-3">
            <h3 className="text-sm font-semibold">Retrieve Certificate</h3>
          </div>
          
          <div className="p-4">
            <p className="text-sm text-gh-muted mb-4">
              Enter the unique Certificate ID provided by your internship coordinator. This will allow you to view, verify, and download your official document.
            </p>

            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="e.g., AMDOX-2026-XYZ"
                  className="block w-full max-w-md px-3 py-1.5 text-sm text-gh-text bg-gh-bg border border-gh-border rounded-md focus:outline-none focus:ring-2 focus:ring-gh-link focus:bg-white transition-colors"
                  required
                />
              </div>
              <div className="pt-2">
                <button 
                  type="submit" 
                  className="bg-gh-green text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-gh-greenHover transition-colors shadow-sm"
                >
                  Find Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}