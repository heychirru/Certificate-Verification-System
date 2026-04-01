const express = require('express');
const router = express.Router();

const { saveToWallet, getWallet } = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const requireJsonBody = require('../middleware/requireJsonBody');

// --- Global Middleware for this Router ---
// Every route below this line requires a valid JWT token!
router.use(authenticate);

// @route   POST /api/user/wallet
// @desc    Save a certificate to the digital wallet
router.post('/wallet', requireJsonBody, saveToWallet);

// @route   GET /api/user/wallet
// @desc    Get the list of saved certificates
router.get('/wallet', getWallet);

module.exports = router;