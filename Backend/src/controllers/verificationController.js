const Student = require('../models/Student');
const { verifyEmployer } = require('../utils/orbIntelligence');
const { verifyInternshipHistory, getAuthorizationUrl } = require('../utils/linkedinVerification');

// ─── POST /api/verify/employer ────────────────────────────────────────────────
// Verify employer exists and is legitimate using ORB Intelligence

exports.verifyEmployerByName = async (req, res, next) => {
  try {
    const { employerName } = req.body;

    if (!employerName || typeof employerName !== 'string' || employerName.trim() === '') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'employerName is required and must be a non-empty string',
      });
    }

    const verification = await verifyEmployer(employerName.trim());

    return res.status(200).json({
      success: true,
      verification,
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/verify/certificate/:certificateId/employer ───────────────────
// Verify certificate holder's employer using ORB Intelligence

exports.verifyCertificateEmployer = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    // Validate certificate exists
    const student = await Student.findOne({ certificateId }).lean();
    if (!student) {
      return res.status(404).json({
        error: 'Certificate not found',
        certificateId,
      });
    }

    // For internship certificates, internshipDomain is the employer/company name
    const employerName = student.internshipDomain;
    const verification = await verifyEmployer(employerName);

    return res.status(200).json({
      success: true,
      certificateId: student.certificateId,
      studentName: student.studentName,
      employer: employerName,
      verification,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/verify/linkedin/auth-url ────────────────────────────────────────
// Get LinkedIn OAuth authorization URL for student authentication

exports.getLinkedInAuthUrl = async (req, res, next) => {
  try {
    // Generate a random state for CSRF protection
    const state = Math.random().toString(36).substring(7);

    // Store state in session or return with instructions to store it
    const authUrl = getAuthorizationUrl(state);

    return res.status(200).json({
      success: true,
      authUrl,
      state,
      instructions: 'Store the state value and use it to verify the callback response',
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/verify/certificate/:certificateId/linkedin ────────────────────
// Verify certificate against LinkedIn work history

exports.verifyWithLinkedIn = async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const { accessToken } = req.body;

    if (!accessToken || typeof accessToken !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'accessToken is required',
      });
    }

    // Get student certificate data
    const student = await Student.findOne({ certificateId }).lean();
    if (!student) {
      return res.status(404).json({
        error: 'Certificate not found',
        certificateId,
      });
    }

    // Prepare certificate data for LinkedIn verification
    const certificateData = {
      certificateId: student.certificateId,
      studentName: student.studentName,
      internshipDomain: student.internshipDomain,
      startDate: student.startDate,
      endDate: student.endDate,
    };

    // Verify against LinkedIn
    const verification = await verifyInternshipHistory(certificateData, accessToken);

    return res.status(200).json({
      success: true,
      certificateId: student.certificateId,
      studentName: student.studentName,
      verification,
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/verify/certificate/:certificateId/full ──────────────────────────
// Full verification: Check ORB Intelligence + optional LinkedIn verification

exports.fullCertificateVerification = async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const { linkedInAccessToken } = req.body; // Optional

    // Get student certificate data
    const student = await Student.findOne({ certificateId }).lean();
    if (!student) {
      return res.status(404).json({
        error: 'Certificate not found',
        certificateId,
      });
    }

    // Verify employer with ORB Intelligence
    const employerVerification = await verifyEmployer(student.internshipDomain);

    // Optional: Verify with LinkedIn
    let linkedInVerification = null;
    if (linkedInAccessToken) {
      const certificateData = {
        certificateId: student.certificateId,
        studentName: student.studentName,
        internshipDomain: student.internshipDomain,
        startDate: student.startDate,
        endDate: student.endDate,
      };
      linkedInVerification = await verifyInternshipHistory(certificateData, linkedInAccessToken);
    }

    // Calculate overall verification status
    const overallVerified = employerVerification.verified && 
                           (!linkedInAccessToken || linkedInVerification.verified);

    return res.status(200).json({
      success: true,
      certificateId: student.certificateId,
      studentName: student.studentName,
      verificationReport: {
        employer: {
          name: student.internshipDomain,
          verified: employerVerification.verified,
          details: employerVerification.match || employerVerification.message,
          score: employerVerification.legitimacyScore,
        },
        linkedIn: linkedInVerification ? {
          verified: linkedInVerification.verified,
          details: linkedInVerification.message,
          profileMatch: linkedInVerification.nameMatch,
        } : null,
        overallVerified,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};
