import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';

const ContactUs = () => {
    return (
        <section className="section-padding bg-soft" id="contact">
            <Container>
                <div className="text-center mb-5 pb-3">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="d-inline-flex align-items-center rounded-pill px-3 py-2 mb-3 shadow-sm border"
                        style={{ backgroundColor: '#ffffff', borderColor: '#eaeeed', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600' }}
                    >
                        <i className="fa-solid fa-headset me-2"></i> Contact Us
                    </motion.div>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="fw-bold text-dark mb-3" 
                        style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', letterSpacing: '-0.5px' }}
                    >
                        Get in <span style={{ color: 'var(--primary)' }}>Touch</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-muted mx-auto mb-0"
                        style={{ maxWidth: '600px', fontSize: '1rem', lineHeight: 1.6 }}
                    >
                        Have questions? We're here to help. Reach out to our support team anytime.
                    </motion.p>
                </div>

                <Row className="g-5">
                    {/* Contact Form */}
                    <Col lg={6}>
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="bg-white p-5 rounded-5 shadow-sm border h-100"
                        >
                            <h3 className="fw-bold mb-4">Send us a Message</h3>
                            <Form>
                                <Row className="g-4 mb-4">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="fw-medium text-dark small">Your Name</Form.Label>
                                            <Form.Control type="text" placeholder="John Doe" className="px-4 py-3 bg-light border-0 rounded-4" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="fw-medium text-dark small">Email Address</Form.Label>
                                            <Form.Control type="email" placeholder="john@example.com" className="px-4 py-3 bg-light border-0 rounded-4" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-medium text-dark small">Phone Number</Form.Label>
                                    <Form.Control type="tel" placeholder="+20 100 123 4567" className="px-4 py-3 bg-light border-0 rounded-4" />
                                </Form.Group>
                                <Form.Group className="mb-5">
                                    <Form.Label className="fw-medium text-dark small">Your Message</Form.Label>
                                    <Form.Control as="textarea" rows={4} placeholder="How can we help you?" className="px-4 py-3 bg-light border-0 rounded-4" />
                                </Form.Group>
                                <Button variant="primary" className="w-100 py-3 rounded-pill fw-bold border-0 shadow-glow" style={{backgroundColor: 'var(--primary)', borderColor: 'var(--primary)'}}>
                                    <i className="fa-regular fa-paper-plane me-2"></i> Send Message
                                </Button>
                            </Form>
                        </motion.div>
                    </Col>

                    {/* Contact Info */}
                    <Col lg={6}>
                        <div className="d-flex flex-column gap-4 h-100">
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                                    <Card.Body className="p-4 d-flex align-items-center gap-4">
                                        <div className="bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                                            <i className="fa-solid fa-phone fs-4"></i>
                                        </div>
                                        <div>
                                            <h3 className="fw-bold mb-1" style={{ fontSize: '1rem' }}>Call Us</h3>
                                            <p className="text-dark fw-bold fs-5 mb-1">+20 100 123 4567</p>
                                            <small className="text-muted">Toll-free, 24/7 support</small>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                                    <Card.Body className="p-4 d-flex align-items-center gap-4">
                                        <div className="bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                                            <i className="fa-solid fa-comments fs-4"></i>
                                        </div>
                                        <div>
                                            <h3 className="fw-bold mb-1" style={{ fontSize: '1rem' }}>Live Chat</h3>
                                            <p className="text-primary fw-bold mb-1 cursor-pointer" style={{ cursor: 'pointer' }}>Start Chat <i className="fa-solid fa-arrow-right ms-1"></i></p>
                                            <small className="text-muted">Instant response</small>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                                    <Card.Body className="p-4 d-flex align-items-center gap-4">
                                        <div className="bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                                            <i className="fa-solid fa-envelope fs-4"></i>
                                        </div>
                                        <div>
                                            <h3 className="fw-bold mb-1" style={{ fontSize: '1rem' }}>Email Us</h3>
                                            <p className="text-dark fw-bold mb-1">support@raaya.com</p>
                                            <small className="text-muted">Response within 2 hours</small>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </motion.div>
                            
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <Card className="border shadow-sm rounded-4 h-100 overflow-hidden mt-2" style={{ borderColor: 'rgba(2, 89, 85, 0.2) !important', backgroundColor: '#f0f7f6' }}>
                                    <Card.Body className="p-4 d-flex align-items-start gap-4">
                                        <div className="text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ backgroundColor: 'var(--primary)', width: '60px', height: '60px' }}>
                                            <i className="fa-solid fa-handshake fs-4"></i>
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-2">Partner with Us</h5>
                                            <p className="text-dark mb-3 small">Are you a clinic or hospital? Join our network of 10,000+ healthcare partners.</p>
                                            <Button variant="outline-light" size="sm" className="rounded-pill fw-bold px-4 py-2 border-2" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}>Become a Partner</Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default ContactUs;
