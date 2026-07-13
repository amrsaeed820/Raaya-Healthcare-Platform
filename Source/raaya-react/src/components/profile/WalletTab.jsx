import React, { useState } from 'react';
import { Card, Button, Row, Col, Modal, Form, InputGroup, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';

// Mock Data
const walletData = {
    balance: 1250.00,
    cards: [
        { id: 1, type: 'visa', last4: '4242', expiry: '12/28' },
        { id: 2, type: 'mastercard', last4: '5555', expiry: '08/27' }
    ],
    transactions: [
        { id: 'TXN-001', date: '2026-05-28T14:30:00', type: 'topup', description: 'Wallet Top-up via Visa ending in 4242', amount: 1000 },
        { id: 'TXN-002', date: '2026-05-25T09:15:00', type: 'payment', description: 'Payment for Visit #BKG-88392', amount: -450 },
        { id: 'TXN-003', date: '2026-05-20T11:00:00', type: 'payment', description: 'Payment for Visit #BKG-88210', amount: -300 },
        { id: 'TXN-004', date: '2026-05-10T16:45:00', type: 'topup', description: 'Wallet Top-up via Mastercard ending in 5555', amount: 1000 }
    ]
};

export default function WalletTab() {
    const [showTopupModal, setShowTopupModal] = useState(false);
    const [topupAmount, setTopupAmount] = useState('');
    const [selectedCardId, setSelectedCardId] = useState(walletData.cards[0]?.id || null);
    const [isProcessing, setIsProcessing] = useState(false);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const handleTopupSubmit = (e) => {
        e.preventDefault();
        setIsProcessing(true);
        // Mock API Call
        setTimeout(() => {
            setIsProcessing(false);
            setShowTopupModal(false);
            setTopupAmount('');
        }, 1500);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -15 }}
            className="w-100"
        >
            <div className="mb-4">
                <h4 className="fw-bold text-dark mb-1">My Wallet</h4>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Manage your balance, payment methods, and billing history securely.</p>
            </div>

            {/* Balance Banner */}
            <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden position-relative" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                {/* Decorative Background Elements */}
                <div className="position-absolute rounded-circle" style={{ width: '200px', height: '200px', background: 'rgba(255,255,255,0.05)', top: '-50px', right: '-50px' }}></div>
                <div className="position-absolute rounded-circle" style={{ width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', bottom: '-80px', right: '100px' }}></div>
                
                <Card.Body className="p-4 p-md-5 d-flex flex-column flex-md-row justify-content-between align-items-md-center position-relative z-1">
                    <div>
                        <p className="text-white-50 fw-medium mb-1" style={{ fontSize: '0.95rem', letterSpacing: '0.5px' }}>Current Balance</p>
                        <h1 className="fw-bold mb-0" style={{ fontSize: '3rem', letterSpacing: '-1px' }}>
                            {walletData.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span style={{ fontSize: '1.2rem', fontWeight: 'normal' }}>EGP</span>
                        </h1>
                    </div>
                    <div className="mt-4 mt-md-0">
                        <Button 
                            variant="light" 
                            className="rounded-pill fw-bold px-4 py-3 shadow-sm d-flex align-items-center gap-2 text-primary hover-lift"
                            style={{ fontSize: '1.05rem', transition: 'all 0.3s' }}
                            onClick={() => setShowTopupModal(true)}
                        >
                            <i className="fa-solid fa-plus-circle"></i> Add Funds
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            <Row className="g-4 mb-4">
                {/* Payment Methods */}
                <Col lg={12}>
                    <h5 className="fw-bold text-dark mb-3">Payment Methods</h5>
                    <div className="d-flex flex-wrap gap-3">
                        {walletData.cards.map((card) => (
                            <Card key={card.id} className="border-0 shadow-sm rounded-4 payment-card" style={{ width: '260px', border: '1px solid #eef2f5' }}>
                                <Card.Body className="p-3 d-flex flex-column justify-content-between position-relative overflow-hidden">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <i className={`fa-brands fa-cc-${card.type} fs-1`} style={{ color: card.type === 'visa' ? '#1434CB' : '#EB001B' }}></i>
                                        <Button variant="link" className="text-muted p-0 text-decoration-none hover-danger">
                                            <i className="fa-solid fa-trash-can"></i>
                                        </Button>
                                    </div>
                                    <div>
                                        <p className="fw-bold text-dark mb-1" style={{ letterSpacing: '2px' }}>**** **** **** {card.last4}</p>
                                        <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>Expires {card.expiry}</p>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))}

                        {/* Add New Card Button */}
                        <div 
                            className="rounded-4 d-flex flex-column align-items-center justify-content-center cursor-pointer transition-all hover-primary-dashed"
                            style={{ 
                                width: '260px', minHeight: '115px', 
                                border: '2px dashed #cbd5e1', backgroundColor: '#f8fafc',
                                color: '#64748b'
                            }}
                        >
                            <i className="fa-solid fa-plus fs-4 mb-2"></i>
                            <span className="fw-bold" style={{ fontSize: '0.9rem' }}>Add New Card</span>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Transaction History */}
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden" style={{ border: '1px solid #eef2f5' }}>
                <Card.Header className="bg-white border-bottom p-4">
                    <h5 className="fw-bold text-dark mb-0">Transaction History</h5>
                </Card.Header>
                <div className="table-responsive">
                    <table className="table table-hover mb-0 premium-table text-nowrap">
                        <thead className="bg-light">
                            <tr>
                                <th className="py-3 px-4 text-muted" style={{ fontSize: '0.8rem', fontWeight: '600' }}>DATE & TIME</th>
                                <th className="py-3 px-4 text-muted" style={{ fontSize: '0.8rem', fontWeight: '600' }}>DESCRIPTION</th>
                                <th className="py-3 px-4 text-muted text-end" style={{ fontSize: '0.8rem', fontWeight: '600' }}>AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {walletData.transactions.map((txn, idx) => (
                                <tr key={idx}>
                                    <td className="py-3 px-4 align-middle">
                                        <span className="fw-medium text-dark">{formatDate(txn.date)}</span>
                                    </td>
                                    <td className="py-3 px-4 align-middle">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: txn.type === 'topup' ? '#d1fae5' : '#fee2e2', color: txn.type === 'topup' ? '#10b981' : '#ef4444' }}>
                                                <i className={`fa-solid ${txn.type === 'topup' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                                            </div>
                                            <div>
                                                <p className="fw-bold text-dark mb-0" style={{ fontSize: '0.95rem' }}>{txn.description}</p>
                                                <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>{txn.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 align-middle text-end">
                                        <span className={`fw-bold fs-5 ${txn.amount > 0 ? 'text-success' : 'text-danger'}`}>
                                            {txn.amount > 0 ? '+' : '-'} {Math.abs(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} EGP
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Top-up Modal */}
            <Modal show={showTopupModal} onHide={() => setShowTopupModal(false)} centered backdrop="static" contentClassName="border-0 rounded-4 shadow-lg overflow-hidden">
                <div className="p-4 p-md-5 position-relative">
                    <button onClick={() => setShowTopupModal(false)} className="btn btn-link text-muted position-absolute" style={{ top: '15px', right: '15px', textDecoration: 'none' }}>
                        <i className="fa-solid fa-xmark fs-5"></i>
                    </button>
                    
                    <div className="text-center mb-4">
                        <div className="mx-auto bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '70px', height: '70px' }}>
                            <i className="fa-solid fa-wallet fs-2"></i>
                        </div>
                        <h4 className="fw-bold text-dark mb-1">Add Funds to Wallet</h4>
                        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Securely top-up your balance for future bookings.</p>
                    </div>

                    <Form onSubmit={handleTopupSubmit}>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>Amount (EGP)</Form.Label>
                            <InputGroup className="bg-light rounded-3 overflow-hidden shadow-sm border" style={{ borderColor: '#e2e8f0' }}>
                                <Form.Control 
                                    type="number" 
                                    placeholder="e.g., 500" 
                                    className="border-0 shadow-none py-3 px-3 fs-5 fw-bold"
                                    value={topupAmount}
                                    onChange={(e) => setTopupAmount(e.target.value)}
                                    required
                                    min="50"
                                />
                                <InputGroup.Text className="bg-transparent border-0 fw-bold text-muted pe-3">EGP</InputGroup.Text>
                            </InputGroup>
                            <div className="d-flex gap-2 mt-2">
                                {[200, 500, 1000].map(amt => (
                                    <Badge 
                                        key={amt} 
                                        bg="white" 
                                        text="dark" 
                                        className="border cursor-pointer px-3 py-2 hover-bg-light transition-all" 
                                        style={{ borderColor: '#cbd5e1' }}
                                        onClick={() => setTopupAmount(amt)}
                                    >
                                        + {amt}
                                    </Badge>
                                ))}
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>Select Payment Method</Form.Label>
                            <div className="d-flex flex-column gap-2">
                                {walletData.cards.map(card => (
                                    <div 
                                        key={card.id} 
                                        className={`p-3 rounded-3 border d-flex justify-content-between align-items-center cursor-pointer transition-all ${selectedCardId === card.id ? 'border-primary bg-primary bg-opacity-10' : 'border-light bg-white hover-bg-light'}`}
                                        onClick={() => setSelectedCardId(card.id)}
                                        style={{ borderColor: selectedCardId === card.id ? 'var(--primary)' : '#e2e8f0' }}
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            <i className={`fa-brands fa-cc-${card.type} fs-3`} style={{ color: card.type === 'visa' ? '#1434CB' : '#EB001B' }}></i>
                                            <div>
                                                <p className="fw-bold text-dark mb-0" style={{ fontSize: '0.95rem' }}>{card.type === 'visa' ? 'Visa' : 'Mastercard'} ending in {card.last4}</p>
                                                <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>Expires {card.expiry}</p>
                                            </div>
                                        </div>
                                        <div className="rounded-circle border d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px', borderColor: selectedCardId === card.id ? 'var(--primary)' : '#cbd5e1', backgroundColor: selectedCardId === card.id ? 'var(--primary)' : 'transparent' }}>
                                            {selectedCardId === card.id && <div className="rounded-circle bg-white" style={{ width: '8px', height: '8px' }}></div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Form.Group>

                        <Button 
                            variant="primary" 
                            type="submit"
                            className="w-100 rounded-pill fw-bold py-3 shadow-sm border-0"
                            disabled={!topupAmount || topupAmount < 50 || isProcessing}
                            style={{ fontSize: '1.05rem', transition: 'all 0.3s' }}
                        >
                            {isProcessing ? <><i className="fa-solid fa-spinner fa-spin me-2"></i> Processing...</> : `Confirm Payment`}
                        </Button>
                    </Form>
                </div>
            </Modal>

            <style>{`
                .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
                .hover-danger:hover { color: #dc3545 !important; }
                .hover-primary-dashed:hover { border-color: var(--primary) !important; color: var(--primary) !important; background-color: var(--primary-light) !important; }
                .hover-bg-light:hover { background-color: #f8fafc !important; }
                .cursor-pointer { cursor: pointer; }
                .transition-all { transition: all 0.2s ease-in-out; }
                
                /* Override table styles inside WalletTab to match the required look */
                .premium-table th { border-bottom: 1px solid #eef2f5; text-transform: uppercase; letter-spacing: 0.5px; }
                .premium-table td { border-bottom: 1px solid #eef2f5; }
                .premium-table tbody tr:last-child td { border-bottom: none; }
                .premium-table tbody tr:hover { background-color: #f8fafc; }
            `}</style>
        </motion.div>
    );
}
