const multer = require('multer');

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Use memory storage so we never write temp files to disk.
 * The buffer is parsed directly by SheetJS.
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === XLSX_MIME) {
    cb(null, true);
  } else {
    cb(Object.assign(new Error('Only .xlsx files are accepted'), { statusCode: 400 }), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = upload;
