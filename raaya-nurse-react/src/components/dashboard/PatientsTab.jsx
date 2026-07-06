import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Form, InputGroup, Modal } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useTranslation } from '../../hooks/useTranslation';

const PatientsTab = ({ showToast, initialBooking, clearInitialBooking }) => {
    const { t, lang } = useTranslation();
    const [activeFilter, setActiveFilter] = useState('upcoming');
    const [showLogbook, setShowLogbook] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Cancellation state
    const [cancellationsThisMonth, setCancellationsThisMonth] = useState(0);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [bookingToCancel, setBookingToCancel] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isStarting, setIsStarting] = useState(false);

    // Report State
    const [showReportModal, setShowReportModal] = useState(false);
    const [bookingToReport, setBookingToReport] = useState(null);
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    const [reportForm, setReportForm] = useState({
        vitals: { bloodPressure: '', heartRate: '', temperature: '' },
        notes: '',
        serviceAnswers: {},
        attachments: []
    });

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
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await axios.get('http://localhost:5000/api/bookings/nurse', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookings(res.data);
                
                // Fetch nurse profile for cancellation limits
                const profileRes = await axios.get('http://localhost:5000/api/nurse/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCancellationsThisMonth(profileRes.data.cancellationsThisMonth || 0);
                
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    useEffect(() => {
        if (initialBooking) {
            setSelectedPatient(initialBooking);
            setShowLogbook(true);
            if (clearInitialBooking) {
                clearInitialBooking();
            }
        }
    }, [initialBooking, clearInitialBooking]);

    const parseBookingDate = (dateString) => {
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

    const getSortableDate = (booking) => {
        let d = parseBookingDate(booking.date);
        let timeStr = booking.time || '12:00 AM';
        let [t, ampm] = timeStr.split(' ');
        if (t && ampm) {
            let [h, m] = t.split(':').map(Number);
            if (ampm === 'PM' && h !== 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;
            d.setHours(h, m, 0, 0);
        }
        return d.getTime();
    };

    const openLogbook = (booking) => {
        setSelectedPatient(booking);
        setShowLogbook(true);
    };

    const getStatusBadge = (status) => {
        const lowerStatus = status?.toLowerCase() || '';
        if (lowerStatus === 'upcoming' || lowerStatus === 'confirmed' || lowerStatus === 'accepted') return <Badge bg="primary" className="bg-opacity-10 text-primary rounded-pill px-3 py-2 border-0">Upcoming</Badge>;
        if (lowerStatus === 'completed') return <Badge bg="success" className="bg-opacity-10 text-success rounded-pill px-3 py-2 border-0">Completed</Badge>;
        if (lowerStatus === 'in-progress') return <Badge bg="warning" className="bg-opacity-10 text-warning rounded-pill px-3 py-2 border-0">In Progress</Badge>;
        return <Badge bg="secondary" className="rounded-pill px-3 py-2 border-0">{status}</Badge>;
    };

    const handleStartService = async (bookingId) => {
        setIsStarting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/bookings/nurse/${bookingId}/status`, 
                { status: 'in-progress' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast(t('Success'), t('Service started successfully!'), 'success');
            setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'in-progress' } : b));
        } catch (err) {
            console.error(err);
            showToast(t('Error'), t('Failed to start service.'), 'danger');
        } finally {
            setIsStarting(false);
        }
    };

    const handleFinishService = async () => {
        setIsSubmittingReport(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/bookings/nurse/${bookingToReport._id}/status`, 
                { status: 'completed', report: reportForm },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast(t('Success'), t('Service completed and report saved.'), 'success');
            setBookings(prev => prev.map(b => b._id === bookingToReport._id ? { ...b, status: 'completed' } : b));
            setShowReportModal(false);
            setBookingToReport(null);
            setReportForm({ vitals: { bloodPressure: '', heartRate: '', temperature: '' }, notes: '', serviceAnswers: {}, attachments: [] });
        } catch (err) {
            console.error(err);
            showToast(t('Error'), t('Failed to complete service.'), 'danger');
        } finally {
            setIsSubmittingReport(false);
        }
    };

    const handleCancelBooking = async () => {
        if (!cancelReason.trim()) {
            showToast(t('Warning'), t('Please provide a reason for cancellation.'), 'warning');
            return;
        }
        setIsCancelling(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`http://localhost:5000/api/bookings/nurse/${bookingToCancel._id}/cancel`, 
                { reason: cancelReason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast(t('Success'), t('Booking cancelled successfully.'), 'success');
            setBookings(prev => prev.map(b => b._id === bookingToCancel._id ? { ...b, status: 'cancelled' } : b));
            setCancellationsThisMonth(5 - res.data.remainingCancellations);
            setShowCancelModal(false);
            setCancelReason('');
            setBookingToCancel(null);
        } catch (err) {
            console.error(err);
            showToast(t('Error'), err.response?.data?.message || t('Failed to cancel booking.'), 'danger');
        } finally {
            setIsCancelling(false);
        }
    };

    const isBookingMissed = (b) => {
        let isMissed = false;
        try {
            if (b.isUrgent || b.status === 'Accepted') {
                const createdDate = new Date(b.createdAt || b.date || Date.now());
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                createdDate.setHours(0, 0, 0, 0);
                if (today > createdDate) {
                    isMissed = true;
                }
            } else {
                const exactDate = new Date(parseBookingDate(b.date));
                if (b.time) {
                    const [timeStr, modifier] = b.time.split(' ');
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
        return isMissed;
    };

    // Filter and sort bookings
    const filteredAndSortedBookings = [...bookings]
        .filter(b => {
            const isUpcomingStatus = b.status === 'upcoming' || b.status === 'confirmed' || b.status === 'in-progress' || b.status === 'Accepted';
            if (activeFilter === 'upcoming') {
                return isUpcomingStatus && !isBookingMissed(b);
            }
            if (activeFilter === 'missed') {
                return isUpcomingStatus && isBookingMissed(b);
            }
            return b.status === activeFilter;
        })
        .filter(b => {
            if (!searchQuery) return true;
            const searchLower = searchQuery.toLowerCase();
            return (
                b.patientDetails?.name?.toLowerCase().includes(searchLower) ||
                b.service?.toLowerCase().includes(searchLower) ||
                b._id?.toLowerCase().includes(searchLower)
            );
        })
        .sort((a, b) => getSortableDate(a) - getSortableDate(b));

    const totalUpcoming = bookings.filter(b => {
        const isUpcomingStatus = b.status === 'upcoming' || b.status === 'confirmed' || b.status === 'in-progress' || b.status === 'Accepted';
        return isUpcomingStatus && !isBookingMissed(b);
    }).length;
    const totalPatients = new Set(bookings.map(b => b.patientId?._id)).size || bookings.length;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Header section with Actions */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h1 className="fw-bold text-dark mb-1 text-24">{t('Patient Appointments')}</h1>
                    <p className="text-muted fw-medium mb-0 text-15">{t('View and manage all your upcoming and past bookings in one place.')}</p>
                </div>
            </div>

            {/* Top Cards */}
            <Row className="g-4 mb-4">
                <Col md={6}>
                    <Card className="border shadow-sm rounded-4 h-100 p-4 transition-all bg-body-tertiary">
                        <Card.Body className="d-flex align-items-center gap-4 p-0">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                                <i className="fa-solid fa-users text-24"></i>
                            </div>
                            <div>
                                <h3 className="fw-bold text-dark mb-1 text-22">{totalPatients}</h3>
                                <p className="text-muted fw-medium mb-0 text-15">{t('Total Patients')}</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="border shadow-sm rounded-4 h-100 p-4 transition-all bg-body-tertiary">
                        <Card.Body className="d-flex align-items-center gap-4 p-0">
                            <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                                <i className="fa-solid fa-house-medical-circle-check text-24"></i>
                            </div>
                            <div>
                                <h3 className="fw-bold text-dark mb-1 text-22">{totalUpcoming}</h3>
                                <p className="text-muted fw-medium mb-0 text-15">{t('Upcoming Visits')}</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Emergency Cancellations Banner */}
            <div className="bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-4 p-3 mb-4 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                        <i className="fa-solid fa-triangle-exclamation"></i>
                    </div>
                    <div>
                        <h6 className="text-danger fw-bold mb-1">{t('Emergency Cancellations')}</h6>
                        <p className="text-danger mb-0 text-13 opacity-75">{t('You are allowed up to 5 emergency cancellations per month.')}</p>
                    </div>
                </div>
                <div className="text-end">
                    <h4 className="text-danger fw-bold mb-0">{5 - cancellationsThisMonth}</h4>
                    <span className="text-danger text-12 fw-medium">{t('Remaining')}</span>
                </div>
            </div>

            {/* Main Content Area */}
            <Card className="border shadow-sm rounded-4 overflow-hidden bg-body-tertiary">
                <Card.Body className="p-0">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 px-4 pt-4 mb-4">
                        <div className="bg-body-secondary p-1 rounded-pill d-inline-flex border" style={{ borderColor: 'var(--bs-border-color)' }}>
                            {['upcoming', 'completed', 'missed'].map(filter => (
                                <Button 
                                    key={filter}
                                    variant={activeFilter === filter ? 'white' : 'transparent'}
                                    className={`rounded-pill px-5 py-2 border-0 fw-bold transition-all text-14 ${activeFilter === filter ? 'bg-body shadow-sm text-primary' : 'text-muted'}`}
                                    onClick={() => setActiveFilter(filter)}
                                >
                                    {t(filter.charAt(0).toUpperCase() + filter.slice(1) + ' Visits')}
                                </Button>
                            ))}
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <InputGroup className="shadow-sm rounded-pill overflow-hidden border bg-body" style={{ maxWidth: '300px' }}>
                                <InputGroup.Text className="bg-transparent border-0 px-3">
                                    <i className="fa-solid fa-search text-muted"></i>
                                </InputGroup.Text>
                                <Form.Control 
                                    placeholder={t('Search patients..')} 
                                    className="bg-transparent border-0 shadow-none py-2 text-14"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </InputGroup>
                        </div>
                    </div>

                    <div className="px-4 pb-4">
                        {loading ? (
                            <div className="text-center py-5">
                                <i className="fa-solid fa-spinner fa-spin fs-2 text-primary"></i>
                            </div>
                        ) : filteredAndSortedBookings.length > 0 ? (
                            <Row className="g-4">
                                {filteredAndSortedBookings.map((booking, idx) => (
                                    <Col lg={6} xl={4} key={idx}>
                                        <Card className="border shadow-sm rounded-4 h-100 hover-lift transition-all bg-body-tertiary">
                                            <Card.Body className="p-4 d-flex flex-column">
                                                {/* Card Header: Patient Info */}
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        {booking.patientId?.profilePicture ? (
                                                            <img 
                                                                src={booking.patientId.profilePicture.startsWith('data:') ? booking.patientId.profilePicture : `http://localhost:5000/uploads/${booking.patientId.profilePicture}`} 
                                                                alt="Profile" 
                                                                className="rounded-circle object-fit-cover shadow-sm"
                                                                style={{ width: '50px', height: '50px' }}
                                                            />
                                                        ) : (
                                                            <div className="bg-primary bg-opacity-10 text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center border border-primary border-opacity-25" style={{ width: '50px', height: '50px', fontSize: '1.2rem' }}>
                                                                {booking.patientDetails?.name?.charAt(0) || 'P'}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h5 className="fw-bold text-dark mb-1 text-16">{booking.patientDetails?.name || t('Unknown Patient')}</h5>
                                                            <div className="d-flex align-items-center gap-2 text-muted text-12">
                                                                {booking.patientId?.gender && (
                                                                    <span><i className={`fa-solid ${booking.patientId.gender === 'Male' ? 'fa-mars text-primary' : 'fa-venus text-danger'} me-1`}></i>{t(booking.patientId.gender)}</span>
                                                                )}
                                                                {booking.patientId?.age && (
                                                                    <>
                                                                        <span style={{ fontSize: '8px' }}>•</span>
                                                                        <span>{booking.patientId.age} {t('Years Old')}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {getStatusBadge(booking.status)}
                                                </div>

                                                {/* Card Body: Appointment Info */}
                                                <div className="bg-body rounded-3 p-3 mb-3 flex-grow-1 border">
                                                    <div className="mb-2">
                                                        <span className="text-muted d-block fw-bold text-11 text-uppercase" style={{ letterSpacing: '0.5px' }}>{t('SERVICE')}</span>
                                                        <span className="fw-bold text-dark text-14">{t(booking.service)}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <div>
                                                            <span className="text-muted d-block fw-bold text-11 text-uppercase" style={{ letterSpacing: '0.5px' }}>{t('DATE & TIME')}</span>
                                                            <span className="fw-bold text-dark text-14"><i className="fa-regular fa-calendar-check text-primary me-1"></i> {parseBookingDate(booking.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })} {t('at')} {booking.time}</span>
                                                        </div>
                                                    </div>
                                                    <div className="mb-2">
                                                        <span className="text-muted d-block fw-bold text-11 text-uppercase" style={{ letterSpacing: '0.5px' }}>{t('LOCATION')}</span>
                                                        <span className="fw-bold text-dark text-13 text-truncate d-inline-block w-100" title={booking.patientDetails?.address}><i className="fa-solid fa-location-dot text-primary me-1"></i> {booking.patientDetails?.address || 'N/A'}</span>
                                                    </div>
                                                    <div className="mb-0">
                                                        <span className="text-muted d-block fw-bold text-11 text-uppercase" style={{ letterSpacing: '0.5px' }}>{t('YOUR EARNINGS')}</span>
                                                        <span className="fw-bold text-success text-13"><i className="fa-solid fa-money-bill-wave text-success me-1"></i> {booking.totalCost ? booking.totalCost - (booking.platformCommissionDeducted || (booking.totalCost * 0.1)) : 0} {t('EGP')}</span>
                                                    </div>
                                                </div>

                                                {/* Card Footer: Action */}
                                                <div className="mt-auto pt-3 d-flex flex-column gap-2">
                                                    <Button 
                                                        variant="primary" 
                                                        className="w-100 rounded-3 fw-bold py-2 shadow-sm text-14 border-0"
                                                        onClick={() => openLogbook(booking)}
                                                    >
                                                        {t('View Details')}
                                                    </Button>
                                                    
                                                    {/* Conditional Cancel / Start buttons */}
                                                    {(booking.status === 'upcoming' || booking.status === 'confirmed') && (() => {
                                                        const today = new Date();
                                                        const bookingDate = parseBookingDate(booking.date);
                                                        bookingDate.setHours(0,0,0,0);
                                                        today.setHours(0,0,0,0);
                                                        
                                                        let isMissed = false;
                                                        try {
                                                            const exactDate = new Date(bookingDate);
                                                            if (booking.time) {
                                                                const [timeStr, modifier] = booking.time.split(' ');
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
                                                                        className="w-100 rounded-3 fw-bold py-2 shadow-sm text-14 border-0 mt-1 opacity-75"
                                                                        disabled
                                                                    >
                                                                        <i className="fa-solid fa-clock-rotate-left me-2"></i> {t('Missed')}
                                                                    </Button>
                                                                );
                                                            }
                                                            return (
                                                                <Button 
                                                                    variant="success" 
                                                                    className="w-100 rounded-3 fw-bold py-2 shadow-sm text-14 border-0 mt-1"
                                                                    onClick={() => handleStartService(booking._id)}
                                                                    disabled={isStarting}
                                                                >
                                                                    <i className="fa-solid fa-play me-2"></i> {t('Start Service')}
                                                                </Button>
                                                            );
                                                        } else {
                                                            return (
                                                                <Button 
                                                                    variant="outline-danger" 
                                                                    className="w-100 rounded-3 fw-bold py-2 text-14 mt-1"
                                                                    onClick={() => { setBookingToCancel(booking); setShowCancelModal(true); }}
                                                                >
                                                                    <i className="fa-solid fa-xmark me-2"></i> {t('Cancel Booking')}
                                                                </Button>
                                                            );
                                                        }
                                                    })()}
                                                    {booking.status === 'in-progress' && (
                                                        <Button 
                                                            variant="warning" 
                                                            className="w-100 rounded-3 fw-bold py-2 shadow-sm text-14 border-0 mt-1 text-dark"
                                                            onClick={() => { 
                                                                setBookingToReport(booking); 
                                                                setReportForm({ vitals: { bloodPressure: '', heartRate: '', temperature: '' }, notes: '', serviceAnswers: {}, attachments: [] });
                                                                setShowReportModal(true); 
                                                            }}
                                                        >
                                                            <i className="fa-solid fa-clipboard-check me-2"></i> {t('Finish Service & Report')}
                                                        </Button>
                                                    )}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <div className="text-center py-5">
                                <div className="bg-body-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                                    <i className="fa-regular fa-calendar-xmark text-muted fs-1"></i>
                                </div>
                                <h5 className="fw-bold text-dark">{t('No appointments found')}</h5>
                            </div>
                        )}
                    </div>
                </Card.Body>
            </Card>

            {/* Medical Logbook Modal */}
            <AnimatePresence>
                {selectedPatient && showLogbook && (
                    <Modal show={true} onHide={() => setShowLogbook(false)} centered size="lg" backdrop="static" contentClassName="border-0 rounded-4 shadow-lg overflow-hidden">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                            {/* Modal Header */}
                            <div className="p-4 border-bottom d-flex justify-content-between align-items-start" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                                <div className="d-flex align-items-center gap-4">
                                    {selectedPatient.patientId?.profilePicture ? (
                                        <img 
                                            src={selectedPatient.patientId.profilePicture.startsWith('data:') ? selectedPatient.patientId.profilePicture : `http://localhost:5000/uploads/${selectedPatient.patientId.profilePicture}`} 
                                            alt="Profile" 
                                            className="rounded-circle object-fit-cover shadow-sm"
                                            style={{ width: '80px', height: '80px', border: '3px solid rgba(255,255,255,0.5)' }}
                                        />
                                    ) : (
                                        <div className="bg-body text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                                            {selectedPatient.patientDetails?.name?.charAt(0) || 'P'}
                                        </div>
                                    )}
                                    <div>
                                        <Badge bg="white" text="primary" className="mb-2 rounded-pill px-3 shadow-sm border-0 fw-bold">{t('Booking Details')}</Badge>
                                        <h3 className="fw-bold mb-1">{selectedPatient.patientDetails?.name || t('Unknown Patient')}</h3>
                                        <div className="d-flex align-items-center gap-3 text-white-50">
                                            <span className="fw-medium text-14">ID: {selectedPatient._id.substring(0,8).toUpperCase()}</span>
                                            {selectedPatient.patientId?.gender && (
                                                <>
                                                    <span style={{ fontSize: '10px' }}>•</span>
                                                    <span className="fw-medium text-14">{selectedPatient.patientId.gender}</span>
                                                </>
                                            )}
                                            {selectedPatient.patientId?.age && (
                                                <>
                                                    <span style={{ fontSize: '10px' }}>•</span>
                                                    <span className="fw-medium text-14">{selectedPatient.patientId.age} {t('Years Old')}</span>
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
                                            <span className="fw-bold text-dark text-15">{t(selectedPatient.service)}</span>
                                        </Col>
                                        <Col md={6}>
                                            <span className="text-muted d-block fw-bold text-12 mb-1">{t('Your Earnings')}</span>
                                            <span className="fw-bold text-success text-15">
                                                <i className="fa-solid fa-money-bill-wave me-1"></i>
                                                {selectedPatient.totalCost ? selectedPatient.totalCost - (selectedPatient.platformCommissionDeducted || (selectedPatient.totalCost * 0.1)) : 0} {t('EGP')}
                                            </span>
                                        </Col>
                                        <Col md={6}>
                                            <span className="text-muted d-block fw-bold text-12 mb-1">{t('Shift Type & Duration')}</span>
                                            <span className="fw-bold text-dark text-15">{selectedPatient.shift}</span>
                                        </Col>
                                        <Col md={6}>
                                            <span className="text-muted d-block fw-bold text-12 mb-1">{t('Date & Time')}</span>
                                            <span className="fw-bold text-dark text-15"><i className="fa-regular fa-calendar-check text-primary me-2"></i>{parseBookingDate(selectedPatient.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })} {t('at')} {selectedPatient.time}</span>
                                        </Col>
                                        <Col md={6}>
                                            <span className="text-muted d-block fw-bold text-12 mb-1">{t('STATUS')}</span>
                                            {selectedPatient.status === 'upcoming' || selectedPatient.status === 'confirmed' ? (
                                                <Badge bg="primary" className="bg-opacity-10 text-primary px-3 py-2 rounded-pill border-0"><i className="fa-regular fa-calendar-check me-1"></i>{t('upcoming')}</Badge>
                                            ) : selectedPatient.status === 'in-progress' ? (
                                                <Badge bg="warning" className="bg-opacity-10 text-dark px-3 py-2 rounded-pill border-0"><i className="fa-solid fa-spinner fa-spin me-1"></i>{t('in-progress')}</Badge>
                                            ) : selectedPatient.status === 'completed' ? (
                                                <Badge bg="success" className="bg-opacity-10 text-success px-3 py-2 rounded-pill border-0"><i className="fa-solid fa-check-circle me-1"></i>{t('completed')}</Badge>
                                            ) : (
                                                <Badge bg="secondary" className="px-3 py-2 rounded-pill border-0">{t(selectedPatient.status)}</Badge>
                                            )}
                                        </Col>
                                    </Row>
                                </div>

                                <div className="mb-4">
                                    <h4 className="fw-bold text-dark mb-3 text-16 border-bottom pb-2"><i className="fa-regular fa-address-book text-primary me-2"></i>{t('Contact & Location')}</h4>
                                    <Row className="g-3">
                                        <Col md={12}>
                                            <span className="text-muted d-block fw-bold text-12 mb-1">{t('Address')}</span>
                                            <span className="fw-bold text-dark text-15"><i className="fa-solid fa-location-dot text-primary me-2"></i>{selectedPatient.patientDetails?.address || 'N/A'}</span>
                                        </Col>
                                        <Col md={6}>
                                            <span className="text-muted d-block fw-bold text-12 mb-1">{t('Phone Number')}</span>
                                            <span className="fw-bold text-dark text-15"><i className="fa-solid fa-phone text-primary me-2"></i>{selectedPatient.patientDetails?.phone || 'N/A'}</span>
                                        </Col>
                                        <Col md={6}>
                                            <span className="text-muted d-block fw-bold text-12 mb-1">{t('Email')}</span>
                                            <span className="fw-bold text-dark text-15 text-break"><i className="fa-regular fa-envelope text-primary me-2"></i>{selectedPatient.patientDetails?.email || 'N/A'}</span>
                                        </Col>
                                    </Row>
                                </div>

                                <div>
                                    <h4 className="fw-bold text-dark mb-3 text-16 border-bottom pb-2"><i className="fa-solid fa-notes-medical text-primary me-2"></i>{t('Patient Notes & Instructions')}</h4>
                                    <div className="bg-body-tertiary p-3 rounded-3 border">
                                        <p className="mb-0 text-dark fw-medium text-14" style={{ lineHeight: '1.6' }}>
                                            {selectedPatient.notes || selectedPatient.patientDetails?.message || t('No special instructions provided.')}
                                        </p>
                                    </div>
                                    <div className="pt-3 border-top d-flex justify-content-between align-items-center mt-3">
                                        <span className="text-muted text-12"><i className="fa-regular fa-clock me-1"></i> {t('Request created on:')} {new Date(selectedPatient.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Modal Footer */}
                            <div className="p-4 border-top bg-body-tertiary text-end">
                                <Button variant="light" className="fw-bold rounded-pill px-4 text-14 border bg-body" onClick={() => setShowLogbook(false)}>
                                    {t('Close Details')}
                                </Button>
                            </div>
                        </motion.div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* Cancellation Modal */}
            <Modal show={showCancelModal} onHide={() => !isCancelling && setShowCancelModal(false)} centered backdrop="static">
                <div className="p-4 border-bottom d-flex align-items-center gap-3 bg-danger bg-opacity-10 text-danger" style={{ borderTopLeftRadius: 'var(--bs-border-radius-xl)', borderTopRightRadius: 'var(--bs-border-radius-xl)' }}>
                    <i className="fa-solid fa-triangle-exclamation fs-4"></i>
                    <h5 className="fw-bold mb-0">{t('Emergency Cancellation')}</h5>
                </div>
                <Modal.Body className="p-4">
                    <p className="text-dark fw-medium mb-3">{t('You are about to cancel this booking due to an emergency. This will consume 1 of your')} {5 - cancellationsThisMonth} {t('remaining cancellations this month.')}</p>
                    <Form.Group>
                        <Form.Label className="fw-bold text-dark text-14">{t('Reason for Cancellation')} <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            placeholder={t('Please explain the emergency...')} 
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            disabled={isCancelling}
                            className="bg-body border-0 shadow-none"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="p-4 border-top-0 bg-body-tertiary">
                    <Button variant="light" className="fw-bold px-4 bg-body border" onClick={() => setShowCancelModal(false)} disabled={isCancelling}>
                        {t('Keep Booking')}
                    </Button>
                    <Button variant="danger" className="fw-bold px-4 shadow-sm" onClick={handleCancelBooking} disabled={isCancelling}>
                        {isCancelling ? t('Cancelling...') : t('Confirm Cancellation')}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Service Report Modal */}
            <Modal show={showReportModal} onHide={() => !isSubmittingReport && setShowReportModal(false)} size="lg" centered backdrop="static">
                <div className="p-4 border-bottom d-flex align-items-center gap-3 bg-primary bg-opacity-10 text-primary" style={{ borderTopLeftRadius: 'var(--bs-border-radius-xl)', borderTopRightRadius: 'var(--bs-border-radius-xl)' }}>
                    <i className="fa-solid fa-notes-medical fs-4"></i>
                    <h5 className="fw-bold mb-0">{t('Service Report')} - {bookingToReport?.service}</h5>
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
                    <Button variant="primary" className="fw-bold px-4 shadow-sm" onClick={handleFinishService} disabled={isSubmittingReport}>
                        {isSubmittingReport ? t('Submitting...') : t('Submit Report & Finish')}
                    </Button>
                </Modal.Footer>
            </Modal>

            <style>{`
                .hover-lift { transition: all 0.3s ease; }
                .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important; border-color: rgba(2, 89, 85, 0.2) !important; }
                .transition-all { transition: all 0.3s ease-in-out; }
            `}</style>
        </motion.div>
    );
};

export default PatientsTab;
