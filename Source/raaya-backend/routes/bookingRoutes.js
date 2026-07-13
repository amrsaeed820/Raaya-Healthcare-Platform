const express = require('express');
const router = express.Router();
const { createBooking, getPatientBookings, getNurseBookings, updateBookingStatus, cancelPatientBooking, reschedulePatientBooking, deletePatientBooking, cancelNurseBooking, rateNurseBooking, createUrgentBooking, getEmergencyBookings, acceptEmergencyBooking, getBookingStatus } = require('../controllers/bookingController');
const auth = require('../middleware/authMiddleware');
const { protectNurse } = require('../middleware/nurseAuthMiddleware');

// Patient routes
router.post('/patient', auth, createBooking);
router.post('/guest', createBooking);
router.get('/patient', auth, getPatientBookings);
router.put('/patient/:id/cancel', auth, cancelPatientBooking);
router.put('/patient/:id/reschedule', auth, reschedulePatientBooking);
router.delete('/patient/:id', auth, deletePatientBooking);
router.post('/patient/:id/rate', auth, rateNurseBooking);

// Nurse routes
router.get('/nurse', protectNurse, getNurseBookings);
router.put('/nurse/:id/status', protectNurse, updateBookingStatus);
router.put('/nurse/:id/cancel', protectNurse, cancelNurseBooking);

// Emergency routes
router.post('/patient/urgent', auth, createUrgentBooking);
router.post('/guest/urgent', createUrgentBooking);
router.get('/nurse/emergency', protectNurse, getEmergencyBookings);
router.put('/nurse/emergency/:id/accept', protectNurse, acceptEmergencyBooking);
router.get('/:id/status', getBookingStatus);

module.exports = router;
