const Nurse = require('../models/Nurse');
const Booking = require('../models/Booking');

exports.getActiveNurses = async (req, res) => {
    try {
        const nurses = await Nurse.find({ status: 'active' }).select('-password -resetPasswordCode -resetPasswordExpires').lean();
        
        // Fetch all upcoming/active bookings to filter available slots on frontend
        const bookings = await Booking.find({ 
            status: { $in: ['upcoming', 'confirmed', 'in-progress'] }
        }).select('nurseId date time shift service');
        
        // Group bookings by nurseId
        const bookingsByNurse = {};
        bookings.forEach(b => {
            const nId = b.nurseId.toString();
            if (!bookingsByNurse[nId]) bookingsByNurse[nId] = [];
            bookingsByNurse[nId].push(b);
        });

        // Attach bookings to nurses
        nurses.forEach(nurse => {
            nurse.bookings = bookingsByNurse[nurse._id.toString()] || [];
        });

        res.status(200).json(nurses);
    } catch (error) {
        console.error("Error fetching active nurses:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getNurseById = async (req, res) => {
    try {
        const nurse = await Nurse.findById(req.params.id).select('-password -resetPasswordCode -resetPasswordExpires').lean();
        if (!nurse || nurse.status !== 'active') {
            return res.status(404).json({ message: 'Nurse not found or not active' });
        }
        
        // Fetch upcoming/active bookings to filter available slots on frontend
        const mongoose = require('mongoose');
        const bookings = await Booking.find({ 
            nurseId: new mongoose.Types.ObjectId(req.params.id),
            status: { $in: ['upcoming', 'confirmed', 'in-progress'] }
        }).select('date time shift service');
        
        console.log("Bookings fetched in publicController:", bookings.length);
        
        nurse.bookings = bookings;

        res.status(200).json(nurse);
    } catch (error) {
        console.error("Error fetching nurse by ID:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
