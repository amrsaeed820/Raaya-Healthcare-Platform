const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    code: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // 10 minutes (document will automatically be deleted after 10 mins)
    }
});

module.exports = mongoose.model('VerificationCode', verificationCodeSchema);
