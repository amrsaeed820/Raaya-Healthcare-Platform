import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, InputGroup, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from 'axios';

const SystemSettings = () => {
    const [settings, setSettings] = useState({
        servicesPricing: {
            'Elderly Care': 0,
            'Post-operative Care': 0,
            'Chronic Care': 0,
            'Basic Care': 0,
            'Wound & Skin Care': 0,
            'Escort Services & Responsibilities': 0
        },
        platformCommission: 10
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/settings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSettings({
                servicesPricing: res.data.servicesPricing || {},
                platformCommission: res.data.platformCommission || 10
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
            triggerToast('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);



    const triggerToast = (msg) => {
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/settings', settings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            triggerToast('System settings updated successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            triggerToast('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handlePricingChange = (e) => {
        const { name, value } = e.target;
        setSettings({
            ...settings,
            servicesPricing: {
                ...settings.servicesPricing,
                [name]: Number(value)
            }
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings({ ...settings, [name]: Number(value) });
    };

    if (loading) {
        return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
    }

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

            <h4 className="fw-bold text-dark mb-4" style={{ fontSize: '20px' }}>System Settings</h4>

            <Form onSubmit={handleSave}>
                <Row className="g-4 mb-4">
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                            <Card.Body className="p-4">
                                <h5 className="fw-bold text-dark mb-4" style={{ fontSize: '18px' }}>
                                    <i className="fa-solid fa-tags me-2 text-primary"></i> Services Pricing
                                </h5>

                                <div className="mb-4">
                                    <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '15px' }}>Fixed Price Services (Per Visit)</h6>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="text-muted fw-medium" style={{ fontSize: '14px' }}>Wound & Skin Care</Form.Label>
                                                <InputGroup>
                                                    <Form.Control type="number" name="Wound & Skin Care" value={settings.servicesPricing['Wound & Skin Care'] || 0} onChange={handlePricingChange} style={{ borderRadius: '8px 0 0 8px', border: '1px solid #e0e6eb' }} />
                                                    <InputGroup.Text className="bg-light" style={{ borderRadius: '0 8px 8px 0', border: '1px solid #e0e6eb', borderLeft: 'none' }}>EGP</InputGroup.Text>
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="text-muted fw-medium" style={{ fontSize: '14px' }}>Chronic Care</Form.Label>
                                                <InputGroup>
                                                    <Form.Control type="number" name="Chronic Care" value={settings.servicesPricing['Chronic Care'] || 0} onChange={handlePricingChange} style={{ borderRadius: '8px 0 0 8px', border: '1px solid #e0e6eb' }} />
                                                    <InputGroup.Text className="bg-light" style={{ borderRadius: '0 8px 8px 0', border: '1px solid #e0e6eb', borderLeft: 'none' }}>EGP</InputGroup.Text>
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </div>

                                <div>
                                    <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '15px' }}>Time-based Services (Per Hour/Shift)</h6>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="text-muted fw-medium" style={{ fontSize: '14px' }}>Elderly Care</Form.Label>
                                                <InputGroup>
                                                    <Form.Control type="number" name="Elderly Care" value={settings.servicesPricing['Elderly Care'] || 0} onChange={handlePricingChange} style={{ borderRadius: '8px 0 0 8px', border: '1px solid #e0e6eb' }} />
                                                    <InputGroup.Text className="bg-light" style={{ borderRadius: '0 8px 8px 0', border: '1px solid #e0e6eb', borderLeft: 'none' }}>EGP</InputGroup.Text>
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="text-muted fw-medium" style={{ fontSize: '14px' }}>Escort Services & Responsibilities</Form.Label>
                                                <InputGroup>
                                                    <Form.Control type="number" name="Escort Services & Responsibilities" value={settings.servicesPricing['Escort Services & Responsibilities'] || 0} onChange={handlePricingChange} style={{ borderRadius: '8px 0 0 8px', border: '1px solid #e0e6eb' }} />
                                                    <InputGroup.Text className="bg-light" style={{ borderRadius: '0 8px 8px 0', border: '1px solid #e0e6eb', borderLeft: 'none' }}>EGP</InputGroup.Text>
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="text-muted fw-medium" style={{ fontSize: '14px' }}>Basic Care</Form.Label>
                                                <InputGroup>
                                                    <Form.Control type="number" name="Basic Care" value={settings.servicesPricing['Basic Care'] || 0} onChange={handlePricingChange} style={{ borderRadius: '8px 0 0 8px', border: '1px solid #e0e6eb' }} />
                                                    <InputGroup.Text className="bg-light" style={{ borderRadius: '0 8px 8px 0', border: '1px solid #e0e6eb', borderLeft: 'none' }}>EGP</InputGroup.Text>
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="text-muted fw-medium" style={{ fontSize: '14px' }}>Post-operative Care</Form.Label>
                                                <InputGroup>
                                                    <Form.Control type="number" name="Post-operative Care" value={settings.servicesPricing['Post-operative Care'] || 0} onChange={handlePricingChange} style={{ borderRadius: '8px 0 0 8px', border: '1px solid #e0e6eb' }} />
                                                    <InputGroup.Text className="bg-light" style={{ borderRadius: '0 8px 8px 0', border: '1px solid #e0e6eb', borderLeft: 'none' }}>EGP</InputGroup.Text>
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                            <Card.Body className="p-4">
                                <h5 className="fw-bold text-dark mb-4" style={{ fontSize: '18px' }}>
                                    <i className="fa-solid fa-percent me-2 text-primary"></i> Platform Commission
                                </h5>

                                <Form.Group className="mb-3">
                                    <Form.Label className="text-muted fw-medium" style={{ fontSize: '14px' }}>Commission Percentage</Form.Label>
                                    <InputGroup>
                                        <Form.Control type="number" name="platformCommission" value={settings.platformCommission} onChange={handleChange} style={{ borderRadius: '8px 0 0 8px', border: '1px solid #e0e6eb' }} />
                                        <InputGroup.Text className="bg-light" style={{ borderRadius: '0 8px 8px 0', border: '1px solid #e0e6eb', borderLeft: 'none' }}>%</InputGroup.Text>
                                    </InputGroup>
                                </Form.Group>

                                <div className="p-3 bg-light rounded" style={{ border: '1px solid #e0e6eb' }}>
                                    <p className="text-muted mb-0" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                                        <i className="fa-solid fa-circle-info text-primary me-2"></i>
                                        This percentage is automatically deducted from the nurse's wallet after every successfully completed booking.
                                    </p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <div className="d-flex justify-content-end">
                    <Button type="submit" variant="primary" className="rounded-pill px-5 py-2 fw-bold shadow-sm" style={{ fontSize: '15px' }} disabled={saving}>
                        {saving ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> Saving...</> : <><i className="fa-solid fa-floppy-disk me-2"></i> Save Changes</>}
                    </Button>
                </div>
            </Form>

        </motion.div>
    );
};

export default SystemSettings;
