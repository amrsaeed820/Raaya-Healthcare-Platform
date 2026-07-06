const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

exports.sendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save or update code in DB
        await VerificationCode.findOneAndDelete({ email }); // Remove old codes
        const verification = new VerificationCode({ email, code });
        await verification.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Raaya App - Email Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #025955; padding: 20px; text-align: center;">
                        <h2 style="color: #ffffff; margin: 0;">Email Verification</h2>
                    </div>
                    <div style="padding: 30px; background-color: #f9f9f9; text-align: center;">
                        <p style="font-size: 16px; color: #333;">Welcome to Raaya App!</p>
                        <p style="font-size: 16px; color: #333;">Here is your 6-digit verification code to complete your registration:</p>
                        <div style="margin: 30px 0; padding: 15px; background-color: #ffffff; border: 2px dashed #025955; border-radius: 8px; display: inline-block;">
                            <h1 style="margin: 0; color: #025955; font-size: 32px; letter-spacing: 5px;">${code}</h1>
                        </div>
                        <p style="font-size: 14px; color: #666;">This code is valid for <strong>10 minutes</strong>.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Verification code sent to your email successfully', code }); // Sending code for dev testing
    } catch (error) {
        console.error("Error in sendVerificationCode:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.register = async (req, res) => {
    try {
        const { name, phone, email, password, code } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Verification code is required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        const validCode = await VerificationCode.findOne({ email, code });
        if (!validCode) {
            return res.status(400).json({ message: 'Invalid or expired verification code.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, phone, email, password: hashedPassword });
        await newUser.save();

        // Delete the code so it cannot be used again
        await VerificationCode.findOneAndDelete({ email });

        // Link guest bookings
        const Booking = require('../models/Booking');
        await Booking.updateMany(
            { guestEmail: email.toLowerCase(), patientId: { $exists: false } },
            { $set: { patientId: newUser._id } }
        );

        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '7d' }
        );

        res.status(201).json({ 
            message: 'User registered successfully!', 
            token, 
            user: { id: newUser._id, name: newUser.name, email: newUser.email } 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found. Please sign up to create a new account.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect email or password.' });
        }

        // Check if admin and first login
        if (user.role === 'admin' && user.isFirstLogin) {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            user.resetPasswordCode = code;
            user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
            await user.save();

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Raaya Admin - First Login Verification',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>Welcome to Raaya Admin!</h2>
                        <p>This is your first time logging in. Please use the following code to verify your account and set a new password:</p>
                        <h1 style="color: #025955;">${code}</h1>
                        <p>This code is valid for 15 minutes.</p>
                    </div>
                `
            };

            try {
                await transporter.sendMail(mailOptions);
            } catch (err) {
                console.error("Email send failed", err);
            }

            return res.status(200).json({ 
                requireOTP: true, 
                message: 'First login detected. An OTP has been sent to your email.' 
            });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '7d' }
        );

        res.status(200).json({ message: 'Logged in successfully', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

exports.verifyAdminFirstLogin = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        
        const user = await User.findOne({
            email,
            resetPasswordCode: otp,
            resetPasswordExpires: { $gt: Date.now() },
            role: 'admin',
            isFirstLogin: true
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordCode = undefined;
        user.resetPasswordExpires = undefined;
        user.isFirstLogin = false;
        
        await user.save();

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '7d' }
        );

        res.status(200).json({ 
            message: 'Password set and logged in successfully', 
            token, 
            user: { id: user._id, name: user.name, email: user.email, role: user.role } 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'This email is not registered in our system.' });
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        user.resetPasswordCode = code;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
        await user.save();

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
            to: user.email,
            subject: 'Raaya App - Password Reset Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #025955; padding: 20px; text-align: center;">
                        <h2 style="color: #ffffff; margin: 0;">Password Reset Request</h2>
                    </div>
                    <div style="padding: 30px; background-color: #f9f9f9; text-align: center;">
                        <p style="font-size: 16px; color: #333;">Hello <strong>${user.name}</strong>,</p>
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
        const user = await User.findOne({
            email,
            resetPasswordCode: code,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
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
        
        const user = await User.findOne({
            email,
            resetPasswordCode: code,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset code.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordCode = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
