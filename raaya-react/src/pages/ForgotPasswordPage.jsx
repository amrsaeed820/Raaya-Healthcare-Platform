import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PasswordRequirements, { validatePassword } from '../components/common/PasswordRequirements';
import axios from 'axios';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1);
    const [showCreatePassword, setShowCreatePassword] = useState(false);
    const [showReenterPassword, setShowReenterPassword] = useState(false);
    
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const navigate = useNavigate();

    const handleSendCode = async () => {
        setErrorMsg('');
        setSuccessMsg('');
        if (!email) return setErrorMsg('Please enter your email.');
        
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setSuccessMsg('Reset code sent to your email successfully!');
            console.log('RESET CODE (for testing):', response.data.code);
            setStep(2);
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Failed to send reset code.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        setErrorMsg('');
        setSuccessMsg('');
        if (!code || code.length !== 6) return setErrorMsg('Please enter a valid 6-digit code.');

        setIsLoading(true);
        try {
            await axios.post('http://localhost:5000/api/auth/verify-reset-code', { email, code });
            setSuccessMsg('');
            setStep(3);
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Invalid or expired code.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetPassword = async () => {
        setErrorMsg('');
        setSuccessMsg('');
        if (newPassword !== confirmPassword) {
            return setErrorMsg("Passwords do not match!");
        }
        if (!validatePassword(newPassword)) {
            return setErrorMsg("Password must be at least 8 characters, contain no spaces, and meet the complexity requirements.");
        }
        
        setIsLoading(true);
        try {
            await axios.post('http://localhost:5000/api/auth/reset-password', { email, code, newPassword });
            setStep(4);
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    const slideVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    const renderStep = () => {
        if (step === 1) {
            return (
                <motion.div
                    key="step1"
                    variants={slideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                >
                    <div className="mb-4">
                        <Link to="/login" className="text-dark text-decoration-none fw-medium d-inline-flex align-items-center gap-2 mb-4 hover-primary" style={{ fontSize: '0.9rem', transition: 'color 0.3s' }}>
                            <i className="fa-solid fa-chevron-left"></i> Back to login
                        </Link>
                        <h2 className="fw-bold text-dark mb-2">Forgot your password?</h2>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                            Don't worry, happens to all of us. Enter your email below to recover your password
                        </p>
                    </div>

                    <Form>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>Email</Form.Label>
                            <Form.Control 
                                type="email" 
                                placeholder="Example@email.com" 
                                className="py-2 px-3 shadow-none custom-input" 
                                style={{ borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #e0e6eb', backgroundColor: '#f9fafb' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Group>

                        {successMsg && (
                            <div className="alert alert-success py-2 px-3 mb-3" style={{ fontSize: '0.85rem', borderRadius: '8px' }}>
                                <i className="fa-solid fa-check-circle me-2"></i>
                                {successMsg}
                            </div>
                        )}

                        {errorMsg && (
                            <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: '0.85rem', borderRadius: '8px' }}>
                                <i className="fa-solid fa-circle-exclamation me-2"></i>
                                {errorMsg}
                            </div>
                        )}

                        <Button 
                            className="w-100 py-2 rounded-3 fw-bold mb-4 shadow-sm text-white"
                            style={{ backgroundColor: 'var(--primary)', border: 'none', fontSize: '1rem', transition: 'all 0.3s' }}
                            onClick={handleSendCode}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending...' : 'Submit'}
                        </Button>
                    </Form>
                </motion.div>
            );
        }

        if (step === 2) {
            return (
                <motion.div
                    key="step2"
                    variants={slideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                >
                    <div className="mb-4">
                        <Link to="/login" className="text-dark text-decoration-none fw-medium d-inline-flex align-items-center gap-2 mb-4 hover-primary" style={{ fontSize: '0.9rem', transition: 'color 0.3s' }}>
                            <i className="fa-solid fa-chevron-left"></i> Back to login
                        </Link>
                        <h2 className="fw-bold text-dark mb-2">Verify code</h2>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                            An authentication code has been sent to your email.
                        </p>
                    </div>

                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>Enter Code</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Enter 6-digit code"
                                className="py-2 px-3 shadow-none custom-input" 
                                style={{ borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #e0e6eb', backgroundColor: '#f9fafb' }}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                        </Form.Group>
                        
                        <div className="mb-4">
                            <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                                Don't receive a code? <span className="text-decoration-none fw-medium" onClick={handleSendCode} style={{ color: 'var(--primary)', cursor: 'pointer' }}>Resend</span>
                            </p>
                        </div>

                        {successMsg && (
                            <div className="alert alert-success py-2 px-3 mb-3" style={{ fontSize: '0.85rem', borderRadius: '8px' }}>
                                <i className="fa-solid fa-check-circle me-2"></i>
                                {successMsg}
                            </div>
                        )}

                        {errorMsg && (
                            <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: '0.85rem', borderRadius: '8px' }}>
                                <i className="fa-solid fa-circle-exclamation me-2"></i>
                                {errorMsg}
                            </div>
                        )}

                        <Button 
                            className="w-100 py-2 rounded-3 fw-bold shadow-sm text-white"
                            style={{ backgroundColor: 'var(--primary)', border: 'none', fontSize: '1rem', transition: 'all 0.3s' }}
                            onClick={handleVerifyCode}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Verifying...' : 'Verify'}
                        </Button>
                    </Form>
                </motion.div>
            );
        }

        if (step === 3) {
            return (
                <motion.div
                    key="step3"
                    variants={slideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                >
                    <div className="mb-4">
                        <h2 className="fw-bold text-dark mb-2">Set a password</h2>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                            Your previous password has been reset. Please set a new password for your account.
                        </p>
                    </div>

                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>Create Password</Form.Label>
                            <div className="position-relative">
                                <Form.Control 
                                    type={showCreatePassword ? "text" : "password"} 
                                    placeholder="Create a new password" 
                                    className="py-2 px-3 shadow-none custom-input pe-5" 
                                    style={{ borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #e0e6eb', backgroundColor: '#f9fafb' }}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <i 
                                    className={`fa-solid ${showCreatePassword ? 'fa-eye-slash' : 'fa-eye'} position-absolute`} 
                                    style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#a0aabf' }}
                                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                                ></i>
                            </div>
                        </Form.Group>

                        <PasswordRequirements password={newPassword} />

                        <Form.Group className="mb-4">
                            <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>Re-enter Password</Form.Label>
                            <div className="position-relative">
                                <Form.Control 
                                    type={showReenterPassword ? "text" : "password"} 
                                    placeholder="Re-enter your password" 
                                    className="py-2 px-3 shadow-none custom-input pe-5" 
                                    style={{ borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #e0e6eb', backgroundColor: '#f9fafb' }}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <i 
                                    className={`fa-solid ${showReenterPassword ? 'fa-eye-slash' : 'fa-eye'} position-absolute`} 
                                    style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#a0aabf' }}
                                    onClick={() => setShowReenterPassword(!showReenterPassword)}
                                ></i>
                            </div>
                        </Form.Group>

                        {errorMsg && (
                            <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: '0.85rem', borderRadius: '8px' }}>
                                <i className="fa-solid fa-circle-exclamation me-2"></i>
                                {errorMsg}
                            </div>
                        )}

                        <Button 
                            className="w-100 py-2 rounded-3 fw-bold shadow-sm text-white"
                            style={{ backgroundColor: 'var(--primary)', border: 'none', fontSize: '1rem', transition: 'all 0.3s' }}
                            onClick={handleSetPassword}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Setting...' : 'Set Password'}
                        </Button>
                    </Form>
                </motion.div>
            );
        }

        if (step === 4) {
            return (
                <motion.div
                    key="step4"
                    variants={slideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="text-center py-4"
                >
                    <div className="mb-4">
                        <div className="d-inline-flex justify-content-center align-items-center rounded-circle bg-success bg-opacity-10 mb-4" style={{ width: '80px', height: '80px' }}>
                            <i className="fa-solid fa-check text-success" style={{ fontSize: '2.5rem' }}></i>
                        </div>
                        <h2 className="fw-bold text-dark mb-2">Password Reset!</h2>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                            Your password has been successfully reset. You can now log in with your new password.
                        </p>
                    </div>

                    <Button 
                        className="w-100 py-2 rounded-3 fw-bold shadow-sm text-white"
                        style={{ backgroundColor: 'var(--primary)', border: 'none', fontSize: '1rem', transition: 'all 0.3s' }}
                        onClick={() => navigate('/login')}
                    >
                        Back to Login
                    </Button>
                </motion.div>
            );
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingTop: '80px', paddingBottom: '40px' }} className="d-flex align-items-center justify-content-center">
            <Container>
                <div className="shadow-lg rounded-4 bg-white mx-auto p-4 p-md-5 overflow-hidden position-relative" style={{ maxWidth: '500px', minHeight: '400px' }}>
                    <AnimatePresence mode="wait">
                        {renderStep()}
                    </AnimatePresence>
                </div>
            </Container>
        </div>
    );
}
