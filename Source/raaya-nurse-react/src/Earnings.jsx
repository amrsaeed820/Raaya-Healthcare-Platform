import React from 'react';
import { Row, Col, Card, Button, Table } from 'react-bootstrap';
import NurseLayout from './components/layout/NurseLayout';
import './Dashboard.css';

const EarningsContent = () => {
    return (
        <>
            <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                <Card.Body className="p-4 p-md-5">
                    <div className="d-flex align-items-center gap-2 mb-1">
                        <i className="fa-solid fa-chart-line text-primary"></i>
                        <h4 className="fw-bold text-dark mb-0">Earnings Dashboard</h4>
                    </div>
                    <p className="text-muted mb-5" style={{ fontSize: '0.9rem' }}>Comprehensive insights for October 2025</p>

                    <div className="mb-5">
                        <p className="text-muted fw-medium mb-1" style={{ fontSize: '0.9rem' }}>Total Earnings</p>
                        <h1 className="fw-bold text-primary mb-0" style={{ fontSize: '2.5rem' }}>10000 <span className="fs-5 text-dark fw-bold">EGB</span></h1>
                    </div>

                    <Row className="g-4">
                        <Col md={4}>
                            <p className="text-muted fw-medium mb-1" style={{ fontSize: '0.9rem' }}>Total Balance</p>
                            <h2 className="fw-bold text-success mb-2">5500 <span className="fs-6 text-success fw-bold">EGP</span></h2>
                        </Col>
                        <Col md={4}>
                            <p className="text-muted fw-medium mb-1" style={{ fontSize: '0.9rem' }}>Pending Earnings</p>
                            <h2 className="fw-bold text-primary mb-2">2000 <span className="fs-6 text-dark fw-bold">EGP</span></h2>
                            <div className="bg-light rounded-pill w-100" style={{ height: '8px' }}>
                                <div className="bg-primary rounded-pill" style={{ width: '40%', height: '100%' }}></div>
                            </div>
                        </Col>
                        <Col md={4}>
                            <p className="text-muted fw-medium mb-1" style={{ fontSize: '0.9rem' }}>In Progress Earnings</p>
                            <h2 className="fw-bold text-info mb-2">3500 <span className="fs-6 text-info fw-bold">EGP</span></h2>
                            <div className="bg-light rounded-pill w-100" style={{ height: '8px' }}>
                                <div className="bg-info rounded-pill" style={{ width: '70%', height: '100%' }}></div>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Tabs */}
            <div className="bg-light p-1 rounded-pill d-flex border mb-4 d-inline-flex" style={{ overflowX: 'auto', maxWidth: '100%' }}>
                <Button variant="primary" className="rounded-pill fw-bold border-0 shadow-sm py-2 px-4 text-nowrap" style={{ backgroundColor: 'var(--primary)' }}>
                    In Progress Transaction
                </Button>
                <Button variant="link" className="rounded-pill fw-medium text-muted text-decoration-none py-2 px-4 hover-bg-light text-nowrap">
                    Pending Transaction
                </Button>
                <Button variant="link" className="rounded-pill fw-medium text-muted text-decoration-none py-2 px-4 hover-bg-light text-nowrap">
                    Transaction Completed
                </Button>
            </div>

            <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                <Card.Body className="p-4">
                    <h5 className="fw-bold text-dark mb-4">Patient Records</h5>
                    <div className="table-responsive">
                        <Table hover className="align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 15px' }}>
                            <thead className="bg-white">
                                <tr>
                                    <th className="border-bottom-0 text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Patient</th>
                                    <th className="border-bottom-0 text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Services</th>
                                    <th className="border-bottom-0 text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Amount</th>
                                    <th className="border-bottom-0 text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Transfer At</th>
                                    <th className="border-bottom-0 text-muted fw-semibold text-end" style={{ fontSize: '0.85rem' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { name: 'Ateeq Rafiq', service: 'Elderly Care', amount: '1500 EGP', date: '10 May 2026', initials: 'AT', color: 'primary' },
                                    { name: 'Sara Ahmed', service: 'Elderly Care', amount: '1200 EGP', date: '22 Jun 2025', initials: 'BT', color: 'primary' },
                                    { name: 'Omar Hassan', service: 'Elderly Care', amount: '2000 EGP', date: '15 Jul 2026', initials: 'CT', color: 'info' },
                                    { name: 'Laila Nasser', service: 'Elderly Care', amount: '1800 EGP', date: '01 Sep 2025', initials: 'DT', color: 'primary' }
                                ].map((record, idx) => (
                                    <tr key={idx}>
                                        <td className="border-top-0 py-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className={`bg-${record.color} bg-opacity-10 text-${record.color} rounded-circle d-flex align-items-center justify-content-center fw-bold`} style={{ width: '40px', height: '40px' }}>
                                                    {record.initials}
                                                </div>
                                                <span className="fw-bold text-dark">{record.name}</span>
                                            </div>
                                        </td>
                                        <td className="border-top-0 py-3 text-muted">{record.service}</td>
                                        <td className="border-top-0 py-3 text-muted">{record.amount}</td>
                                        <td className="border-top-0 py-3 text-muted">{record.date}</td>
                                        <td className="border-top-0 py-3 text-end">
                                            <Button variant="link" className="text-muted fw-medium text-decoration-none px-0 hover-primary">Withdraw</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>
        </>
    );
};

import ErrorBoundary from './components/common/ErrorBoundary';

const Earnings = () => {
    return (
        <NurseLayout>
            <ErrorBoundary>
                <EarningsContent />
            </ErrorBoundary>
        </NurseLayout>
    );
};

export default Earnings;
