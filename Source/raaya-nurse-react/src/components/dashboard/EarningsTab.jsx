import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import axios from 'axios';

const EarningsTab = ({ showToast }) => {
    const { t, lang } = useTranslation();
    const [activeFilter, setActiveFilter] = useState('Transaction Completed');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const locale = lang === 'ar' ? 'ar-EG' : 'en-US';

    useEffect(() => {
        const fetchEarningsData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await axios.get('http://localhost:5000/api/bookings/nurse', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Sort by date descending
                const sorted = res.data.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
                setBookings(sorted);
            } catch (err) {
                console.error("Failed to fetch earnings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEarningsData();
    }, []);

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

    const calculateNetEarnings = (booking) => {
        if (!booking.totalCost) return 0;
        return booking.totalCost - (booking.platformCommissionDeducted || (booking.totalCost * 0.1));
    };

    const completedBookings = bookings.filter(b => b.status === 'completed');
    const pendingBookings = bookings.filter(b => (b.status === 'upcoming' || b.status === 'confirmed' || b.status === 'Accepted') && !isBookingMissed(b));
    const inProgressBookings = bookings.filter(b => b.status === 'in-progress' && !isBookingMissed(b));

    const totalEarnings = completedBookings.reduce((sum, b) => sum + calculateNetEarnings(b), 0);
    const pendingEarnings = pendingBookings.reduce((sum, b) => sum + calculateNetEarnings(b), 0);
    const inProgressEarnings = inProgressBookings.reduce((sum, b) => sum + calculateNetEarnings(b), 0);

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

    const handleWithdraw = () => {
        showToast(t('Withdrawal feature is coming soon!'), t('This feature will be available in upcoming updates.'), 'info');
    };

    const getFilteredTransactions = () => {
        if (activeFilter === 'Transaction Completed') return completedBookings;
        if (activeFilter === 'Pending Transaction') return pendingBookings;
        if (activeFilter === 'In Progress Transaction') return inProgressBookings;
        return bookings;
    };

    const filteredTransactions = getFilteredTransactions();

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            
            {/* Header / Summary Card */}
            <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden bg-body-tertiary">
                <Card.Body className="p-4 p-md-5 position-relative">
                    <div className="position-absolute" style={{ top: '-30px', right: lang === 'ar' ? 'auto' : '-30px', left: lang === 'ar' ? '-30px' : 'auto', opacity: 0.03 }}>
                        <i className="fa-solid fa-wallet text-primary" style={{ fontSize: '250px' }}></i>
                    </div>
                    
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-5 position-relative z-1 gap-3">
                        <div>
                            <div className="d-flex align-items-center gap-3 mb-2">
                                <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center">
                                    <i className="fa-solid fa-sack-dollar text-primary text-24"></i>
                                </div>
                                <div>
                                    <h1 className="fw-bold mb-0 text-24 text-body">{t('Earnings Dashboard')}</h1>
                                    <p className="text-muted mb-0 text-14">{t('Comprehensive insights for')} {new Date().toLocaleString(locale, { month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>
                        <Button variant="primary" className="fw-bold rounded-pill px-4 py-2 shadow-sm d-flex align-items-center gap-2 hover-lift" onClick={handleWithdraw}>
                            <i className="fa-solid fa-building-columns"></i>
                            <span>{t('Withdraw Funds')}</span>
                        </Button>
                    </div>

                    <Row className="g-4 position-relative z-1">
                        {/* Total Balance */}
                        <Col md={4}>
                            <Card className="border border-primary border-2 shadow-sm h-100 rounded-4 bg-body hover-lift transition-all">
                                <Card.Body className="p-4 text-center">
                                    <p className="text-primary fw-bold mb-2 text-13 text-uppercase" style={{ letterSpacing: '0.5px' }}>
                                        <i className="fa-solid fa-wallet me-2"></i>{t('TOTAL BALANCE')}
                                    </p>
                                    <h2 className="fw-bold text-primary mb-0" style={{ fontSize: '2.5rem', letterSpacing: '-1px' }}>
                                        {totalEarnings.toLocaleString()} <span className="text-16 fw-bold">{t('EGP')}</span>
                                    </h2>
                                    <p className="text-muted text-12 mt-2 mb-0 fw-medium">{t('Available to withdraw')}</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        
                        {/* Pending Earnings */}
                        <Col md={4}>
                            <Card className="border shadow-sm h-100 rounded-4 hover-lift transition-all bg-body">
                                <Card.Body className="p-4 text-center">
                                    <p className="text-muted fw-bold mb-2 text-13 text-uppercase" style={{ letterSpacing: '0.5px' }}>
                                        <i className="fa-regular fa-clock text-warning me-2"></i>{t('PENDING EARNINGS')}
                                    </p>
                                    <h3 className="fw-bold text-body mb-0 text-24">
                                        {pendingEarnings.toLocaleString()} <span className="text-14 fw-bold text-muted">{t('EGP')}</span>
                                    </h3>
                                    <p className="text-muted text-12 mt-2 mb-0 fw-medium"><span>{pendingBookings.length}</span> {t('Upcoming Visits')}</p>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* In Progress Earnings */}
                        <Col md={4}>
                            <Card className="border shadow-sm h-100 rounded-4 hover-lift transition-all bg-body">
                                <Card.Body className="p-4 text-center">
                                    <p className="text-muted fw-bold mb-2 text-13 text-uppercase" style={{ letterSpacing: '0.5px' }}>
                                        <i className="fa-solid fa-spinner text-info me-2"></i>{t('IN PROGRESS EARNINGS')}
                                    </p>
                                    <h3 className="fw-bold text-body mb-0 text-24">
                                        {inProgressEarnings.toLocaleString()} <span className="text-14 fw-bold text-muted">{t('EGP')}</span>
                                    </h3>
                                    <p className="text-muted text-12 mt-2 mb-0 fw-medium"><span>{inProgressBookings.length}</span> {t('Active Visits')}</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Filter Tabs */}
            <div className="d-flex flex-wrap gap-2 mb-4 bg-body-tertiary p-2 rounded-pill d-inline-flex border">
                {['Transaction Completed', 'Pending Transaction', 'In Progress Transaction'].map(filter => {
                    const count = filter === 'Transaction Completed' ? completedBookings.length : filter === 'Pending Transaction' ? pendingBookings.length : inProgressBookings.length;
                    return (
                        <Button 
                            key={filter}
                            variant={activeFilter === filter ? 'white' : 'transparent'}
                            className={`rounded-pill px-4 py-2 fw-bold text-14 transition-all d-flex align-items-center gap-2 ${activeFilter === filter ? 'shadow-sm text-primary bg-body' : 'text-muted'}`}
                            onClick={() => setActiveFilter(filter)}
                            style={{ border: 'none' }}
                        >
                            <span>{t(filter)}</span>
                            <Badge bg={activeFilter === filter ? 'primary' : 'secondary'} className="rounded-pill bg-opacity-10 text-body">
                                {count}
                            </Badge>
                        </Button>
                    );
                })}
            </div>

            {/* Transactions Table */}
            <Card className="border shadow-sm rounded-4 overflow-hidden">
                <Card.Header className="bg-transparent border-bottom p-4">
                    <h2 className="fw-bold text-body mb-0 text-18"><i className="fa-solid fa-file-invoice-dollar text-primary me-2"></i> {t('Transaction Records')}</h2>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="modern-table text-nowrap mb-0 align-middle">
                            <thead className="bg-body-tertiary">
                                <tr>
                                    <th className="py-3 px-4 border-0 text-muted fw-bold text-12">{t('PATIENT')}</th>
                                    <th className="py-3 border-0 text-muted fw-bold text-12">{t('SERVICES')}</th>
                                    <th className="py-3 border-0 text-muted fw-bold text-12">{t('AMOUNT')}</th>
                                    <th className="py-3 border-0 text-muted fw-bold text-12">{t('TRANSFER AT')}</th>
                                    <th className="py-3 px-4 border-0 text-end text-muted fw-bold text-12">{t('STATUS')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5">
                                                <i className="fa-solid fa-spinner fa-spin text-primary fs-2"></i>
                                            </td>
                                        </tr>
                                    ) : filteredTransactions.length > 0 ? (
                                        filteredTransactions.map((booking, idx) => {
                                            const netAmount = calculateNetEarnings(booking);
                                            const initial = booking.patientDetails?.name?.charAt(0) || 'P';
                                            let color = 'primary';
                                            if (booking.status === 'completed') color = 'success';
                                            if (booking.status === 'in-progress') color = 'warning';

                                            return (
                                                <motion.tr 
                                                    key={booking._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className={`bg-${color} bg-opacity-10 text-${color} rounded-circle d-flex align-items-center justify-content-center fw-bold text-15`} style={{ width: '40px', height: '40px' }}>
                                                                {initial}
                                                            </div>
                                                            <span className="fw-bold text-body text-14">{booking.patientDetails?.name || t('Unknown Patient')}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3">
                                                        <span className="bg-body-secondary px-3 py-1 rounded-pill text-12 fw-medium text-body">
                                                            {t(booking.service)}
                                                        </span>
                                                    </td>
                                                    <td className="py-3">
                                                        <span className={`fw-bold text-${color} text-14`}>
                                                            {netAmount.toLocaleString()} {t('EGP')}
                                                        </span>
                                                    </td>
                                                    <td className="py-3">
                                                        <span className="text-muted fw-medium text-13">
                                                            <i className="fa-regular fa-calendar me-2 opacity-50"></i>
                                                            {parseBookingDate(booking.date).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-end">
                                                        {booking.status === 'completed' && <Badge bg="success" className="bg-opacity-10 text-success border-0 px-3 py-2 rounded-pill"><i className="fa-solid fa-check-circle me-1"></i> {t('Completed')}</Badge>}
                                                        {booking.status === 'in-progress' && <Badge bg="warning" className="bg-opacity-10 text-dark border-0 px-3 py-2 rounded-pill"><i className="fa-solid fa-spinner fa-spin me-1"></i> {t('In Progress')}</Badge>}
                                                        {(booking.status === 'upcoming' || booking.status === 'confirmed') && <Badge bg="primary" className="bg-opacity-10 text-primary border-0 px-3 py-2 rounded-pill"><i className="fa-regular fa-clock me-1"></i> {t('Pending')}</Badge>}
                                                    </td>
                                                </motion.tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5">
                                                <div className="bg-body-secondary rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                                                    <i className="fa-solid fa-file-invoice-dollar text-muted fs-3"></i>
                                                </div>
                                                <h6 className="fw-bold text-body">{t('No transactions found')}</h6>
                                                <p className="text-muted text-13 mb-0">{t('There are no records for the selected filter.')}</p>
                                            </td>
                                        </tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            <style>{`
                .hover-lift { transition: all 0.3s ease; }
                .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.08) !important; }
            `}</style>
        </motion.div>
    );
};

export default EarningsTab;
