import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [rejectReason, setRejectReason] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setRejectReason('');
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/nurse/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('nurse', JSON.stringify(res.data.nurse));
            navigate('/dashboard');
        } catch (err) {
            if (err.response?.data?.rejectReason) {
                setRejectReason(err.response.data.rejectReason);
            } else {
                setError(err.response?.data?.message || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', position: 'relative' }} className="d-flex align-items-center justify-content-center overflow-hidden">
            
            {/* Decorative background elements matching the main app identity */}
            <div className="position-absolute rounded-circle" style={{ width: '500px', height: '500px', background: 'rgba(2, 89, 85, 0.08)', top: '-150px', right: '-150px', filter: 'blur(70px)', zIndex: 0 }}></div>
            <div className="position-absolute rounded-circle" style={{ width: '400px', height: '400px', background: 'rgba(2, 89, 85, 0.05)', bottom: '-100px', left: '-100px', filter: 'blur(60px)', zIndex: 0 }}></div>

            <Container className="position-relative" style={{ zIndex: 1 }}>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
                    className="shadow-lg bg-white mx-auto overflow-hidden" 
                    style={{ maxWidth: '550px', borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)' }}
                >
                    <div className="p-4 p-md-5">
                        {/* Header Section - Left Aligned */}
                        <div className="mb-4 text-start">
                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 shadow-sm" style={{ width: '50px', height: '50px', backgroundColor: '#025955', color: '#ffffff' }}>
                                <i className="fa-solid fa-user-nurse fs-5"></i>
                            </div>
                            <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.5px', fontSize: '1.75rem', color: '#025955' }}>Nurse Portal</h2>
                            <p className="text-muted" style={{ fontSize: '0.95rem' }}>
                                Sign in to your account to manage patient records and schedules.
                            </p>
                        </div>

                        {/* Form Section */}
                        {rejectReason ? (
                            <div className="text-center py-4">
                                <div className="mb-4">
                                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 bg-danger bg-opacity-10" style={{ width: '70px', height: '70px' }}>
                                        <i className="fa-solid fa-file-circle-xmark fs-2 text-danger"></i>
                                    </div>
                                    <h4 className="fw-bold text-danger mb-3">Application Rejected</h4>
                                    <p className="text-muted mb-2" style={{ fontSize: '0.95rem' }}>
                                        Unfortunately, your application was rejected by the admin for the following reason:
                                    </p>
                                    <div className="bg-light p-3 rounded-3 border mb-4 text-start">
                                        <p className="mb-0 fw-medium text-dark">"{rejectReason}"</p>
                                    </div>
                                    <p className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>
                                        Please register again and ensure all your information is correct and up to date.
                                    </p>
                                </div>
                                <Button 
                                    className="w-100 py-2 rounded-3 fw-bold shadow-sm text-white d-flex justify-content-center align-items-center gap-2"
                                    style={{ backgroundColor: '#025955', border: 'none', fontSize: '1rem', transition: 'all 0.3s' }}
                                    onClick={() => navigate('/signup')}
                                >
                                    Register Again <i className="fa-solid fa-arrow-right fs-6"></i>
                                </Button>
                                <Button 
                                    variant="link" 
                                    className="w-100 mt-3 text-muted text-decoration-none"
                                    onClick={() => { setRejectReason(''); setEmail(''); setPassword(''); }}
                                >
                                    Back to Login
                                </Button>
                            </div>
                        ) : (
                            <>
                                {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
                        <Form onSubmit={handleLogin} className="text-start">
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Email</Form.Label>
                                <Form.Control 
                                    type="email" 
                                    placeholder="name@example.com" 
                                    className="py-2 px-3 shadow-none custom-input" 
                                    style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid #e2e8f0', backgroundColor: '#f9fafb', transition: 'all 0.2s' }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={(e) => { e.target.style.borderColor = '#025955'; e.target.style.boxShadow = '0 0 0 3px rgba(2, 89, 85, 0.15)' }}
                                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Password</Form.Label>
                                <div className="position-relative">
                                    <Form.Control 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="Enter your password" 
                                        className="py-2 px-3 shadow-none custom-input pe-5" 
                                        style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid #e2e8f0', backgroundColor: '#f9fafb', transition: 'all 0.2s' }}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={(e) => { e.target.style.borderColor = '#025955'; e.target.style.boxShadow = '0 0 0 3px rgba(2, 89, 85, 0.15)' }}
                                        onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                                        required
                                    />
                                    <span
                                        className="position-absolute"
                                        style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '1rem', color: '#94a3b8', transition: 'color 0.2s' }}
                                        onClick={() => setShowPassword(!showPassword)}
                                        onMouseOver={e => e.target.style.color = '#025955'}
                                        onMouseOut={e => e.target.style.color = '#94a3b8'}
                                    >
                                        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </span>
                                </div>
                            </Form.Group>

                            <div className="d-flex justify-content-end align-items-center mb-4">
                                <Link to="/forgot-password" className="text-decoration-none fw-semibold" style={{ fontSize: '0.85rem', color: '#025955', transition: 'opacity 0.2s' }} onMouseOver={e => e.target.style.opacity = '0.8'} onMouseOut={e => e.target.style.opacity = '1'}>
                                    Forgot Password?
                                </Link>
                            </div>

                            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                <Button 
                                    type="submit"
                                    className="w-100 py-2 rounded-3 fw-bold shadow-sm text-white d-flex justify-content-center align-items-center gap-2"
                                    style={{ backgroundColor: '#025955', border: 'none', fontSize: '1rem', transition: 'all 0.3s' }}
                                >
                                    Sign in <i className="fa-solid fa-arrow-right fs-6"></i>
                                </Button>
                            </motion.div>
                            
                            <div className="mt-4 text-center">
                                <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                    Don't have an account?{' '}
                                    <Link to="/signup" className="text-decoration-none fw-bold" style={{ color: '#025955', transition: 'opacity 0.2s' }} onMouseOver={e => e.target.style.opacity = '0.8'} onMouseOut={e => e.target.style.opacity = '1'}>
                                        Sign up
                                    </Link>
                                </p>
                            </div>
                        </Form>
                            </>
                        )}
                    </div>
                </motion.div>
            </Container>
            
            <style>{`
                .custom-input::placeholder {
                    color: #94a3b8;
                }
                .custom-checkbox .form-check-input:checked {
                    background-color: #025955;
                    border-color: #025955;
                }
                .custom-checkbox .form-check-input:focus {
                    box-shadow: 0 0 0 3px rgba(2, 89, 85, 0.15);
                    border-color: #025955;
                }
            `}</style>
        </div>
    );
}
