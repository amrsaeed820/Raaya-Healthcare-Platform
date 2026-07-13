import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Row, Col, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from 'axios';

const Financials = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        platformCommission: 0,
        nursesEarnings: 0,
        completedBookings: 0
    });

    useEffect(() => {
        fetchFinancials();
    }, []);

    const fetchFinancials = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/bookings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const completed = res.data.filter(b => b.status === 'completed');
            
            let total = 0;
            let platform = 0;
            let nurses = 0;

            completed.forEach(b => {
                const cost = b.totalCost || 0;
                const commission = b.platformCommissionDeducted || (cost * 0.1);
                total += cost;
                platform += commission;
                nurses += (cost - commission);
            });

            setStats({
                totalRevenue: total,
                platformCommission: platform,
                nursesEarnings: nurses,
                completedBookings: completed.length
            });

            setBookings(res.data.filter(b => b.status === 'completed' || b.status === 'in-progress' || b.status === 'upcoming').sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            console.error("Failed to fetch financials:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold text-dark mb-1" style={{ fontSize: '22px' }}>Platform Financials</h4>
                    <p className="text-muted mb-0" style={{ fontSize: '14px' }}>Overview of all revenues, commissions, and nurse payouts.</p>
                </div>
                <Button variant="success" className="border-0 shadow-sm rounded-pill fw-bold px-4" onClick={() => alert("Withdrawals are currently disabled.")}>
                    <i className="fa-solid fa-building-columns me-2"></i> Withdraw Funds
                </Button>
            </div>

            {loading ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                    <Spinner animation="border" variant="success" />
                </div>
            ) : (
                <>
                    <Row className="g-4 mb-4">
                        <Col md={3}>
                            <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden bg-white">
                                <Card.Body className="p-4 text-center">
                                    <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '56px', height: '56px' }}>
                                        <i className="fa-solid fa-sack-dollar text-primary fs-4"></i>
                                    </div>
                                    <p className="text-muted fw-semibold mb-1" style={{ fontSize: '13px', textTransform: 'uppercase' }}>Gross Revenue</p>
                                    <h3 className="fw-bold text-dark mb-0">{stats.totalRevenue} <span className="fs-6 text-muted fw-normal">EGP</span></h3>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ backgroundColor: '#f0fdf4' }}>
                                <Card.Body className="p-4 text-center">
                                    <div className="bg-success bg-opacity-25 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '56px', height: '56px' }}>
                                        <i className="fa-solid fa-vault text-success fs-4"></i>
                                    </div>
                                    <p className="text-success fw-semibold mb-1" style={{ fontSize: '13px', textTransform: 'uppercase' }}>Raaya Net Profit</p>
                                    <h3 className="fw-bold text-success mb-0">{stats.platformCommission} <span className="fs-6 opacity-75 fw-normal">EGP</span></h3>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden bg-white">
                                <Card.Body className="p-4 text-center">
                                    <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '56px', height: '56px' }}>
                                        <i className="fa-solid fa-hand-holding-dollar text-warning fs-4"></i>
                                    </div>
                                    <p className="text-muted fw-semibold mb-1" style={{ fontSize: '13px', textTransform: 'uppercase' }}>Paid to Nurses</p>
                                    <h3 className="fw-bold text-dark mb-0">{stats.nursesEarnings} <span className="fs-6 text-muted fw-normal">EGP</span></h3>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden bg-white">
                                <Card.Body className="p-4 text-center">
                                    <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '56px', height: '56px' }}>
                                        <i className="fa-solid fa-file-invoice-dollar text-info fs-4"></i>
                                    </div>
                                    <p className="text-muted fw-semibold mb-1" style={{ fontSize: '13px', textTransform: 'uppercase' }}>Billed Visits</p>
                                    <h3 className="fw-bold text-dark mb-0">{stats.completedBookings}</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                        <Card.Header className="bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold text-dark mb-0"><i className="fa-solid fa-money-bill-transfer text-primary me-2"></i> Financial Transactions</h5>
                        </Card.Header>
                        <div className="table-responsive">
                            <Table hover className="mb-0 align-middle">
                                <thead className="bg-light text-muted" style={{ fontSize: '13px', textTransform: 'uppercase' }}>
                                    <tr>
                                        <th className="py-3 px-4 fw-semibold">Ref ID</th>
                                        <th className="py-3 px-4 fw-semibold">Date</th>
                                        <th className="py-3 px-4 fw-semibold">Amount (Gross)</th>
                                        <th className="py-3 px-4 fw-semibold">Platform Fee</th>
                                        <th className="py-3 px-4 fw-semibold">Nurse Share</th>
                                        <th className="py-3 px-4 fw-semibold text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(b => {
                                        const gross = b.totalCost || 0;
                                        const fee = b.platformCommissionDeducted || (gross * 0.1);
                                        const share = gross - fee;
                                        
                                        return (
                                            <tr key={b._id}>
                                                <td className="py-3 px-4 fw-bold text-primary" style={{ fontSize: '13px' }}>{b.bookingId || b._id.substring(0,8).toUpperCase()}</td>
                                                <td className="py-3 px-4 text-muted" style={{ fontSize: '14px' }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                                                <td className="py-3 px-4 fw-bold text-dark" style={{ fontSize: '15px' }}>{gross} EGP</td>
                                                <td className="py-3 px-4 fw-bold text-success" style={{ fontSize: '15px' }}>+{fee} EGP</td>
                                                <td className="py-3 px-4 fw-medium text-muted" style={{ fontSize: '14px' }}>{share} EGP</td>
                                                <td className="py-3 px-4 text-center">
                                                    {b.status === 'completed' ? (
                                                        <Badge bg="success" className="bg-opacity-10 text-success border border-success rounded-pill px-3 py-1 fw-medium"><i className="fa-solid fa-check me-1"></i> Settled</Badge>
                                                    ) : (
                                                        <Badge bg="warning" className="bg-opacity-10 text-warning border border-warning rounded-pill px-3 py-1 fw-medium text-dark"><i className="fa-solid fa-hourglass-half me-1"></i> Pending</Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {bookings.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5 text-muted">
                                                <i className="fa-solid fa-receipt fs-1 opacity-25 mb-3"></i>
                                                <p className="mb-0">No financial transactions found.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card>
                </>
            )}

        </motion.div>
    );
};

export default Financials;
