import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Row, Col, Modal, Spinner } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const PatientsManagement = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/patients', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatients(res.data);
        } catch (error) {
            console.error("Failed to fetch patients:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewHistory = (patient) => {
        setSelectedPatient(patient);
        setShowModal(true);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-dark mb-0" style={{ fontSize: '20px' }}>Patients Management</h4>
                <Button variant="light" className="border shadow-sm rounded-pill fw-bold" onClick={fetchPatients}>
                    <i className="fa-solid fa-rotate-right me-2"></i> Refresh Data
                </Button>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
                <div className="table-responsive">
                    <Table hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '14px' }}>Patient Details</th>
                                <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '14px' }}>Contact Info</th>
                                <th className="py-3 px-4 text-muted fw-semibold text-center" style={{ fontSize: '14px' }}>Bookings Count</th>
                                <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '14px' }}>Total Spent</th>
                                <th className="py-3 px-4 text-muted fw-semibold text-center" style={{ fontSize: '14px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="text-muted mt-2">Loading patients database...</p>
                                    </td>
                                </tr>
                            ) : patients.map(patient => (
                                <tr key={patient._id} style={{ cursor: 'pointer' }} onClick={() => handleViewHistory(patient)}>
                                    <td className="py-3 px-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px', fontSize: '16px' }}>
                                                {patient.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark" style={{ fontSize: '15px' }}>{patient.name}</div>
                                                <div className="text-muted" style={{ fontSize: '12px' }}>Joined: {new Date(patient.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="fw-medium text-dark mb-1" style={{ fontSize: '14px' }}>
                                            <i className="fa-solid fa-envelope text-muted me-2"></i>{patient.email}
                                        </div>
                                        {patient.phone && (
                                            <div className="text-muted" style={{ fontSize: '13px' }}>
                                                <i className="fa-solid fa-phone text-muted me-2"></i>{patient.phone}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Badge bg={patient.bookings?.length > 0 ? "primary" : "secondary"} className="bg-opacity-10 text-primary rounded-pill px-3 py-2 fw-bold">
                                            {patient.bookings?.length || 0} Bookings
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-4 text-dark fw-bold text-success" style={{ fontSize: '15px' }}>
                                        {patient.totalSpent || 0} EGP
                                    </td>
                                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                        <Button variant="light" size="sm" className="rounded-circle shadow-sm" onClick={() => handleViewHistory(patient)}>
                                            <i className="fa-regular fa-eye text-primary"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && patients.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted" style={{ fontSize: '15px' }}>
                                        <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                                            <i className="fa-solid fa-users-slash fs-3"></i>
                                        </div>
                                        <h5>No patients found</h5>
                                        <p className="mb-0 text-muted">There are no registered patients in the system yet.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>

            {/* Patient History Modal */}
            <AnimatePresence>
                {showModal && selectedPatient && (
                    <Modal show={true} onHide={() => setShowModal(false)} size="lg" centered backdrop="static" contentClassName="border-0 rounded-4 shadow-lg overflow-hidden">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                            <div className="p-4 border-bottom d-flex justify-content-between align-items-start bg-primary text-white">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold shadow" style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                                        {selectedPatient.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <Badge bg="light" text="primary" className="mb-2 rounded-pill px-3 shadow-sm border-0 fw-bold">Patient Profile</Badge>
                                        <h3 className="fw-bold mb-0">{selectedPatient.name}</h3>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(false)} className="btn btn-link text-white p-0 text-decoration-none">
                                    <i className="fa-solid fa-xmark fs-4"></i>
                                </button>
                            </div>

                            <Modal.Body className="p-4 p-md-5 bg-body-tertiary" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                                <Row className="g-4 mb-4">
                                    <Col md={6}>
                                        <Card className="h-100 border-0 shadow-sm rounded-4">
                                            <Card.Body>
                                                <h6 className="fw-bold text-muted mb-3"><i className="fa-solid fa-address-card text-primary me-2"></i> Contact Information</h6>
                                                <div className="d-flex flex-column gap-2 text-14">
                                                    <div><span className="fw-bold text-dark">Email:</span> {selectedPatient.email}</div>
                                                    <div><span className="fw-bold text-dark">Phone:</span> {selectedPatient.phone || 'Not Provided'}</div>
                                                    <div><span className="fw-bold text-dark">Joined On:</span> {new Date(selectedPatient.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={6}>
                                        <Card className="h-100 border-0 shadow-sm rounded-4">
                                            <Card.Body>
                                                <h6 className="fw-bold text-muted mb-3"><i className="fa-solid fa-wallet text-success me-2"></i> Financial Overview</h6>
                                                <div className="d-flex flex-column gap-2 text-14">
                                                    <div><span className="fw-bold text-dark">Total Bookings:</span> {selectedPatient.bookings?.length || 0}</div>
                                                    <div><span className="fw-bold text-dark">Total Spent:</span> <span className="text-success fw-bold">{selectedPatient.totalSpent || 0} EGP</span></div>
                                                    <div><span className="fw-bold text-dark">Last Active:</span> {selectedPatient.updatedAt ? new Date(selectedPatient.updatedAt).toLocaleDateString() : 'N/A'}</div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>

                                <h6 className="fw-bold mb-3 text-dark"><i className="fa-solid fa-clock-rotate-left text-primary me-2"></i> Booking History</h6>
                                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                                    {selectedPatient.bookings && selectedPatient.bookings.length > 0 ? (
                                        <Table hover className="mb-0 align-middle">
                                            <thead className="bg-light text-muted" style={{ fontSize: '13px' }}>
                                                <tr>
                                                    <th className="py-3 px-4">Booking ID</th>
                                                    <th className="py-3 px-4">Date</th>
                                                    <th className="py-3 px-4">Service</th>
                                                    <th className="py-3 px-4 text-center">Status</th>
                                                    <th className="py-3 px-4 text-end">Amount Paid</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedPatient.bookings.map((b) => (
                                                    <tr key={b.id}>
                                                        <td className="py-3 px-4 fw-medium text-primary" style={{ fontSize: '13px' }}>{b.id.substring(0,8).toUpperCase()}</td>
                                                        <td className="py-3 px-4 text-muted" style={{ fontSize: '13px' }}>{b.date}</td>
                                                        <td className="py-3 px-4 fw-medium" style={{ fontSize: '14px' }}>{b.service}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            <Badge bg={
                                                                b.status === 'completed' ? 'success' :
                                                                b.status === 'cancelled' ? 'danger' :
                                                                b.status === 'in-progress' ? 'warning' : 'info'
                                                            } className="bg-opacity-10 text-dark border">{b.status}</Badge>
                                                        </td>
                                                        <td className="py-3 px-4 text-end fw-bold text-success" style={{ fontSize: '14px' }}>{b.amount} EGP</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-4 text-muted">
                                            <i className="fa-regular fa-folder-open fs-1 mb-2 opacity-50"></i>
                                            <p className="mb-0">This patient has no booking history yet.</p>
                                        </div>
                                    )}
                                </Card>
                            </Modal.Body>
                            <div className="p-4 border-top bg-white text-end">
                                <Button variant="light" className="fw-bold px-5 py-2 shadow-sm border" onClick={() => setShowModal(false)}>
                                    Close Profile
                                </Button>
                            </div>
                        </motion.div>
                    </Modal>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default PatientsManagement;
