import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Badge, Form, InputGroup } from 'react-bootstrap';
import NurseLayout from './components/layout/NurseLayout';
import './Dashboard.css';
import axios from 'axios';

const PatientsContent = () => {
    const [bookings, setBookings] = useState([]);
    const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'completed'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('nurseToken');
                if (!token) return;

                const res = await axios.get('http://localhost:5000/api/bookings/nurse', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookings(res.data);
            } catch (err) {
                console.error("Failed to fetch bookings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const filteredBookings = bookings.filter(b => {
        if (filter === 'upcoming') return b.status === 'upcoming' || b.status === 'confirmed';
        if (filter === 'completed') return b.status === 'completed';
        return true;
    }).sort((a, b) => {
        if (filter === 'upcoming') return new Date(a.date) - new Date(b.date);
        return new Date(b.date) - new Date(a.date);
    });

    const uniquePatientsCount = new Set(bookings.map(b => b.patientId?._id)).size;
    const currentMonthVisitsCount = bookings.filter(b => {
        const d = new Date(b.date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return (
        <>
            <div className="mb-4">
                <p className="text-muted mb-1" style={{ fontSize: '0.95rem' }}>Manage and view all patient records</p>
                <h2 className="fw-bold text-dark mb-4">Patients</h2>
            </div>

            {/* Top Cards */}
            <Row className="g-4 mb-4">
                <Col md={6}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 p-2">
                        <Card.Body>
                            <h2 className="fw-bold text-dark mb-1">{uniquePatientsCount}</h2>
                            <p className="text-muted fw-medium mb-0" style={{ fontSize: '0.9rem' }}>Total Patients</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 p-2">
                        <Card.Body>
                            <h2 className="fw-bold text-dark mb-1">{currentMonthVisitsCount}</h2>
                            <p className="text-muted fw-medium mb-0" style={{ fontSize: '0.9rem' }}>Visits This Month</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Table Section */}
            <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                <Card.Body className="p-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                        <h4 className="fw-bold text-dark mb-0">Patient Records</h4>
                        <div className="d-flex align-items-center gap-3">
                            <InputGroup className="shadow-sm rounded-pill overflow-hidden border" style={{ maxWidth: '300px' }}>
                                <InputGroup.Text className="bg-light border-0 px-3">
                                    <i className="fa-solid fa-search text-muted"></i>
                                </InputGroup.Text>
                                <Form.Control placeholder="Search patients..." className="bg-light border-0 shadow-none py-2" style={{ fontSize: '0.9rem' }} />
                            </InputGroup>
                            <Button variant="light" className="rounded-pill py-2 border shadow-sm fw-semibold text-dark bg-white d-flex align-items-center gap-2">
                                <i className="fa-solid fa-filter text-muted"></i> All Status <i className="fa-solid fa-chevron-down text-muted ms-1 fs-7"></i>
                            </Button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-light p-1 rounded-pill d-flex border mb-4" style={{ width: '100%', maxWidth: '400px' }}>
                        <Button 
                            variant={filter === 'upcoming' ? 'primary' : 'link'} 
                            className={`rounded-pill fw-bold border-0 shadow-sm py-2 px-4 ${filter === 'upcoming' ? 'text-white' : 'text-muted text-decoration-none hover-bg-light'}`} 
                            style={{ flex: 1, backgroundColor: filter === 'upcoming' ? 'var(--primary)' : 'transparent' }}
                            onClick={() => setFilter('upcoming')}
                        >
                            Upcoming
                        </Button>
                        <Button 
                            variant={filter === 'completed' ? 'primary' : 'link'} 
                            className={`rounded-pill fw-bold border-0 shadow-sm py-2 px-4 ${filter === 'completed' ? 'text-white' : 'text-muted text-decoration-none hover-bg-light'}`} 
                            style={{ flex: 1, backgroundColor: filter === 'completed' ? 'var(--primary)' : 'transparent' }}
                            onClick={() => setFilter('completed')}
                        >
                            Completed
                        </Button>
                    </div>

                    <div className="table-responsive">
                        <Table hover className="align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                            <thead className="bg-white">
                                <tr>
                                    <th className="border-bottom-0 text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Patient</th>
                                    <th className="border-bottom-0 text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Contact</th>
                                    <th className="border-bottom-0 text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Care Type</th>
                                    <th className="border-bottom-0 text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Status</th>
                                    <th className="border-bottom-0 text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Date & Time</th>
                                    <th className="border-bottom-0 text-muted fw-semibold text-center" style={{ fontSize: '0.85rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.length > 0 ? filteredBookings.map((booking, idx) => (
                                    <tr key={booking._id}>
                                        <td className="border-top-0 py-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-light text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold border" style={{ width: '45px', height: '45px' }}>
                                                    {booking.patientDetails.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="fw-bold text-dark d-block">{booking.patientDetails.name}</span>
                                                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>#{booking._id.substring(0, 8)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="border-top-0 py-3">
                                            <div>
                                                <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}><i className="fa-solid fa-phone me-1"></i> {booking.patientDetails.phone}</span>
                                                <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}><i className="fa-regular fa-envelope me-1"></i> {booking.patientId?.email || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="border-top-0 py-3 fw-medium text-dark">{booking.service}</td>
                                        <td className="border-top-0 py-3">
                                            <Badge bg={booking.status === 'completed' ? 'success' : 'primary'} className="bg-opacity-10 text-dark rounded-pill px-3 py-2 border-0">
                                                {booking.status}
                                            </Badge>
                                        </td>
                                        <td className="border-top-0 py-3 text-muted">
                                            {new Date(booking.date).toLocaleDateString()} at {booking.time}
                                        </td>
                                        <td className="border-top-0 py-3 text-center">
                                            <Button variant="link" className="text-muted p-0 shadow-none"><i className="fa-solid fa-ellipsis"></i></Button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-muted">
                                            No bookings found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>
        </>
    );
};

const Patients = () => {
    return (
        <NurseLayout>
            <PatientsContent />
        </NurseLayout>
    );
};

export default Patients;
