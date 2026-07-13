const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    nurseId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Nurse',
        required: false 
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: false
    },
    type: { 
        type: String, 
        enum: ['new_booking', 'cancelled_booking', 'rescheduled_booking', 'system', 'nurse_cancelled', 'suggestion'], 
        required: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    isRead: { 
        type: Boolean, 
        default: false 
    },
    relatedBookingId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Booking' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
