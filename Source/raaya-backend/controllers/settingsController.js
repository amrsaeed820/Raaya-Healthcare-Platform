const Settings = require('../models/Settings');

// Initialize settings if they don't exist
const initializeSettings = async () => {
    let settings = await Settings.findOne();
    if (!settings) {
        settings = new Settings();
        await settings.save();
    }
    return settings;
};

// Get settings (Public or Admin)
exports.getSettings = async (req, res) => {
    try {
        const settings = await initializeSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings' });
    }
};

// Update settings (Admin only)
exports.updateSettings = async (req, res) => {
    try {
        const { servicesPricing, platformCommission } = req.body;
        let settings = await initializeSettings();

        if (servicesPricing) {
            // Update individual prices
            for (const [key, value] of Object.entries(servicesPricing)) {
                settings.servicesPricing.set(key, Number(value));
            }
        }
        
        if (platformCommission !== undefined) {
            settings.platformCommission = Number(platformCommission);
        }

        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error updating settings' });
    }
};
