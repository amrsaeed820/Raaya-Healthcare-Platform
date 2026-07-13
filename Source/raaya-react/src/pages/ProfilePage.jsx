import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PasswordRequirements, { validatePassword } from '../components/common/PasswordRequirements';
import axios from 'axios';
import MedicalRecordsTab from '../components/profile/MedicalRecordsTab';
import BookingHistoryTab from '../components/profile/BookingHistoryTab';
import WalletTab from '../components/profile/WalletTab';
import FamilyMembersTab from '../components/profile/FamilyMembersTab';
import NotificationsTab from '../components/profile/NotificationsTab';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Animated Toast Component
const AnimatedToast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? '#d1fae5' : '#fee2e2';
    const textColor = type === 'success' ? '#065f46' : '#991b1b';
    const barColor = type === 'success' ? '#10b981' : '#ef4444';
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mb-4 overflow-hidden rounded-3 shadow-sm position-relative"
            style={{ backgroundColor: bgColor, border: `1px solid ${barColor}40` }}
        >
            <div className="p-3 d-flex align-items-center gap-2">
                <i className={`fa-solid ${icon} fs-5`} style={{ color: barColor }}></i>
                <span className="fw-medium" style={{ color: textColor, fontSize: '0.95rem' }}>{message}</span>
            </div>
            {/* Progress bar line */}
            <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 3, ease: 'linear' }}
                style={{ height: '4px', backgroundColor: barColor, position: 'absolute', bottom: 0, left: 0 }}
            />
        </motion.div>
    );
};

