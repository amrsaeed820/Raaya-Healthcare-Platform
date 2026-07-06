const express = require('express');
const router = express.Router();
const { registerNurse, loginNurse, getProfile, forgotPassword, verifyResetCode, resetPassword, changePassword, updateWorkingHours, updateProfile } = require('../controllers/nurseAuthController');
const { protectNurse } = require('../middleware/nurseAuthMiddleware');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

router.post('/register', upload.single('documentFile'), registerNurse);
router.post('/login', loginNurse);
router.get('/profile', protectNurse, getProfile);

router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
router.post('/change-password', protectNurse, changePassword);
router.put('/working-hours', protectNurse, updateWorkingHours);
router.put('/profile', protectNurse, updateProfile);

module.exports = router;
