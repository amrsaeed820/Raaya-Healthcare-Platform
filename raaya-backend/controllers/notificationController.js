const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ nurseId: req.nurse.nurseId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { nurseId: req.nurse.nurseId, isRead: false },
            { $set: { isRead: true } }
        );
        res.status(200).json({ message: 'Notifications marked as read' });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteAllNurseNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ nurseId: req.nurse.nurseId });
        res.status(200).json({ message: 'All notifications deleted' });
    } catch (error) {
        console.error("Error deleting nurse notifications:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getPatientNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ patientId: req.user.userId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching patient notifications:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.markPatientAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { patientId: req.user.userId, isRead: false },
            { $set: { isRead: true } }
        );
        res.status(200).json({ message: 'Notifications marked as read' });
    } catch (error) {
        console.error("Error marking patient notifications as read:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteAllPatientNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ patientId: req.user.userId });
        res.status(200).json({ message: 'All notifications deleted' });
    } catch (error) {
        console.error("Error deleting patient notifications:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
