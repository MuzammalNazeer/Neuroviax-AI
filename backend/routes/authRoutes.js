const express = require('express');
const router = express.Router();
const { register, login, refresh, me, forgotPassword, verifyOTP, resetPassword, googleLogin, googleAuth, googleAuthCallback } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);
router.post('/google', googleLogin);
router.post('/sso', googleLogin);
router.post('/refresh', refresh);
router.get('/me', protect, me);

// Password reset flow
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
