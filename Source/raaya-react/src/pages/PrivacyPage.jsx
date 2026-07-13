import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import PageHeader from '../components/layout/PageHeader';

const PrivacyPage = () => {
    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '76px' }}>
            <PageHeader 
                title={<span>Privacy <span className="text-primary">Policy</span></span>} 
                description="Understand how we collect, use, and protect your personal data when you use the Raaya platform."
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
                                        <p className="text-muted fw-bold mb-5" style={{ letterSpacing: '1px' }}>LAST UPDATED: JULY 2026</p>
                                        
                                        <div className="mb-5">
                                            <h4 className="fw-bold text-dark mb-4">
                                                1. Introduction
                                            </h4>
                                            <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
                                                Welcome to Raaya Healthcare. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our platform and tell you about your privacy rights and how the law protects you.
                                            </p>
                                        </div>

                                        <div className="mb-5">
                                            <h4 className="fw-bold text-dark mb-4">
                                                2. The Data We Collect About You
                                            </h4>
                                            <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
                                                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                                            </p>
                                            <ul className="text-muted" style={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
                                                <li className="mb-2"><strong>Identity Data</strong> includes first name, last name, username or similar identifier, and title.</li>
                                                <li className="mb-2"><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                                                <li className="mb-2"><strong>Medical Data</strong> includes information about your health condition provided during booking for the purpose of proper care.</li>
                                            </ul>
                                        </div>

                                        <div className="mb-5">
                                            <h4 className="fw-bold text-dark mb-4">
                                                3. Data Security
                                            </h4>
                                            <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
                                                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="fw-bold text-dark mb-4">
                                                4. Contact Us
                                            </h4>
                                            <div className="bg-light p-4 rounded-4 border">
                                                <p className="text-muted mb-2" style={{ fontSize: '1.05rem' }}>If you have any questions about this privacy policy, please contact us at:</p>
                                                <p className="mb-1 text-dark fw-bold"><i className="fa-solid fa-at text-primary me-2"></i> privacy@raaya.com</p>
                                                <p className="mb-0 text-dark fw-bold"><i className="fa-solid fa-phone text-primary me-2"></i> +20 100 123 4567</p>
                                            </div>
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

export default PrivacyPage;
