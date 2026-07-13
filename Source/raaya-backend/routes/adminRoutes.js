const express = require('express');
const router = express.Router();
const { getStats, getPendingNurses, getActiveNurses, getSuspendedNurses, updateNurseStatus, getAdmins, createAdmin, deleteAdmin, getAllBookings, forceCancelBooking, getAllPatients } = require('../controllers/adminController');
const protect = require('../middleware/authMiddleware');

const User = require('../models/User');

// Middleware to check if user is admin or super_admin
const adminOnly = async (req, res, next) => {
    if (req.user && ['admin', 'super_admin'].includes(req.user.role)) {
        return next();
    }
    
    // Fallback for older tokens that don't have the role in payload
    if (req.user && req.user.userId) {
        try {
            const user = await User.findById(req.user.userId);
            if (user && ['admin', 'super_admin'].includes(user.role)) {
                return next();
            }
        } catch(e) {
            console.error(e);
        }
    }
    
    res.status(403).json({ message: 'Not authorized as admin' });
};

// Middleware to check if user is super_admin ONLY
const superAdminOnly = async (req, res, next) => {
    if (req.user && req.user.role === 'super_admin') {
        return next();
    }
    
    // Fallback
    if (req.user && req.user.userId) {
        try {
            const user = await User.findById(req.user.userId);
            if (user && user.role === 'super_admin') {
                return next();
            }
        } catch(e) {
            console.error(e);
        }
    }
    
    res.status(403).json({ message: 'Not authorized as Super Admin' });
};

// Protect all admin routes
router.use(protect);
router.use(adminOnly);

router.get('/stats', getStats);
router.get('/nurses/pending', getPendingNurses);
router.get('/nurses/active', getActiveNurses);
router.get('/nurses/suspended', getSuspendedNurses);
router.put('/nurses/:id/status', updateNurseStatus);

// Bookings Management
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/force-cancel', forceCancelBooking);

// Patients Management
router.get('/patients', getAllPatients);

// List and Create Admins (Super Admin Only)
router.get('/list-admins', superAdminOnly, getAdmins);
router.post('/create-admin', superAdminOnly, createAdmin);
router.delete('/delete-admin/:id', superAdminOnly, deleteAdmin);

module.exports = router;
