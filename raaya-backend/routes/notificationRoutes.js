const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protectNurse } = require('../middleware/nurseAuthMiddleware');
const auth = require('../middleware/authMiddleware');

router.get('/', protectNurse, notificationController.getNotifications);
router.put('/read', protectNurse, notificationController.markAsRead);
router.delete('/delete-all', protectNurse, notificationController.deleteAllNurseNotifications);

router.get('/patient', auth, notificationController.getPatientNotifications);
router.put('/patient/read', auth, notificationController.markPatientAsRead);
router.delete('/patient/delete-all', auth, notificationController.deleteAllPatientNotifications);

module.exports = router;
