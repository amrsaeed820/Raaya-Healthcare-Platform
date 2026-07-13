import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Spinner, Modal, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from 'axios';

const ActiveNurses = () => {
    const [activeNurses, setActiveNurses] = useState([]);
    const [suspendedNurses, setSuspendedNurses] = useState([]);
    const [isViewingSuspended, setIsViewingSuspended] = useState(false);
    const [loading, setLoading] = useState(true);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const [selectedNurse, setSelectedNurse] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchNurses = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        try {
            const activeRes = await axios.get('http://localhost:5000/api/admin/nurses/active', { headers: { Authorization: `Bearer ${token}` } });
            setActiveNurses(activeRes.data || []);
        } catch (error) {
            console.error("Error fetching active nurses", error);
        }

        try {
            const suspendedRes = await axios.get('http://localhost:5000/api/admin/nurses/suspended', { headers: { Authorization: `Bearer ${token}` } });
            setSuspendedNurses(suspendedRes.data || []);
        } catch (error) {
            console.error("Error fetching suspended nurses", error);
            // Fallback for older backend before restart
        }
        
        setLoading(false);
    };

    useEffect(() => {
        fetchNurses();
    }, []);

    const triggerToast = (msg) => {
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleSuspend = async (id) => {
        if (!window.confirm("Are you sure you want to suspend this nurse? They will not receive new bookings.")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/admin/nurses/${id}/status`, { status: 'suspended' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            triggerToast('Nurse suspended successfully');
            fetchNurses();
        } catch (error) {
            console.error("Error suspending nurse", error);
            triggerToast('Error suspending nurse');
        }
    };

    const handleRestore = async (id) => {
        if (!window.confirm("Are you sure you want to restore this nurse?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/admin/nurses/${id}/status`, { status: 'active' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            triggerToast('Nurse restored successfully');
            fetchNurses();
        } catch (error) {
            console.error("Error restoring nurse", error);
            triggerToast('Error restoring nurse');
        }
    };

    const handleView = (nurse) => {
        setSelectedNurse(nurse);
        setShowModal(true);
    };

    if (loading) {
        return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;
    }

    const currentList = isViewingSuspended ? suspendedNurses : activeNurses;

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
                <h4 className="fw-bold text-dark mb-0" style={{ fontSize: '20px' }}>
                    {isViewingSuspended ? 'Suspended Nurses' : 'Active Nurses Directory'}
                </h4>
                <Button 
                    variant={isViewingSuspended ? "outline-primary" : "outline-danger"} 
                    className="rounded-pill fw-bold px-4"
                    onClick={() => setIsViewingSuspended(!isViewingSuspended)}
                >
                    <i className={`fa-solid ${isViewingSuspended ? 'fa-user-nurse' : 'fa-user-slash'} me-2`}></i>
                    {isViewingSuspended ? 'View Active Nurses' : 'View Suspended Nurses'}
                </Button>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
                <div className="table-responsive">
                    <Table hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '14px' }}>Name</th>
                                <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '14px' }}>Rating</th>
                                <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '14px' }}>Total Visits</th>
                                <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '14px' }}>Financials (Earnings / Platform Share)</th>
                                <th className="py-3 px-4 text-muted fw-semibold text-center" style={{ fontSize: '14px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentList.map(nurse => (
                                <tr key={nurse._id}>
                                    <td className="py-3 px-4 fw-medium text-dark" style={{ fontSize: '15px' }}>
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '14px', textTransform: 'uppercase' }}>
                                                {nurse.name ? nurse.name.charAt(0) : '?'}
                                            </div>
                                            {nurse.name || 'Unknown'}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="d-flex align-items-center gap-1 text-warning">
                                            <i className="fa-solid fa-star" style={{ fontSize: '14px' }}></i>
                                            <span className="text-dark fw-bold ms-1" style={{ fontSize: '15px' }}>{nurse.rating}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-muted" style={{ fontSize: '15px' }}>{nurse.shiftsCompleted || 0} Visits</td>
                                    <td className="py-3 px-4">
                                        <div className="d-flex flex-column">
                                            <span className="text-success fw-bold" style={{ fontSize: '14px' }}>
                                                <i className="fa-solid fa-money-bill-wave me-1"></i> {nurse.totalEarnings || 0} EGP (Nurse)
                                            </span>
                                            <span className="text-primary fw-bold mt-1" style={{ fontSize: '13px' }}>
                                                <i className="fa-solid fa-hand-holding-dollar me-1"></i> {nurse.platformShare || 0} EGP (Platform)
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="d-flex justify-content-center gap-2">
                                            <Button variant="outline-primary" size="sm" className="rounded-pill px-3 fw-medium" onClick={() => handleView(nurse)}>
                                                <i className="fa-regular fa-eye me-1"></i> View
                                            </Button>
                                            {isViewingSuspended ? (
                                                <Button variant="outline-success" size="sm" className="rounded-pill px-3 fw-medium" onClick={() => handleRestore(nurse._id)}>
                                                    <i className="fa-solid fa-rotate-left me-1"></i> Restore
                                                </Button>
                                            ) : (
                                                <Button variant="outline-danger" size="sm" className="rounded-pill px-3 fw-medium" onClick={() => handleSuspend(nurse._id)}>
                                                    <i className="fa-solid fa-ban me-1"></i> Suspend
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {currentList.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted" style={{ fontSize: '15px' }}>
                                        No {isViewingSuspended ? 'suspended' : 'active'} nurses found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>

            {/* Nurse Profile Modal */}
            {selectedNurse && (
                <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                    <Modal.Header closeButton className="border-0 pb-0">
                        <Modal.Title className="fw-bold text-dark">Nurse Profile</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-4">
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow-sm" style={{ width: '60px', height: '60px', fontSize: '24px', textTransform: 'uppercase' }}>
                                {selectedNurse.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="fw-bold mb-1">{selectedNurse.name}</h4>
                                <div className="d-flex gap-2">
                                    <Badge bg={selectedNurse.status === 'active' ? 'success' : 'danger'}>
                                        {selectedNurse.status.toUpperCase()}
                                    </Badge>
                                    <Badge bg="primary">{selectedNurse.qualification}</Badge>
                                </div>
                            </div>
                        </div>

                        <Row className="g-4 mb-4">
                            <Col md={6}>
                                <Card className="border-0 shadow-sm bg-light h-100 p-3">
                                    <h6 className="fw-bold text-primary mb-3">Contact Info</h6>
                                    <div className="mb-2"><i className="fa-solid fa-envelope text-muted me-2"></i> <strong>Email:</strong> {selectedNurse.email}</div>
                                    <div className="mb-2"><i className="fa-solid fa-phone text-muted me-2"></i> <strong>Phone:</strong> {selectedNurse.phone}</div>
                                    <div className="mb-0"><i className="fa-solid fa-location-dot text-muted me-2"></i> <strong>Location:</strong> {selectedNurse.governorate}, {selectedNurse.city}</div>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card className="border-0 shadow-sm bg-light h-100 p-3">
                                    <h6 className="fw-bold text-primary mb-3">Professional Info</h6>
                                    <div className="mb-2"><i className="fa-solid fa-id-card text-muted me-2"></i> <strong>License:</strong> {selectedNurse.licenseNumber}</div>
                                    <div className="mb-2"><i className="fa-solid fa-briefcase text-muted me-2"></i> <strong>Experience:</strong> {selectedNurse.experienceYears} Years</div>
                                    <div className="mb-0"><i className="fa-solid fa-graduation-cap text-muted me-2"></i> <strong>University:</strong> {selectedNurse.university} ({selectedNurse.faculty})</div>
                                </Card>
                            </Col>
                        </Row>

                        <h6 className="fw-bold text-dark mb-3">Skills & Experience</h6>
                        <Card className="border-0 shadow-sm bg-light p-3 mb-4">
                            <div className="mb-3">
                                <strong className="d-block mb-1">Skills:</strong>
                                <span className="text-muted">{selectedNurse.skills || 'Not specified'}</span>
                            </div>
                            <div className="mb-3">
                                <strong className="d-block mb-1">Previous Work:</strong>
                                <span className="text-muted">{selectedNurse.previousWork || 'Not specified'}</span>
                            </div>
                            <div>
                                <strong className="d-block mb-1">Languages:</strong>
                                <span className="text-muted">{selectedNurse.languages || 'Not specified'}</span>
                            </div>
                        </Card>

                        <h6 className="fw-bold text-dark mb-3">Performance</h6>
                        <Row className="g-3">
                            <Col xs={3}>
                                <div className="bg-light rounded p-3 text-center border shadow-sm">
                                    <div className="text-warning mb-1"><i className="fa-solid fa-star fs-4"></i></div>
                                    <div className="fw-bold fs-5">{selectedNurse.rating}</div>
                                    <div className="text-muted small">Rating</div>
                                </div>
                            </Col>
                            <Col xs={3}>
                                <div className="bg-light rounded p-3 text-center border shadow-sm">
                                    <div className="text-primary mb-1"><i className="fa-solid fa-briefcase-medical fs-4"></i></div>
                                    <div className="fw-bold fs-5">{selectedNurse.shiftsCompleted || 0}</div>
                                    <div className="text-muted small">Visits</div>
                                </div>
                            </Col>
                            <Col xs={3}>
                                <div className="bg-light rounded p-3 text-center border shadow-sm">
                                    <div className="text-success mb-1"><i className="fa-solid fa-money-bill-wave fs-4"></i></div>
                                    <div className="fw-bold fs-5">{selectedNurse.totalEarnings || 0} EGP</div>
                                    <div className="text-muted small">Nurse Earnings</div>
                                </div>
                            </Col>
                            <Col xs={3}>
                                <div className="bg-light rounded p-3 text-center border shadow-sm">
                                    <div className="text-info mb-1"><i className="fa-solid fa-hand-holding-dollar fs-4"></i></div>
                                    <div className="fw-bold fs-5">{selectedNurse.platformShare || 0} EGP</div>
                                    <div className="text-muted small">Platform Share</div>
                                </div>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0">
                        <Button variant="secondary" onClick={() => setShowModal(false)} className="rounded-pill px-4">
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </motion.div>
    );
};

export default ActiveNurses;
