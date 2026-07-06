const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, verifyResetCode, resetPassword, sendVerificationCode, verifyAdminFirstLogin } = require('../controllers/authController');

router.post('/send-verification-code', sendVerificationCode);
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
router.post('/verify-admin-first-login', verifyAdminFirstLogin);

module.exports = router;
