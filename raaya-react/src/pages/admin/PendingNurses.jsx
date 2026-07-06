import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from 'axios';

const PendingNurses = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedNurse, setSelectedNurse] = useState(null);
    const [pendingApps, setPendingApps] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingNurses = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/nurses/pending', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPendingApps(res.data);
        } catch (error) {
            console.error("Error fetching pending nurses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingNurses();
    }, []);

    const handleViewDetails = (nurse) => {
        setSelectedNurse(nurse);
        setShowModal(true);
    };

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const handleUpdateStatus = async (id, status, reason = '') => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/admin/nurses/${id}/status`, { status, rejectReason: reason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Remove from list
            setPendingApps(pendingApps.filter(app => app._id !== id));
            setSelectedNurse(null);
            setShowRejectModal(false);
            setRejectReason('');
        } catch (error) {
            console.error(`Error updating status to ${status}`, error);
            alert('Failed to update status');
        }
    };

    if (loading) {
        return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-dark mb-0">Pending Nurse Applications</h4>
                <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill shadow-sm">
                    {pendingApps.length} Pending
                </Badge>
            </div>

            {selectedNurse ? (
                <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                    <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold mb-0">Applicant Details</h5>
                            <Button variant="light" className="rounded-pill fw-medium px-4 shadow-sm" onClick={() => setSelectedNurse(null)}>
                                <i className="fa-solid fa-arrow-left me-2"></i> Back to List
                            </Button>
                        </div>
                        
                        {/* Personal Details Section */}
                        <div className="mb-5">
                            <h5 className="fw-bold text-dark mb-4" style={{ color: '#025955' }}>
                                <i className="fa-solid fa-user me-2" style={{ color: '#025955' }}></i> Personal Details
                            </h5>
                            <div className="row g-4">
                                <div className="col-md-4">
                                    <div className="p-3 bg-light rounded-3 h-100">
                                        <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>Full Name</span>
                                        <span className="fw-bold text-dark fs-5">{selectedNurse.name}</span>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-3 bg-light rounded-3 h-100">
                                        <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>Email Address</span>
                                        <span className="fw-bold text-dark fs-5">{selectedNurse.email}</span>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-3 bg-light rounded-3 h-100">
                                        <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>Phone Number</span>
                                        <span className="fw-bold text-dark fs-5">{selectedNurse.phone}</span>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-3 bg-light rounded-3 h-100">
                                        <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>Gender</span>
                                        <span className="fw-bold text-dark fs-5" style={{ textTransform: 'capitalize' }}>{selectedNurse.gender || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-3 bg-light rounded-3 h-100">
                                        <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>Governorate</span>
                                        <span className="fw-bold text-dark fs-5">{selectedNurse.governorate || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-3 bg-light rounded-3 h-100">
                                        <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>City</span>
                                        <span className="fw-bold text-dark fs-5">{selectedNurse.city || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Education & Experience Section */}
                        <div className="mb-5">
                            <h5 className="fw-bold text-dark mb-4" style={{ color: '#025955' }}>
                                <i className="fa-solid fa-briefcase me-2" style={{ color: '#025955' }}></i> Education & Experience
                            </h5>
                            <div className="row g-4">
                                <div className="col-md-4">
                                    <div className="p-3 bg-light rounded-3 h-100">
                                        <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>University</span>
                                        <span className="fw-bold text-dark fs-5">{selectedNurse.university || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-3 bg-light rounded-3 h-100">
                                        <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>Faculty / College</span>
                                        <span className="fw-bold text-dark fs-5">{selectedNurse.faculty || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-3 bg-light rounded-3 h-100">
                                        <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>Highest Degree</span>
                                        <span className="fw-bold text-dark fs-5">{selectedNurse.degree || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-3 bg-light rounded-3 h-100">
                                        <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>Languages Spoken</span>
                                        <span className="fw-bold text-dark fs-5">{selectedNurse.languages || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-3 bg-light rounded-3 h-100">
                                        <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>Years of Experience</span>
                                        <span className="fw-bold text-dark fs-5">{selectedNurse.experienceYears} Years</span>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="p-3 bg-light rounded-3 h-100">
                                        <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>Current or Previous Workplace(s)</span>
                                        <span className="fw-bold text-dark fs-5">{selectedNurse.previousWork || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="p-3 bg-light rounded-3 h-100">
                                        <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>Relevant Nursing Services</span>
                                        <span className="fw-bold text-dark fs-6">{selectedNurse.skills || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Documents Section */}
                        <div className="mb-4">
                            <h5 className="fw-bold text-dark mb-4" style={{ color: '#025955' }}>
                                <i className="fa-solid fa-file-arrow-up me-2" style={{ color: '#025955' }}></i> Verification Documents
                            </h5>
                            <div className="p-4 bg-light rounded-3 border d-flex align-items-center justify-content-between" style={{ borderStyle: 'dashed !important', borderColor: '#cbd5e1' }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-white p-3 rounded-circle shadow-sm">
                                        <i className="fa-solid fa-file-pdf fs-3 text-danger"></i>
                                    </div>
                                    <div>
                                        <span className="d-block fw-bold text-dark fs-5">{selectedNurse.documentName || 'No Document Uploaded'}</span>
                                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>National ID, Certificates, Criminal Record</span>
                                    </div>
                                </div>
                                {selectedNurse.documentName ? (
                                    <a href={`http://localhost:5000/uploads/${selectedNurse.documentName}`} target="_blank" rel="noreferrer" className="btn btn-outline-primary rounded-pill fw-bold px-4">
                                        <i className="fa-solid fa-eye me-2"></i> View File
                                    </a>
                                ) : (
                                    <Button variant="outline-primary" className="rounded-pill fw-bold px-4" disabled>
                                        <i className="fa-solid fa-eye me-2"></i> View File
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                            <Button variant="danger" className="rounded-pill fw-bold text-white px-5 py-2 shadow-sm" onClick={() => setShowRejectModal(true)}>
                                <i className="fa-solid fa-xmark me-2"></i> Reject Application
                            </Button>
                            <Button variant="success" className="rounded-pill fw-bold text-white px-5 py-2 shadow-sm" onClick={() => handleUpdateStatus(selectedNurse._id, 'active')}>
                                <i className="fa-solid fa-check me-2"></i> Approve & Activate
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            ) : (
                <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
                    <div className="table-responsive">
                        <Table hover className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Name</th>
                                    <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Qualification</th>
                                    <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>License No.</th>
                                    <th className="py-3 px-4 text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Experience</th>
                                    <th className="py-3 px-4 text-muted fw-semibold text-center" style={{ fontSize: '0.85rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingApps.map(app => (
                                    <tr key={app._id}>
                                        <td className="py-3 px-4 fw-medium text-dark">{app.name}</td>
                                        <td className="py-3 px-4 text-muted">{app.qualification}</td>
                                        <td className="py-3 px-4 text-muted"><code>{app.licenseNumber}</code></td>
                                        <td className="py-3 px-4 text-muted">{app.experienceYears} Years</td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                <Button variant="primary" size="sm" className="rounded-pill px-3 shadow-sm" onClick={() => handleViewDetails(app)}>
                                                    Review Details
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {pendingApps.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            No pending applications found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card>
            )}

            {/* Rejection Modal */}
            <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold text-dark">Reject Application</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>Please provide a reason for rejecting this application. This reason will be shown to the nurse.</p>
                    <textarea 
                        className="form-control" 
                        rows="4" 
                        placeholder="Enter rejection reason here..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        style={{ borderRadius: '10px', resize: 'none' }}
                    ></textarea>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" onClick={() => setShowRejectModal(false)} className="rounded-pill px-4">
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={() => handleUpdateStatus(selectedNurse._id, 'rejected', rejectReason)} className="rounded-pill px-4" disabled={!rejectReason.trim()}>
                        Confirm Rejection
                    </Button>
                </Modal.Footer>
            </Modal>
        </motion.div>
    );
};

export default PendingNurses;
