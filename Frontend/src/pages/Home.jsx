import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { searchCertificate } from '../api/search';

const Home = () => {
  const [searchId, setSearchId] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      try {
        await searchCertificate(searchId.trim());
      } catch (err) {
        // Ignore errors to ensure navigation still happens
      }
      navigate(`/certificate/${searchId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gh-bg text-gh-text selection:bg-gh-link selection:text-white font-sans overflow-x-hidden">
      
      {/* Custom Keyframes for 3D Floating Logo */}
      <style>{`
        @keyframes float3d {
          0% { transform: translateY(0px) rotateX(10deg) rotateY(-15deg); filter: drop-shadow(0 0 20px rgba(46, 160, 67, 0.2)); }
          50% { transform: translateY(-20px) rotateX(15deg) rotateY(-5deg); filter: drop-shadow(0 0 40px rgba(46, 160, 67, 0.6)); }
          100% { transform: translateY(0px) rotateX(10deg) rotateY(-15deg); filter: drop-shadow(0 0 20px rgba(46, 160, 67, 0.2)); }
        }
        .animate-float-3d {
          animation: float3d 6s ease-in-out infinite;
          transform-style: preserve-3d;
        }
        .perspective-container {
          perspective: 1000px;
        }
      `}</style>

      {/* --- HERO SECTION --- */}
      <div className="relative border-b border-gh-border">
        {/* Subtle background gradient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[rgba(46,160,67,0.05)] to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-36 flex flex-col lg:flex-row items-center gap-16 relative z-10">
          
          {/* LEFT: 3D Animated Logo Area */}
          <div className="flex-1 w-full perspective-container flex justify-center lg:justify-end lg:pr-12">
            <div className="animate-float-3d w-64 h-64 sm:w-80 sm:h-80 relative">
              {/* Pure Code SVG Replica of Credify Logo */}
              <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
                {/* Outer Shield Backing */}
                <path d="M100 15C100 15 45 25 20 40V110C20 160 55 205 100 225C145 205 180 160 180 110V40C155 25 100 15 100 15Z" fill="#161b22" stroke="#30363d" strokeWidth="6" strokeLinejoin="round"/>
                {/* Shield Inner Darker Left Side */}
                <path d="M100 15C100 15 45 25 20 40V110C20 160 55 205 100 225V15Z" fill="#0d1117" opacity="0.7"/>
                {/* Data Lines */}
                <rect x="55" y="70" width="50" height="8" rx="4" fill="#8b949e" opacity="0.8"/>
                <rect x="55" y="90" width="70" height="8" rx="4" fill="#8b949e" opacity="0.8"/>
                <rect x="55" y="110" width="40" height="8" rx="4" fill="#8b949e" opacity="0.8"/>
                {/* Huge Green Checkmark */}
                <path d="M65 150L90 175L150 100" stroke="#3fb950" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* RIGHT: Text & Inputs */}
          <div className="flex-1 w-full text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-4">
              {/* White "Cred" */}
              <span className="text-white">Cred</span>
              
              {/* Gray "i" with the Green Dot hack */}
              <span className="text-[#8b949e] relative inline-block">
                i
                <span className="absolute top-[0.12em] left-1/2 -translate-x-1/2 w-[0.18em] h-[0.18em] bg-[#3fb950] rounded-full"></span>
              </span>
              
              {/* Gray "fy" */}
              <span className="text-[#8b949e]">fy</span>
            </h1>
            <p className="text-lg text-gh-muted mb-8 max-w-xl mx-auto lg:mx-0">
              The enterprise-grade standard for issuing, managing, and forensically verifying Certificates on an immutable ledger.
            </p>

            {/* Auth Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10 justify-center lg:justify-start">
              <Link to="/sign-up" className="px-6 py-2.5 rounded-md text-sm font-medium text-white bg-gh-green hover:bg-gh-greenHover transition-colors shadow-sm text-center">
                Sign Up for free
              </Link>
              <Link to="/sign-in" className="px-6 py-2.5 rounded-md text-sm font-medium text-gh-text bg-gh-canvas border border-gh-border hover:bg-[#21262d] transition-colors shadow-sm text-center">
                Sign in
              </Link>
            </div>

            {/* Public Search Box */}
            <div className="bg-gh-canvas p-5 rounded-md shadow-sm border border-gh-border max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-gh-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <h2 className="text-sm font-semibold text-gh-text">Public Verification</h2>
              </div>
              <p className="text-xs text-gh-muted mb-4">Enter a valid Credential ID to run an instant forensic audit.</p>
              <form className="flex gap-2" onSubmit={handleSearch}>
                <input
                  type="text"
                  required
                  className="flex-1 rounded-md px-3 py-1.5 border border-gh-border bg-gh-bg text-sm text-gh-text focus:outline-none focus:ring-1 focus:ring-gh-link transition-colors"
                  placeholder="e.g., AMDOX-2026-XYZ"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
                <button type="submit" className="px-4 py-1.5 rounded-md text-sm font-medium text-gh-text bg-[#21262d] border border-gh-border hover:bg-[#30363d] transition-colors">
                  Audit
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>

      {/* --- FEATURES SECTION --- */}
      <div className="py-24 border-b border-gh-border bg-[#0d1117]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-white">Why choose Credify?</h2>
            <p className="mt-4 text-gh-muted">Engineered for security, designed for speed.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Cryptographic Audits', desc: 'Every certificate is hashed and cross-referenced. Any tampering instantly invalidates the credential.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
              { title: 'Automated Issuance', desc: 'Upload bulk Excel sheets. Our system instantly parses, saves, and generates verifiable PDFs for hundreds of students.', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
              { title: 'Analytics Engine', desc: 'Administrators get real-time insights into who is searching for credentials and when verification failures occur.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
            ].map((feature, i) => (
              <div key={i} className="bg-gh-canvas p-6 rounded-lg border border-gh-border hover:border-gh-muted transition-colors">
                <div className="w-10 h-10 rounded-md bg-[#21262d] flex items-center justify-center border border-[#30363d] mb-4 text-gh-link">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} /></svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gh-muted leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- ABOUT US (TEAM OF 3) --- */}
      <div className="py-24 border-b border-gh-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-white">The Architects</h2>
            <p className="mt-4 text-gh-muted">Built by developers, for developers.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Replace names/roles below with your actual team members */}
            {[
              { name: 'Chiranjit Das', role: 'Backend & Security', handle: '@chiranjit' },
              { name: 'Shikhar Verma', role: 'Full Stack Engineer', handle: '@shikhar' },
              { name: 'Katyayani Jaiswal', role: 'Frontend & UI/UX', handle: '@katyayani' }
            ].map((member, i) => (
              <div key={i} className="text-center p-6 bg-gh-canvas rounded-lg border border-gh-border flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-gh-link to-[#d2a8ff] mb-4 p-1">
                  <div className="w-full h-full bg-[#0d1117] rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {member.name.charAt(0)}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                <p className="text-sm text-gh-link mb-2">{member.handle}</p>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#21262d] border border-[#30363d] text-gh-muted">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- FAQ SECTION --- */}
      <div className="py-24 border-b border-gh-border bg-[#0d1117]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-white text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Is the public search really free?', a: 'Yes. Anyone can verify a credential ID instantly without needing to create an account.' },
              { q: 'What happens if data is tampered with?', a: 'Our forensic audit recalculates the cryptographic hash of the document. If it does not match the blockchain/database master record, it is flagged instantly.' },
              { q: 'Can organizations manage their own data?', a: 'Currently under development. Soon, organizations will be able to apply for an Org-Admin portal to issue their own credentials under the Super Admin review protocol.' }
            ].map((faq, i) => (
              <details key={i} className="group bg-gh-canvas border border-gh-border rounded-lg [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-white">
                  {faq.q}
                  <span className="transition group-open:rotate-180 text-gh-muted">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="px-4 pb-4 text-sm text-gh-muted">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* --- CONTACT / ASK A QUESTION --- */}
      <div className="py-24 border-b border-gh-border">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white">Get in touch</h2>
            <p className="mt-2 text-sm text-gh-muted">Have a question or want to report an issue? Drop us a line.</p>
          </div>
          
          <form className="bg-gh-canvas p-6 rounded-lg border border-gh-border space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Feature coming soon!"); }}>
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1">Email</label>
              <input type="email" className="w-full rounded-md px-3 py-2 border border-gh-border bg-gh-bg text-sm focus:outline-none focus:border-gh-link" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gh-text mb-1">Message</label>
              <textarea rows="4" className="w-full rounded-md px-3 py-2 border border-gh-border bg-gh-bg text-sm focus:outline-none focus:border-gh-link resize-none" placeholder="How can we help?"></textarea>
            </div>
            <button type="submit" className="w-full px-4 py-2 rounded-md text-sm font-medium text-white bg-gh-green hover:bg-gh-greenHover transition-colors">
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="py-10 bg-[#010409]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            {/* --- THE FIX: Replaced GitHub logo with simplified, branded Credify Shield icon --- */}
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-gh-link" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8 2 4 4 2 6v6c0 4 3 7 7 8 4-1 7-4 7-8V6c-2-2-6-4-10-4z"></path>
              <polyline points="6 11 9 14 15 8"></polyline>
            </svg>
            <span className="text-sm text-gh-muted">© 2026 Credify Protocol. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-sm text-gh-link">
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">API Docs</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;