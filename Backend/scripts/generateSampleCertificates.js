const XLSX = require('xlsx');
const path = require('path');

// Sample certificate data
const certificateData = [
  {
    'Certificate ID': 'CERT-001',
    'Student Name': 'Aarav Sharma',
    'Student Email': 'aarav.sharma@email.com',
    'Student ID': 'STU-001',
    'Course Name': 'Full Stack Web Development',
    'Issue Date': '2026-01-15',
    'Expiry Date': '2027-01-15',
    'Grade': 'A+',
    'Score': 95,
    'Verification Code': 'VER-ABC123XYZ',
    'Institution Name': 'Navodita Infotech',
    'Status': 'Active'
  },
  {
    'Certificate ID': 'CERT-002',
    'Student Name': 'Priya Patel',
    'Student Email': 'priya.patel@email.com',
    'Student ID': 'STU-002',
    'Course Name': 'React.js Mastery',
    'Issue Date': '2026-02-10',
    'Expiry Date': '2027-02-10',
    'Grade': 'A',
    'Score': 92,
    'Verification Code': 'VER-DEF456UVW',
    'Institution Name': 'Navodita Infotech',
    'Status': 'Active'
  },
  {
    'Certificate ID': 'CERT-003',
    'Student Name': 'Rahul Kumar',
    'Student Email': 'rahul.kumar@email.com',
    'Student ID': 'STU-003',
    'Course Name': 'Node.js Backend Development',
    'Issue Date': '2025-12-20',
    'Expiry Date': '2026-12-20',
    'Grade': 'A',
    'Score': 88,
    'Verification Code': 'VER-GHI789RST',
    'Institution Name': 'Navodita Infotech',
    'Status': 'Active'
  },
  {
    'Certificate ID': 'CERT-004',
    'Student Name': 'Sneha Gupta',
    'Student Email': 'sneha.gupta@email.com',
    'Student ID': 'STU-004',
    'Course Name': 'MongoDB Database Design',
    'Issue Date': '2026-01-05',
    'Expiry Date': '2027-01-05',
    'Grade': 'B+',
    'Score': 85,
    'Verification Code': 'VER-JKL012MNO',
    'Institution Name': 'Navodita Infotech',
    'Status': 'Active'
  },
  {
    'Certificate ID': 'CERT-005',
    'Student Name': 'Vikram Singh',
    'Student Email': 'vikram.singh@email.com',
    'Student ID': 'STU-005',
    'Course Name': 'MERN Stack Complete Course',
    'Issue Date': '2025-11-30',
    'Expiry Date': '2026-11-30',
    'Grade': 'A+',
    'Score': 94,
    'Verification Code': 'VER-PQR345STU',
    'Institution Name': 'Navodita Infotech',
    'Status': 'Active'
  }
];

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Add the data as a worksheet
const worksheet = XLSX.utils.json_to_sheet(certificateData);

// Set column widths for better readability
worksheet['!cols'] = [
  { wch: 15 },  // Certificate ID
  { wch: 20 },  // Student Name
  { wch: 25 },  // Student Email
  { wch: 12 },  // Student ID
  { wch: 30 },  // Course Name
  { wch: 15 },  // Issue Date
  { wch: 15 },  // Expiry Date
  { wch: 10 },  // Grade
  { wch: 10 },  // Score
  { wch: 20 },  // Verification Code
  { wch: 20 },  // Institution Name
  { wch: 10 }   // Status
];

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Certificates');

// Define the output path
const outputPath = path.join(__dirname, '../..', 'sample_certificates.xlsx');

// Write the file
XLSX.writeFile(workbook, outputPath);

console.log(`✅ Certificate Excel file created successfully!`);
console.log(`📁 File saved at: ${outputPath}`);
console.log(`📊 Total records: ${certificateData.length}`);
