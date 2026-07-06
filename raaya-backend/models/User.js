const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    gender: {
        type: String,
        default: ''
    },
    age: {
        type: Number
    },
    profilePicture: {
        type: String, // Store base64 or URL
        default: ''
    },
    resetPasswordCode: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    role: {
        type: String,
        default: 'patient',
        enum: ['patient', 'admin', 'super_admin']
    },
    isFirstLogin: {
        type: Boolean,
        default: false
    },
    address: {
        type: String,
        default: ''
    },
    location: {
        lat: Number,
        lng: Number
    },
    familyMembers: [{
        name: String,
        relationship: String,
        age: Number,
        gender: String,
        diseases: [String],
        address: String,
        location: {
            lat: Number,
            lng: Number
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
