const Booking = require('../models/Booking');
const Nurse = require('../models/Nurse');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const { nurseId, service, shift, date, time, patientDetails, paymentMethod, totalCost } = req.body;
        
        // Generate a random booking ID like BKG-12345
        const bookingId = 'BKG-' + Math.floor(Math.random() * 90000 + 10000);

        const booking = new Booking({
            nurseId,
            service,
            shift,
            date,
            time,
            patientDetails,
            paymentMethod,
            totalCost,
            bookingId
        });

        if (req.user && req.user.userId) {
            booking.patientId = req.user.userId;
        } else {
            // Guest booking
            const guestEmail = patientDetails.email || req.body.email;
            
            // Basic check
            if (!guestEmail) {
                return res.status(400).json({ message: 'Email is required for guest bookings' });
            }

            // Check if user already exists with this email
            const existingUser = await User.findOne({ email: guestEmail.toLowerCase() });
            if (existingUser) {
                booking.patientId = existingUser._id;
            } else {
                booking.guestEmail = guestEmail;
            }
        }

        // Helper to check overlaps
        const getMinutes = (timeStr) => {
            if (!timeStr) return 0;
            let [t, ampm] = timeStr.split(' ');
            if(!t) return 0;
            let [h, m] = t.split(':').map(Number);
            if (ampm === 'PM' && h !== 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;
            return h * 60 + (m || 0);
        };

        const newStartInMinutes = getMinutes(time);
        let newDuration = 120; // Default 2 hours for Quick Visit
        if (shift && shift.includes('Hour')) {
            newDuration = parseInt(shift.split(' ')[0]) * 60;
        }
        const newEndInMinutes = newStartInMinutes + newDuration;

        const checkOverlap = (existingBookingsArray) => {
            const activeBookings = req.body.reschedulingFrom 
                ? existingBookingsArray.filter(b => b._id.toString() !== req.body.reschedulingFrom.toString())
                : existingBookingsArray;

            for (let b of activeBookings) {
                const bStartInMinutes = getMinutes(b.time);
                let bDuration = 120;
                if (b.shift && b.shift.includes('Hour')) {
                    bDuration = parseInt(b.shift.split(' ')[0]) * 60;
                }
                const bEndInMinutes = bStartInMinutes + bDuration;

                if (newStartInMinutes < bEndInMinutes && newEndInMinutes > bStartInMinutes) {
                    return true;
                }
            }
            return false;
        };

        // 1. Check Patient Overlap
        let patientQuery = {};
        if (booking.patientId) {
            patientQuery = { patientId: booking.patientId };
        } else {
            patientQuery = { guestEmail: booking.guestEmail };
        }

        const patientBookings = await Booking.find({
            ...patientQuery,
            date: date,
            status: { $in: ['upcoming', 'confirmed', 'in-progress'] }
        });

        console.log("Found patient bookings:", patientBookings.map(b => b._id));
        console.log("Overlap result for patient:", checkOverlap(patientBookings));

        if (checkOverlap(patientBookings)) {
            return res.status(400).json({ message: 'You already have an overlapping booking at this time.' });
        }

        // 2. Check Nurse Overlap (prevent race condition)
        const nurseBookings = await Booking.find({
            nurseId: nurseId,
            date: date,
            status: { $in: ['upcoming', 'confirmed', 'in-progress'] }
        });

        if (checkOverlap(nurseBookings)) {
            return res.status(400).json({ message: 'This nurse has already been booked for the selected time.' });
        }

        await booking.save();

        if (req.body.reschedulingFrom) {
            try {
                const oldBooking = await Booking.findById(req.body.reschedulingFrom);
                if (oldBooking && oldBooking.patientId.toString() === req.user.userId.toString()) {
                    oldBooking.status = 'cancelled';
                    await oldBooking.save();
                }
            } catch (err) {
                console.error("Failed to cancel old booking during reschedule:", err);
            }
        }



        // Create Notification for Nurse (New Booking)
        try {
            const notif = await Notification.create({
                nurseId: booking.nurseId,
                type: req.body.reschedulingFrom ? 'rescheduled_booking' : 'new_booking',
                title: req.body.reschedulingFrom ? 'Appointment Rescheduled' : 'New Appointment Request',
                message: `Patient ${booking.patientDetails?.name || 'Guest'} has ${req.body.reschedulingFrom ? 'rescheduled an' : 'requested a new'} appointment for ${booking.service} on ${booking.date} at ${booking.time}.`,
                relatedBookingId: booking._id
            });
            console.log("Notification created successfully:", notif._id);
        } catch (notifErr) {
            console.error("Failed to create notification:", notifErr);
        }

        res.status(201).json({ message: 'Booking created successfully', booking, debug: { foundPatientBookings: patientBookings.length, checkOverlapResult: checkOverlap(patientBookings) } });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get bookings for the logged-in patient
exports.getPatientBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ patientId: req.user.userId })
            .populate('nurseId', 'name profilePicture gender phone qualification')
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching patient bookings:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get bookings for the logged-in nurse
exports.getNurseBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ nurseId: req.nurse.nurseId })
            .populate('patientId', 'name email gender age profilePicture')
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching nurse bookings:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update booking status (e.g. by nurse)
exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, report } = req.body;
        
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only allow the assigned nurse to update
        if (booking.nurseId.toString() !== req.nurse.nurseId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (status) {
            // Check if status is changing to completed
            if (status === 'completed' && booking.status !== 'completed') {
                const Settings = require('../models/Settings');
                const settings = await Settings.findOne();
                const commissionPercentage = settings ? settings.platformCommission : 10;
                
                const deductionAmount = (booking.totalCost * commissionPercentage) / 100;
                
                // Deduct from nurse's wallet
                const Nurse = require('../models/Nurse');
                await Nurse.findByIdAndUpdate(booking.nurseId, {
                    $inc: { walletBalance: -deductionAmount }
                });
                
                booking.platformCommissionDeducted = deductionAmount;
            }
            booking.status = status;
        }
        if (report) {
            booking.report = report;
        }

        await booking.save();
        res.status(200).json({ message: 'Booking status updated', booking });
    } catch (error) {
        console.error("Error updating booking status:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.cancelNurseBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const nurseId = req.nurse.nurseId;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.nurseId.toString() !== nurseId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        // Ensure day has not started
        const today = new Date();
        let dateToParse = booking.date;
        if (!/\d{4}/.test(dateToParse)) {
            // Append current year if year is missing
            dateToParse += ` ${today.getFullYear()}`;
        }
        const bookingDate = new Date(dateToParse);
        
        bookingDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        if (bookingDate <= today) {
            return res.status(400).json({ message: 'Cannot cancel booking on or after its start day' });
        }

        const Nurse = require('../models/Nurse');
        const nurse = await Nurse.findById(nurseId);
        
        // Handle monthly quotas
        const currentMonth = `${today.getFullYear()}-${today.getMonth() + 1}`;
        if (nurse.lastCancellationMonth !== currentMonth) {
            nurse.cancellationsThisMonth = 0;
            nurse.lastCancellationMonth = currentMonth;
        }

        if (nurse.cancellationsThisMonth >= 5) {
            return res.status(400).json({ message: 'Monthly cancellation limit (5) reached' });
        }

        nurse.cancellationsThisMonth += 1;
        await nurse.save();

        booking.status = 'cancelled';
        booking.cancellationReason = reason;
        booking.cancelledBy = 'nurse';
        await booking.save();
        
        // Find alternative nurses
        const alternativeNurses = await Nurse.find({
            _id: { $ne: nurseId },
            status: 'active'
        }).limit(3);

        const Notification = require('../models/Notification');
        // Notify patient
        if (booking.patientId) {
            await Notification.create({
                patientId: booking.patientId,
                type: 'nurse_cancelled',
                title: 'Nurse Cancelled Booking',
                message: `We apologize, but ${nurse.name} has cancelled your booking on ${booking.date} due to an emergency.`,
                relatedBookingId: booking._id
            });
        }

        res.status(200).json({ 
            message: 'Booking cancelled successfully', 
            remainingCancellations: 5 - nurse.cancellationsThisMonth 
        });

    } catch (error) {
        console.error("Error cancelling by nurse:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Cancel booking by patient
exports.cancelPatientBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only allow the patient who booked to cancel
        if (booking.patientId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (booking.status !== 'upcoming' && booking.status !== 'confirmed' && booking.status !== 'Pending_Emergency') {
            return res.status(400).json({ message: 'Only upcoming, confirmed, or pending emergency bookings can be cancelled' });
        }

        if (booking.isUrgent && booking.status === 'confirmed') {
            return res.status(400).json({ message: 'Emergency bookings cannot be cancelled once accepted by a nurse' });
        }

        booking.status = 'cancelled';
        await booking.save();
        // Create Notification for Nurse (Cancelled Booking)
        try {
            await Notification.create({
                nurseId: booking.nurseId,
                type: 'cancelled_booking',
                title: 'Appointment Cancelled',
                message: `Patient ${booking.patientDetails?.name || 'Unknown'} has cancelled their appointment for ${booking.service} on ${booking.date} at ${booking.time}.`,
                relatedBookingId: booking._id
            });
            console.log("Cancellation notification created successfully.");
        } catch (notifErr) {
            console.error("Failed to create cancellation notification:", notifErr);
        }
        res.status(200).json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Reschedule booking by patient
exports.reschedulePatientBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, time, shift } = req.body;
        const booking = await Booking.findById(id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only allow the patient who booked to reschedule
        if (booking.patientId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (booking.status !== 'upcoming' && booking.status !== 'confirmed') {
            return res.status(400).json({ message: 'Only upcoming or confirmed bookings can be rescheduled' });
        }

        // Helper to check overlaps
        const getMinutes = (timeStr) => {
            if (!timeStr) return 0;
            let [t, ampm] = timeStr.split(' ');
            if(!t) return 0;
            let [h, m] = t.split(':').map(Number);
            if (ampm === 'PM' && h !== 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;
            return h * 60 + (m || 0);
        };

        const newStartInMinutes = getMinutes(time);
        let newDuration = 120;
        if (shift && shift.includes('Hour')) {
            newDuration = parseInt(shift.split(' ')[0]) * 60;
        }
        const newEndInMinutes = newStartInMinutes + newDuration;

        const checkOverlap = (existingBookingsArray) => {
            const activeBookings = existingBookingsArray.filter(b => b._id.toString() !== id.toString());

            for (let b of activeBookings) {
                const bStartInMinutes = getMinutes(b.time);
                let bDuration = 120;
                if (b.shift && b.shift.includes('Hour')) {
                    bDuration = parseInt(b.shift.split(' ')[0]) * 60;
                }
                const bEndInMinutes = bStartInMinutes + bDuration;

                if (newStartInMinutes < bEndInMinutes && newEndInMinutes > bStartInMinutes) {
                    return true;
                }
            }
            return false;
        };

        // 1. Check Patient Overlap
        const patientBookings = await Booking.find({
            patientId: booking.patientId,
            date: date,
            status: { $in: ['upcoming', 'confirmed', 'in-progress'] }
        });

        if (checkOverlap(patientBookings)) {
            return res.status(400).json({ message: 'You already have an overlapping booking at this time.' });
        }

        // 2. Check Nurse Overlap
        const nurseBookings = await Booking.find({
            nurseId: booking.nurseId,
            date: date,
            status: { $in: ['upcoming', 'confirmed', 'in-progress'] }
        });

        if (checkOverlap(nurseBookings)) {
            return res.status(400).json({ message: 'This nurse has already been booked for the selected time.' });
        }

        booking.date = date;
        booking.time = time;
        if (shift) booking.shift = shift;
        
        await booking.save();

        // Create Notification for Nurse (Rescheduled Booking via direct reschedule)
        try {
            await Notification.create({
                nurseId: booking.nurseId,
                type: 'rescheduled_booking',
                title: 'Appointment Rescheduled',
                message: `Patient ${booking.patientDetails?.name || 'Unknown'} has rescheduled their appointment to ${booking.date} at ${booking.time}.`,
                relatedBookingId: booking._id
            });
            console.log("Reschedule notification created successfully.");
        } catch (notifErr) {
            console.error("Failed to create reschedule notification:", notifErr);
        }

        res.status(200).json({ message: 'Booking rescheduled successfully', booking });
    } catch (error) {
        console.error("Error rescheduling booking:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a cancelled booking by patient (hard delete)
exports.deletePatientBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only allow the patient who booked to delete
        if (booking.patientId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Only allow deleting cancelled bookings
        if (booking.status !== 'cancelled') {
            return res.status(400).json({ message: 'Only cancelled bookings can be deleted' });
        }

        await booking.deleteOne();
        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error("Error deleting booking:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Rate a completed booking
exports.rateNurseBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Valid rating between 1 and 5 is required' });
        }

        const booking = await Booking.findById(id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.patientId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (booking.status !== 'completed') {
            return res.status(400).json({ message: 'Only completed bookings can be rated' });
        }

        if (booking.isRated) {
            return res.status(400).json({ message: 'You have already rated this booking' });
        }

        const Nurse = require('../models/Nurse');
        const nurse = await Nurse.findById(booking.nurseId);
        
        if (!nurse) return res.status(404).json({ message: 'Nurse not found' });

        const patientName = booking.patientDetails?.name || 'Patient';
        
        // Calculate new rating
        const currentTotal = (nurse.rating || 0) * (nurse.reviewCount || 0);
        const newCount = (nurse.reviewCount || 0) + 1;
        const newRating = (currentTotal + Number(rating)) / newCount;

        nurse.rating = newRating;
        nurse.reviewCount = newCount;
        nurse.reviews.push({ patientName, rating: Number(rating), comment });

        await nurse.save();

        booking.isRated = true;
        await booking.save();

        res.status(200).json({ message: 'Rating submitted successfully' });
    } catch (error) {
        console.error("Error submitting rating:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.createUrgentBooking = async (req, res) => {
    try {
        const { service, shift, date, time, patientDetails, paymentMethod, totalCost } = req.body;
        const bookingId = 'EMG-' + Math.floor(Math.random() * 90000 + 10000);

        const booking = new Booking({
            service, shift, date, time, patientDetails, paymentMethod, totalCost, bookingId,
            status: 'Pending_Emergency', isUrgent: true
        });

        if (req.user && req.user.userId) {
            booking.patientId = req.user.userId;
        } else {
            const guestEmail = patientDetails.email || req.body.email;
            if (!guestEmail) return res.status(400).json({ message: 'Email is required' });
            const existingUser = await User.findOne({ email: guestEmail.toLowerCase() });
            if (existingUser) booking.patientId = existingUser._id;
            else booking.guestEmail = guestEmail;
        }

        await booking.save();
        res.status(201).json({ message: 'Urgent booking created', booking });
    } catch (err) {
        console.error("Error creating urgent booking:", err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getEmergencyBookings = async (req, res) => {
    try {
        const nurseId = req.nurse.nurseId;
        const Nurse = require('../models/Nurse');
        const nurse = await Nurse.findById(nurseId);
        if (nurse && nurse.status === 'suspended') {
            return res.status(200).json([]);
        }

        const emergencies = await Booking.find({ status: 'Pending_Emergency' }).sort({ createdAt: -1 });
        res.status(200).json(emergencies);
    } catch (err) {
        console.error("Error fetching emergency bookings:", err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.acceptEmergencyBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const nurseId = req.nurse.nurseId;
        const Nurse = require('../models/Nurse');
        const nurse = await Nurse.findById(nurseId);
        if (nurse && nurse.status === 'suspended') {
            return res.status(403).json({ message: 'Your account is suspended. You cannot accept emergency bookings.' });
        }

        const booking = await Booking.findById(id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.status !== 'Pending_Emergency') return res.status(400).json({ message: 'This emergency was already accepted or is no longer available.' });

        const getMinutes = (timeStr) => {
            if (!timeStr) return 0;
            let [t, ampm] = timeStr.split(' ');
            if(!t) return 0;
            let [h, m] = t.split(':').map(Number);
            if (ampm === 'PM' && h !== 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;
            return h * 60 + (m || 0);
        };
        const newStart = getMinutes(booking.time);
        let newDuration = booking.shift && booking.shift.includes('Hour') ? parseInt(booking.shift.split(' ')[0]) * 60 : 120;
        const newEnd = newStart + newDuration;

        const dateStr1 = booking.date;
        let dateStr2 = '';
        try {
            const d = new Date(booking.date);
            dateStr2 = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        } catch(e) {}

        const datesToCheck = dateStr2 ? [dateStr1, dateStr2] : [dateStr1];

        const nurseBookings = await Booking.find({
            nurseId, date: { $in: datesToCheck }, status: { $in: ['upcoming', 'confirmed', 'in-progress'] }
        });

        for (let b of nurseBookings) {
            const bStart = getMinutes(b.time);
            let bDuration = b.shift && b.shift.includes('Hour') ? parseInt(b.shift.split(' ')[0]) * 60 : 120;
            const bEnd = bStart + bDuration;
            if (newStart < bEnd && newEnd > bStart) {
                return res.status(400).json({ message: 'You have a conflicting appointment at this time.' });
            }
        }

        booking.nurseId = nurseId;
        booking.status = 'confirmed';
        await booking.save();

        res.status(200).json({ message: 'Emergency accepted successfully', booking });
    } catch (err) {
        console.error("Error accepting emergency:", err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getBookingStatus = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('nurseId', 'personalInfo.name');
        if (!booking) return res.status(404).json({ message: 'Not found' });
        res.status(200).json(booking);
    } catch (err) {
        console.error("Error fetching booking status:", err);
        res.status(500).json({ message: 'Server error' });
    }
};
