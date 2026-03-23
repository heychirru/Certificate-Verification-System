const Student = require('../models/Student');
const { calculateDuration, formatDate, generateCertificatePDF } = require('../utils/certificateGenerator');

// Validate certificate ID format — only alphanumeric, hyphens, underscores
// This also catches URL-decoded special chars (!, @, etc.) Express passes through
const CERT_ID_REGEX = /^[A-Z0-9_-]+$/i;

// ─── GET /api/certificate/:certificateId ─────────────────────────────────────

exports.getCertificateData = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    if (!CERT_ID_REGEX.test(certificateId)) {
      return res.status(400).json({ error: 'Invalid certificate ID format' });
    }

    const student = await Student.findOne({ certificateId }).lean();
    if (!student) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const organizationName = process.env.ORGANIZATION_NAME || 'Amdox Technologies';

    return res.status(200).json({
      certificateId:    student.certificateId,
      studentName:      student.studentName,
      internshipDomain: student.internshipDomain,
      startDate:        student.startDate,
      endDate:          student.endDate,
      duration:         calculateDuration(student.startDate, student.endDate),
      issueDate:        new Date().toISOString().split('T')[0],
      organizationName,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/certificate/:certificateId/preview ─────────────────────────────
// Alias: same as getCertificateData — returns JSON for frontend preview

exports.previewCertificate = exports.getCertificateData;

// ─── GET /api/certificate/:certificateId/download ────────────────────────────

exports.downloadCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    if (!CERT_ID_REGEX.test(certificateId)) {
      return res.status(400).json({ error: 'Invalid certificate ID format' });
    }

    const student = await Student.findOne({ certificateId }).lean();
    if (!student) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    let pdfBuffer;
    try {
      pdfBuffer = await generateCertificatePDF(student);
    } catch (err) {
      console.error('[PDF Generation Error]', err.message);
      return res.status(500).json({ error: 'Failed to generate certificate' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${certificateId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
