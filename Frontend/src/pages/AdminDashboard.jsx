import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo1 from '../assets/logo1.jpeg';
import { listStudents, deleteStudent, uploadStudentsExcel } from '../api/students';
import { getSearchLogs } from '../api/search'; 

const AdminDashboard = () => {
  const { signOutLocal } = useAuth();
  const navigate = useNavigate();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('registry'); // 'registry' or 'analytics'

  // Registry State
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null, success: null });
  const [students, setStudents] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Analytics State
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // --- FETCHERS ---
  const fetchStudents = useCallback(async () => {
    setLoadingData(true);
    try {
      const res = await listStudents({ page: 1, limit: 100 });
      setStudents(res?.data || res || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await getSearchLogs(1, 50); // Fetch latest 50 logs
      setLogs(res?.logs || res || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  // --- LIFECYCLE ---
  useEffect(() => {
    if (activeTab === 'registry') fetchStudents();
    if (activeTab === 'analytics') fetchLogs();
  }, [activeTab, fetchStudents, fetchLogs]);

  // --- HANDLERS ---
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus({ loading: false, error: null, success: null });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setStatus({ ...status, error: 'Select an Excel file.' });

    setStatus({ loading: true, error: null, success: null });
    try {
      const res = await uploadStudentsExcel(file);
      setStatus({ loading: false, error: null, success: res?.message || 'Database Synced!' });
      setFile(null); 
      fetchStudents();
    } catch (err) {
      setStatus({ loading: false, success: null, error: err?.message || 'Upload failed.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete certificate ${id}?`)) return;
    try {
      await deleteStudent(id);
      fetchStudents();
    } catch (err) {
      alert('Failed to delete the record.');
    }
  };

  const filteredStudents = students.filter(s => 
    s.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.certificateId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.internshipDomain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gh-bg border-b border-gh-border px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={logo1} alt="Credify" className="w-8 h-8 rounded" />
          <span className="font-semibold text-sm text-gh-text">Credify <span className="text-gh-muted font-normal">/ Admin Portal</span></span>
        </div>
        <button onClick={() => { signOutLocal(); navigate('/'); }} className="text-sm text-gh-muted hover:text-gh-link transition-colors">
          Sign out
        </button>
      </header>

      <main className="max-w-6xl mx-auto mt-8 px-4 pb-12">
        <div className="mb-6 border-b border-gh-border flex justify-between items-end">
          <h1 className="text-2xl font-normal text-gh-text pb-4">System Management</h1>
          
          {/* GitHub Style Tabs */}
          <nav className="flex gap-4">
            <button 
              onClick={() => setActiveTab('registry')}
              className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'registry' ? 'text-gh-text border-b-2 border-[#f78166]' : 'text-gh-muted hover:text-gh-text'}`}
            >
              Credential Registry
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'analytics' ? 'text-gh-text border-b-2 border-[#f78166]' : 'text-gh-muted hover:text-gh-text'}`}
            >
              Search Analytics
            </button>
          </nav>
        </div>

        {/* --- REGISTRY TAB --- */}
        {activeTab === 'registry' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="lg:col-span-1">
              <div className="bg-gh-canvas border border-gh-border rounded-md overflow-hidden sticky top-6">
                <div className="bg-gh-bg border-b border-gh-border px-4 py-3">
                  <h3 className="text-sm font-semibold">Upload Student Data</h3>
                </div>
                <div className="p-4">
                  <form onSubmit={handleUpload} className="space-y-4">
                    <input type="file" accept=".xlsx" onChange={handleFileChange} className="block w-full text-sm text-gh-muted file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border file:border-gh-border file:text-sm file:font-medium file:bg-gh-bg file:text-gh-text hover:file:bg-[#21262d] cursor-pointer" />
                    {status.error && <div className="p-3 bg-gh-dangerBg text-gh-danger border border-[#fac7cb] text-sm rounded-md">{status.error}</div>}
                    {status.success && <div className="p-3 bg-[#13231a] text-[#3fb950] border border-[#2ea043] text-sm rounded-md">{status.success}</div>}
                    <button type="submit" disabled={status.loading} className="w-full bg-gh-green text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-gh-greenHover disabled:opacity-50 transition-colors shadow-sm">
                      {status.loading ? 'Uploading...' : 'Sync Database'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-gh-canvas border border-gh-border rounded-md overflow-hidden">
                <div className="bg-gh-bg border-b border-gh-border px-4 py-3 flex justify-between items-center">
                  <h3 className="text-sm font-semibold">Live Database</h3>
                  <input type="text" placeholder="Filter..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="px-3 py-1 text-sm bg-gh-canvas border border-gh-border rounded-md text-gh-text focus:outline-none focus:ring-1 focus:ring-gh-link w-48 transition-all" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#1c2128] border-b border-gh-border text-xs uppercase text-gh-muted">
                        <th className="px-4 py-3">Cert ID</th>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Domain</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gh-text">
                      {loadingData ? (
                        <tr><td colSpan="4" className="px-4 py-8 text-center text-gh-muted animate-pulse">Loading...</td></tr>
                      ) : filteredStudents.length === 0 ? (
                         <tr><td colSpan="4" className="px-4 py-8 text-center text-gh-muted">No records found.</td></tr>
                      ) : filteredStudents.map((s) => (
                        <tr key={s.certificateId} className="border-b border-gh-border hover:bg-[#1c2128]">
                          <td className="px-4 py-3 font-mono text-xs text-gh-link">{s.certificateId}</td>
                          <td className="px-4 py-3 font-medium">{s.studentName}</td>
                          <td className="px-4 py-3 text-gh-muted">{s.internshipDomain}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => handleDelete(s.certificateId)} className="text-gh-danger hover:text-white hover:bg-gh-danger px-2 py-1 rounded text-xs transition-colors">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ANALYTICS TAB --- */}
        {activeTab === 'analytics' && (
          <div className="bg-gh-canvas border border-gh-border rounded-md overflow-hidden animate-fade-in">
            <div className="bg-gh-bg border-b border-gh-border px-4 py-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-gh-text">Verification Audit Logs</h3>
                <p className="text-xs text-gh-muted mt-0.5">Tracking global API requests and manual searches.</p>
              </div>
              <button onClick={fetchLogs} className="p-1.5 text-gh-muted hover:text-gh-link border border-gh-border rounded-md hover:bg-[#21262d] transition-colors" title="Refresh Logs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1c2128] border-b border-gh-border text-xs uppercase text-gh-muted">
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Queried ID</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gh-text">
                  {loadingLogs ? (
                     <tr><td colSpan="4" className="px-4 py-8 text-center text-gh-muted animate-pulse">Fetching security logs...</td></tr>
                  ) : logs.length === 0 ? (
                     <tr><td colSpan="4" className="px-4 py-8 text-center text-gh-muted">No search logs recorded yet.</td></tr>
                  ) : logs.map((log) => (
                    <tr key={log._id} className="border-b border-gh-border hover:bg-[#1c2128]">
                      <td className="px-4 py-3 text-gh-muted">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-xs">{log.certificateId}</td>
                      <td className="px-4 py-3">
                        {log.found ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[#13231a] text-[#3fb950] border border-[#2ea043]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#3fb950]"></div> Found
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-gh-dangerBg text-gh-danger border border-[#fac7cb]">
                            <div className="w-1.5 h-1.5 rounded-full bg-gh-danger"></div> Missing
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gh-muted">{log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;