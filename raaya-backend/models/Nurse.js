const mongoose = require('mongoose');

const nurseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profilePicture: { 
        type: String, 
        default: '' 
    },
    qualification: {
        type: String,
        required: true
    },
    degree: { type: String },
    university: { type: String },
    faculty: { type: String },
    skills: { type: String },
    documentName: { type: String },
    gender: { type: String },
    governorate: { type: String },
    city: { type: String },
    languages: { type: String },
    previousWork: { type: String },
    licenseNumber: {
        type: String,
        required: true
    },
    experienceYears: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'rejected', 'suspended'],
        default: 'pending'
    },
    resetPasswordCode: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    shiftsCompleted: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            patientName: String,
            rating: Number,
            comment: String,
            date: { type: Date, default: Date.now }
        }
    ],
    workingHours: {
        type: [
            {
                day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
                startTime: { type: String },
                endTime: { type: String },
                isWorking: { type: Boolean, default: true },
                availableForQuickVisits: { type: Boolean, default: true },
                availableForLongShifts: { type: Boolean, default: true },
                dayShift: { type: Boolean, default: false },
                nightShift: { type: Boolean, default: false }
            }
        ],
        default: []
    },
    accepts24HourShifts: {
        type: Boolean,
        default: false
    },
    rejectReason: {
        type: String,
        default: ''
    },
    cancellationsThisMonth: {
        type: Number,
        default: 0
    },
    lastCancellationMonth: {
        type: String,
        default: ''
    },
    walletBalance: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Nurse', nurseSchema);