export default function ProfilePage() {
    const { logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'personal');
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
            // Clear state so it doesn't persist on refresh
            window.history.replaceState({}, document.title)
        }
    }, [location.state]);

    // Profile States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [address, setAddress] = useState('');

    const [originalData, setOriginalData] = useState({ name: '', phone: '', gender: '', age: '', profilePicture: '', address: '' });

    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null); // { message, type }
    const [viewMode, setViewMode] = useState('profile'); // 'profile' | 'password'

    const [unreadNotifCount, setUnreadNotifCount] = useState(0);

    useEffect(() => {
        const fetchUnreadNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get('http://localhost:5000/api/notifications/patient', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const unread = res.data.filter(n => !n.isRead).length;
                setUnreadNotifCount(unread);
            } catch (err) {
                console.error("Failed to fetch notifications count", err);
            }
        };
        fetchUnreadNotifications();
    }, []);

    // Password States
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return navigate('/login');

                const res = await axios.get('http://localhost:5000/api/user/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const user = res.data;
                setName(user.name || '');
                setEmail(user.email || '');
                setPhone(user.phone || '');
                setGender(user.gender || '');
                setAge(user.age || '');
                setProfilePicture(user.profilePicture || '');
                setAddress(user.address || '');

                setOriginalData({
                    name: user.name || '',
                    phone: user.phone || '',
                    gender: user.gender || '',
                    age: user.age || '',
                    profilePicture: user.profilePicture || '',
                    address: user.address || ''
                });
            } catch (error) {
                console.error("Failed to fetch profile", error);
            }
        };
        fetchProfile();
    }, [navigate]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleConfirmLogout = () => {
        logout();
        navigate('/login');
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 800 * 1024) {
                showToast("Image size exceeds 800KB", "error");
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setProfilePicture(reader.result);
            };
        }
    };

    const handleRemoveImage = () => {
        setProfilePicture('');
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();

        if (!/^\d+$/.test(phone)) {
            return showToast("Phone number must contain only numbers.", "error");
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/user/profile', {
                name, phone, gender, age: age ? parseInt(age) : undefined, profilePicture, address
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast("Profile updated successfully!");
            setOriginalData({ name, phone, gender, age, profilePicture, address }); // Update original data after save
            if (refreshUser) refreshUser(); // Update Header
        } catch (error) {
            showToast("Failed to update profile.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            showToast("Geolocation is not supported by your browser", "error");
            return;
        }

        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                // Reverse geocode using Nominatim with high precision and English language preference
                const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`);
                if (res.data && res.data.display_name) {
                    setAddress(res.data.display_name);
                    showToast("Location updated successfully!");
                }
            } catch (error) {
                showToast("Failed to fetch address from location", "error");
            } finally {
                setIsLoading(false);
            }
        }, (error) => {
            showToast("Failed to get your location. Please check permissions.", "error");
            setIsLoading(false);
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (oldPassword === newPassword) {
            return showToast("New password cannot be the same as the current password.", "error");
        }
        if (newPassword !== confirmPassword) {
            return showToast("New passwords do not match!", "error");
        }
        if (!validatePassword(newPassword)) {
            return showToast("Password must be at least 8 characters, contain no spaces, and meet the complexity requirements.", "error");
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
            showToast("Password changed successfully!", "success");
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setViewMode('profile'), 1500); // go back to profile after success
        } catch (error) {
            showToast(error.response?.data?.message || "Failed to change password.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const hasChanges =
        name.trim() !== originalData.name ||
        phone.trim() !== originalData.phone ||
        gender !== originalData.gender ||
        age.toString() !== originalData.age?.toString() ||
        profilePicture !== originalData.profilePicture ||
        address.trim() !== originalData.address;

    const tabs = [
        { id: 'personal', label: 'Personal Information', icon: 'fa-user' },
        { id: 'family', label: 'Family Members', icon: 'fa-users' },
        { id: 'medical', label: 'Medical Record', icon: 'fa-notes-medical' },
        { id: 'booking', label: 'Booking History', icon: 'fa-calendar-check' },
        { id: 'notifications', label: 'Notifications', icon: 'fa-bell' },
        { id: 'wallet', label: 'Wallet', icon: 'fa-wallet' },
    ];

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '76px' }}>

            <Container className="mt-4 pb-5">
                <Row className="g-4 g-lg-5">
                    {/* Sidebar Tabs */}
                    <Col lg={4} xl={3}>
                        <div className="bg-white rounded-4 shadow-sm p-3 border" style={{ borderColor: '#eef2f5' }}>

                            <div className="d-flex align-items-center gap-3 mb-4 p-2 pb-4 border-bottom">
                                <div className="d-flex align-items-center justify-content-center shadow-sm overflow-hidden" style={{ width: '55px', height: '55px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#94a3b8', border: '2px solid white' }}>
                                    {originalData.profilePicture ? (
                                        <img src={originalData.profilePicture} alt="Profile" className="w-100 h-100 object-fit-cover" />
                                    ) : (
                                        <i className="fa-solid fa-user fs-4"></i>
                                    )}
                                </div>
                                <div>
                                    <h6 className="mb-0 fw-bold text-dark text-truncate" style={{ letterSpacing: '-0.3px', maxWidth: '150px' }}>{originalData.name || 'Loading...'}</h6>
                                    <small className="text-muted text-truncate d-block" style={{ maxWidth: '150px' }}>{email || 'Loading...'}</small>
                                </div>
                            </div>

                            <div className="d-flex flex-column gap-2">
                                {tabs.map(tab => (
                                    <div
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            setViewMode('profile'); // reset view mode when changing tabs
                                        }}
                                        className={`px-4 py-3 rounded-4 d-flex align-items-center gap-3 transition-all`}
                                        style={{
                                            cursor: 'pointer',
                                            backgroundColor: activeTab === tab.id ? 'var(--primary-light, rgba(2, 89, 85, 0.08))' : 'transparent',
                                            color: activeTab === tab.id ? 'var(--primary)' : '#64748b',
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (activeTab !== tab.id) {
                                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                                e.currentTarget.style.color = '#334155';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (activeTab !== tab.id) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = '#64748b';
                                            }
                                        }}
                                    >
                                        <div style={{ width: '24px', textAlign: 'center' }}>
                                            <i className={`fa-solid ${tab.icon} ${activeTab === tab.id ? 'fs-5' : 'fs-6'}`} style={{ transition: 'all 0.2s ease' }}></i>
                                        </div>
                                        <span className={activeTab === tab.id ? 'fw-bold' : 'fw-medium'} style={{ fontSize: '1rem' }}>{tab.label}</span>
                                        {tab.id === 'notifications' && unreadNotifCount > 0 && (
                                            <div className="ms-auto bg-danger text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '22px', height: '22px', fontSize: '0.75rem' }}>
                                                {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <hr className="my-2 border-light" />

                                <div
                                    onClick={() => setShowLogoutModal(true)}
                                    className="px-4 py-3 rounded-4 d-flex align-items-center gap-3 transition-all"
                                    style={{
                                        cursor: 'pointer',
                                        backgroundColor: '#fff1f2',
                                        color: '#e11d48',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffe4e6'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff1f2'}
                                >
                                    <div style={{ width: '24px', textAlign: 'center' }}>
                                        <i className="fa-solid fa-arrow-right-from-bracket fs-6"></i>
                                    </div>
                                    <span className="fw-bold" style={{ fontSize: '1rem' }}>Logout</span>
                                </div>
                            </div>
                        </div>
                    </Col>

                    {/* Main Content Area */}
                    <Col lg={8} xl={9}>
                        <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 border h-100 overflow-hidden" style={{ borderColor: '#eef2f5', position: 'relative' }}>
                            <AnimatePresence mode="wait">
                                {toast && (
                                    <AnimatedToast
                                        key="toast"
                                        message={toast.message}
                                        type={toast.type}
                                        onClose={() => setToast(null)}
                                    />
                                )}
                            </AnimatePresence>

                            <AnimatePresence mode="wait">
                                {/* Personal Information Tab */}
                                {activeTab === 'personal' && viewMode === 'profile' && (
                                    <motion.div
                                        key="profile"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-5 border-bottom pb-4 d-flex justify-content-between align-items-center">
                                            <div>
                                                <h4 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>Personal Information</h4>
                                                <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>Update your photo and personal details here.</p>
                                            </div>
                                        </div>

                                        <div className="d-flex flex-column flex-md-row align-items-md-center gap-4 mb-5">
                                            <div className="d-flex align-items-center justify-content-center overflow-hidden" style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#94a3b8', border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                                                {profilePicture ? (
                                                    <img src={profilePicture} alt="Profile" className="w-100 h-100 object-fit-cover" />
                                                ) : (
                                                    <i className="fa-solid fa-user" style={{ fontSize: '2.5rem' }}></i>
                                                )}
                                            </div>
                                            <div>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleImageUpload}
                                                    accept="image/png, image/jpeg, image/gif"
                                                    style={{ display: 'none' }}
                                                />
                                                <div className="d-flex gap-2 mb-2">
                                                    <Button
                                                        variant="outline-dark"
                                                        className="rounded-pill px-4 fw-medium"
                                                        size="sm"
                                                        onClick={() => fileInputRef.current.click()}
                                                    >
                                                        Upload Picture
                                                    </Button>
                                                    {profilePicture && (
                                                        <Button
                                                            variant="outline-danger"
                                                            className="rounded-pill px-3 fw-medium"
                                                            size="sm"
                                                            onClick={handleRemoveImage}
                                                        >
                                                            <i className="fa-solid fa-trash"></i>
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="text-muted" style={{ fontSize: '0.8rem' }}>JPG, GIF or PNG. Max size of 800K</div>
                                            </div>
                                        </div>

                                        <Form onSubmit={handleSaveChanges}>
                                            <Row className="g-4 mb-4">
                                                <Col md={12}>
                                                    <Form.Group>
                                                        <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>Full Name</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                            className="py-2 px-3 shadow-none bg-light"
                                                            style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid transparent' }}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Row className="g-4 mb-4">
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>Email Address</Form.Label>
                                                        <Form.Control
                                                            type="email"
                                                            value={email}
                                                            readOnly
                                                            className="py-2 px-3 shadow-none"
                                                            style={{ borderRadius: '10px', fontSize: '0.95rem', backgroundColor: '#eef2f5', border: '1px solid transparent', color: '#64748b' }}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>Phone Number</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={phone}
                                                            onChange={(e) => setPhone(e.target.value)}
                                                            className="py-2 px-3 shadow-none bg-light"
                                                            style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid transparent' }}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Row className="g-4 mb-4">
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>Gender</Form.Label>
                                                        <Form.Select
                                                            value={gender}
                                                            onChange={(e) => setGender(e.target.value)}
                                                            className="py-2 px-3 shadow-none bg-light"
                                                            style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid transparent', cursor: 'pointer' }}
                                                        >
                                                            <option value="" disabled>Select your gender</option>
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>Age</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            min="1" max="120"
                                                            placeholder="Enter your age"
                                                            value={age}
                                                            onChange={(e) => setAge(e.target.value)}
                                                            className="py-2 px-3 shadow-none bg-light"
                                                            style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid transparent' }}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Form.Group className="mb-4">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <Form.Label className="fw-semibold text-dark mb-0" style={{ fontSize: '0.9rem' }}>Address</Form.Label>
                                                    <Button
                                                        variant="link"
                                                        className="text-primary text-decoration-none p-0 d-flex align-items-center gap-1"
                                                        style={{ fontSize: '0.85rem', fontWeight: '500' }}
                                                        onClick={handleUseCurrentLocation}
                                                        disabled={isLoading}
                                                    >
                                                        <i className="fa-solid fa-location-crosshairs"></i>
                                                        Use Current Location
                                                    </Button>
                                                </div>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    placeholder="Enter your full address"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    className="py-2 px-3 shadow-none bg-light"
                                                    style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid transparent', resize: 'none' }}
                                                />
                                            </Form.Group>

                                            <div className="mb-5">
                                                <Form.Label className="fw-semibold text-dark mb-2" style={{ fontSize: '0.9rem' }}>Security</Form.Label>
                                                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between p-3 rounded-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                                    <div className="d-flex align-items-center gap-3 mb-3 mb-md-0">
                                                        <div className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm" style={{ width: '45px', height: '45px' }}>
                                                            <i className="fa-solid fa-shield-halved fs-5" style={{ color: 'var(--primary)' }}></i>
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.95rem' }}>Password</h6>
                                                            <small className="text-muted" style={{ fontSize: '0.85rem' }}>Manage your account password</small>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline-dark"
                                                        className="fw-bold rounded-pill px-4 py-2"
                                                        style={{ fontSize: '0.9rem' }}
                                                        onClick={() => setViewMode('password')}
                                                    >
                                                        Change Password
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-end pt-4 border-top">
                                                <Button
                                                    type="submit"
                                                    disabled={isLoading || !hasChanges}
                                                    className="px-5 py-2 rounded-pill fw-bold shadow-sm border-0 d-flex align-items-center justify-content-center gap-2"
                                                    style={{
                                                        backgroundColor: hasChanges ? 'var(--primary)' : '#e2e8f0',
                                                        color: hasChanges ? 'white' : '#94a3b8',
                                                        fontSize: '0.95rem',
                                                        transition: 'all 0.3s',
                                                        cursor: hasChanges ? 'pointer' : 'not-allowed'
                                                    }}
                                                >
                                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                                    <i className="fa-solid fa-check"></i>
                                                </Button>
                                            </div>
                                        </Form>
                                    </motion.div>
                                )}

                                {/* Change Password Inside Profile Tab */}
                                {activeTab === 'personal' && viewMode === 'password' && (
                                    <motion.div
                                        key="password"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-5 border-bottom pb-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <button
                                                    onClick={() => setViewMode('profile')}
                                                    className="btn btn-link text-muted p-0 text-decoration-none d-flex align-items-center justify-content-center"
                                                    style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f8fafc', transition: 'all 0.2s' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                                >
                                                    <i className="fa-solid fa-arrow-left fs-5"></i>
                                                </button>
                                                <div>
                                                    <h4 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>Change Password</h4>
                                                    <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>Secure your account with a new password.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <Form onSubmit={handleChangePassword}>
                                            <Form.Group className="mb-4">
                                                <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>Current Password</Form.Label>
                                                <div className="position-relative">
                                                    <Form.Control
                                                        type={showOldPassword ? "text" : "password"}
                                                        value={oldPassword}
                                                        onChange={(e) => setOldPassword(e.target.value)}
                                                        required
                                                        className="py-2 px-3 shadow-none bg-light pe-5"
                                                        style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid transparent' }}
                                                    />
                                                    <i
                                                        className={`fa-solid ${showOldPassword ? 'fa-eye-slash' : 'fa-eye'} position-absolute`}
                                                        style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#a0aabf' }}
                                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                                    ></i>
                                                </div>
                                            </Form.Group>

                                            <Form.Group className="mb-2">
                                                <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>New Password</Form.Label>
                                                <div className="position-relative">
                                                    <Form.Control
                                                        type={showNewPassword ? "text" : "password"}
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        required
                                                        className="py-2 px-3 shadow-none bg-light pe-5"
                                                        style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid transparent' }}
                                                    />
                                                    <i
                                                        className={`fa-solid ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'} position-absolute`}
                                                        style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#a0aabf' }}
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                    ></i>
                                                </div>
                                            </Form.Group>

                                            <PasswordRequirements password={newPassword} />

                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>Confirm New Password</Form.Label>
                                                <div className="position-relative">
                                                    <Form.Control
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        required
                                                        className="py-2 px-3 shadow-none bg-light pe-5"
                                                        style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid transparent' }}
                                                    />
                                                    <i
                                                        className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} position-absolute`}
                                                        style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#a0aabf' }}
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    ></i>
                                                </div>
                                            </Form.Group>

                                            <div className="mb-5">
                                                <Button
                                                    variant="link"
                                                    className="text-muted text-decoration-none p-0 fw-medium"
                                                    style={{ fontSize: '0.9rem' }}
                                                    onClick={() => navigate('/forgot-password')}
                                                >
                                                    Forgot Password?
                                                </Button>
                                            </div>

                                            <div className="d-flex justify-content-end pt-4 border-top">
                                                <Button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="px-5 py-2 rounded-pill fw-bold shadow-sm border-0 w-100 w-md-auto"
                                                    style={{ backgroundColor: 'var(--primary)', color: 'white', transition: 'all 0.3s' }}
                                                >
                                                    {isLoading ? 'Updating...' : 'Update Password'}
                                                </Button>
                                            </div>
                                        </Form>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Medical Record Tab */}
                            {activeTab === 'medical' && (
                                <MedicalRecordsTab />
                            )}

                            {/* Family Members Tab */}
                            {activeTab === 'family' && (
                                <FamilyMembersTab />
                            )}

                            {/* Booking History Tab */}
                            {activeTab === 'booking' && (
                                <BookingHistoryTab />
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <NotificationsTab onRead={() => setUnreadNotifCount(0)} />
                            )}

                            {/* Wallet Tab */}
                            {activeTab === 'wallet' && (
                                <ErrorBoundary>
                                    <WalletTab />
                                </ErrorBoundary>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Modern Logout Modal */}
            <Modal
                show={showLogoutModal}
                onHide={() => setShowLogoutModal(false)}
                centered
                backdrop="static"
                contentClassName="border-0 rounded-4 shadow-lg overflow-hidden"
            >
                <div className="p-4 p-md-5 text-center position-relative">
                    <button
                        onClick={() => setShowLogoutModal(false)}
                        className="btn btn-link text-muted position-absolute"
                        style={{ top: '15px', right: '15px', textDecoration: 'none' }}
                    >
                        <i className="fa-solid fa-xmark fs-5"></i>
                    </button>

                    <div
                        className="mx-auto d-flex align-items-center justify-content-center rounded-circle mb-4"
                        style={{ width: '80px', height: '80px', backgroundColor: '#fff1f2', color: '#e11d48' }}
                    >
                        <i className="fa-solid fa-arrow-right-from-bracket fs-1"></i>
                    </div>

                    <h3 className="fw-bold text-dark mb-3">Sign Out</h3>
                    <p className="text-muted mb-4 px-3" style={{ fontSize: '0.95rem' }}>
                        Are you sure you would like to sign out of your account? You will need to log back in to manage your appointments.
                    </p>

                    <div className="d-flex flex-column gap-2 mt-4">
                        <Button
                            variant="danger"
                            className="w-100 py-3 rounded-pill fw-bold border-0 shadow-sm"
                            style={{ backgroundColor: '#e11d48', fontSize: '1.05rem' }}
                            onClick={handleConfirmLogout}
                        >
                            Yes, Sign Out
                        </Button>
                        <Button
                            variant="light"
                            className="w-100 py-3 rounded-pill fw-bold text-dark border-0"
                            style={{ backgroundColor: 'transparent', fontSize: '1.05rem' }}
                            onClick={() => setShowLogoutModal(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            <style>{`
                @media (min-width: 768px) {
                    .w-md-auto {
                        width: auto !important;
                    }
                }
            `}</style>
        </div>
    );
}
