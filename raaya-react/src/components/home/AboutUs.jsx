import { Container, Row, Col, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';

const AboutUs = () => {
    return (
        <section className="py-5 w-100" id="about" style={{ backgroundColor: '#ffffff' }}>
            <Container className="py-4 py-md-5">
                
                {/* Header Section */}
                <Row className="mb-4 mb-md-5">
                    <Col lg={8} className="mb-3 mb-lg-0">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <div 
                                className="d-inline-flex align-items-center rounded-pill px-3 py-2 mb-3 shadow-sm border"
                                style={{ backgroundColor: '#ffffff', borderColor: '#eaeeed', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600' }}
                            >
                                <i className="fa-solid fa-circle-info me-2"></i> About Us
                            </div>
                            <h2 className="fw-bold mb-3 text-dark" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                                A New Standard in Home Healthcare
                            </h2>
                            <p 
                                className="text-muted mb-0"
                                style={{ lineHeight: 1.6, fontSize: '1rem', maxWidth: '700px' }}
                            >
                                We bring hospital-level expertise directly to your doorstep. Experience personalized care plans, advanced health tracking, and absolute peace of mind.
                            </p>
                        </motion.div>
                    </Col>
                </Row>

                {/* Bento Grid */}
                <div className="about-bento-container">
                    
                    {/* Left Box (Large Dark Green) */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="rounded-4 p-3 p-md-4 text-white d-flex flex-column flex-xl-row gap-3 gap-xl-4 shadow-sm h-100"
                        style={{ backgroundColor: 'var(--primary)' }}
                    >
                        <div className="rounded-4 overflow-hidden shadow-sm" style={{ flex: '0 0 45%', minHeight: '220px' }}>
                            <img 
                                src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&q=80&w=800" 
                                alt="Medical Professional" 
                                className="w-100 h-100 object-fit-cover"
                                loading="lazy"
                            />
                        </div>
                        <div className="d-flex flex-column justify-content-center" style={{ flex: '1' }}>
                            <h3 className="fw-bold mb-2 text-white" style={{ fontSize: 'clamp(1.2rem, 2vw, 1.8rem)', lineHeight: 1.3 }}>
                                Advanced Care, Familiar Comfort
                            </h3>
                            <p className="text-white text-opacity-75 mb-4" style={{ lineHeight: 1.6, fontSize: '0.9rem' }}>
                                Our dedicated team of certified professionals leverages state-of-the-art technology to ensure your recovery is safe, swift, and monitored around the clock.
                            </p>
                            <div>
                                <Button 
                                    variant="outline-light"
                                    className="fw-bold px-4 py-2 btn-about-hover"
                                    style={{ fontSize: '0.95rem' }}
                                    onClick={() => { window.scrollTo(0, 0); window.location.href = '/about'; }}
                                >
                                    Learn More
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column */}
                    <div className="d-flex flex-column gap-3 gap-md-4 h-100">
                        
                        {/* Top Right Box (Our Approach) */}
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="rounded-4 p-3 p-md-4 bg-white border shadow-sm d-flex flex-column justify-content-center position-relative"
                            style={{ flex: '1' }}
                        >
                            <div className="position-absolute top-0 end-0 p-3">
                                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', backgroundColor: '#e6f4f1', color: 'var(--primary)' }}>
                                    <i className="fa-solid fa-heart-circle-check fs-6"></i>
                                </div>
                            </div>
                            <h4 className="fw-bold mb-2 text-dark" style={{ fontSize: '1.25rem' }}>Our Approach</h4>
                            <p className="text-muted mb-0" style={{ lineHeight: 1.6, fontSize: '0.9rem' }}>
                                We combine unwavering empathy with clinical excellence, treating every patient like family while maintaining the highest medical standards in the comfort of your home.
                            </p>
                        </motion.div>

                        {/* Bottom Right Box (Stats from image 9) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="rounded-4 p-3 p-md-4 shadow-sm d-flex align-items-center"
                            style={{ backgroundColor: '#e6f4f1', flex: '0 0 auto', minHeight: '130px' }}
                        >
                            <Row className="w-100 text-center m-0 align-items-center">
                                <Col xs={4} className="px-1 d-flex flex-column align-items-center justify-content-center">
                                    <div className="mb-1 d-flex align-items-center justify-content-center" style={{ color: 'var(--primary)', height: '30px' }}>
                                        <i className="fa-solid fa-user-nurse fs-5"></i>
                                    </div>
                                    <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.5rem)' }}>50,000+</h4>
                                    <span className="text-muted fw-medium d-block mt-1 text-center" style={{ fontSize: '11px', lineHeight: 1.2 }}>Verified<br/>Nurses</span>
                                </Col>
                                <Col xs={4} className="px-1 d-flex flex-column align-items-center justify-content-center" style={{ borderLeft: '1px solid rgba(2,89,85,0.15)', borderRight: '1px solid rgba(2,89,85,0.15)' }}>
                                    <div className="mb-1 d-flex align-items-center justify-content-center" style={{ color: 'var(--primary)', height: '30px' }}>
                                        <i className="fa-solid fa-calendar-check fs-5"></i>
                                    </div>
                                    <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.5rem)' }}>10K+</h4>
                                    <span className="text-muted fw-medium d-block mt-1 text-center" style={{ fontSize: '11px', lineHeight: 1.2 }}>Appointments<br/>Booked</span>
                                </Col>
                                <Col xs={4} className="px-1 d-flex flex-column align-items-center justify-content-center">
                                    <div className="mb-1 d-flex align-items-center justify-content-center" style={{ color: 'var(--primary)', height: '30px' }}>
                                        <i className="fa-solid fa-location-dot fs-5"></i>
                                    </div>
                                    <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.5rem)' }}>100+</h4>
                                    <span className="text-muted fw-medium d-block mt-1 text-center" style={{ fontSize: '11px', lineHeight: 1.2 }}>Cities<br/>Covered</span>
                                </Col>
                            </Row>
                        </motion.div>

                    </div>
                </div>
            </Container>

            <style>{`
                .about-bento-container {
                    display: grid;
                    grid-template-columns: 1.4fr 1fr;
                    gap: 1.5rem;
                }
                
                @media (max-width: 991px) {
                    .about-bento-container {
                        grid-template-columns: 1fr;
                    }
                }
                
                .btn-hover-effect {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .btn-hover-effect:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                }
                .btn-about-hover {
                    transition: all 0.3s ease;
                    border-radius: var(--radius-btn) !important;
                }
                .btn-about-hover:hover {
                    background-color: #ffffff !important;
                    color: var(--primary) !important;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 15px rgba(0,0,0,0.2) !important;
                }
            `}</style>
        </section>
    );
};

export default AboutUs;
