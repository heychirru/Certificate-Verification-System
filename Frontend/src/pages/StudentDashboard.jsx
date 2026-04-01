import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo1 from '../assets/logo1.jpeg';
import { API_BASE_URL } from '../api/client';
import { getAccessToken } from '../auth/token';

export default function StudentDashboard() {
  const { user, signOutLocal } = useAuth();
  const navigate = useNavigate();
  
  // Tab State
  const [activeTab, setActiveTab] = useState('search'); // 'search' or 'wallet'
  const [searchId, setSearchId] = useState('');
  
  // Wallet State
  const [savedCerts, setSavedCerts] = useState([]);
  const [loadingWallet, setLoadingWallet] = useState(false);

  // Fetch Saved Certificates
  const fetchWallet = useCallback(async () => {
    setLoadingWallet(true);
    try {
      const token = getAccessToken();
      const response = await fetch(`${API_BASE_URL}/api/user/wallet`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSavedCerts(data.savedCertificates || []);
      }
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
    } finally {
      setLoadingWallet(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'wallet') {
      fetchWallet();
    }
  }, [activeTab, fetchWallet]);

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
      {/* Top Navigation Bar */}
      <header className="bg-gh-bg border-b border-gh-border px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={logo1} alt="Credify" className="w-8 h-8 rounded" />
          <span className="font-semibold text-sm text-gh-text">Credify <span className="text-gh-muted font-normal">/ Student Portal</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gh-muted hidden sm:inline-block">
            Signed in as <span className="font-semibold text-gh-text">{user?.name || 'Student'}</span>
          </span>
          <button onClick={handleLogout} className="text-sm text-gh-muted hover:text-gh-link transition-colors">
            Sign out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto mt-8 px-4 pb-12">
        <div className="mb-6 border-b border-gh-border flex justify-between items-end">
          <h1 className="text-2xl font-normal text-gh-text pb-4">
            Your Credentials
          </h1>
          
          {/* GitHub Style Tabs */}
          <nav className="flex gap-4">
            <button 
              onClick={() => setActiveTab('search')}
              className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'search' ? 'text-gh-text border-b-2 border-[#f78166]' : 'text-gh-muted hover:text-gh-text'}`}
            >
              Find Credential
            </button>
            <button 
              onClick={() => setActiveTab('wallet')}
              className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'wallet' ? 'text-gh-text border-b-2 border-[#f78166]' : 'text-gh-muted hover:text-gh-text flex items-center gap-2'}`}
            >
              Issued Documents
              <span className="bg-[#21262d] text-gh-text text-xs py-0.5 px-2 rounded-full border border-gh-border">{savedCerts.length || 0}</span>
            </button>
          </nav>
        </div>

        {/* --- TAB 1: SEARCH --- */}
        {activeTab === 'search' && (
          <div className="bg-gh-canvas border border-gh-border rounded-md overflow-hidden animate-fade-in max-w-2xl">
            <div className="bg-gh-bg border-b border-gh-border px-4 py-3">
              <h3 className="text-sm font-semibold">Retrieve Certificate</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-gh-muted mb-4">
                Enter the unique Certificate ID provided by your internship coordinator. This will allow you to view, verify, and save your official document.
              </p>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="e.g., AMDOX-2026-XYZ"
                    className="block w-full max-w-md px-3 py-1.5 text-sm text-gh-text bg-gh-bg border border-gh-border rounded-md focus:outline-none focus:ring-1 focus:ring-gh-link transition-colors"
                    required
                  />
                </div>
                <div className="pt-2">
                  <button type="submit" className="bg-gh-green text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-gh-greenHover transition-colors shadow-sm">
                    Find Certificate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- TAB 2: WALLET / ISSUED DOCUMENTS --- */}
        {activeTab === 'wallet' && (
          <div className="bg-gh-canvas border border-gh-border rounded-md overflow-hidden animate-fade-in">
            <div className="bg-gh-bg border-b border-gh-border px-4 py-3">
              <h3 className="text-sm font-semibold">Digital Wallet</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1c2128] border-b border-gh-border text-xs uppercase text-gh-muted">
                    <th className="px-4 py-3">Certificate ID</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gh-text">
                  {loadingWallet ? (
                    <tr><td colSpan="3" className="px-4 py-8 text-center text-gh-muted animate-pulse">Loading wallet...</td></tr>
                  ) : savedCerts.length === 0 ? (
                    <tr><td colSpan="3" className="px-4 py-8 text-center text-gh-muted">Your wallet is empty. Search for a certificate to save it here.</td></tr>
                  ) : (
                    savedCerts.map((certId) => (
                      <tr key={certId} className="border-b border-gh-border hover:bg-[#1c2128]">
                        <td className="px-4 py-3 font-mono text-xs text-gh-link">{certId}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[#13231a] text-[#3fb950] border border-[#2ea043]">
                            Verified
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link to={`/certificate/${certId}`} className="text-gh-link hover:underline text-xs">
                            View Document
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}