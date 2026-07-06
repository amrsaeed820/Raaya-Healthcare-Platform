import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmergencyTab({ showToast, setActiveTab }) {
    const [emergencies, setEmergencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [acceptingId, setAcceptingId] = useState(null);

    const fetchEmergencies = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get('http://localhost:5000/api/bookings/nurse/emergency', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmergencies(res.data);
        } catch (error) {
            console.error("Failed to fetch emergencies", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmergencies();
        const interval = setInterval(fetchEmergencies, 10000); // Polling every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const handleAccept = async (id) => {
        setAcceptingId(id);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/bookings/nurse/emergency/${id}/accept`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast('Case Accepted', 'Emergency case added to your schedule successfully.', 'success');
            // Remove from board immediately
            setEmergencies(prev => prev.filter(e => e._id !== id));
            
            // Redirect to Patients Tab after short delay to see details
            setTimeout(() => {
                setActiveTab('patients');
            }, 1500);
        } catch (error) {
            showToast('Sorry', error.response?.data?.message || 'An error occurred or case was already accepted by another nurse.', 'error');
            fetchEmergencies(); // refresh board
        } finally {
            setAcceptingId(null);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                        <span className="bg-danger rounded-circle d-inline-block" style={{ width: '12px', height: '12px' }}></span> 
                        Emergency Requests Board
                    </h3>
                    <p className="text-muted text-14 mb-0">Emergency cases waiting for immediate acceptance in your area. (First come, first served)</p>
                </div>
            </div>

            <Row className="g-4">
                <AnimatePresence>
                    {emergencies.length > 0 ? (
                        emergencies.map(emg => (
                            <Col md={6} lg={4} key={emg._id}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    layout
                                >
                                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden" style={{ borderTop: '4px solid var(--primary)' }}>
                                        <Card.Body className="p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                                        <i className="fa-solid fa-truck-medical"></i>
                                                    </div>
                                                    <div>
                                                        <h6 className="fw-bold mb-0 text-dark">{emg.service}</h6>
                                                        <span className="text-muted" style={{ fontSize: '12px' }}>
                                                            {new Date(emg.createdAt).toLocaleTimeString('en-US')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-light p-3 rounded-3 mb-4">
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <i className="fa-solid fa-location-dot text-muted" style={{ width: '20px' }}></i>
                                                    <span className="text-dark fw-medium text-14">{emg.patientDetails?.address || 'Not specified'}</span>
                                                </div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="fa-regular fa-clock text-muted" style={{ width: '20px' }}></i>
                                                    <span className="text-dark fw-medium text-14">Immediate Request - {emg.shift}</span>
                                                </div>
                                            </div>

                                            <Button 
                                                variant="primary" 
                                                className="w-100 fw-bold py-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                                                onClick={() => handleAccept(emg._id)}
                                                disabled={acceptingId === emg._id}
                                            >
                                                {acceptingId === emg._id ? (
                                                    <div className="spinner-border spinner-border-sm text-light" role="status"></div>
                                                ) : (
                                                    <>Accept Case Now <i className="fa-solid fa-arrow-right"></i></>
                                                )}
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))
                    ) : (
                        <Col xs={12}>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-5 text-muted">
                                <i className="fa-solid fa-check-circle fs-1 mb-3 text-success opacity-50"></i>
                                <h5>No Emergency Cases Currently</h5>
                                <p>This page will automatically update when a new request arrives.</p>
                            </motion.div>
                        </Col>
                    )}
                </AnimatePresence>
            </Row>
        </div>
    );
}
