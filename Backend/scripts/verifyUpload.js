const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Student = require('../src/models/Student');

async function verifyUpload() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Count total records
    const totalCount = await Student.countDocuments();
    console.log(`📊 Total certificates in database: ${totalCount}\n`);

    // Get all certificates
    const allCertificates = await Student.find().select('certificateId studentName email internshipDomain startDate endDate').lean();

    if (allCertificates.length === 0) {
      console.log('❌ No certificates found in database!');
    } else {
      console.log('📋 Recently uploaded certificates:\n');
      console.log('┌─────────────────────┬──────────────────┬──────────────────────────┬─────────────────────┐');
      console.log('│ Certificate ID      │ Student Name     │ Email                    │ Domain              │');
      console.log('├─────────────────────┼──────────────────┼──────────────────────────┼─────────────────────┤');
      
      allCertificates.slice(0, 10).forEach(cert => {
        const certId = (cert.certificateId || 'N/A').padEnd(19);
        const name = (cert.studentName || 'N/A').substring(0, 16).padEnd(16);
        const email = (cert.email || 'N/A').substring(0, 24).padEnd(24);
        const domain = (cert.internshipDomain || 'N/A').substring(0, 19).padEnd(19);
        console.log(`│ ${certId} │ ${name} │ ${email} │ ${domain} │`);
      });
      
      console.log('└─────────────────────┴──────────────────┴──────────────────────────┴─────────────────────┘\n');

      if (allCertificates.length > 10) {
        console.log(`... and ${allCertificates.length - 10} more certificates\n`);
      }

      // Test verification
      console.log('🔍 Testing certificate verification:\n');
      const testCert = allCertificates[0];
      if (testCert) {
        console.log(`✅ Certificate ID: ${testCert.certificateId}`);
        console.log(`✅ Student: ${testCert.studentName}`);
        console.log(`✅ Email: ${testCert.email}`);
        console.log(`✅ Domain: ${testCert.internshipDomain}`);
        console.log(`\n🌐 URL to verify: http://localhost:5173/certificate/${testCert.certificateId}`);
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Verification complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyUpload();
