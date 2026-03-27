const Student = require('../models/Student');
const SearchLog = require('../models/SearchLog');

// ─── Helper to log search attempts ────────────────────────────────────────────
const logSearchAttempt = async (certificateId, found, req) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    await SearchLog.create({
      certificateId: certificateId.trim().toUpperCase(),
      found,
      ip,
      userAgent,
      timestamp: new Date(),
    });
  } catch (err) {
    // Log error but don't fail the request due to logging failure
    console.error('[SearchLog Error]', err.message);
  }
};

// ─── GET /api/search?certificateId=CERT-001 ──────────────────────────────────
// Search for a certificate by ID (case-insensitive)

exports.searchCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.query;

    // Trim and normalize the search ID
    const searchId = certificateId.trim().toUpperCase();

    // Perform case-insensitive lookup using regex
    const student = await Student.findOne({
      certificateId: { $regex: new RegExp(`^${searchId}$`, 'i') },
    }).lean();

    // Log the search attempt
    await logSearchAttempt(certificateId, !!student, req);

    if (!student) {
      return res.status(404).json({
        found: false,
        message: `No certificate found with ID: ${searchId}`,
      });
    }

    // Calculate duration and format dates
    const startDate = new Date(student.startDate);
    const endDate = new Date(student.endDate);
    const diffMs = endDate - startDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const duration = diffMonths > 0 ? `${diffMonths} months` : `${diffDays} days`;

    return res.status(200).json({
      found: true,
      certificate: {
        certificateId: student.certificateId,
        studentName: student.studentName,
        internshipDomain: student.internshipDomain,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        duration,
        issueDate: new Date().toISOString().split('T')[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/search/verify/:certificateId ───────────────────────────────────
// Verify if a certificate ID exists in the system (third-party verification)

exports.verifyCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    // Trim and normalize the search ID
    const searchId = certificateId.trim().toUpperCase();

    // Perform case-insensitive lookup using regex
    const student = await Student.findOne({
      certificateId: { $regex: new RegExp(`^${searchId}$`, 'i') },
    }).lean();

    // Log the verification attempt
    await logSearchAttempt(certificateId, !!student, req);

    if (!student) {
      return res.status(200).json({
        valid: false,
        message: 'Certificate ID does not exist in our records.',
      });
    }

    return res.status(200).json({
      valid: true,
      certificateId: student.certificateId,
      studentName: student.studentName,
      internshipDomain: student.internshipDomain,
      issuedOn: new Date().toISOString().split('T')[0],
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/search/verify (Bulk Verification) ────────────────────────────
// Verify multiple certificate IDs via POST request

exports.verifyBulkCertificates = async (req, res, next) => {
  try {
    const { certificateIds } = req.body;

    // Validate input
    if (!certificateIds || !Array.isArray(certificateIds)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'certificateIds must be an array',
      });
    }

    if (certificateIds.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'certificateIds array cannot be empty',
      });
    }

    if (certificateIds.length > 100) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Maximum 100 certificate IDs allowed per request',
      });
    }

    // Verify each certificate ID
    const results = await Promise.all(
      certificateIds.map(async (certId) => {
        try {
          const trimmedId = certId.trim().toUpperCase();

          const student = await Student.findOne({
            certificateId: { $regex: new RegExp(`^${trimmedId}$`, 'i') },
          }).lean();

          // Log the verification attempt
          await logSearchAttempt(certId, !!student, req);

          if (!student) {
            return {
              certificateId: trimmedId,
              valid: false,
              message: 'Certificate ID does not exist in our records.',
            };
          }

          return {
            valid: true,
            certificateId: student.certificateId,
            studentName: student.studentName,
            internshipDomain: student.internshipDomain,
            issuedOn: new Date().toISOString().split('T')[0],
          };
        } catch (error) {
          return {
            certificateId: certId,
            valid: false,
            error: error.message,
          };
        }
      })
    );

    const verifiedCount = results.filter((r) => r.valid).length;
    const failedCount = results.length - verifiedCount;

    return res.status(200).json({
      total: results.length,
      verified: verifiedCount,
      failed: failedCount,
      results,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSearchLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const logs = await SearchLog.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await SearchLog.countDocuments();
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};
