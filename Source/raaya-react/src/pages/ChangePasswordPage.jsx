import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageHeader from '../components/layout/PageHeader';
import PasswordRequirements, { validatePassword } from '../components/common/PasswordRequirements';

export default function ChangePasswordPage() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (oldPassword === newPassword) {
            return setErrorMsg("New password cannot be the same as the current password.");
        }
        if (newPassword !== confirmPassword) {
            return setErrorMsg("New passwords do not match!");
        }
        if (!validatePassword(newPassword)) {
            return setErrorMsg("Password must be at least 8 characters, contain no spaces, and meet the complexity requirements.");
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/user/change-password', {
                oldPassword,
                newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMsg("Password changed successfully!");
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setErrorMsg(error.response?.data?.message || "Failed to change password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '76px' }}>
            <PageHeader 
                title={<span>Change <span className="text-primary">Password</span></span>} 
                description="Update your password securely." 
            />

            <Container className="mt-5 pb-5 d-flex justify-content-center">
                <div className="bg-white rounded-4 shadow-sm p-4 p-md-5 border" style={{ borderColor: '#eef2f5', width: '100%', maxWidth: '500px' }}>
                    <div className="text-center mb-4">
                        <div className="mx-auto bg-light rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                            <i className="fa-solid fa-lock" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
                        </div>
                        <h4 className="fw-bold text-dark">Secure Your Account</h4>
                    </div>

                    {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
                    {successMsg && <Alert variant="success">{successMsg}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>Current Password</Form.Label>
                            <div className="position-relative">
                                <Form.Control 
                                    type={showOldPassword ? "text" : "password"} 
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                    className="py-2 px-3 shadow-none bg-light pe-5" 
                                    style={{ borderRadius: '10px' }} 
                                />
                                <i 
                                    className={`fa-solid ${showOldPassword ? 'fa-eye-slash' : 'fa-eye'} position-absolute`} 
                                    style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#a0aabf' }}
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                ></i>
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>New Password</Form.Label>
                            <div className="position-relative">
                                <Form.Control 
                                    type={showNewPassword ? "text" : "password"} 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="py-2 px-3 shadow-none bg-light pe-5" 
                                    style={{ borderRadius: '10px' }} 
                                />
                                <i 
                                    className={`fa-solid ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'} position-absolute`} 
                                    style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#a0aabf' }}
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                ></i>
                            </div>
                        </Form.Group>

                        <PasswordRequirements password={newPassword} />

                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>Confirm New Password</Form.Label>
                            <div className="position-relative">
                                <Form.Control 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="py-2 px-3 shadow-none bg-light pe-5" 
                                    style={{ borderRadius: '10px' }} 
                                />
                                <i 
                                    className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} position-absolute`} 
                                    style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#a0aabf' }}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                ></i>
                            </div>
                        </Form.Group>

                        <Button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-100 py-3 rounded-pill fw-bold border-0 shadow-sm mb-3"
                            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                        >
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </Button>

                        <div className="text-center">
                            <Button variant="link" className="text-muted text-decoration-none" style={{ fontSize: '0.9rem' }} onClick={() => navigate('/login')}>
                                Forgot password?
                            </Button>
                        </div>
                    </Form>
                </div>
            </Container>
        </div>
    );
}
