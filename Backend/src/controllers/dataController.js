const xlsx = require('xlsx');
const { validationResult } = require('express-validator');
const Student = require('../models/Student');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Validate a single row from the Excel sheet.
 * Returns null if valid, or an error reason string.
 */
function validateRow(row, rowIndex) {
  const { certificateId, studentName, email, internshipDomain, startDate, endDate } = row;

  if (!certificateId || String(certificateId).trim() === '') {
    return { row: rowIndex, reason: 'Missing certificateId' };
  }
  if (!studentName || String(studentName).trim().length < 2) {
    return { row: rowIndex, reason: 'Missing or invalid studentName (min 2 chars)' };
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(String(email).trim())) {
    return { row: rowIndex, reason: 'Missing or invalid email' };
  }
  if (!internshipDomain || String(internshipDomain).trim() === '') {
    return { row: rowIndex, reason: 'Missing internshipDomain' };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (!startDate || isNaN(start.getTime())) {
    return { row: rowIndex, reason: 'Missing or invalid startDate' };
  }
  if (!endDate || isNaN(end.getTime())) {
    return { row: rowIndex, reason: 'Missing or invalid endDate' };
  }
  if (end <= start) {
    return { row: rowIndex, reason: 'endDate must be after startDate' };
  }

  return null;
}

// ─── POST /api/data/upload ────────────────────────────────────────────────────

exports.uploadExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Parse workbook from memory buffer
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: 'Spreadsheet contains no data rows' });
    }

    const errors = [];
    const toInsert = [];
    const seenIds = new Set();

    // Fetch existing certficateIds from DB for duplicate detection
    const existingIds = new Set(
      (await Student.find({}, 'certificateId').lean()).map((s) => s.certificateId)
    );

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Row 1 = header, data starts at row 2

      const validationError = validateRow(row, rowNum);
      if (validationError) {
        errors.push(validationError);
        continue;
      }

      const certId = String(row.certificateId).trim();

      // Duplicate in this batch
      if (seenIds.has(certId)) {
        errors.push({ row: rowNum, reason: `Duplicate certificateId in file: ${certId}` });
        continue;
      }

      // Duplicate in DB
      if (existingIds.has(certId)) {
        errors.push({ row: rowNum, reason: `Duplicate certificateId: ${certId}` });
        continue;
      }

      seenIds.add(certId);
      toInsert.push({
        certificateId: certId,
        studentName: String(row.studentName).trim(),
        email: String(row.email).trim().toLowerCase(),
        internshipDomain: String(row.internshipDomain).trim(),
        startDate: new Date(row.startDate),
        endDate: new Date(row.endDate),
      });
    }

    let inserted = 0;
    if (toInsert.length > 0) {
      await Student.insertMany(toInsert, { ordered: false });
      inserted = toInsert.length;
    }

    return res.status(200).json({
      message: 'Upload complete',
      total: rows.length,
      inserted,
      skipped: rows.length - inserted - errors.length + (rows.length - inserted - (rows.length - inserted)),
      errors,
    });
  } catch (error) {
    // Handle partial insertMany failures (e.g., concurrent duplicate keys)
    if (error.code === 11000 || (error.writeErrors && error.writeErrors.length > 0)) {
      return res.status(207).json({
        message: 'Upload partially complete — some rows failed due to duplicate keys',
        error: error.message,
      });
    }
    next(error);
  }
};

// ─── GET /api/data/students ───────────────────────────────────────────────────

exports.getAllStudents = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.search) {
      const regex = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ studentName: regex }, { certificateId: regex }];
    }
    if (req.query.domain) {
      filter.internshipDomain = new RegExp(req.query.domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }
    if (req.query.startDate) {
      filter.startDate = { ...filter.startDate, $gte: new Date(req.query.startDate) };
    }
    if (req.query.endDate) {
      filter.endDate = { ...filter.endDate, $lte: new Date(req.query.endDate) };
    }

    const [total, data] = await Promise.all([
      Student.countDocuments(filter),
      Student.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ]);

    return res.status(200).json({ total, page, limit, data });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/data/students/:id ───────────────────────────────────────────────

exports.getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findOne({ certificateId: req.params.id }).lean();
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }
    return res.status(200).json(student);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/data/students ──────────────────────────────────────────────────

exports.addStudent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { certificateId, studentName, email, internshipDomain, startDate, endDate } = req.body;

    const student = await Student.create({
      certificateId,
      studentName,
      email,
      internshipDomain,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return res.status(201).json({ message: 'Student record created', data: student });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/data/students/:id ───────────────────────────────────────────────

exports.updateStudent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const allowedFields = ['studentName', 'email', 'internshipDomain', 'startDate', 'endDate'];
    const update = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        update[field] = field.includes('Date') ? new Date(req.body[field]) : req.body[field];
      }
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided to update' });
    }

    const student = await Student.findOneAndUpdate(
      { certificateId: req.params.id },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    return res.status(200).json({ message: 'Student record updated', data: student });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/data/students/:id ───────────────────────────────────────────

exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findOneAndDelete({ certificateId: req.params.id });

    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    return res.status(200).json({ message: 'Student record deleted' });
  } catch (error) {
    next(error);
  }
};
