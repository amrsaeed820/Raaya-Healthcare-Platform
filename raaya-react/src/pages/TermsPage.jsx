import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import PageHeader from '../components/layout/PageHeader';

const TermsPage = () => {
    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '76px' }}>
            <PageHeader 
                title={<span>Terms of <span className="text-primary">Service</span></span>} 
                description="Please read these terms carefully before using our platform to ensure a safe and reliable healthcare experience."
            />

            <section className="py-5" style={{ marginTop: '20px', marginBottom: '40px' }}>
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={10}>
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <Card className="border-0 shadow-sm" style={{ borderRadius: '24px' }}>
                                    <Card.Body className="p-4 p-md-5">
                                        <p className="text-muted fw-bold mb-5" style={{ letterSpacing: '1px' }}>EFFECTIVE DATE: JULY 2026</p>
                                        
                                        <div className="mb-5">
                                            <h4 className="fw-bold text-dark mb-4">
                                                1. Agreement to Terms
                                            </h4>
                                            <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
                                                By accessing or using the Raaya Healthcare platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service. These terms apply to all visitors, users, and others who access or use our home healthcare booking platform.
                                            </p>
                                        </div>

                                        <div className="mb-5">
                                            <h4 className="fw-bold text-dark mb-4">
                                                2. Our Healthcare Services
                                            </h4>
                                            <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
                                                Raaya acts as a bridge connecting patients with certified freelance nurses and healthcare professionals. While we thoroughly verify the credentials of all professionals on our platform, the medical services provided are the sole responsibility of the independent healthcare provider.
                                            </p>
                                        </div>

                                        <div className="mb-5">
                                            <h4 className="fw-bold text-dark mb-4">
                                                3. Booking and Payments
                                            </h4>
                                            <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
                                                All bookings must be made through the official Raaya platform. We process payments securely. A cancellation fee may apply if a booking is cancelled within 24 hours of the scheduled visit. Platform commissions are non-refundable once a service has been completed.
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="fw-bold text-dark mb-4">
                                                4. Limitation of Liability
                                            </h4>
                                            <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
                                                In no event shall Raaya Healthcare, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                                            </p>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
};

export default TermsPage;
