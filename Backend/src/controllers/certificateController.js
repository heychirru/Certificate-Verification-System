const Student = require('../models/Student');
const { calculateDuration, formatDate, generateCertificatePDF } = require('../utils/certificateGenerator');
const { getPDF, setPDF, invalidatePDF } = require('../utils/pdfCache');

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
// Download certificate as PDF (with caching)

exports.downloadCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    if (!CERT_ID_REGEX.test(certificateId)) {
      return res.status(400).json({ error: 'Invalid certificate ID format' });
    }

    // Check cache first
    let pdfBuffer = getPDF(certificateId);
    if (pdfBuffer) {
      console.log(`✓ PDF served from cache: ${certificateId}`);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Certificate_${certificateId}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('X-Cache', 'HIT');
      return res.end(pdfBuffer);
    }

    // Cache miss - fetch from database
    const student = await Student.findOne({ certificateId }).lean();
    if (!student) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Generate PDF
    try {
      pdfBuffer = await generateCertificatePDF(student);
    } catch (err) {
      console.error('[PDF Generation Error]', err.message);
      return res.status(500).json({ error: 'Failed to generate certificate' });
    }

    // Cache the PDF for future requests
    setPDF(certificateId, pdfBuffer);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Certificate_${certificateId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('X-Cache', 'MISS');
    return res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
