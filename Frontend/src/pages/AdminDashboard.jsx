import { useState } from 'react';

const AdminDashboard = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus({ loading: false, error: null, success: null });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus({ ...status, error: 'Please select an Excel file first.' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setStatus({ loading: true, error: null, success: null });

    try {
      // Using native fetch because we are sending a file (FormData)
      const response = await fetch('/api/data/upload', {
        method: 'POST',
        body: formData, 
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      
      setStatus({ 
        loading: false, 
        error: null, 
        success: `Successfully uploaded ${data.inserted || 'the'} records!` 
      });
      setFile(null); 
    } catch (err) {
      setStatus({ 
        loading: false, 
        success: null, 
        error: err.message || 'Upload failed. Please check the file format.' 
      });
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Admin Control Panel</h2>
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h3>Upload Student Data</h3>
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="file" accept=".xlsx" onChange={handleFileChange} />
          <button type="submit" disabled={status.loading} style={{ padding: '10px', cursor: 'pointer' }}>
            {status.loading ? 'Uploading...' : 'Upload Excel File'}
          </button>
        </form>
        {status.error && <div style={{ color: 'red', marginTop: '15px' }}>{status.error}</div>}
        {status.success && <div style={{ color: 'green', marginTop: '15px' }}>{status.success}</div>}
      </div>
    </div>
  );
};

export default AdminDashboard;