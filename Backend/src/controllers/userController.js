const User = require('../models/User');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Save a certificate ID to the student's digital wallet
// @route   POST /api/user/wallet
// @access  Private - Authenticated Users Only
// ─────────────────────────────────────────────────────────────────────────────
const saveToWallet = async (req, res, next) => {
  try {
    const { certificateId } = req.body;
    const userId = req.user.id; // Automatically provided by your authentication middleware

    if (!certificateId) {
      return res.status(400).json({ error: 'Certificate ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check for duplicates to prevent the same ID being saved twice
    if (!user.savedCertificates.includes(certificateId)) {
      user.savedCertificates.push(certificateId);
      // validateBeforeSave: false ensures we don't accidentally trigger password validation errors
      await user.save({ validateBeforeSave: false }); 
    }

    res.status(200).json({ 
      message: 'Saved successfully', 
      savedCertificates: user.savedCertificates 
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all saved certificate IDs for the student's dashboard
// @route   GET /api/user/wallet
// @access  Private - Authenticated Users Only
// ─────────────────────────────────────────────────────────────────────────────
const getWallet = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ 
      savedCertificates: user.savedCertificates 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveToWallet,
  getWallet
};