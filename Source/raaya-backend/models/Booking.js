const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    guestEmail: {
        type: String,
        lowercase: true,
        trim: true
    },
    nurseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Nurse',
        required: false
    },
    service: {
        type: String,
        required: true
    },
    shift: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    patientDetails: {
        name: String,
        phone: String,
        email: String,
        address: String,
        message: String,
        isForSomeoneElse: Boolean
    },
    paymentMethod: {
        type: String,
        required: true
    },
    totalCost: {
        type: Number,
        required: true,
        default: 300
    },
    status: {
        type: String,
        enum: ['upcoming', 'confirmed', 'in-progress', 'completed', 'cancelled', 'missed', 'expired', 'Pending_Emergency', 'Accepted'],
        default: 'upcoming'
    },
    isUrgent: {
        type: Boolean,
        default: false
    },
    bookingId: {
        type: String,
        required: true,
        unique: true
    },
    isRated: {
        type: Boolean,
        default: false
    },
    cancellationReason: {
        type: String
    },
    cancelledBy: {
        type: String,
        enum: ['nurse', 'patient', 'admin']
    },
    platformCommissionDeducted: {
        type: Number,
        default: 0
    },
    report: {
        vitals: {
            bloodPressure: String,
            heartRate: String,
            temperature: String
        },
        notes: String,
        serviceAnswers: mongoose.Schema.Types.Mixed,
        attachments: [String]
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
