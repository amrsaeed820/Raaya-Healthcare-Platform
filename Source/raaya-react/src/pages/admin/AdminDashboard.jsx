import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Badge, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalPatients: 0,
        activeNurses: 0,
        pendingNurses: 0,
        completedVisits: 0,
        pendingVisits: 0,
        totalRevenue: 0,
        platformEarnings: 0,
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
        } finally {
            setLoading(false);
        }
    };

    const timeAgo = (dateStr) => {
        const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
        if (diff < 60) return `${diff} sec ago`;
        if (diff < 3600) return `${Math.floor(diff/60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff/3600)} hours ago`;
        return `${Math.floor(diff/86400)} days ago`;
    };

    const getActivityIcon = (type, status) => {
        if (type === 'nurse') {
            if (status === 'pending') return <i className="fa-solid fa-user-clock text-warning"></i>;
            if (status === 'active') return <i className="fa-solid fa-user-check text-success"></i>;
            return <i className="fa-solid fa-user-xmark text-danger"></i>;
        } else {
            if (status === 'completed') return <i className="fa-solid fa-calendar-check text-success"></i>;
            if (status === 'cancelled') return <i className="fa-solid fa-calendar-xmark text-danger"></i>;
            return <i className="fa-solid fa-calendar-plus text-primary"></i>;
        }
    };

    if (loading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '70vh' }}>
                <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                <h5 className="mt-3 text-muted">Loading System Overview...</h5>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold text-dark mb-1" style={{ fontSize: '22px' }}>System Overview</h4>
                    <p className="text-muted mb-0" style={{ fontSize: '14px' }}>Welcome back, here's what's happening today.</p>
                </div>
                <Button variant="light" className="border shadow-sm rounded-pill fw-bold" onClick={fetchStats}>
                    <i className="fa-solid fa-rotate-right me-2"></i> Refresh
                </Button>
            </div>

            {/* Top Stat Cards */}
            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden" onClick={() => navigate('/admin/patients')} style={{ cursor: 'pointer' }}>
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '56px', height: '56px', flexShrink: 0 }}>
                                <i className="fa-solid fa-users text-primary fs-4"></i>
                            </div>
                            <div>
                                <p className="text-muted fw-semibold mb-1" style={{ fontSize: '13px', textTransform: 'uppercase' }}>Total Patients</p>
                                <h3 className="fw-bold text-dark mb-0">{stats.totalPatients}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden" onClick={() => navigate('/admin/active-nurses')} style={{ cursor: 'pointer' }}>
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '56px', height: '56px', flexShrink: 0 }}>
                                <i className="fa-solid fa-user-nurse text-success fs-4"></i>
                            </div>
                            <div>
                                <p className="text-muted fw-semibold mb-1" style={{ fontSize: '13px', textTransform: 'uppercase' }}>Active Nurses</p>
                                <h3 className="fw-bold text-dark mb-0">{stats.activeNurses}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden position-relative" onClick={() => navigate('/admin/pending-nurses')} style={{ cursor: 'pointer' }}>
                        {stats.pendingNurses > 0 && (
                            <span className="position-absolute top-0 end-0 mt-3 me-3 flex p-2 bg-danger border border-light rounded-circle"></span>
                        )}
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '56px', height: '56px', flexShrink: 0 }}>
                                <i className="fa-solid fa-file-signature text-warning fs-4"></i>
                            </div>
                            <div>
                                <p className="text-muted fw-semibold mb-1" style={{ fontSize: '13px', textTransform: 'uppercase' }}>Pending Apps</p>
                                <h3 className="fw-bold text-dark mb-0">{stats.pendingNurses}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden" onClick={() => navigate('/admin/bookings')} style={{ cursor: 'pointer' }}>
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '56px', height: '56px', flexShrink: 0 }}>
                                <i className="fa-solid fa-calendar-check text-info fs-4"></i>
                            </div>
                            <div>
                                <p className="text-muted fw-semibold mb-1" style={{ fontSize: '13px', textTransform: 'uppercase' }}>Completed Visits</p>
                                <h3 className="fw-bold text-dark mb-0">{stats.completedVisits}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4">
                {/* Financial & Performance Overview */}
                <Col md={8}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Header className="bg-white border-0 pt-4 pb-0 px-4">
                            <h5 className="fw-bold text-dark mb-0"><i className="fa-solid fa-chart-line text-primary me-2"></i> Financial & Operations</h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Row className="g-4">
                                <Col md={6}>
                                    <div className="bg-light p-4 rounded-4 border text-center h-100 d-flex flex-column justify-content-center">
                                        <div className="text-muted fw-medium mb-2"><i className="fa-solid fa-money-bill-trend-up me-2"></i>Total Transactions (Platform)</div>
                                        <h2 className="fw-bold text-dark mb-1">{stats.totalRevenue} EGP</h2>
                                        <p className="text-12 text-muted mb-0">Total amount paid by all patients</p>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="bg-success bg-opacity-10 p-4 rounded-4 border border-success border-opacity-25 text-center h-100 d-flex flex-column justify-content-center">
                                        <div className="text-success fw-bold mb-2"><i className="fa-solid fa-vault me-2"></i>Raaya Net Profit</div>
                                        <h2 className="fw-bold text-success mb-1">{stats.platformEarnings} EGP</h2>
                                        <p className="text-12 text-success opacity-75 mb-0">Platform's 10% commission slice</p>
                                    </div>
                                </Col>
                                <Col md={12}>
                                    <h6 className="fw-bold text-dark mb-3 mt-2">Visits Progress</h6>
                                    {stats.completedVisits === 0 && stats.pendingVisits === 0 ? (
                                        <div className="text-center py-4 bg-light rounded text-muted">No visits recorded yet.</div>
                                    ) : (
                                        <div>
                                            <div className="d-flex justify-content-between mb-2 text-14 fw-medium">
                                                <span className="text-success"><i className="fa-solid fa-circle-check me-1"></i> Completed: {stats.completedVisits}</span>
                                                <span className="text-warning text-dark"><i className="fa-solid fa-circle-notch me-1"></i> Pending/Active: {stats.pendingVisits}</span>
                                            </div>
                                            <div className="progress" style={{ height: '24px', borderRadius: '12px' }}>
                                                <div 
                                                    className="progress-bar bg-success" 
                                                    style={{ width: `${(stats.completedVisits / (stats.completedVisits + stats.pendingVisits)) * 100}%` }}
                                                >
                                                    {Math.round((stats.completedVisits / (stats.completedVisits + stats.pendingVisits)) * 100)}%
                                                </div>
                                                <div 
                                                    className="progress-bar bg-warning text-dark fw-bold" 
                                                    style={{ width: `${(stats.pendingVisits / (stats.completedVisits + stats.pendingVisits)) * 100}%` }}
                                                >
                                                    {Math.round((stats.pendingVisits / (stats.completedVisits + stats.pendingVisits)) * 100)}%
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Recent Activity Feed */}
                <Col md={4}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Header className="bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold text-dark mb-0"><i className="fa-solid fa-bell text-warning me-2"></i> Recent Activity</h5>
                        </Card.Header>
                        <Card.Body className="p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {stats.recentActivity && stats.recentActivity.length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {stats.recentActivity.map((act, index) => (
                                        <li key={index} className="list-group-item border-bottom-0 py-3 px-4 d-flex gap-3 align-items-start">
                                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mt-1" style={{ width: '36px', height: '36px', flexShrink: 0 }}>
                                                {getActivityIcon(act.type, act.status)}
                                            </div>
                                            <div>
                                                <p className="mb-1 text-dark fw-medium text-14" style={{ lineHeight: '1.3' }}>{act.title}</p>
                                                <span className="text-muted text-12"><i className="fa-regular fa-clock me-1"></i> {timeAgo(act.time)}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-5 text-muted">
                                    <i className="fa-regular fa-bell-slash fs-1 opacity-50 mb-3"></i>
                                    <p className="mb-0 mt-2">No recent activities.</p>
                                </div>
                            )}
                        </Card.Body>
                        <Card.Footer className="bg-white border-top-0 pt-0 pb-4 px-4 text-center">
                            <Button variant="light" className="w-100 text-primary fw-bold rounded-pill shadow-sm" onClick={() => fetchStats()}>
                                <i className="fa-solid fa-arrows-rotate me-2"></i> Refresh Feed
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

        </motion.div>
    );
};

export default AdminDashboard;
