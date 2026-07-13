const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update profile (name, phone, gender, profilePicture)
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, gender, age, profilePicture, familyMembers, address, location } = req.body;
        
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (gender !== undefined) user.gender = gender;
        if (age !== undefined) user.age = age;
        if (profilePicture !== undefined) user.profilePicture = profilePicture;
        if (familyMembers !== undefined) user.familyMembers = familyMembers;
        if (address !== undefined) user.address = address;
        if (location !== undefined) user.location = location;

        await user.save();
        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect old password' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
