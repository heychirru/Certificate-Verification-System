import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CertificateView = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [certData, setCertData] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: null });

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

  if (status.loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  if (status.error) return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>{status.error}</h2>
      <button onClick={() => navigate('/')} style={{ padding: '10px', cursor: 'pointer' }}>Go Back</button>
    </div>
  );

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h2>Certificate Found!</h2>
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', margin: '20px 0', textAlign: 'left' }}>
        <p><strong>Student Name:</strong> {certData.studentName}</p>
        <p><strong>Domain:</strong> {certData.internshipDomain}</p>
        <p><strong>Duration:</strong> {certData.duration}</p>
        <p><strong>Issue Date:</strong> {certData.issueDate}</p>
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={handleDownload} style={{ padding: '10px', cursor: 'pointer', background: '#aa3bff', color: 'white', border: 'none', borderRadius: '5px' }}>Download PDF</button>
        <button onClick={() => navigate('/')} style={{ padding: '10px', cursor: 'pointer' }}>Search Another</button>
      </div>
    </div>
  );
};

export default CertificateView;