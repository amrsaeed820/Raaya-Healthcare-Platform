const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    servicesPricing: {
        type: Map,
        of: Number,
        default: {
            'Elderly Care': 100, // hourly
            'Post-operative Care': 350, // task/visit
            'Chronic Care': 400, // task/visit
            'Basic Care': 250, // task/visit
            'Wound & Skin Care': 200, // task/visit
            'Escort Services & Responsibilities': 150 // hourly
        }
    },
    platformCommission: {
        type: Number,
        default: 10
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
