import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import nurseImage from '../assets/nurse_portrait.png';
import { useAuth } from '../context/AuthContext';
import PasswordRequirements, { validatePassword } from '../components/common/PasswordRequirements';

export default function LoginPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(location.pathname !== '/register');

    useEffect(() => {
        setIsLogin(location.pathname !== '/register');
    }, [location.pathname]);

    const handleToggle = (loginState) => {
        setIsLogin(loginState);
        navigate(loginState ? '/login' : '/register', { replace: true });
    };

    const { login } = useAuth();
    
    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [registerError, setRegisterError] = useState('');
    const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);

    // Login Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Admin First Login States
    const [isAdminFirstLogin, setIsAdminFirstLogin] = useState(false);
    const [adminOtp, setAdminOtp] = useState('');
    const [adminNewPassword, setAdminNewPassword] = useState('');
    
    // Register Form States
    const [regStep, setRegStep] = useState(1);
    const [regCode, setRegCode] = useState('');
    const [regName, setRegName] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');

    // Password visibility states
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

    // --- Login Handler ---
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');

        if (!email || !password) {
            return setLoginError('Please fill in both email and password.');
        }

        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            
            if (response.data.requireOTP) {
                setIsAdminFirstLogin(true);
                return;
            }

            localStorage.setItem('token', response.data.token);
            await login(); 
            if (response.data.user && ['admin', 'super_admin'].includes(response.data.user.role)) {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error("Login Error: ", error);
            const errorMsg = error.response?.data?.message || error.message || 'Invalid email or password. Please try again.';
            setLoginError(`Error: ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdminFirstLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');
        if (!adminOtp || !adminNewPassword) {
            return setLoginError('Please fill in all fields.');
        }
        if (!validatePassword(adminNewPassword)) {
            return setLoginError('Password does not meet the requirements.');
        }
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/verify-admin-first-login', { 
                email, 
                otp: adminOtp, 
                newPassword: adminNewPassword 
            });
            localStorage.setItem('token', response.data.token);
            await login(); 
            navigate('/admin');
        } catch (error) {
            console.error("Admin Login Error: ", error);
            const errorMsg = error.response?.data?.message || error.message || 'Invalid OTP.';
            setLoginError(`Error: ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Register Handlers ---
    const handleSendRegCode = async (e) => {
        e.preventDefault();
        setRegisterError('');

        if (!regName || !regPhone || !regEmail || !regPassword || !regConfirmPassword) {
            return setRegisterError('Please fill in all the required fields.');
        }

        if (!/^\d+$/.test(regPhone)) {
            return setRegisterError('Phone number must contain only numbers.');
        }

        if (regPassword !== regConfirmPassword) {
            return setRegisterError('Passwords do not match!');
        }

        if (!validatePassword(regPassword)) {
            return setRegisterError('Password must be at least 8 characters, contain no spaces, and meet the complexity requirements.');
        }

        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/send-verification-code', { email: regEmail });
            console.log('REGISTRATION CODE (for testing):', response.data.code);
            setRegStep(2);
        } catch (error) {
            console.error("Verification Error: ", error);
            const errorMsg = error.response?.data?.message || error.message || 'Something went wrong.';
            setRegisterError(`Error: ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyRegCode = async (e) => {
        e.preventDefault();
        setRegisterError('');

        if (!regCode || regCode.length !== 6) {
            return setRegisterError('Please enter a valid 6-digit code.');
        }

        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', {
                name: regName,
                phone: regPhone,
                email: regEmail,
                password: regPassword,
                code: regCode
            });

            // Save token and login user automatically
            localStorage.setItem('token', response.data.token);
            login();
            
            // Show success view
            setIsRegistrationSuccess(true);
            setRegStep(1);
            
            // Clear inputs
            setRegName('');
            setRegPhone('');
            setRegEmail('');
            setRegPassword('');
            setRegConfirmPassword('');
            setRegCode('');
        } catch (error) {
            console.error("Registration Error: ", error);
            const errorMsg = error.response?.data?.message || error.message || 'Something went wrong during registration.';
            setRegisterError(`Error: ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingTop: '80px', paddingBottom: '40px' }} className="d-flex align-items-center justify-content-center overflow-hidden">
            <style>{`
                @media (min-width: 992px) {
                    .panel-form {
                        position: relative !important;
                        width: 50% !important;
                    }
                    .panel-image {
                        position: absolute !important;
                        top: 0;
                        right: 0;
                        width: 50% !important;
                        height: 100% !important;
                        display: block !important;
                    }
                    .panels-container {
                        position: relative;
                        min-height: 650px;
                        transition: min-height 0.3s ease;
                    }
                }
                @media (max-width: 991px) {
                    .panel-image {
                        display: none !important;
                    }
                    .panel-form {
                        width: 100% !important;
                        transform: none !important;
                        position: relative !important;
                    }
                    .panels-container {
                        min-height: auto;
                    }
                }
                .form-content-wrapper {
                    height: 100%;
                }
                .panel-form::-webkit-scrollbar {
                    display: none;
                }
                .panel-form {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            
            <Container>
                <Row className="shadow-lg rounded-4 bg-white mx-auto panels-container overflow-hidden" style={{ maxWidth: '1000px' }}>
                    
                    {/* Form Side (Sliding) */}
                    <motion.div 
                        className="panel-form p-0"
                        initial={false}
                        animate={{ x: isLogin ? '0%' : '100%' }}
                        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
                        style={{ zIndex: 2 }}
                    >
                        <div className="bg-white w-100 h-100">
                            <AnimatePresence mode="wait">
                                {isRegistrationSuccess ? (
                                    <motion.div 
                                        key="success" 
                                        initial={{ opacity: 0, scale: 0.95 }} 
                                        animate={{ opacity: 1, scale: 1 }} 
                                        exit={{ opacity: 0, scale: 1.05 }}
                                        transition={{ duration: 0.3 }}
                                        className="form-content-wrapper p-4 p-md-5 d-flex flex-column"
                                    >
                                        <div className="mx-auto w-100 my-auto text-center" style={{ maxWidth: '400px' }}>
                                            <div className="mb-4 d-flex justify-content-center">
                                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e6f5f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <i className="fa-solid fa-check" style={{ fontSize: '2.5rem', color: '#025955' }}></i>
                                                </div>
                                            </div>
                                            <h2 className="fw-bold text-dark mb-3">Registration Successful!</h2>
                                            <p className="text-muted mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                                Welcome to Raaya! Your account has been created successfully. You are now logged in and ready to access our home healthcare services.
                                            </p>
                                            <Button 
                                                className="w-100 py-3 rounded-3 fw-bold shadow-sm text-white mt-2"
                                                style={{ backgroundColor: '#025955', border: 'none', fontSize: '1rem', transition: 'all 0.3s' }}
                                                onClick={() => navigate('/')}
                                            >
                                                Go to Home Page
                                            </Button>
                                        </div>
                                    </motion.div>
                                ) : isLogin ? (
                                    <motion.div 
                                        key="login" 
                                        initial={{ opacity: 0, x: -20 }} 
                                        animate={{ opacity: 1, x: 0 }} 
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.2 }}
                                        className="form-content-wrapper p-4 p-md-5 d-flex flex-column"
                                    >
                                        <div className="mx-auto w-100 my-auto" style={{ maxWidth: '400px' }}>
                                            <div className="mb-4 text-center text-lg-start">
                                                <h2 className="fw-bold text-dark mb-2">Welcome to Raaya</h2>
                                                <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                                    Sign in to your account to manage your home healthcare services and appointments.
                                                </p>
                                            </div>

                                            {isAdminFirstLogin ? (
                                                <Form onSubmit={handleAdminFirstLoginSubmit}>
                                                    <div className="alert alert-info py-2 px-3 mb-3" style={{ fontSize: '0.85rem', borderRadius: '8px' }}>
                                                        <i className="fa-solid fa-envelope me-2"></i>
                                                        First time login. An OTP has been sent to your email.
                                                    </div>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>OTP Code</Form.Label>
                                                        <Form.Control 
                                                            type="text" 
                                                            placeholder="Enter 6-digit OTP" 
                                                            className="py-2 px-3 shadow-none custom-input" 
                                                            style={{ borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #e0e6eb', backgroundColor: '#f9fafb' }}
                                                            value={adminOtp}
                                                            onChange={(e) => setAdminOtp(e.target.value)}
                                                        />
                                                    </Form.Group>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>New Password</Form.Label>
                                                        <Form.Control 
                                                            type="password" 
                                                            placeholder="Enter new password" 
                                                            className="py-2 px-3 shadow-none custom-input" 
                                                            style={{ borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #e0e6eb', backgroundColor: '#f9fafb' }}
                                                            value={adminNewPassword}
                                                            onChange={(e) => setAdminNewPassword(e.target.value)}
                                                        />
                                                    </Form.Group>
                                                    
                                                    <PasswordRequirements password={adminNewPassword} />
                                                    
                                                    {loginError && (
                                                        <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: '0.85rem', borderRadius: '8px' }}>
                                                            <i className="fa-solid fa-circle-exclamation me-2"></i>
                                                            {loginError}
                                                        </div>
                                                    )}

                                                    <Button 
                                                        type="submit"
                                                        disabled={isLoading}
                                                        className="w-100 py-2 rounded-3 fw-bold mb-3 shadow-sm text-white"
                                                        style={{ backgroundColor: 'var(--primary)', border: 'none', fontSize: '1rem', transition: 'all 0.3s' }}
                                                    >
                                                        {isLoading ? 'Verifying...' : 'Set Password & Login'}
                                                    </Button>
                                                </Form>
                                            ) : (
                                                <Form onSubmit={handleLoginSubmit}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>Email</Form.Label>
                                                        <Form.Control 
                                                            type="email" 
                                                            placeholder="Enter your email address" 
                                                            className="py-2 px-3 shadow-none custom-input" 
                                                            style={{ borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #e0e6eb', backgroundColor: '#f9fafb' }}
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                        />
                                                    </Form.Group>

                                                    <Form.Group className="mb-2">
                                                        <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>Password</Form.Label>
                                                        <div className="position-relative">
                                                            <Form.Control 
                                                                type={showLoginPassword ? "text" : "password"} 
                                                                placeholder="Enter your password" 
                                                                className="py-2 px-3 shadow-none custom-input pe-5" 
                                                                style={{ borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #e0e6eb', backgroundColor: '#f9fafb' }}
                                                                value={password}
                                                                onChange={(e) => setPassword(e.target.value)}
                                                            />
                                                            <i 
                                                                className={`fa-solid ${showLoginPassword ? 'fa-eye-slash' : 'fa-eye'} position-absolute`} 
                                                                style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#a0aabf' }}
                                                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                                                            ></i>
                                                        </div>
                                                    </Form.Group>

                                                    <div className="d-flex justify-content-end mb-3 mt-1">
                                                        <Link to="/forgot-password" className="text-decoration-none fw-medium" style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Forgot Password?</Link>
                                                    </div>

                                                    {loginError && (
                                                        <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: '0.85rem', borderRadius: '8px' }}>
                                                            <i className="fa-solid fa-circle-exclamation me-2"></i>
                                                            {loginError}
                                                        </div>
                                                    )}

                                                    <Button 
                                                        type="submit"
                                                        disabled={isLoading}
                                                        className="w-100 py-2 rounded-3 fw-bold mb-3 shadow-sm text-white"
                                                        style={{ backgroundColor: 'var(--primary)', border: 'none', fontSize: '1rem', transition: 'all 0.3s' }}
                                                    >
                                                        {isLoading ? 'Signing in...' : 'Sign in'}
                                                    </Button>

                                                    <div className="text-center">
                                                        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                                                            Don't you have an account? <span onClick={() => handleToggle(false)} className="text-decoration-none fw-medium" style={{ color: 'var(--primary)', cursor: 'pointer' }}>Sign up</span>
                                                        </p>
                                                    </div>
                                                </Form>
                                            )}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="register" 
                                        initial={{ opacity: 0, x: 20 }} 
                                        animate={{ opacity: 1, x: 0 }} 
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="form-content-wrapper p-4 p-md-5 d-flex flex-column"
                                    >
                                        <div className="mx-auto w-100 my-auto" style={{ maxWidth: '400px', paddingBottom: '20px' }}>
                                            {regStep === 1 ? (
                                                <div className="mb-4 text-center text-lg-start">
                                                    <h2 className="fw-bold text-dark mb-2">Sign up</h2>
                                                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                                        Let's get you all set up so you can access your personal account.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="mb-4 text-center text-lg-start">
                                                    <span onClick={() => setRegStep(1)} className="text-dark text-decoration-none fw-medium d-inline-flex align-items-center gap-2 mb-4 hover-primary" style={{ fontSize: '0.9rem', transition: 'color 0.3s', cursor: 'pointer' }}>
                                                        <i className="fa-solid fa-chevron-left"></i> Back to sign up
                                                    </span>
                                                    <h2 className="fw-bold text-dark mb-2">Verify email</h2>
                                                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                                        We've sent a code to your email. Enter it below to complete registration.
                                                    </p>
                                                </div>
                                            )}

                                            {regStep === 1 ? (
                                                <Form onSubmit={handleSendRegCode}>
                                                <Row className="g-2 mb-2">
                                                    <Col sm={6}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>Name</Form.Label>
                                                            <Form.Control 
                                                                type="text" 
                                                                placeholder="Enter your full name" 
                                                                className="py-2 px-3 shadow-none custom-input" 
                                                                style={{ borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #e0e6eb', backgroundColor: '#f9fafb' }}
                                                                value={regName}
                                                                onChange={(e) => setRegName(e.target.value)}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col sm={6}>
                                                        <Form.Group>
                                                            <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>Phone Number</Form.Label>
                                                            <Form.Control 
                                                                type="text" 
                                                                placeholder="Enter your phone number" 
                                                                className="py-2 px-3 shadow-none custom-input" 
                                                                style={{ borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #e0e6eb', backgroundColor: '#f9fafb' }}
                                                                value={regPhone}
                                                                onChange={(e) => setRegPhone(e.target.value)}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Form.Group className="mb-2">
                                                    <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>Email</Form.Label>
                                                    <Form.Control 
                                                        type="email" 
                                                        placeholder="Enter your email address" 
                                                        className="py-2 px-3 shadow-none custom-input" 
                                                        style={{ borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #e0e6eb', backgroundColor: '#f9fafb' }}
                                                        value={regEmail}
                                                        onChange={(e) => setRegEmail(e.target.value)}
                                                    />
                                                </Form.Group>

                                                <Form.Group className="mb-2">
                                                    <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>Password</Form.Label>
                                                    <div className="position-relative">
                                                        <Form.Control 
                                                            type={showRegPassword ? "text" : "password"} 
                                                            placeholder="Create a password" 
                                                            className="py-2 px-3 shadow-none custom-input pe-5" 
                                                            style={{ borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #e0e6eb', backgroundColor: '#f9fafb' }}
                                                            value={regPassword}
                                                            onChange={(e) => setRegPassword(e.target.value)}
                                                        />
                                                        <i 
                                                            className={`fa-solid ${showRegPassword ? 'fa-eye-slash' : 'fa-eye'} position-absolute`} 
                                                            style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#a0aabf' }}
                                                            onClick={() => setShowRegPassword(!showRegPassword)}
                                                        ></i>
                                                    </div>
                                                </Form.Group>
                                                
                                                <PasswordRequirements password={regPassword} />

                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>Confirm Password</Form.Label>
                                                    <div className="position-relative">
                                                        <Form.Control 
                                                            type={showRegConfirmPassword ? "text" : "password"} 
                                                            placeholder="Confirm your password" 
                                                            className="py-2 px-3 shadow-none custom-input pe-5" 
                                                            style={{ borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #e0e6eb', backgroundColor: '#f9fafb' }}
                                                            value={regConfirmPassword}
                                                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                                                        />
                                                        <i 
                                                            className={`fa-solid ${showRegConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} position-absolute`} 
                                                            style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#a0aabf' }}
                                                            onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                                                        ></i>
                                                    </div>
                                                </Form.Group>

                                                {registerError && (
                                                    <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: '0.85rem', borderRadius: '8px' }}>
                                                        <i className="fa-solid fa-circle-exclamation me-2"></i>
                                                        {registerError}
                                                    </div>
                                                )}

                                                <Button 
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="w-100 py-2 rounded-3 fw-bold mb-3 shadow-sm text-white"
                                                    style={{ backgroundColor: 'var(--primary)', border: 'none', fontSize: '1rem', transition: 'all 0.3s' }}
                                                >
                                                    {isLoading ? 'Signing up...' : 'Sign up'}
                                                </Button>

                                                <div className="text-center">
                                                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                                                        Already have an account? <span onClick={() => handleToggle(true)} className="text-decoration-none fw-medium" style={{ color: 'var(--primary)', cursor: 'pointer' }}>Sign in</span>
                                                    </p>
                                                </div>
                                            </Form>
                                            ) : (
                                            <Form onSubmit={handleVerifyRegCode}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>Enter Code</Form.Label>
                                                    <Form.Control 
                                                        type="text" 
                                                        placeholder="Enter 6-digit code"
                                                        className="py-2 px-3 shadow-none custom-input" 
                                                        style={{ borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #e0e6eb', backgroundColor: '#f9fafb' }}
                                                        value={regCode}
                                                        onChange={(e) => setRegCode(e.target.value)}
                                                    />
                                                </Form.Group>

                                                {registerError && (
                                                    <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: '0.85rem', borderRadius: '8px' }}>
                                                        <i className="fa-solid fa-circle-exclamation me-2"></i>
                                                        {registerError}
                                                    </div>
                                                )}

                                                <Button 
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="w-100 py-2 rounded-3 fw-bold mb-3 shadow-sm text-white"
                                                    style={{ backgroundColor: 'var(--primary)', border: 'none', fontSize: '1rem', transition: 'all 0.3s' }}
                                                >
                                                    {isLoading ? 'Verifying...' : 'Verify & Register'}
                                                </Button>

                                                <div className="text-center">
                                                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                                                        Didn't receive the code? <span onClick={handleSendRegCode} className="text-decoration-none fw-medium" style={{ color: 'var(--primary)', cursor: 'pointer' }}>Resend</span>
                                                    </p>
                                                </div>
                                            </Form>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Image Side (Sliding) */}
                    <motion.div 
                        className="panel-image p-0"
                        initial={false}
                        animate={{ x: isLogin ? '0%' : '-100%' }}
                        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
                        style={{ zIndex: 1 }}
                    >
                        <div className="w-100 h-100 position-relative">
                            <img 
                                src={nurseImage} 
                                alt="Nurse" 
                                className="w-100 h-100 d-none d-lg-block" 
                                style={{ objectFit: 'cover' }}
                            />
                            {/* Overlay */}
                            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ backgroundColor: 'rgba(2, 89, 85, 0.1)' }}></div>
                        </div>
                    </motion.div>
                    
                </Row>
            </Container>
        </div>
    );
}
