import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const QUICK_SERVICES = [
    { id: 'Wound & Skin Care', label: 'Wound & Skin Care', icon: 'fa-band-aid', price: 200 },
    { id: 'IV Cannula Insertion', label: 'IV Cannula Insertion', icon: 'fa-syringe', price: 150 },
    { id: 'Injections & Medications', label: 'Injections & Medications', icon: 'fa-pills', price: 100 },
    { id: 'Catheterization', label: 'Catheterization', icon: 'fa-vial', price: 250 },
    { id: 'Vital Signs Monitoring', label: 'Vital Signs', icon: 'fa-heart-pulse', price: 150 }
];

export default function UrgentBookingPage() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedService, setSelectedService] = useState('');
    const [isForSomeoneElse, setIsForSomeoneElse] = useState(false);
    const [selectedFamilyMemberIndex, setSelectedFamilyMemberIndex] = useState('');
    const [prices, setPrices] = useState({});

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settingsRes = await axios.get('http://localhost:5000/api/settings');
                if (settingsRes.data && settingsRes.data.servicesPricing) {
                    setPrices(settingsRes.data.servicesPricing);
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
            }
        };
        fetchSettings();
    }, []);
    
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', address: '', message: '',
        theirName: '', theirPhone: '', theirAddress: '', theirMessage: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingId, setBookingId] = useState(null);
    const [pollingStatus, setPollingStatus] = useState('searching'); // 'searching', 'accepted'
    const [assignedNurse, setAssignedNurse] = useState(null);

    useEffect(() => {
        if (isAuthenticated && user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                phone: user.phone || prev.phone,
                address: user.address || prev.address
            }));
            
            if (isForSomeoneElse && selectedFamilyMemberIndex !== '' && user.familyMembers) {
                const member = user.familyMembers[selectedFamilyMemberIndex];
                if (member) {
                    setFormData(prev => ({
                        ...prev,
                        theirName: member.name || '',
                        theirPhone: user.phone || '',
                        theirAddress: member.address || '',
                    }));
                }
            } else if (isForSomeoneElse && selectedFamilyMemberIndex === '') {
                setFormData(prev => ({
                    ...prev,
                    theirName: '',
                    theirPhone: user.phone || prev.theirPhone,
                    theirAddress: '',
                }));
            }
        }
    }, [isAuthenticated, user, isForSomeoneElse, selectedFamilyMemberIndex]);

    const isStep2Valid = isForSomeoneElse
        ? formData.theirName.trim() !== '' && formData.theirPhone.trim() !== '' && formData.theirAddress.trim() !== '' && (isAuthenticated || formData.email.trim() !== '')
        : formData.name.trim() !== '' && formData.email.trim() !== '' && formData.phone.trim() !== '' && formData.address.trim() !== '';

    const handleConfirmBooking = async () => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const endpoint = isAuthenticated ? 'http://localhost:5000/api/bookings/patient/urgent' : 'http://localhost:5000/api/bookings/guest/urgent';
            const headers = isAuthenticated && token ? { Authorization: `Bearer ${token}` } : {};

            const patientDetails = isForSomeoneElse ? {
                name: formData.theirName,
                phone: formData.theirPhone,
                address: formData.theirAddress,
                message: formData.theirMessage,
                email: !isAuthenticated ? formData.email : '',
                isForSomeoneElse: true
            } : {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                message: formData.message,
                isForSomeoneElse: false
            };

            const srv = QUICK_SERVICES.find(s => s.id === selectedService);
            const dynamicPrice = prices['Wound & Skin Care'] || 300;

            const res = await axios.post(endpoint, {
                service: selectedService,
                shift: 'Single Visit',
                date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                patientDetails,
                paymentMethod: 'Cash',
                totalCost: dynamicPrice
            }, { headers });

            setBookingId(res.data.booking._id);
            setCurrentStep(4); // Polling step
        } catch (error) {
            console.error("Booking failed:", error);
            alert(error.response?.data?.message || "Failed to submit urgent request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Polling Logic
    useEffect(() => {
        let interval;
        if (currentStep === 4 && bookingId && pollingStatus === 'searching') {
            interval = setInterval(async () => {
                try {
                    const res = await axios.get(`http://localhost:5000/api/bookings/${bookingId}/status`);
                    if (res.data.status === 'confirmed' || res.data.status === 'upcoming') {
                        setAssignedNurse(res.data.nurseId?.personalInfo?.name || 'A Nurse');
                        setPollingStatus('accepted');
                        clearInterval(interval);
                    }
                } catch (e) {
                    console.error("Polling error:", e);
                }
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [currentStep, bookingId, pollingStatus]);

    const Stepper = () => (
        <div className="d-flex align-items-center justify-content-center flex-wrap gap-2 gap-md-4 mb-5 mx-auto" style={{ maxWidth: '600px' }}>
            <div className={`d-flex flex-column align-items-center position-relative z-1 ${currentStep < 1 ? 'opacity-50' : ''}`}>
                <div className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${currentStep >= 1 ? 'text-white shadow-sm' : 'bg-white border'}`}
                    style={{ width: '48px', height: '48px', backgroundColor: currentStep >= 1 ? 'var(--primary)' : 'transparent', color: currentStep >= 1 ? '#fff' : '#6c757d', borderColor: '#e0e6eb' }}>
                    {currentStep > 1 ? <i className="fa-solid fa-check fs-5"></i> : <i className="fa-solid fa-truck-medical fs-5"></i>}
                </div>
                <span className={currentStep >= 1 ? 'fw-bold text-primary' : 'fw-medium text-muted'} style={{ fontSize: '0.8rem' }}>Service</span>
            </div>
            <div className="flex-grow-1 rounded" style={{ height: '2px', minWidth: '30px', maxWidth: '60px', marginTop: '-20px', backgroundColor: currentStep > 1 ? 'var(--primary)' : '#f8f9fa' }}></div>
            
            <div className={`d-flex flex-column align-items-center position-relative z-1 ${currentStep < 2 ? 'opacity-50' : ''}`}>
                <div className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${currentStep >= 2 ? 'text-white shadow-sm' : 'bg-white border'}`}
                    style={{ width: '48px', height: '48px', backgroundColor: currentStep >= 2 ? 'var(--primary)' : 'transparent', color: currentStep >= 2 ? '#fff' : '#6c757d', borderColor: '#e0e6eb' }}>
                    {currentStep > 2 ? <i className="fa-solid fa-check fs-5"></i> : <i className="fa-regular fa-user fs-5"></i>}
                </div>
                <span className={currentStep >= 2 ? 'fw-bold text-primary' : 'fw-medium text-muted'} style={{ fontSize: '0.8rem' }}>Details</span>
            </div>
            <div className="flex-grow-1 rounded" style={{ height: '2px', minWidth: '30px', maxWidth: '60px', marginTop: '-20px', backgroundColor: currentStep > 2 ? 'var(--primary)' : '#f8f9fa' }}></div>
            
            <div className={`d-flex flex-column align-items-center position-relative z-1 ${currentStep < 3 ? 'opacity-50' : ''}`}>
                <div className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${currentStep >= 3 ? 'text-white shadow-sm' : 'bg-white border'}`}
                    style={{ width: '48px', height: '48px', backgroundColor: currentStep >= 3 ? 'var(--primary)' : 'transparent', color: currentStep >= 3 ? '#fff' : '#6c757d', borderColor: '#e0e6eb' }}>
                    {currentStep > 3 ? <i className="fa-solid fa-check fs-5"></i> : <i className="fa-regular fa-circle-check fs-5"></i>}
                </div>
                <span className={currentStep >= 3 ? 'fw-bold text-primary' : 'fw-medium text-muted'} style={{ fontSize: '0.8rem' }}>Confirm</span>
            </div>
        </div>
    );

    if (currentStep === 4) {
        return (
            <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingTop: '120px', paddingBottom: '60px' }}>
                <Container>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto" style={{ maxWidth: '600px' }}>
                        <Card className="border-0 shadow-sm rounded-4 text-center p-5">
                            {pollingStatus === 'searching' ? (
                                <>
                                    <div className="mb-4">
                                        <div className="spinner-grow text-primary" style={{ width: '4rem', height: '4rem' }} role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                    <h3 className="fw-bold text-dark mb-3">Searching for the nearest available nurse...</h3>
                                    <p className="text-muted text-15 mb-0">Please wait, an available nurse will be assigned to your request shortly. Do not close this page.</p>
                                </>
                            ) : (
                                <>
                                    <div className="mb-4">
                                        <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center mx-auto" style={{ width: '80px', height: '80px' }}>
                                            <i className="fa-solid fa-check text-success fs-1"></i>
                                        </div>
                                    </div>
                                    <h3 className="fw-bold text-dark mb-3">Your request has been accepted successfully!</h3>
                                    <p className="text-muted text-16 mb-4">Nurse <strong>{assignedNurse}</strong> is on their way to you now.</p>
                                    <Button variant="outline-primary" onClick={() => navigate('/profile', { state: { activeTab: 'booking' } })} className="px-4 py-2 rounded-pill fw-bold" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}>
                                        View Booking Details
                                    </Button>
                                </>
                            )}
                        </Card>
                    </motion.div>
                </Container>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '100px', paddingTop: '100px' }}>
            <Container className="px-lg-4">
                <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-3" style={{ width: '60px', height: '60px' }}>
                        <i className="fa-solid fa-truck-medical fs-3"></i>
                    </div>
                    <h2 className="fw-bold text-dark mb-2">Request Urgent Booking</h2>
                    <p className="text-muted" style={{ fontSize: '0.95rem' }}>We are here to serve you as quickly as possible. Please enter the required details.</p>
                </div>

                <Stepper />

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto" style={{ maxWidth: '800px' }}>
                    <Card className="border-0 shadow-sm rounded-4 p-4 bg-white" style={{ border: '1px solid #e0e6eb' }}>
                        
                        {currentStep === 1 && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                <h5 className="fw-bold text-dark mb-4">Select Required Service</h5>
                                <Row className="g-3 mb-4">
                                    {QUICK_SERVICES.map(srv => (
                                        <Col md={6} key={srv.id}>
                                            <div
                                                className={`p-3 rounded-3 d-flex align-items-center gap-3 cursor-pointer transition-all ${selectedService === srv.id ? 'shadow-sm' : ''}`}
                                                onClick={() => setSelectedService(srv.id)}
                                                style={{
                                                    cursor: 'pointer',
                                                    border: selectedService === srv.id ? '1.5px solid var(--primary)' : '1px solid #e0e6eb',
                                                    backgroundColor: selectedService === srv.id ? 'rgba(2, 89, 85, 0.05)' : '#fff'
                                                }}
                                            >
                                                <div className="shrink-0 d-flex align-items-center justify-content-center">
                                                    {selectedService === srv.id ? (
                                                        <i className="fa-solid fa-circle-dot fs-6 text-primary"></i>
                                                    ) : (
                                                        <i className="fa-regular fa-circle fs-6 text-muted"></i>
                                                    )}
                                                </div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className={`fa-solid ${srv.icon}`} style={{ color: selectedService === srv.id ? 'var(--primary)' : '#6c757d' }}></i>
                                                    <span className="text-dark fw-medium">{srv.label}</span>
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                                <Button variant="primary" className="w-100 py-2 rounded-3 fw-bold" disabled={!selectedService} onClick={() => setCurrentStep(2)} style={{ backgroundColor: 'var(--primary)', border: 'none' }}>
                                    Continue <i className="fa-solid fa-arrow-right ms-2"></i>
                                </Button>
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <h5 className="fw-bold text-dark mb-4">Patient Information</h5>
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.9rem' }}>Booking For</Form.Label>
                                    <Form.Select 
                                        value={isForSomeoneElse ? (selectedFamilyMemberIndex !== '' ? `family_${selectedFamilyMemberIndex}` : 'other') : 'myself'}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === 'myself') { setIsForSomeoneElse(false); setSelectedFamilyMemberIndex(''); }
                                            else if (val.startsWith('family_')) { setIsForSomeoneElse(true); setSelectedFamilyMemberIndex(val.split('_')[1]); }
                                            else { setIsForSomeoneElse(true); setSelectedFamilyMemberIndex(''); }
                                        }}
                                        className="py-2 px-3 shadow-none custom-input"
                                    >
                                        <option value="myself">Myself</option>
                                        {isAuthenticated && user?.familyMembers?.map((member, index) => (
                                            <option key={index} value={`family_${index}`}>{member.name} ({member.relationship})</option>
                                        ))}
                                        <option value="other">Someone Else</option>
                                    </Form.Select>
                                </Form.Group>

                                {!isAuthenticated && (
                                    <Row className="g-3 mb-3">
                                        <Col md={12}>
                                            <Form.Control placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="py-2" />
                                        </Col>
                                    </Row>
                                )}

                                <Row className="g-3 mb-4">
                                    <Col md={6}>
                                        <Form.Control placeholder="Full Name" value={!isForSomeoneElse ? formData.name : formData.theirName} onChange={e => !isForSomeoneElse ? setFormData({...formData, name: e.target.value}) : setFormData({...formData, theirName: e.target.value})} className="py-2" />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Control placeholder="Phone Number" value={!isForSomeoneElse ? formData.phone : formData.theirPhone} onChange={e => !isForSomeoneElse ? setFormData({...formData, phone: e.target.value}) : setFormData({...formData, theirPhone: e.target.value})} className="py-2" />
                                    </Col>
                                    <Col md={12}>
                                        <Form.Control placeholder="Detailed Address" value={!isForSomeoneElse ? formData.address : formData.theirAddress} onChange={e => !isForSomeoneElse ? setFormData({...formData, address: e.target.value}) : setFormData({...formData, theirAddress: e.target.value})} className="py-2" />
                                    </Col>
                                </Row>

                                <div className="d-flex gap-3">
                                    <Button variant="light" className="py-2 px-4 rounded-3 fw-bold border" onClick={() => setCurrentStep(1)}>
                                        <i className="fa-solid fa-arrow-left me-2"></i> Back
                                    </Button>
                                    <Button variant="primary" className="flex-grow-1 py-2 rounded-3 fw-bold" disabled={!isStep2Valid} onClick={() => setCurrentStep(3)} style={{ backgroundColor: 'var(--primary)', border: 'none' }}>
                                        Continue <i className="fa-solid fa-arrow-right ms-2"></i>
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 3 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <h5 className="fw-bold text-dark mb-4">Confirm Request</h5>
                                <div className="bg-light p-4 rounded-3 mb-4 border">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-muted">Required Service:</span>
                                        <span className="fw-bold text-primary">{QUICK_SERVICES.find(s => s.id === selectedService)?.label}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-muted">Estimated Cost:</span>
                                        <span className="fw-bold text-primary">{prices['Wound & Skin Care'] || 300} EGP</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-muted">Patient Name:</span>
                                        <span className="fw-bold text-dark">{!isForSomeoneElse ? formData.name : formData.theirName}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-muted">Contact Number:</span>
                                        <span className="fw-bold text-dark">{!isForSomeoneElse ? formData.phone : formData.theirPhone}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted">Address:</span>
                                        <span className="fw-bold text-dark">{!isForSomeoneElse ? formData.address : formData.theirAddress}</span>
                                    </div>
                                </div>
                                <div className="d-flex gap-3">
                                    <Button variant="light" className="py-2 px-4 rounded-3 fw-bold border" onClick={() => setCurrentStep(2)}>
                                        <i className="fa-solid fa-arrow-left me-2"></i> Back
                                    </Button>
                                    <Button variant="primary" className="flex-grow-1 py-2 rounded-3 fw-bold" disabled={isSubmitting} onClick={handleConfirmBooking} style={{ backgroundColor: 'var(--primary)', border: 'none' }}>
                                        {isSubmitting ? 'Requesting...' : 'Confirm Urgent Booking'} <i className="fa-solid fa-check ms-2"></i>
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </Card>
                </motion.div>
            </Container>
        </div>
    );
}
