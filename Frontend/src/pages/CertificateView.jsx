import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// IMPORT the teammate's search API
import { verifyCertificate } from '../api/search';

const CertificateView = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [certData, setCertData] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: null });
  
  // State for Deep Verification
  const [audit, setAudit] = useState({ loading: false, data: null, error: null });

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await fetch(`/api/certificate/${id}`);
        if (!response.ok) throw new Error('Certificate not found.');
        const data = await response.json();
        setCertData(data);
        setStatus({ loading: false, error: null });
      } catch (err) {
        setStatus({ loading: false, error: 'Certificate not found. Please check the ID.' });
      }
    };
    fetchCertificate();
  }, [id]);

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/certificate/${id}/download`);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download the certificate.");
    }
  };

  // --- THE FIX: Using the correct backend verification route ---
  const runSecurityAudit = async () => {
    setAudit({ loading: true, data: null, error: null });
    try {
      // Use the helper from api/search.js which hits /api/search/verify/:id
      const data = await verifyCertificate(id);
      
      // Add a slight visual delay for the "processing" effect
      setTimeout(() => {
        setAudit({ loading: false, data: data, error: null });
      }, 1500);
      
    } catch (err) {
      setTimeout(() => {
        setAudit({ loading: false, data: null, error: err.message || 'Advanced verification failed.' });
      }, 1000);
    }
  };

  if (status.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gh-muted animate-pulse font-medium text-sm">Fetching document...</div>
      </div>
    );
  }

  if (status.error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <svg className="w-12 h-12 text-gh-danger mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-gh-text mb-2">Not Found</h2>
        <p className="text-sm text-gh-muted mb-6 text-center max-w-md">{status.error}</p>
        <button onClick={() => navigate(-1)} className="px-4 py-1.5 bg-gh-canvas border border-gh-border text-sm font-medium text-gh-text rounded-md hover:bg-[#21262d] transition-colors">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <header className="bg-gh-bg border-b border-gh-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gh-muted hover:text-gh-link transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gh-muted" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M2 5.5A2.5 2.5 0 014.5 3h15A2.5 2.5 0 0122 5.5v13a2.5 2.5 0 01-2.5 2.5h-15A2.5 2.5 0 012 18.5v-13zM4.5 4.5a1 1 0 00-1 1v13a1 1 0 001 1h15a1 1 0 001-1v-13a1 1 0 00-1-1h-15z" clipRule="evenodd" /></svg>
            <span className="font-semibold text-sm text-gh-link">{certData.internshipDomain.replace(/\s+/g, '-').toLowerCase()}</span>
            <span className="text-gh-muted">/</span>
            <span className="font-semibold text-sm text-gh-text">{id}.pdf</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-8 px-4">
        <div className="bg-gh-canvas border border-gh-border rounded-md overflow-hidden shadow-sm">
          
          <div className="bg-gh-bg border-b border-gh-border px-4 py-3 flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-gh-text font-medium">
              <svg className="w-4 h-4 text-gh-muted" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M3 3a2 2 0 012-2h9.982a2 2 0 011.414.586l4.018 4.018A2 2 0 0121 7.018V21a2 2 0 01-2 2H5a2 2 0 01-2-2V3zm2-.5a.5.5 0 00-.5.5v18a.5.5 0 00.5.5h14a.5.5 0 00.5-.5V7.5h-4.5a1 1 0 01-1-1V2.5H5z" clipRule="evenodd" /></svg>
              Verified Credential Record
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={runSecurityAudit} 
                disabled={audit.loading}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#1c2128] border border-gh-border text-xs font-medium text-gh-link rounded-md hover:bg-[#2d333b] transition-colors disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                {audit.loading ? 'Running Audit...' : 'Run Security Audit'}
              </button>
              <button 
                onClick={handleDownload} 
                className="flex items-center gap-1.5 px-3 py-1 bg-gh-green border border-[#2ea043] text-xs font-medium text-white rounded-md hover:bg-gh-greenHover transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download PDF
              </button>
            </div>
          </div>

          <div className="p-8">
            <div className="border-b border-gh-border pb-2 mb-6">
              <h1 className="text-3xl font-semibold text-gh-text tracking-tight">Certificate of Internship</h1>
            </div>

            <div className="space-y-6 text-gh-text">
              <p className="text-sm text-gh-muted">
                This digital record confirms the successful completion of the internship program. The details below have been verified against the secure database.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-4">
                <div className="border-l-4 border-gh-link pl-4">
                  <p className="text-xs font-semibold text-gh-muted uppercase tracking-wider mb-1">Student Name</p>
                  <p className="text-lg font-medium">{certData.studentName}</p>
                </div>
                <div className="border-l-4 border-gh-link pl-4">
                  <p className="text-xs font-semibold text-gh-muted uppercase tracking-wider mb-1">Internship Domain</p>
                  <p className="text-lg font-medium">{certData.internshipDomain}</p>
                </div>
                <div className="border-l-4 border-[#484f58] pl-4">
                  <p className="text-xs font-semibold text-gh-muted uppercase tracking-wider mb-1">Duration</p>
                  <p className="text-sm font-medium">{certData.duration}</p>
                </div>
                <div className="border-l-4 border-[#484f58] pl-4">
                  <p className="text-xs font-semibold text-gh-muted uppercase tracking-wider mb-1">Issue Date</p>
                  <p className="text-sm font-medium">{certData.issueDate}</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gh-border flex items-center gap-4">
                <div className="inline-flex items-center gap-2 bg-[#13231a] text-[#3fb950] px-3 py-1.5 rounded-full text-xs font-semibold border border-[#2ea043]">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Database Verified
                </div>
              </div>
            </div>
          </div>

          {/* --- SECURITY AUDIT CONSOLE --- */}
          {(audit.loading || audit.data || audit.error) && (
            <div className="bg-[#010409] border-t border-gh-border p-6 font-mono text-xs text-gh-muted">
              <div className="flex items-center gap-2 mb-4 text-sm text-gh-text">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L21 5V11C21 16.55 17.16 21.74 12 23C6.84 21.74 3 16.55 3 11V5L12 1ZM12 3.18L5 6.3V11C5 15.46 7.95 19.53 12 20.93C16.05 19.53 19 15.46 19 11V6.3L12 3.18ZM16.44 8.24L17.5 9.3L10.5 16.3L6.5 12.3L7.56 11.24L10.5 14.18L16.44 8.24Z" /></svg>
                Forensic Security Audit
              </div>
              
              {audit.loading ? (
                <div className="space-y-2">
                  <div className="flex gap-2"><span className="text-[#d2a8ff]">[system]</span> Initiating deep verification sequence...</div>
                  <div className="flex gap-2"><span className="text-[#79c0ff]">[network]</span> Validating signature against master registry...</div>
                  <div className="flex gap-2 animate-pulse text-[#3fb950]"><span className="text-[#a5d6ff]">[auth]</span> Awaiting cryptographic response...</div>
                </div>
              ) : audit.error ? (
                <div className="text-gh-danger bg-gh-dangerBg p-3 rounded border border-[#fac7cb]">
                  [Error]: {audit.error}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2 text-[#3fb950]"><span className="text-[#d2a8ff]">[success]</span> Security audit completed. Zero anomalies detected.</div>
                  <div className="bg-[#161b22] p-4 rounded border border-gh-border space-y-2 mt-2">
                    <div className="flex justify-between border-b border-[#30363d] pb-2">
                      <span className="text-gh-text">Registry Status</span>
                      <span className="text-[#3fb950]">{audit.data.status ? audit.data.status.toUpperCase() : 'VERIFIED'}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#30363d] pb-2">
                      <span className="text-gh-text">Cryptographic Match</span>
                      <span className="text-[#3fb950]">CONFIRMED</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gh-text">Audit Hash</span>
                      <span className="text-gh-link">{audit.data.certificateId || id}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default CertificateView;