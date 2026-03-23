const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');
const { studentFields, updateStudentFields } = require('../validators/dataValidator');
const dataController = require('../controllers/dataController');

// All routes require Admin access
router.use(authenticate, authorize(['admin']));

// ─── Excel Bulk Upload ─────────────────────────────────────────────────────────
router.post('/upload', upload.single('file'), dataController.uploadExcel);

// ─── Student CRUD ─────────────────────────────────────────────────────────────
router.get('/students', dataController.getAllStudents);
router.get('/students/:id', dataController.getStudentById);
router.post('/students', studentFields, dataController.addStudent);
router.put('/students/:id', updateStudentFields, dataController.updateStudent);
router.delete('/students/:id', dataController.deleteStudent);

module.exports = router;
