import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, InputGroup, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PasswordRequirements from '../common/PasswordRequirements';
import { useTranslation } from '../../hooks/useTranslation';

const ProfileTab = ({ showToast }) => {
    const { t } = useTranslation();
    const [nurseData, setNurseData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // Edit state
    const [editForm, setEditForm] = useState({
        phone: '',
        city: '',
        governorate: '',
        skills: []
    });

    // Password state
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [passwordError, setPasswordError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const availableSkills = ['Elderly Care', 'Post-operative Care', 'Chronic Care', 'Basic Care', 'Wound & Skin Care', 'Escort Services & Responsibilities'];


    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/nurse/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNurseData(response.data);
                setEditForm({
                    phone: response.data.phone || '',
                    city: response.data.city || '',
                    governorate: response.data.governorate || '',
                    skills: response.data.skills ? response.data.skills.split(', ') : []
                });
            } catch (error) {
                console.error("Error fetching profile:", error);
                showToast(t('Error'), t('Failed to load profile data'), 'danger');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [showToast]);

    const handleEditToggle = () => {
        if (!isEditing && nurseData) {
            setEditForm({
                phone: nurseData.phone || '',
                city: nurseData.city || '',
                governorate: nurseData.governorate || '',
                skills: nurseData.skills ? nurseData.skills.split(', ') : [],
                profilePicture: nurseData.profilePicture || ''
            });
        }
        setIsEditing(!isEditing);
    };

    const handleRemovePicture = async () => {
        if (!window.confirm(t("Are you sure you want to remove your profile picture?"))) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put('http://localhost:5000/api/nurse/auth/profile', 
                { profilePicture: '' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            showToast(t('Success'), t('Profile picture removed successfully.'), 'success');
            setNurseData(response.data.nurse);
            localStorage.setItem('nurse', JSON.stringify(response.data.nurse));
            setEditForm(prev => ({...prev, profilePicture: ''}));
            
            // Dispatch a custom event so the Topbar/Sidebar can update
            window.dispatchEvent(new Event('storage'));
        } catch (error) {
            showToast(t('Error'), error.response?.data?.message || t('Error removing picture'), 'danger');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put('http://localhost:5000/api/nurse/auth/profile', 
                { 
                    phone: editForm.phone,
                    city: editForm.city,
                    governorate: editForm.governorate,
                    skills: editForm.skills.join(', '),
                    profilePicture: editForm.profilePicture === '' ? '' : (editForm.profilePicture || nurseData.profilePicture)
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            showToast(t('Success'), t('Profile updated successfully.'), 'success');
            setNurseData(response.data.nurse);
            localStorage.setItem('nurse', JSON.stringify(response.data.nurse));
            setIsEditing(false);
            window.dispatchEvent(new Event('storage'));
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            showToast(t('Error'), error.response?.data?.message || t('Error updating profile'), 'danger');
        } finally {
            setIsSubmitting(false);
        }
    };


    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');

        if (passwords.new !== passwords.confirm) {
            setPasswordError(t('New passwords do not match.'));
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/nurse/auth/change-password', 
                { currentPassword: passwords.current, newPassword: passwords.new },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            showToast(t('Success'), t('Password changed successfully.'), 'success');
            setIsChangingPassword(false);
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            setPasswordError(error.response?.data?.message || t('Error changing password.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="text-center mt-5"><i className="fa-solid fa-spinner fa-spin text-primary fs-2"></i></div>;
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>{t('My Profile')}</h2>
                    <p className="text-muted mb-0 text-15">{t('Manage your personal information and security settings')}</p>
                </div>
                {!isEditing && (
                    <Button variant="primary" className="rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2" onClick={handleEditToggle}>
                        <i className="fa-solid fa-pen-to-square"></i> {t('Edit Profile')}
                    </Button>
                )}
            </div>

            <Row className="g-4">
                {/* Left Column: Profile Card & Security */}
                <Col lg={4}>
                    {/* Profile Summary Card */}
                    <Card className="border shadow-sm rounded-4 mb-4 overflow-hidden bg-body-tertiary text-center">
                        <div className="bg-primary position-relative" style={{ height: '100px' }}>
                            {/* Decorative background pattern could go here */}
                        </div>
                        <Card.Body className="px-4 pb-4 position-relative pt-0">
                            <div className="bg-body-tertiary p-1 rounded-circle d-inline-block position-relative shadow" style={{ marginTop: '-45px', marginBottom: '15px' }}>
                                <div className="bg-primary bg-gradient text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-inner position-relative overflow-hidden" style={{ width: '90px', height: '90px', fontSize: '2.5rem' }}>
                                    {isEditing ? (
                                        editForm.profilePicture ? (
                                            <img src={editForm.profilePicture} alt="Profile" className="w-100 h-100 object-fit-cover" />
                                        ) : (
                                            nurseData?.name?.charAt(0) || 'N'
                                        )
                                    ) : nurseData?.profilePicture ? (
                                        <img src={nurseData.profilePicture} alt="Profile" className="w-100 h-100 object-fit-cover" />
                                    ) : (
                                        nurseData?.name?.charAt(0) || 'N'
                                    )}
                                    
                                    {isEditing && (
                                        <label htmlFor="profilePicUpload" className="position-absolute bottom-0 w-100 text-center bg-dark bg-opacity-50 text-white" style={{ fontSize: '0.6rem', padding: '2px 0', cursor: 'pointer', zIndex: 2 }}>
                                            <i className="fa-solid fa-camera"></i>
                                            <input 
                                                type="file" 
                                                id="profilePicUpload" 
                                                accept="image/*" 
                                                className="d-none"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        if (file.size > 2 * 1024 * 1024) {
                                                            showToast('Error', 'Image size should be less than 2MB', 'danger');
                                                            return;
                                                        }
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setEditForm(prev => ({...prev, profilePicture: reader.result}));
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                                {(isEditing ? editForm.profilePicture : nurseData?.profilePicture) && (
                                    <button 
                                        type="button" 
                                        className="btn btn-sm btn-danger position-absolute rounded-circle d-flex align-items-center justify-content-center p-0 shadow hover-lift"
                                        style={{ width: '30px', height: '30px', bottom: '0px', right: '-10px', zIndex: 10, border: '3px solid white' }}
                                        onClick={handleRemovePicture}
                                        title="Remove Picture"
                                    >
                                        <i className="fa-solid fa-trash text-white" style={{ fontSize: '13px' }}></i>
                                    </button>
                                )}
                            </div>
                            <h4 className="fw-bold text-dark mb-1">{nurseData?.name}</h4>
                            <p className="text-primary fw-semibold mb-3 text-14">{nurseData?.qualification || 'Registered Nurse'}</p>
                            <div className="d-flex justify-content-center gap-2 mb-2">
                                <span className="badge bg-body border border-secondary border-opacity-25 text-dark px-3 py-2 rounded-pill text-12">
                                    <i className="fa-solid fa-star text-warning me-1"></i> {nurseData?.rating > 0 ? nurseData.rating.toFixed(1) : 'New'} {t('Rating')}
                                </span>
                                <span className="badge bg-body border border-secondary border-opacity-25 text-dark px-3 py-2 rounded-pill text-12">
                                    <i className={`fa-solid ${nurseData?.status === 'active' ? 'fa-check-circle text-success' : 'fa-clock text-warning'} me-1`}></i> {nurseData?.status === 'active' ? t('Active') : 'Pending'}
                                </span>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Security Card */}
                    <Card className="border shadow-sm rounded-4 bg-body-tertiary">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-4">
                                <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                    <i className="fa-solid fa-shield-halved"></i>
                                </div>
                                <h5 className="fw-bold text-dark mb-0">{t('Security')}</h5>
                            </div>
                            
                            {!isChangingPassword ? (
                                <div className="text-center py-2">
                                    <p className="text-muted mb-4 text-14">{t('Keep your account secure by regularly updating your password')}</p>
                                    <Button variant="outline-danger" className="w-100 rounded-pill fw-bold py-2 text-14" onClick={() => setIsChangingPassword(true)}>
                                        {t('Change Password')}
                                    </Button>
                                    <Link to="/forgot-password" className="d-block mt-3 text-decoration-none text-muted fw-semibold text-13 hover-primary">{t('Forgot Password?')}</Link>
                                </div>
                            ) : (
                                <Form onSubmit={handlePasswordChange}>
                                    {passwordError && <Alert variant="danger" className="py-2 px-3 border-0 rounded-3 text-danger bg-danger bg-opacity-10 fw-medium text-13 mb-3">{passwordError}</Alert>}
                                    
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold text-dark text-13">{t('Current Password')}</Form.Label>
                                        <InputGroup className="bg-body rounded-3 overflow-hidden border">
                                            <Form.Control type={showPasswords.current ? "text" : "password"} required className="py-2 px-3 shadow-none bg-transparent border-0 text-14" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
                                            <InputGroup.Text className="bg-transparent border-0 cursor-pointer" onClick={() => togglePasswordVisibility('current')}>
                                                <i className={`fa-regular ${showPasswords.current ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                                            </InputGroup.Text>
                                        </InputGroup>
                                    </Form.Group>
                                    
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold text-dark text-13">{t('New Password')}</Form.Label>
                                        <InputGroup className="bg-body rounded-3 overflow-hidden border">
                                            <Form.Control type={showPasswords.new ? "text" : "password"} required className="py-2 px-3 shadow-none bg-transparent border-0 text-14" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
                                            <InputGroup.Text className="bg-transparent border-0 cursor-pointer" onClick={() => togglePasswordVisibility('new')}>
                                                <i className={`fa-regular ${showPasswords.new ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                                            </InputGroup.Text>
                                        </InputGroup>
                                    </Form.Group>

                                    <PasswordRequirements password={passwords.new} />

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold text-dark text-13">{t('Confirm New Password')}</Form.Label>
                                        <InputGroup className="bg-body rounded-3 overflow-hidden border">
                                            <Form.Control type={showPasswords.confirm ? "text" : "password"} required className="py-2 px-3 shadow-none bg-transparent border-0 text-14" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
                                            <InputGroup.Text className="bg-transparent border-0 cursor-pointer" onClick={() => togglePasswordVisibility('confirm')}>
                                                <i className={`fa-regular ${showPasswords.confirm ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                                            </InputGroup.Text>
                                        </InputGroup>
                                    </Form.Group>
                                    
                                    <div className="d-flex gap-2">
                                        <Button variant="light" className="w-50 rounded-pill fw-bold text-14 border bg-body" onClick={() => { setIsChangingPassword(false); setPasswordError(''); setPasswords({ current: '', new: '', confirm: '' }); }}>{t('Cancel')}</Button>
                                        <Button variant="danger" type="submit" className="w-50 rounded-pill fw-bold shadow-sm text-14" disabled={isSubmitting}>
                                            {isSubmitting ? t('Saving...') : t('Save')}
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Column: Details & Edit Form */}
                <Col lg={8}>
                    <Card className="border shadow-sm rounded-4 bg-body-tertiary h-100">
                        <Card.Body className="p-4 p-md-5">
                            {isEditing ? (
                                <Form onSubmit={handleProfileUpdate}>
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </div>
                                        <h4 className="fw-bold text-dark mb-0">{t('Edit Profile')}</h4>
                                    </div>

                                    <Row className="g-4">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="text-muted fw-bold text-12 text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>{t('PHONE NUMBER')}</Form.Label>
                                                <Form.Control type="text" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="py-2 shadow-none border-secondary border-opacity-25 bg-body rounded-3" required />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="text-muted fw-bold text-12 text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>{t('City')}</Form.Label>
                                                <Form.Control type="text" value={editForm.city} onChange={(e) => setEditForm({...editForm, city: e.target.value})} className="py-2 shadow-none border-secondary border-opacity-25 bg-body rounded-3" required />
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="text-muted fw-bold text-12 text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>{t('Governorate')}</Form.Label>
                                                <Form.Select value={editForm.governorate} onChange={(e) => setEditForm({...editForm, governorate: e.target.value})} className="py-2 shadow-none border-secondary border-opacity-25 bg-body rounded-3" required>
                                                    <option value="">{t('Select Governorate')}</option>
                                                    <option value="Cairo">{t('Cairo')}</option>
                                                    <option value="Alexandria">{t('Alexandria')}</option>
                                                    <option value="Giza">{t('Giza')}</option>
                                                    {/* Other options... */}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="text-muted fw-bold text-12 text-uppercase mb-3" style={{ letterSpacing: '0.5px' }}>{t('Nursing Services Provided')}</Form.Label>
                                                <Row className="g-3">
                                                    {availableSkills.map(service => (
                                                        <Col xs={12} sm={6} key={service}>
                                                            <div className={`p-3 rounded-3 border transition-all cursor-pointer ${editForm.skills.includes(service) ? 'bg-primary bg-opacity-10 border-primary' : 'bg-body hover-bg-body-tertiary'}`}
                                                                 onClick={() => {
                                                                     if (!editForm.skills.includes(service)) setEditForm({...editForm, skills: [...editForm.skills, service]});
                                                                     else setEditForm({...editForm, skills: editForm.skills.filter(s => s !== service)});
                                                                 }}>
                                                                <Form.Check 
                                                                    type="checkbox" 
                                                                    id={`service-${service}`}
                                                                    label={<span className={`fw-medium text-14 ${editForm.skills.includes(service) ? 'text-primary' : 'text-dark'}`}>{t(service)}</span>}
                                                                    checked={editForm.skills.includes(service)}
                                                                    onChange={() => {}} // handled by parent div
                                                                    className="mb-0 custom-checkbox"
                                                                />
                                                            </div>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </Form.Group>
                                        </Col>
                                        <Col md={12} className="d-flex justify-content-end gap-3 mt-5 border-top pt-4">
                                            <Button variant="light" className="px-5 py-2 fw-bold rounded-pill text-14 border shadow-sm bg-body" onClick={handleEditToggle} disabled={isSubmitting}>{t('Cancel')}</Button>
                                            <Button variant="primary" type="submit" className="px-5 py-2 fw-bold rounded-pill text-14 shadow-sm" disabled={isSubmitting}>
                                                {isSubmitting ? <><i className="fa-solid fa-spinner fa-spin me-2"></i>{t('Saving...')}</> : t('Save Changes')}
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
                            ) : (
                                <div>
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                            <i className="fa-regular fa-id-card"></i>
                                        </div>
                                        <h4 className="fw-bold text-dark mb-0">{t('Professional Details')}</h4>
                                    </div>
                                    
                                    <Row className="g-4 mb-5">
                                        <Col md={6}>
                                            <div className="d-flex align-items-start gap-3 p-3 bg-body border rounded-3">
                                                <div className="bg-body-tertiary border border-secondary border-opacity-10 rounded p-2 text-primary shadow-sm"><i className="fa-solid fa-envelope"></i></div>
                                                <div>
                                                    <p className="text-muted mb-0 fw-bold text-11 text-uppercase" style={{ letterSpacing: '0.5px' }}>{t('EMAIL ADDRESS')}</p>
                                                    <p className="fw-bold text-dark mb-0 text-14">{nurseData?.email}</p>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="d-flex align-items-start gap-3 p-3 bg-body border rounded-3">
                                                <div className="bg-body-tertiary border border-secondary border-opacity-10 rounded p-2 text-primary shadow-sm"><i className="fa-solid fa-phone"></i></div>
                                                <div>
                                                    <p className="text-muted mb-0 fw-bold text-11 text-uppercase" style={{ letterSpacing: '0.5px' }}>{t('PHONE NUMBER')}</p>
                                                    <p className="fw-bold text-dark mb-0 text-14">{nurseData?.phone || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="d-flex align-items-start gap-3 p-3 bg-body border rounded-3">
                                                <div className="bg-body-tertiary border border-secondary border-opacity-10 rounded p-2 text-primary shadow-sm"><i className="fa-solid fa-id-badge"></i></div>
                                                <div>
                                                    <p className="text-muted mb-0 fw-bold text-11 text-uppercase" style={{ letterSpacing: '0.5px' }}>{t('LICENSE NUMBER')}</p>
                                                    <p className="fw-bold text-dark mb-0 text-14 font-monospace">{nurseData?.licenseNumber || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="d-flex align-items-start gap-3 p-3 bg-body border rounded-3">
                                                <div className="bg-body-tertiary border border-secondary border-opacity-10 rounded p-2 text-primary shadow-sm"><i className="fa-solid fa-briefcase-medical"></i></div>
                                                <div>
                                                    <p className="text-muted mb-0 fw-bold text-11 text-uppercase" style={{ letterSpacing: '0.5px' }}>{t('EXPERIENCE')}</p>
                                                    <p className="fw-bold text-dark mb-0 text-14">{nurseData?.experienceYears ? `${nurseData.experienceYears} ${t('Years')}` : 'N/A'}</p>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="d-flex align-items-start gap-3 p-3 bg-body border rounded-3">
                                                <div className="bg-body-tertiary border border-secondary border-opacity-10 rounded p-2 text-primary shadow-sm"><i className="fa-solid fa-graduation-cap"></i></div>
                                                <div>
                                                    <p className="text-muted mb-0 fw-bold text-11 text-uppercase" style={{ letterSpacing: '0.5px' }}>{t('UNIVERSITY / FACULTY')}</p>
                                                    <p className="fw-bold text-dark mb-0 text-14">{nurseData?.university ? `${nurseData.university} - ${nurseData.faculty}` : 'N/A'}</p>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="d-flex align-items-start gap-3 p-3 bg-body border rounded-3">
                                                <div className="bg-body-tertiary border border-secondary border-opacity-10 rounded p-2 text-primary shadow-sm"><i className="fa-solid fa-location-dot"></i></div>
                                                <div>
                                                    <p className="text-muted mb-0 fw-bold text-11 text-uppercase" style={{ letterSpacing: '0.5px' }}>{t('Location')}</p>
                                                    <p className="fw-bold text-dark mb-0 text-14">{nurseData?.city ? `${nurseData.city}, ${nurseData.governorate}` : 'N/A'}</p>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>

                                    {nurseData?.skills && (
                                        <>
                                            <div className="d-flex align-items-center mb-3">
                                                <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                                    <i className="fa-solid fa-hand-holding-medical"></i>
                                                </div>
                                                <h5 className="fw-bold text-dark mb-0">{t('Registered Services')}</h5>
                                            </div>
                                            <div className="d-flex flex-wrap gap-2 ms-5">
                                                {nurseData.skills.split(', ').map((skill, index) => (
                                                    <span key={index} className="badge bg-body border border-secondary border-opacity-25 text-dark px-3 py-2 fw-bold text-13 rounded-pill shadow-sm">
                                                        <i className="fa-solid fa-check text-success me-2"></i>{t(skill)}
                                                    </span>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </motion.div>
    );
};

export default ProfileTab;
