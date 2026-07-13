const Nurse = require('../models/Nurse');
const User = require('../models/User');

// Get Dashboard Stats
exports.getStats = async (req, res) => {
    try {
        const Booking = require('../models/Booking');
        const totalPatients = await User.countDocuments({ role: 'patient' });
        const activeNurses = await Nurse.countDocuments({ status: 'active' });
        const pendingNurses = await Nurse.countDocuments({ status: 'pending' });
        
        // Compute real booking stats
        const completedVisits = await Booking.countDocuments({ status: 'completed' });
        const pendingVisits = await Booking.countDocuments({ status: { $in: ['upcoming', 'confirmed', 'in-progress'] } });
        const allBookings = await Booking.find({ status: 'completed' });
        
        const totalRevenue = allBookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);
        const platformEarnings = allBookings.reduce((sum, b) => sum + (b.platformCommissionDeducted || ((b.totalCost || 0) * 0.1)), 0);

        // Fetch recent activities (Last 5 Bookings & Last 5 Nurses)
        const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(5).populate('patientId', 'name');
        const recentNurses = await Nurse.find().sort({ createdAt: -1 }).limit(5);

        const activities = [];
        recentBookings.forEach(b => {
            activities.push({
                type: 'booking',
                id: b._id,
                title: `Booking ${b.bookingId || b._id.toString().substring(0,6)} created`,
                time: b.createdAt,
                status: b.status
            });
        });
        recentNurses.forEach(n => {
            activities.push({
                type: 'nurse',
                id: n._id,
                title: `Nurse ${n.name} applied (${n.status})`,
                time: n.createdAt,
                status: n.status
            });
        });

        // Sort activities by time descending
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));

        res.status(200).json({
            totalPatients,
            activeNurses,
            pendingNurses,
            completedVisits,
            pendingVisits,
            totalRevenue,
            platformEarnings,
            recentActivity: activities.slice(0, 7) // Return top 7
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Pending Nurses
exports.getPendingNurses = async (req, res) => {
    try {
        const nurses = await Nurse.find({ status: 'pending' }).select('-password');
        res.status(200).json(nurses);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Helper to enhance nurse data
const enhanceNurseData = async (nurses) => {
    const Booking = require('../models/Booking');
    return Promise.all(nurses.map(async (nurse) => {
        const bookings = await Booking.find({ nurseId: nurse._id, status: 'completed' });
        let totalEarnings = 0;
        let platformShare = 0;
        bookings.forEach(b => {
            const cost = b.totalCost || 0;
            const comm = b.platformCommissionDeducted || (cost * 0.1);
            totalEarnings += (cost - comm);
            platformShare += comm;
        });
        return {
            ...nurse.toObject(), // lean doesn't work if they are mongoose documents, toObject works
            shiftsCompleted: bookings.length,
            totalEarnings: totalEarnings,
            platformShare: platformShare
        };
    }));
};

// Get Active Nurses
exports.getActiveNurses = async (req, res) => {
    try {
        const nurses = await Nurse.find({ status: 'active' }).select('-password');
        const enhancedNurses = await enhanceNurseData(nurses);
        res.status(200).json(enhancedNurses);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Suspended Nurses
exports.getSuspendedNurses = async (req, res) => {
    try {
        const nurses = await Nurse.find({ status: 'suspended' }).select('-password');
        const enhancedNurses = await enhanceNurseData(nurses);
        res.status(200).json(enhancedNurses);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update Nurse Status
exports.updateNurseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectReason } = req.body;

        if (!['active', 'rejected', 'suspended'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const nurse = await Nurse.findById(id);
        if (!nurse) {
            return res.status(404).json({ message: 'Nurse not found' });
        }

        nurse.status = status;
        if (status === 'rejected' && rejectReason) {
            nurse.rejectReason = rejectReason;
        } else if (status !== 'rejected') {
            nurse.rejectReason = '';
        }
        await nurse.save();

        const Notification = require('../models/Notification');
        if (status === 'suspended') {
            await Notification.create({
                nurseId: nurse._id,
                type: 'system',
                title: 'Account Suspended',
                message: 'Your account has been suspended by the administrator. You cannot receive new bookings until it is restored.',
                isRead: false
            });
        } else if (status === 'active') {
            await Notification.create({
                nurseId: nurse._id,
                type: 'system',
                title: 'Account Activated',
                message: 'Your account has been activated by the administrator. You can now receive new bookings.',
                isRead: false
            });
        }

        res.status(200).json({ message: `Nurse status updated to ${status}`, nurse });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all admins
exports.getAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } }).select('-password');
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get All Bookings for Admin
exports.getAllBookings = async (req, res) => {
    try {
        const Booking = require('../models/Booking');
        const bookings = await Booking.find()
            .populate('nurseId', 'name')
            .populate('patientId', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get All Patients for Admin
exports.getAllPatients = async (req, res) => {
    try {
        const User = require('../models/User');
        const Booking = require('../models/Booking');
        
        // Find all users who are patients
        const patients = await User.find({ role: 'patient' }).select('-password');
        
        // Enhance with financial data
        const enhancedPatients = await Promise.all(patients.map(async (patient) => {
            const bookings = await Booking.find({ patientId: patient._id });
            const totalSpent = bookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);
            
            return {
                ...patient.toObject(),
                totalSpent: totalSpent,
                bookings: bookings.map(b => ({
                    id: b.bookingId || b._id,
                    service: b.service,
                    amount: b.totalCost || 0,
                    date: b.date,
                    status: b.status
                }))
            };
        }));
        
        res.status(200).json(enhancedPatients);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Force Cancel a Booking
exports.forceCancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const Booking = require('../models/Booking');
        const Notification = require('../models/Notification');
        
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status === 'cancelled' || booking.status === 'completed') {
            return res.status(400).json({ message: 'Cannot force cancel a completed or already cancelled booking.' });
        }

        booking.status = 'cancelled';
        booking.cancellationReason = 'Force cancelled by administrator';
        booking.cancelledBy = 'admin';
        await booking.save();

        // Notify Nurse
        if (booking.nurseId) {
            await Notification.create({
                nurseId: booking.nurseId,
                type: 'cancelled_booking',
                title: 'Booking Cancelled by Admin',
                message: `Booking ${booking.bookingId} for service ${booking.service} has been force cancelled by an administrator.`,
                relatedBookingId: booking._id
            });
        }

        // Notify Patient
        if (booking.patientId) {
            await Notification.create({
                patientId: booking.patientId,
                type: 'cancelled_booking',
                title: 'Booking Cancelled by Admin',
                message: `Your booking ${booking.bookingId} has been cancelled by the administration. You will be refunded if applicable.`,
                relatedBookingId: booking._id
            });
        }

        res.status(200).json({ message: 'Booking successfully force cancelled', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create new admin
exports.createAdmin = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Ensure only super_admin can create admins (or any admin depending on requirement, let's allow based on frontend)
        
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const adminRole = role || 'admin';
        
        const newAdmin = new User({
            name,
            email,
            password: hashedPassword,
            role: adminRole,
            phone: '0000000000', // default dummy phone
            isFirstLogin: true
        });
        
        await newAdmin.save();
        
        res.status(201).json({ message: 'Admin created successfully', admin: newAdmin });
    } catch (error) {
        console.error("Error creating admin:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete an admin (Super Admin only)
exports.deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Prevent deleting oneself
        if (req.user && req.user.userId === id) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }
        
        const adminToDelete = await User.findById(id);
        if (!adminToDelete) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        
        // We can optionally prevent deleting another super_admin
        if (adminToDelete.role === 'super_admin') {
            return res.status(403).json({ message: 'Cannot delete another super admin' });
        }
        
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (error) {
        console.error("Error deleting admin:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
