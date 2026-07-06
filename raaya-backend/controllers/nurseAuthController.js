const Nurse = require('../models/Nurse');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Nurse Registration
exports.registerNurse = async (req, res) => {
    try {
        const { name, email, phone, password, qualification, licenseNumber, experienceYears, degree, university, faculty, skills, gender, governorate, city, languages, previousWork } = req.body;
        
        const documentName = req.file ? req.file.filename : '';

        // Check if nurse exists
        const existingNurse = await Nurse.findOne({ email });
        if (existingNurse) {
            if (existingNurse.status === 'rejected') {
                // We will update the existing rejected application below instead of failing
            } else {
                return res.status(400).json({ message: 'Email already registered.' });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (existingNurse && existingNurse.status === 'rejected') {
            existingNurse.name = name;
            existingNurse.phone = phone;
            existingNurse.password = hashedPassword;
            existingNurse.qualification = qualification;
            existingNurse.degree = degree;
            existingNurse.university = university;
            existingNurse.faculty = faculty;
            existingNurse.skills = skills;
            if (documentName) existingNurse.documentName = documentName;
            existingNurse.gender = gender;
            existingNurse.governorate = governorate;
            existingNurse.city = city;
            existingNurse.languages = languages;
            existingNurse.previousWork = previousWork;
            existingNurse.experienceYears = experienceYears;
            existingNurse.status = 'pending';
            existingNurse.rejectReason = '';
            await existingNurse.save();
        } else {
            const newNurse = new Nurse({
                name,
                email,
                phone,
                password: hashedPassword,
                qualification,
                degree,
                university,
                faculty,
                skills,
                documentName,
                gender,
                governorate,
                city,
                languages,
                previousWork,
                licenseNumber,
                experienceYears,
                status: 'pending' // Default status
            });
            await newNurse.save();
        }

        res.status(201).json({ message: 'Registration successful! Your application is under review.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

// Nurse Login
exports.loginNurse = async (req, res) => {
    try {
        const { email, password } = req.body;

        const nurse = await Nurse.findOne({ email });
        if (!nurse) {
            return res.status(400).json({ message: 'Account not found. Please sign up to create a new account.' });
        }

        const isMatch = await bcrypt.compare(password, nurse.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect email or password.' });
        }

        if (nurse.status === 'pending') {
            return res.status(403).json({ message: 'Your application is still under review by the admin.' });
        }

        if (nurse.status === 'rejected') {
            return res.status(403).json({ 
                message: 'Your application has been rejected.',
                rejectReason: nurse.rejectReason
            });
        }
        
        if (nurse.status === 'suspended') {
            return res.status(403).json({ message: 'Your account is suspended. Please contact support.' });
        }

        // Must be active
        const token = jwt.sign(
            { nurseId: nurse._id, email: nurse.email, role: 'nurse' },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '7d' }
        );

        res.status(200).json({ 
            message: 'Logged in successfully', 
            token, 
            nurse: { id: nurse._id, name: nurse.name, email: nurse.email, status: nurse.status } 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

// Get Nurse Profile
exports.getProfile = async (req, res) => {
    try {
        const nurse = await Nurse.findById(req.nurse.nurseId).select('-password');
        if (!nurse) {
            return res.status(404).json({ message: 'Nurse not found' });
        }
        res.json(nurse);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const nodemailer = require('nodemailer');

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const nurse = await Nurse.findOne({ email });
        if (!nurse) {
            return res.status(404).json({ message: 'This email is not registered in our system.' });
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        nurse.resetPasswordCode = code;
        nurse.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
        await nurse.save();

        // Setup Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: nurse.email,
            subject: 'Raaya App - Password Reset Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #025955; padding: 20px; text-align: center;">
                        <h2 style="color: #ffffff; margin: 0;">Password Reset Request</h2>
                    </div>
                    <div style="padding: 30px; background-color: #f9f9f9; text-align: center;">
                        <p style="font-size: 16px; color: #333;">Hello <strong>${nurse.name}</strong>,</p>
                        <p style="font-size: 16px; color: #333;">We received a request to reset your password. Here is your 6-digit verification code:</p>
                        <div style="margin: 30px 0; padding: 15px; background-color: #ffffff; border: 2px dashed #025955; border-radius: 8px; display: inline-block;">
                            <h1 style="margin: 0; color: #025955; font-size: 32px; letter-spacing: 5px;">${code}</h1>
                        </div>
                        <p style="font-size: 14px; color: #666;">This code is valid for <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email.</p>
                    </div>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error("Error sending email: ", emailError);
            return res.status(500).json({ message: 'Error sending email. Please check your email configuration in .env' });
        }

        res.status(200).json({ message: 'Reset code sent to your email successfully', code }); 
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.verifyResetCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        const nurse = await Nurse.findOne({
            email,
            resetPasswordCode: code,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!nurse) {
            return res.status(400).json({ message: 'Invalid or expired reset code.' });
        }

        res.status(200).json({ message: 'Code verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        
        const nurse = await Nurse.findOne({
            email,
            resetPasswordCode: code,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!nurse) {
            return res.status(400).json({ message: 'Invalid or expired reset code.' });
        }

        const salt = await bcrypt.genSalt(10);
        nurse.password = await bcrypt.hash(newPassword, salt);
        nurse.resetPasswordCode = undefined;
        nurse.resetPasswordExpires = undefined;
        
        await nurse.save();

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const nurseId = req.nurse.nurseId;

        const nurse = await Nurse.findById(nurseId);
        if (!nurse) {
            return res.status(404).json({ message: 'Nurse not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, nurse.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await Nurse.findByIdAndUpdate(nurseId, { password: hashedPassword }, { runValidators: false });

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateWorkingHours = async (req, res) => {
    try {
        console.log("[UPDATE WORKING HOURS] Incoming request body:", req.body);
        const { workingHours, accepts24HourShifts } = req.body;
        const nurseId = req.nurse.nurseId;
        
        console.log("[UPDATE WORKING HOURS] Extracted nurseId from token:", nurseId);

        if (!nurseId) {
            console.log("[UPDATE WORKING HOURS] nurseId is undefined! Token might be from patient app.");
            return res.status(401).json({ message: 'Invalid token: missing nurse ID. Are you logged in as a patient instead of a nurse?' });
        }

        const nurse = await Nurse.findById(nurseId);
        
        if (!nurse) {
            console.log("[UPDATE WORKING HOURS] Nurse not found for ID:", nurseId);
            return res.status(404).json({ message: 'Nurse not found' });
        }

        // We use findByIdAndUpdate to bypass validation errors for other unrelated missing fields
        const updateData = { workingHours };
        if (typeof accepts24HourShifts !== 'undefined') {
            updateData.accepts24HourShifts = accepts24HourShifts;
        }

        const updatedNurse = await Nurse.findByIdAndUpdate(
            nurseId,
            { $set: updateData },
            { new: true, runValidators: false }
        );

        if (!updatedNurse) {
             return res.status(500).json({ message: 'Failed to update nurse document' });
        }

        console.log("[UPDATE WORKING HOURS] Successfully updated working hours.");
        res.status(200).json({ message: 'Working hours updated successfully', workingHours: updatedNurse.workingHours });
    } catch (error) {
        console.error("[UPDATE WORKING HOURS] Error:", error);
        res.status(500).json({ message: 'Server error: ' + error.message, error: error.stack });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { phone, city, governorate, skills, profilePicture } = req.body;
        const nurseId = req.nurse.nurseId;

        const updateData = {};
        if (phone) updateData.phone = phone;
        if (city) updateData.city = city;
        if (governorate) updateData.governorate = governorate;
        if (skills) updateData.skills = skills; // Expects comma separated string
        if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

        const updatedNurse = await Nurse.findByIdAndUpdate(
            nurseId,
            { $set: updateData },
            { new: true, runValidators: false }
        ).select('-password');

        res.status(200).json({ message: 'Profile updated successfully', nurse: updatedNurse });
    } catch (error) {
        console.error("[UPDATE PROFILE] Error:", error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};
