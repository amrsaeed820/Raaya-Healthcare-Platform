import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Table, Modal, Form } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useTranslation } from '../../hooks/useTranslation';

const OverviewTab = ({ nurseData, showToast }) => {
    const { t, lang } = useTranslation();
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showReportModal, setShowReportModal] = useState(false);
    const [bookingToReport, setBookingToReport] = useState(null);
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    const [reportForm, setReportForm] = useState({ vitals: { bloodPressure: '', heartRate: '', temperature: '' }, notes: '', serviceAnswers: {}, attachments: [] });

    const [nurseProfile, setNurseProfile] = useState(null);
    
    // View Details Modal State
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showLogbook, setShowLogbook] = useState(false);

    const serviceSpecificQuestions = {
        'Elderly Care': [
            { id: 'mobility', label: 'Patient Mobility Level', type: 'select', options: ['Independent', 'Requires Assistance', 'Bedridden'] },
            { id: 'meds', label: 'Medications Administered', type: 'text' }
        ],
        'Post-operative Care': [
            { id: 'woundCondition', label: 'Wound Condition', type: 'text' },
            { id: 'painLevel', label: 'Pain Level (1-10)', type: 'number' }
        ],
        'Basic Care': [
            { id: 'generalCondition', label: 'General Condition', type: 'text' },
            { id: 'diet', label: 'Diet Taken', type: 'text' }
        ],
        'Wound & Skin Care': [
            { id: 'woundCondition', label: 'Wound Condition', type: 'text' },
            { id: 'dressingChanged', label: 'Dressing Changed?', type: 'select', options: ['Yes', 'No'] }
        ]
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const [bookingsRes, profileRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/bookings/nurse', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:5000/api/nurse/auth/profile', { headers: { Authorization: `Bearer ${token}` } })
                ]);
                
                setVisits(bookingsRes.data);
                setNurseProfile(profileRes.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleStartVisit = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/bookings/nurse/${id}/status`, { status: 'in-progress' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVisits(visits.map(v => v._id === id ? { ...v, status: 'in-progress' } : v));
            showToast(t('Visit Started'), t('You have started the visit. Make sure to record vitals.'), 'info');
        } catch (err) {
            console.error("Failed to update status", err);
            showToast(t('Error'), t('Failed to start visit.'), 'danger');
        }
    };

    const handleEndVisitClick = (visit) => {
        setBookingToReport(visit);
        setReportForm({ vitals: { bloodPressure: '', heartRate: '', temperature: '' }, notes: '', serviceAnswers: {}, attachments: [] });
        setShowReportModal(true);
    };

    const handleSaveReport = async () => {
        setIsSubmittingReport(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/bookings/nurse/${bookingToReport._id}/status`, 
                { status: 'completed', report: reportForm }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setVisits(visits.map(v => v._id === bookingToReport._id ? { ...v, status: 'completed' } : v));
            setShowReportModal(false);
            setBookingToReport(null);
            setReportForm({ vitals: { bloodPressure: '', heartRate: '', temperature: '' }, notes: '', serviceAnswers: {}, attachments: [] });
            showToast(t('Success'), t('Service completed and report saved.'), 'success');
        } catch (err) {
            console.error("Failed to update status", err);
            showToast(t('Error'), t('Failed to complete service.'), 'danger');
        } finally {
            setIsSubmittingReport(false);
        }
    };

    const parseBookingDate = (dateString) => {
        if (!dateString) return new Date();
        let d = new Date(dateString);
        if (d.getFullYear() < 2020) {
            const currentYear = new Date().getFullYear();
            d = new Date(`${dateString} ${currentYear}`);
            if (d < new Date(new Date().setMonth(new Date().getMonth() - 3))) {
                d = new Date(`${dateString} ${currentYear + 1}`);
            }
        }
        return d;
    };

    // Filter out completed, cancelled, expired, and locally missed visits
    const activeVisits = visits.filter(v => {
        if (v.status === 'completed' || v.status === 'cancelled' || v.status === 'expired' || v.status === 'missed') return false;
        
        let isMissed = false;
        try {
            if (v.isUrgent || v.status === 'Accepted') {
                const createdDate = new Date(v.createdAt || v.date || Date.now());
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                createdDate.setHours(0, 0, 0, 0);
                if (today > createdDate) {
                    isMissed = true;
                }
            } else {
                const bookingDate = parseBookingDate(v.date);
                const exactDate = new Date(bookingDate);
                if (v.time) {
                    const [timeStr, modifier] = v.time.split(' ');
                    let [h, m] = timeStr.split(':');
                    let hours = parseInt(h, 10);
                    if (hours === 12 && modifier === 'AM') hours = 0;
                    if (hours !== 12 && modifier === 'PM') hours += 12;
                    exactDate.setHours(hours, parseInt(m, 10) || 0);
                }
                const diffHours = (new Date() - exactDate) / (1000 * 60 * 60);
                isMissed = diffHours >= 3;
            }
        } catch(e) {}
        
        return !isMissed;
    });

    // Calculate real stats
    const totalCompleted = visits.filter(v => v.status === 'completed').length;
    const rating = nurseProfile?.rating || 0;
    const reviewCount = nurseProfile?.reviewCount || 0;
    
    // Total Earnings: Sum of (totalCost - platformCommissionDeducted) for completed visits
    const totalEarnings = visits.filter(v => v.status === 'completed').reduce((sum, v) => {
        const cost = v.totalCost || 0;
        const comm = v.platformCommissionDeducted || (cost * 0.1); // Fallback to 10% if not set
        return sum + (cost - comm);
    }, 0);
    const upcomingVisits = activeVisits.filter(v => v.status === 'upcoming' || v.status === 'confirmed' || v.status === 'in-progress' || v.status === 'Accepted').length;

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center h-100">
                <i className="fa-solid fa-spinner fa-spin fs-2 text-primary"></i>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                <Card.Header className="bg-transparent border-0 px-4 pt-4 pb-0">
                    <h2 className="fw-bold text-dark mb-1 text-20">{t('Dashboard Overview')}</h2>
                    <p className="text-muted mb-0 text-14">{t('Welcome back')}, {nurseProfile?.name || nurseData?.name || 'Nurse'}. {t("Here's your performance snapshot.")}</p>
                </Card.Header>
            </div>

            {/* Quick Stats Cards */}
            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Card className="border shadow-sm rounded-4 h-100 p-4 transition-all bg-body-tertiary">
                        <Card.Body className="d-flex align-items-center gap-4 p-0">
                            <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                                <i className="fa-solid fa-check-double text-24"></i>
                            </div>
                            <div>
                                <h3 className="fw-bold text-dark mb-1 text-22">{totalCompleted}</h3>
                                <p className="text-muted fw-medium mb-0 text-15">{t('Completed')}</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border shadow-sm rounded-4 h-100 p-4 transition-all bg-body-tertiary">
                        <Card.Body className="d-flex align-items-center gap-4 p-0">
                            <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                                <i className="fa-solid fa-star text-24"></i>
                            </div>
                            <div>
                                <h3 className="fw-bold text-dark mb-1 text-22">{rating.toFixed(1)}<span className="text-15 text-muted">/5</span></h3>
                                <p className="text-muted fw-medium mb-0 text-15">{reviewCount} {t('reviews')}</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border shadow-sm rounded-4 h-100 p-4 transition-all bg-body-tertiary">
                        <Card.Body className="d-flex align-items-center gap-4 p-0">
                            <div className="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                                <i className="fa-solid fa-sack-dollar text-24"></i>
                            </div>
                            <div>
                                <h3 className="fw-bold text-dark mb-1 text-22">{totalEarnings} <span className="text-15 text-muted">{t('EGP')}</span></h3>
                                <p className="text-muted fw-medium mb-0 text-15">{t('Total Earnings')}</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border shadow-sm rounded-4 h-100 p-4 transition-all bg-body-tertiary">
                        <Card.Body className="d-flex align-items-center gap-4 p-0">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                                <i className="fa-solid fa-calendar-check text-24"></i>
                            </div>
                            <div>
                                <h3 className="fw-bold text-dark mb-1 text-22">{upcomingVisits}</h3>
                                <p className="text-muted fw-medium mb-0 text-15">{t('Upcoming Visits')}</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* My Schedule / Visits */}
            <Card className="border shadow-sm rounded-4 h-100 hover-lift transition-all bg-body-tertiary">
                <Card.Header className="bg-transparent border-bottom p-4 d-flex justify-content-between align-items-center">
                    <h2 className="fw-bold text-dark mb-0 text-18"><i className="fa-solid fa-calendar-day text-primary me-2"></i> {t('Active & Upcoming Visits')}</h2>
                </Card.Header>
                <Card.Body className="p-0 bg-transparent px-4 pb-4">
                    <div className="table-responsive pt-2">
                        <Table hover className="modern-table text-nowrap">
                            <thead>
                                <tr>
                                    <th>{t('PATIENT')}</th>
                                    <th>{t('DATE & TIME')}</th>
                                    <th>{t('CARE TYPE')}</th>
                                    <th>{t('YOUR EARNINGS')}</th>
                                    <th>{t('STATUS')}</th>
                                    <th className="text-end">{t('ACTIONS')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {activeVisits.length > 0 ? activeVisits.map((visit) => {
                                        const netEarnings = visit.totalCost ? visit.totalCost - (visit.platformCommissionDeducted || (visit.totalCost * 0.1)) : 0;
                                        return (
                                        <motion.tr 
                                            key={visit._id}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, x: -50 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-primary bg-opacity-10 text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center border border-primary border-opacity-25" style={{ width: '48px', height: '48px' }}>
                                                        {visit.patientDetails.name.charAt(0)}
                                                    </div>
                                                    <span className="fw-bold text-dark text-15">{visit.patientDetails.name}</span>
                                                </div>
                                            </td>
                                            <td className="text-muted fw-medium text-14"><i className="fa-regular fa-clock me-2 text-primary opacity-50"></i>{parseBookingDate(visit.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })} {t('at')} {visit.time}</td>
                                            <td>
                                                <span className="fw-bold text-dark bg-body px-3 py-1 rounded-pill border text-13">
                                                    {t(visit.service)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="fw-bold text-success text-14">
                                                    <i className="fa-solid fa-money-bill-wave me-1"></i> {netEarnings} {t('EGP')}
                                                </span>
                                            </td>
                                            <td>
                                                <Badge 
                                                    bg={visit.status === 'in-progress' ? 'warning' : 'primary'} 
                                                    className="bg-opacity-10 px-3 py-2 rounded-pill border-0 text-12" 
                                                    text={visit.status === 'in-progress' ? 'dark' : 'primary'}
                                                >
                                                    {visit.status === 'upcoming' || visit.status === 'confirmed' ? <i className="fa-regular fa-calendar-check me-1"></i> : null}
                                                    {visit.status === 'in-progress' && <i className="fa-solid fa-spinner fa-spin me-1"></i>}
                                                    {t(visit.status)}
                                                </Badge>
                                            </td>
                                            <td className="text-end">
                                                <div className="d-flex flex-column gap-2 align-items-end">
                                                    <Button 
                                                        variant="primary" 
                                                        className="rounded-pill fw-bold shadow-sm px-4 py-1 text-12 w-100 border-0"
                                                        onClick={() => { setSelectedBooking(visit); setShowLogbook(true); }}
                                                    >
                                                        {t('View Details')}
                                                    </Button>
                                                    {(visit.status === 'upcoming' || visit.status === 'confirmed') && (() => {
                                                        const today = new Date();
                                                        const bookingDate = parseBookingDate(visit.date);
                                                        bookingDate.setHours(0,0,0,0);
                                                        today.setHours(0,0,0,0);
                                                        
                                                        let isMissed = false;
                                                        try {
                                                            const exactDate = new Date(bookingDate);
                                                            if (visit.time) {
                                                                const [timeStr, modifier] = visit.time.split(' ');
                                                                let [h, m] = timeStr.split(':');
                                                                let hours = parseInt(h, 10);
                                                                if (hours === 12 && modifier === 'AM') hours = 0;
                                                                if (hours !== 12 && modifier === 'PM') hours += 12;
                                                                exactDate.setHours(hours, parseInt(m, 10) || 0);
                                                            }
                                                            const diffHours = (new Date() - exactDate) / (1000 * 60 * 60);
                                                            isMissed = diffHours >= 3;
                                                        } catch(e) {}

                                                        if (bookingDate <= today) {
                                                            if (isMissed) {
                                                                return (
                                                                    <Button 
                                                                        variant="secondary" 
                                                                        className="rounded-pill fw-bold shadow-sm px-4 py-1 w-100 text-12 border-0 opacity-75" 
                                                                        disabled
                                                                    >
                                                                        <i className="fa-solid fa-clock-rotate-left"></i> {t('Missed')}
                                                                    </Button>
                                                                );
                                                            }
                                                            return (
                                                                <Button 
                                                                    variant="success" 
                                                                    className="rounded-pill fw-bold shadow-sm px-4 py-1 w-100 text-12 border-0" 
                                                                    onClick={() => handleStartVisit(visit._id)}
                                                                >
                                                                    <i className="fa-solid fa-play"></i> {t('Start Visit')}
                                                                </Button>
                                                            );
                                                        }
                                                        return null;
                                                    })()}
                                                    {visit.status === 'in-progress' && (
                                                        <Button 
                                                            variant="warning" 
                                                            className="rounded-pill fw-bold shadow-sm px-4 py-1 w-100 text-12 border-0 text-dark" 
                                                            onClick={() => handleEndVisitClick(visit)}
                                                        >
                                                            <i className="fa-solid fa-clipboard-check"></i> {t('Finish Service & Report')}
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5">
                                                <div className="bg-body-secondary rounded-circle d-inline-flex align-items-center justify-content-center mb-3 text-muted" style={{ width: '80px', height: '80px' }}>
                                                    <i className="fa-solid fa-check-double fs-2"></i>
                                                </div>
                                                <h5 className="fw-bold text-dark">{t('All Caught Up!')}</h5>
                                                <p className="text-muted">{t('You have no upcoming or active visits at the moment.')}</p>
                                            </td>
                                        </tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Medical Logbook / View Details Modal */}
            <AnimatePresence>
                {selectedBooking && showLogbook && (
                    <Modal show={true} onHide={() => setShowLogbook(false)} centered size="lg" backdrop="static" contentClassName="border-0 rounded-4 shadow-lg overflow-hidden">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                            {/* Modal Header */}
                            <div className="p-4 border-bottom d-flex justify-content-between align-items-start" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                                <div className="d-flex align-items-center gap-4">
                                    {selectedBooking.patientId?.profilePicture ? (
                                        <img 
                                            src={selectedBooking.patientId.profilePicture.startsWith('data:') ? selectedBooking.patientId.profilePicture : `http://localhost:5000/uploads/${selectedBooking.patientId.profilePicture}`} 
                                            alt="Profile" 
                                            className="rounded-circle object-fit-cover shadow-sm"
                                            style={{ width: '80px', height: '80px', border: '3px solid rgba(255,255,255,0.5)' }}
                                        />
                                    ) : (
                                        <div className="bg-body text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                                            {selectedBooking.patientDetails?.name?.charAt(0) || 'P'}
                                        </div>
                                    )}
                                    <div>
                                        <Badge bg="primary" text="white" className="mb-2 rounded-pill px-3 shadow-sm border-0 fw-bold">{t('Booking Details')}</Badge>
                                        <h3 className="fw-bold mb-1">{selectedBooking.patientDetails?.name || t('Unknown Patient')}</h3>
                                        <div className="d-flex align-items-center gap-3 text-white-50">
                                            <span className="fw-medium text-14">ID: {selectedBooking._id.substring(0,8).toUpperCase()}</span>
                                            {selectedBooking.patientId?.gender && (
                                                <>
                                                    <span style={{ fontSize: '10px' }}>•</span>
                                                    <span className="fw-medium text-14">{selectedBooking.patientId.gender}</span>
                                                </>
                                            )}
                                            {selectedBooking.patientId?.age && (
                                                <>
                                                    <span style={{ fontSize: '10px' }}>•</span>
                                                    <span className="fw-medium text-14">{selectedBooking.patientId.age} {t('Years Old')}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setShowLogbook(false)} className="btn btn-link text-white p-0 text-decoration-none">
                                    <i className="fa-solid fa-xmark fs-4"></i>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-4 p-md-5 bg-body-tertiary" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                
                                <h4 className="fw-bold text-dark mb-3 text-16 border-bottom pb-2"><i className="fa-solid fa-stethoscope text-primary me-2"></i>{t('Service Information')}</h4>
                                <div className="bg-body-tertiary rounded-4 p-4 border shadow-sm mb-4">
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <span className="text-muted d-block fw-bold text-12 mb-1">{t('Service Requested')}</span>
                                            <span className="fw-bold text-dark text-15">{selectedBooking.service}</span>
                                        </Col>
                                        <Col md={6}>
                                            <span className="text-muted d-block fw-bold text-12 mb-1">{t('Your Earnings')}</span>
                                            <span className="fw-bold text-success text-15">
                                                <i className="fa-solid fa-money-bill-wave me-1"></i>
                                                {selectedBooking.totalCost ? selectedBooking.totalCost - (selectedBooking.platformCommissionDeducted || (selectedBooking.totalCost * 0.1)) : 0} {t('EGP')}
                                            </span>
                                        </Col>
                                        <Col md={6}>
                                            <span className="text-muted d-block fw-bold text-12 mb-1">{t('Shift Type & Duration')}</span>
                                            <span className="fw-bold text-dark text-15">{selectedBooking.shift}</span>
                                        </Col>
                                        <Col md={6}>
                                            <span className="text-muted d-block fw-bold text-12 mb-1">{t('Date & Time')}</span>
                                            <span className="fw-bold text-dark text-15"><i className="fa-regular fa-calendar-check text-primary me-2"></i>{parseBookingDate(selectedBooking.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })} {t('at')} {selectedBooking.time}</span>
                                        </Col>
                                        <Col md={6}>
                                            <span className="text-muted d-block fw-bold text-12 mb-1">{t('STATUS')}</span>
                                            {selectedBooking.status === 'upcoming' || selectedBooking.status === 'confirmed' ? (
                                                <Badge bg="primary" className="bg-opacity-10 text-primary px-3 py-2 rounded-pill border-0"><i className="fa-regular fa-calendar-check me-1"></i>{t('upcoming')}</Badge>
                                            ) : selectedBooking.status === 'in-progress' ? (
                                                <Badge bg="warning" className="bg-opacity-10 text-dark px-3 py-2 rounded-pill border-0"><i className="fa-solid fa-spinner fa-spin me-1"></i>{t('in-progress')}</Badge>
                                            ) : selectedBooking.status === 'completed' ? (
                                                <Badge bg="success" className="bg-opacity-10 text-success px-3 py-2 rounded-pill border-0"><i className="fa-solid fa-check-circle me-1"></i>{t('completed')}</Badge>
                                            ) : (
                                                <Badge bg="secondary" className="px-3 py-2 rounded-pill border-0">{t(selectedBooking.status)}</Badge>
                                            )}
                                        </Col>
                                    </Row>
                                </div>

                                <div className="mb-4">
                                    <h4 className="fw-bold text-dark mb-3 text-16 border-bottom pb-2"><i className="fa-regular fa-address-book text-primary me-2"></i>{t('Contact & Location')}</h4>
                                    <Row className="g-3">
                                        <Col md={12}>
                                            <span className="text-muted d-block fw-bold text-12 mb-1">{t('Address')}</span>
                                            <span className="fw-bold text-dark text-15"><i className="fa-solid fa-location-dot text-primary me-2"></i>{selectedBooking.patientDetails?.address || 'N/A'}</span>
                                        </Col>
                                        <Col md={6}>
                                            <span className="text-muted d-block fw-bold text-12 mb-1">{t('Phone Number')}</span>
                                            <span className="fw-bold text-dark text-15"><i className="fa-solid fa-phone text-primary me-2"></i>{selectedBooking.patientDetails?.phone || 'N/A'}</span>
                                        </Col>
                                        <Col md={6}>
                                            <span className="text-muted d-block fw-bold text-12 mb-1">{t('Email')}</span>
                                            <span className="fw-bold text-dark text-15 text-break"><i className="fa-regular fa-envelope text-primary me-2"></i>{selectedBooking.patientDetails?.email || 'N/A'}</span>
                                        </Col>
                                    </Row>
                                </div>
                                
                                <div>
                                    <h4 className="fw-bold text-dark mb-3 text-16 border-bottom pb-2"><i className="fa-solid fa-notes-medical text-primary me-2"></i>{t('Patient Notes & Instructions')}</h4>
                                    <div className="bg-body-tertiary p-3 rounded-3 border">
                                        <p className="mb-0 text-dark fw-medium text-14" style={{ lineHeight: '1.6' }}>
                                            {selectedBooking.notes || t('No special instructions provided.')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Modal Footer */}
                            <div className="p-4 border-top bg-body-tertiary text-end">
                                <Button variant="primary" className="rounded-3 fw-bold px-5 py-2 shadow-sm" onClick={() => setShowLogbook(false)}>
                                    {t('Close Details')}
                                </Button>
                            </div>
                        </motion.div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* Service Report Modal (same as PatientsTab) */}
            <Modal show={showReportModal} onHide={() => !isSubmittingReport && setShowReportModal(false)} size="lg" centered backdrop="static">
                <div className="p-4 border-bottom d-flex align-items-center gap-3 bg-primary bg-opacity-10 text-primary" style={{ borderTopLeftRadius: 'var(--bs-border-radius-xl)', borderTopRightRadius: 'var(--bs-border-radius-xl)' }}>
                    <i className="fa-solid fa-notes-medical fs-4"></i>
                    <h5 className="fw-bold mb-0">{t('Service Report')} - {bookingToReport && t(bookingToReport.service)}</h5>
                </div>
                <Modal.Body className="p-4" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                    
                    {/* Section 1: Vitals (Optional) */}
                    <div className="mb-4">
                        <h6 className="fw-bold text-dark mb-3"><i className="fa-solid fa-heart-pulse text-danger me-2"></i> {t('Vital Signs (Optional)')}</h6>
                        <Row className="g-3">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="text-muted text-12 fw-bold">{t('Blood Pressure')}</Form.Label>
                                    <Form.Control type="text" placeholder={t('e.g. 120/80')} value={reportForm.vitals.bloodPressure} onChange={e => setReportForm(prev => ({...prev, vitals: {...prev.vitals, bloodPressure: e.target.value}}))} className="bg-body border-0" />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="text-muted text-12 fw-bold">{t('Heart Rate (bpm)')}</Form.Label>
                                    <Form.Control type="text" placeholder={t('e.g. 72')} value={reportForm.vitals.heartRate} onChange={e => setReportForm(prev => ({...prev, vitals: {...prev.vitals, heartRate: e.target.value}}))} className="bg-body border-0" />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="text-muted text-12 fw-bold">{t('Temperature (°C)')}</Form.Label>
                                    <Form.Control type="text" placeholder={t('e.g. 37.0')} value={reportForm.vitals.temperature} onChange={e => setReportForm(prev => ({...prev, vitals: {...prev.vitals, temperature: e.target.value}}))} className="bg-body border-0" />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    <hr className="text-muted opacity-25 my-4" />

                    {/* Section 2: Service Specific */}
                    {bookingToReport && serviceSpecificQuestions[bookingToReport.service] && (
                        <div className="mb-4">
                            <h6 className="fw-bold text-dark mb-3"><i className="fa-solid fa-list-check text-primary me-2"></i> {t('Service Specific Details')}</h6>
                            <Row className="g-3">
                                {serviceSpecificQuestions[bookingToReport.service].map(q => (
                                    <Col md={6} key={q.id}>
                                        <Form.Group>
                                            <Form.Label className="text-muted text-12 fw-bold">{q.label}</Form.Label>
                                            {q.type === 'select' ? (
                                                <Form.Select 
                                                    className="bg-body border-0"
                                                    value={reportForm.serviceAnswers[q.id] || ''}
                                                    onChange={e => setReportForm(prev => ({...prev, serviceAnswers: {...prev.serviceAnswers, [q.id]: e.target.value}}))}
                                                >
                                                    <option value="">{t('Select option...')}</option>
                                                    {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </Form.Select>
                                            ) : (
                                                <Form.Control 
                                                    type={q.type} 
                                                    placeholder={t(`Enter ${q.label.toLowerCase()}`)}
                                                    value={reportForm.serviceAnswers[q.id] || ''}
                                                    onChange={e => setReportForm(prev => ({...prev, serviceAnswers: {...prev.serviceAnswers, [q.id]: e.target.value}}))}
                                                    className="bg-body border-0" 
                                                />
                                            )}
                                        </Form.Group>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}
                    
                    {bookingToReport && serviceSpecificQuestions[bookingToReport.service] && <hr className="text-muted opacity-25 my-4" />}

                    {/* Section 3: Notes */}
                    <div className="mb-4">
                        <h6 className="fw-bold text-dark mb-3"><i className="fa-regular fa-comment-dots text-primary me-2"></i> {t('Notes & Observations')}</h6>
                        <Form.Group>
                            <Form.Control as="textarea" rows={3} placeholder={t('Add any general notes or observations here...')} value={reportForm.notes} onChange={e => setReportForm(prev => ({...prev, notes: e.target.value}))} className="bg-body border-0 shadow-none" />
                        </Form.Group>
                    </div>

                    <hr className="text-muted opacity-25 my-4" />

                    {/* Section 4: Attachments */}
                    <div>
                        <h6 className="fw-bold text-dark mb-3"><i className="fa-solid fa-paperclip text-primary me-2"></i> {t('Attachments')}</h6>
                        <Form.Group>
                            <Form.Label className="text-muted text-12 fw-bold">{t('Upload Prescriptions or Photos (Optional)')}</Form.Label>
                            <Form.Control 
                                type="file" 
                                multiple 
                                className="bg-body border-0" 
                                onChange={(e) => {
                                    const files = Array.from(e.target.files);
                                    files.forEach(file => {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setReportForm(prev => ({...prev, attachments: [...prev.attachments, reader.result]}));
                                        };
                                        reader.readAsDataURL(file);
                                    });
                                }}
                            />
                        </Form.Group>
                        {reportForm.attachments.length > 0 && (
                            <div className="d-flex flex-wrap gap-2 mt-3">
                                {reportForm.attachments.map((att, i) => (
                                    <div key={i} className="position-relative">
                                        <img src={att} alt="attachment" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                                        <button 
                                            className="btn btn-sm btn-danger position-absolute top-0 start-100 translate-middle rounded-circle p-0" 
                                            style={{ width: '20px', height: '20px', fontSize: '10px' }}
                                            onClick={() => setReportForm(prev => ({...prev, attachments: prev.attachments.filter((_, idx) => idx !== i)}))}
                                        >
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </Modal.Body>
                <Modal.Footer className="p-4 border-top-0 bg-body-tertiary">
                    <Button variant="light" className="fw-bold px-4 bg-body border" onClick={() => setShowReportModal(false)} disabled={isSubmittingReport}>
                        {t('Cancel')}
                    </Button>
                    <Button variant="primary" className="fw-bold px-4 shadow-sm" onClick={handleSaveReport} disabled={isSubmittingReport}>
                        {isSubmittingReport ? t('Submitting...') : t('Submit Report & Finish')}
                    </Button>
                </Modal.Footer>
            </Modal>

            <style>{`
                .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
                .hover-shadow-lg:hover { transform: translateY(-3px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important; }
                .transition-all { transition: all 0.3s ease-in-out; }
            `}</style>
        </motion.div>
    );
};

export default OverviewTab;
