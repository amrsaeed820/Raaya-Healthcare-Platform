import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Nav, Spinner, Modal, Row, Col } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Bookings = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/bookings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(res.data);
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = activeTab === 'all' 
        ? bookings 
        : bookings.filter(b => {
            const svc = (b.service || '').toLowerCase();
            if (activeTab === 'resident') {
                return svc.includes('elderly') || svc.includes('chronic') || svc.includes('post-operative') || svc.includes('mother');
            }
            if (activeTab === 'urgent') {
                return svc.includes('injection') || svc.includes('iv ') || svc.includes('wound');
            }
            if (activeTab === 'escort') {
                return svc.includes('escort');
            }
            return false;
        });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'upcoming': 
            case 'confirmed': return <Badge bg="info" className="text-info bg-opacity-10 px-3 py-2 rounded-pill fw-medium"><i className="fa-regular fa-calendar-check me-1"></i>Upcoming</Badge>;
            case 'in-progress': return <Badge bg="warning" className="text-warning bg-opacity-10 px-3 py-2 rounded-pill fw-medium text-dark"><i className="fa-solid fa-spinner fa-spin me-1"></i>In Progress</Badge>;
            case 'completed': return <Badge bg="success" className="text-success bg-opacity-10 px-3 py-2 rounded-pill fw-medium"><i className="fa-solid fa-check-double me-1"></i>Completed</Badge>;
            case 'cancelled': return <Badge bg="danger" className="text-danger bg-opacity-10 px-3 py-2 rounded-pill fw-medium"><i className="fa-solid fa-ban me-1"></i>Cancelled</Badge>;
            default: return <Badge bg="secondary" className="fw-medium">{status}</Badge>;
        }
    };

    const triggerToast = (msg) => {
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleForceCancel = async (id) => {
        if (!window.confirm("EMERGENCY ACTION: Are you sure you want to force cancel this booking? This will notify both patient and nurse.")) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/admin/bookings/${id}/force-cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            triggerToast(`Booking force cancelled successfully.`);
            fetchBookings(); // refresh list
        } catch (error) {
            console.error("Failed to cancel booking:", error);
            alert("Error cancelling booking.");
        }
    };

    const openDetails = (booking) => {
        setSelectedBooking(booking);
        setShowModal(true);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            
            {showToast && (
                <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
                    <div className="bg-success text-white px-4 py-2 rounded shadow-sm d-flex align-items-center gap-2">
                        <i className="fa-solid fa-circle-check"></i>
                        <span className="fw-medium">{toastMessage}</span>
                    </div>
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-dark mb-0" style={{ fontSize: '20px' }}>Bookings & Visits Management</h4>
                <Button variant="light" className="border shadow-sm rounded-pill fw-bold" onClick={fetchBookings}>
                    <i className="fa-solid fa-rotate-right me-2"></i> Refresh Data
                </Button>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden mb-4" style={{ borderRadius: '16px' }}>
                <Card.Header className="bg-white border-bottom-0 pt-4 pb-0 px-4">
                    <Nav variant="tabs" className="border-bottom" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                        <Nav.Item>
                            <Nav.Link eventKey="all" className={`text-dark fw-medium border-0 border-bottom ${activeTab === 'all' ? 'border-primary border-3' : ''}`}>All Bookings</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="resident" className={`text-dark fw-medium border-0 border-bottom ${activeTab === 'resident' ? 'border-primary border-3' : ''}`}>Resident Nursing</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="urgent" className={`text-dark fw-medium border-0 border-bottom ${activeTab === 'urgent' ? 'border-primary border-3' : ''}`}>Urgent Care</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="escort" className={`text-dark fw-medium border-0 border-bottom ${activeTab === 'escort' ? 'border-primary border-3' : ''}`}>Escort Services</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '14px' }}>Booking ID</th>
                                    <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '14px' }}>Patient / Guest</th>
                                    <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '14px' }}>Nurse Assigned</th>
                                    <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '14px' }}>Service Details</th>
                                    <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '14px' }}>Cost & Comm.</th>
                                    <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '14px' }}>Status</th>
                                    <th className="py-3 px-4 text-muted fw-semibold text-center" style={{ fontSize: '14px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <Spinner animation="border" variant="primary" />
                                            <p className="text-muted mt-2">Loading active bookings...</p>
                                        </td>
                                    </tr>
                                ) : filteredBookings.map(booking => (
                                    <tr key={booking._id} style={{ cursor: 'pointer' }} onClick={() => openDetails(booking)}>
                                        <td className="py-3 px-4 fw-bold text-primary" style={{ fontSize: '14px' }}>
                                            <i className="fa-solid fa-hashtag text-muted me-1"></i> {booking.bookingId || booking._id.substring(0,8).toUpperCase()}
                                        </td>
                                        <td className="py-3 px-4 fw-medium text-dark" style={{ fontSize: '15px' }}>
                                            {booking.patientDetails?.name || booking.patientId?.name || 'Guest'}
                                            {booking.guestEmail && <span className="d-block text-muted text-12"><i className="fa-solid fa-user-secret me-1"></i> Guest</span>}
                                        </td>
                                        <td className="py-3 px-4 text-dark fw-bold" style={{ fontSize: '14px' }}>
                                            {booking.nurseId?.name || 'Unassigned'}
                                        </td>
                                        <td className="py-3 px-4 text-muted" style={{ fontSize: '14px' }}>
                                            <div className="fw-bold text-dark">{booking.service}</div>
                                            <div className="text-12"><i className="fa-regular fa-clock me-1"></i>{booking.date} at {booking.time}</div>
                                        </td>
                                        <td className="py-3 px-4" style={{ fontSize: '14px' }}>
                                            {['missed', 'cancelled'].includes(booking.status) ? (
                                                <>
                                                    <div className="fw-bold text-muted text-decoration-line-through">{booking.totalCost || 0} EGP</div>
                                                    <div className="text-12 text-muted">0 EGP (Platform)</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="fw-bold text-dark">{booking.totalCost || 0} EGP</div>
                                                    <div className="text-12 text-success">+{booking.platformCommissionDeducted || ((booking.totalCost || 0) * 0.1)} EGP (Platform)</div>
                                                </>
                                            )}
                                        </td>
                                        <td className="py-3 px-4" style={{ fontSize: '14px' }}>{getStatusBadge(booking.status)}</td>
                                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                            <Button variant="light" size="sm" className="rounded-circle shadow-sm me-2" onClick={() => openDetails(booking)}>
                                                <i className="fa-regular fa-eye text-primary"></i>
                                            </Button>
                                            {(booking.status === 'upcoming' || booking.status === 'confirmed' || booking.status === 'in-progress') && (
                                                <Button variant="outline-danger" size="sm" className="rounded-pill px-3 fw-medium" onClick={() => handleForceCancel(booking._id)}>
                                                    <i className="fa-solid fa-ban me-1"></i> Cancel
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {!loading && filteredBookings.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5 text-muted" style={{ fontSize: '15px' }}>
                                            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                                                <i className="fa-regular fa-calendar-xmark fs-3"></i>
                                            </div>
                                            <h5>No bookings found</h5>
                                            <p className="mb-0 text-muted">There are no bookings matching your current filter.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Booking Details Modal */}
            <AnimatePresence>
                {showModal && selectedBooking && (
                    <Modal show={true} onHide={() => setShowModal(false)} size="lg" centered backdrop="static" contentClassName="border-0 rounded-4 shadow-lg overflow-hidden">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                            <div className="p-4 border-bottom d-flex justify-content-between align-items-start bg-primary text-white">
                                <div>
                                    <Badge bg="light" text="primary" className="mb-2 rounded-pill px-3 shadow-sm border-0 fw-bold">Booking Details</Badge>
                                    <h3 className="fw-bold mb-1">{selectedBooking.bookingId || selectedBooking._id}</h3>
                                    <div className="d-flex align-items-center gap-3 text-white-50">
                                        <span className="fw-medium text-14"><i className="fa-regular fa-clock me-1"></i> {new Date(selectedBooking.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(false)} className="btn btn-link text-white p-0 text-decoration-none">
                                    <i className="fa-solid fa-xmark fs-4"></i>
                                </button>
                            </div>

                            <Modal.Body className="p-4 p-md-5 bg-body-tertiary" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                                
                                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                                    <h5 className="fw-bold text-dark mb-0"><i className="fa-solid fa-layer-group text-primary me-2"></i> Current Status</h5>
                                    <div>{getStatusBadge(selectedBooking.status)}</div>
                                </div>

                                <Row className="g-4 mb-4">
                                    {/* Patient Info */}
                                    <Col md={6}>
                                        <Card className="h-100 border-0 shadow-sm rounded-4">
                                            <Card.Body>
                                                <h6 className="fw-bold text-muted mb-3"><i className="fa-solid fa-bed-pulse text-danger me-2"></i> Patient Details</h6>
                                                <div className="d-flex flex-column gap-2 text-14">
                                                    <div><span className="fw-bold text-dark">Name:</span> {selectedBooking.patientDetails?.name || selectedBooking.patientId?.name || 'N/A'}</div>
                                                    <div><span className="fw-bold text-dark">Phone:</span> {selectedBooking.patientDetails?.phone || 'N/A'}</div>
                                                    <div><span className="fw-bold text-dark">Address:</span> {selectedBooking.patientDetails?.address || 'N/A'}</div>
                                                    {selectedBooking.guestEmail && <div><span className="badge bg-secondary">Guest Booking</span> {selectedBooking.guestEmail}</div>}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>

                                    {/* Nurse Info */}
                                    <Col md={6}>
                                        <Card className="h-100 border-0 shadow-sm rounded-4">
                                            <Card.Body>
                                                <h6 className="fw-bold text-muted mb-3"><i className="fa-solid fa-user-nurse text-primary me-2"></i> Assigned Nurse</h6>
                                                <div className="d-flex flex-column gap-2 text-14">
                                                    <div><span className="fw-bold text-dark">Name:</span> {selectedBooking.nurseId?.name || 'Unassigned'}</div>
                                                    <div><span className="fw-bold text-dark">Nurse ID:</span> {selectedBooking.nurseId?._id || 'N/A'}</div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>

                                    {/* Service Details */}
                                    <Col md={12}>
                                        <Card className="border-0 shadow-sm rounded-4">
                                            <Card.Body>
                                                <h6 className="fw-bold text-muted mb-3"><i className="fa-solid fa-stethoscope text-primary me-2"></i> Service Request</h6>
                                                <Row className="g-3">
                                                    <Col md={4}>
                                                        <span className="text-muted d-block text-12">Service Type</span>
                                                        <span className="fw-bold text-dark">{selectedBooking.service}</span>
                                                    </Col>
                                                    <Col md={4}>
                                                        <span className="text-muted d-block text-12">Date & Time</span>
                                                        <span className="fw-bold text-dark">{selectedBooking.date} at {selectedBooking.time}</span>
                                                    </Col>
                                                    <Col md={4}>
                                                        <span className="text-muted d-block text-12">Shift Duration</span>
                                                        <span className="fw-bold text-dark">{selectedBooking.shift}</span>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>

                                {/* Financials */}
                                <div className="mb-4">
                                    <h6 className="fw-bold text-dark mb-3"><i className="fa-solid fa-money-check-dollar text-success me-2"></i> Financial Summary</h6>
                                    <div className="bg-white rounded-4 p-3 border shadow-sm">
                                        <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                                            <span className="text-muted">Total Cost Paid By Patient</span>
                                            <span className={`fw-bold ${['missed', 'cancelled'].includes(selectedBooking.status) ? 'text-muted text-decoration-line-through' : 'text-dark'}`}>
                                                {selectedBooking.totalCost || 0} EGP
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                                            <span className="text-muted">Platform Commission</span>
                                            <span className={`fw-bold ${['missed', 'cancelled'].includes(selectedBooking.status) ? 'text-muted' : 'text-success'}`}>
                                                {['missed', 'cancelled'].includes(selectedBooking.status) ? 0 : `+${selectedBooking.platformCommissionDeducted || ((selectedBooking.totalCost || 0) * 0.1)}`} EGP
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="text-muted">Net Earnings for Nurse</span>
                                            <span className={`fw-bold ${['missed', 'cancelled'].includes(selectedBooking.status) ? 'text-muted' : 'text-primary'}`}>
                                                {['missed', 'cancelled'].includes(selectedBooking.status) ? 0 : (selectedBooking.totalCost || 0) - (selectedBooking.platformCommissionDeducted || ((selectedBooking.totalCost || 0) * 0.1))} EGP
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Nurse Report (If Completed) */}
                                {selectedBooking.status === 'completed' && selectedBooking.report && (
                                    <div className="mb-4">
                                        <h6 className="fw-bold text-dark mb-3"><i className="fa-solid fa-clipboard-check text-success me-2"></i> Nurse Medical Report</h6>
                                        <div className="bg-white rounded-4 p-4 border shadow-sm border-success border-opacity-50">
                                            
                                            {selectedBooking.report.vitals && (
                                                <Row className="g-3 mb-3 border-bottom pb-3">
                                                    <Col md={4}>
                                                        <span className="text-muted d-block text-12">Blood Pressure</span>
                                                        <span className="fw-bold text-danger">{selectedBooking.report.vitals.bloodPressure || 'N/A'}</span>
                                                    </Col>
                                                    <Col md={4}>
                                                        <span className="text-muted d-block text-12">Heart Rate</span>
                                                        <span className="fw-bold text-danger">{selectedBooking.report.vitals.heartRate || 'N/A'} bpm</span>
                                                    </Col>
                                                    <Col md={4}>
                                                        <span className="text-muted d-block text-12">Temperature</span>
                                                        <span className="fw-bold text-danger">{selectedBooking.report.vitals.temperature || 'N/A'} °C</span>
                                                    </Col>
                                                </Row>
                                            )}

                                            <div className="mb-3">
                                                <span className="text-muted d-block text-12 mb-1">Nurse Notes & Observations</span>
                                                <p className="text-dark fw-medium text-14 bg-light p-3 rounded">{selectedBooking.report.notes || 'No general notes provided.'}</p>
                                            </div>

                                            {selectedBooking.report.serviceAnswers && Object.keys(selectedBooking.report.serviceAnswers).length > 0 && (
                                                <div>
                                                    <span className="text-muted d-block text-12 mb-2">Service Specific Checks</span>
                                                    <ul className="list-group list-group-flush border rounded overflow-hidden">
                                                        {Object.entries(selectedBooking.report.serviceAnswers).map(([key, value], idx) => (
                                                            <li key={idx} className="list-group-item bg-light d-flex justify-content-between align-items-center">
                                                                <span className="text-capitalize text-muted">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                                <span className="fw-bold text-dark">{value}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Cancellation Details */}
                                {selectedBooking.status === 'cancelled' && selectedBooking.cancellationReason && (
                                    <div className="alert alert-danger rounded-4 d-flex gap-3 align-items-start border-0 shadow-sm">
                                        <i className="fa-solid fa-triangle-exclamation fs-4"></i>
                                        <div>
                                            <h6 className="fw-bold mb-1">Cancellation Details</h6>
                                            <p className="mb-0 text-14 fw-medium">Reason: {selectedBooking.cancellationReason}</p>
                                            <span className="d-block mt-1 text-12 opacity-75">Cancelled By: <span className="text-uppercase fw-bold">{selectedBooking.cancelledBy}</span></span>
                                        </div>
                                    </div>
                                )}

                            </Modal.Body>
                            <div className="p-4 border-top bg-white text-end">
                                <Button variant="light" className="fw-bold px-5 py-2 shadow-sm border" onClick={() => setShowModal(false)}>
                                    Close Details
                                </Button>
                            </div>
                        </motion.div>
                    </Modal>
                )}
            </AnimatePresence>

        </motion.div>
    );
};

export default Bookings;
