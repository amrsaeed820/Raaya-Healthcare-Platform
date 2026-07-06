import { Container, Row, Col, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
    const navigate = useNavigate();
    return (
        <section className="px-3 px-md-4 pb-3" id="home" style={{ backgroundColor: '#ffffff', paddingTop: '64px' }}>
            <div 
                className="position-relative overflow-hidden w-100 d-flex flex-column justify-content-center mx-auto"
                style={{ 
                    minHeight: 'calc(100vh - 80px)', 
                    borderRadius: '24px',
                    backgroundImage: 'url(https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=60&w=1200)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'right center',
                }}
            >
                {/* Gradient overlay */}
                <div className="position-absolute w-100 h-100 top-0 start-0" style={{ background: 'linear-gradient(to right, rgba(2,89,85,0.95) 0%, rgba(2,89,85,0.7) 40%, rgba(2,89,85,0.1) 100%)' }}></div>
                
                <Container className="position-relative z-1 py-4">
                    <Row>
                        <Col lg={9} xl={8} className="text-start">
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <h1 className="text-white fw-bold mb-3 mb-md-4 text-uppercase" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.1, letterSpacing: '-1px' }}>
                                    Trusted Home<br/>Nursing Today
                                </h1>
                                <p className="text-white text-opacity-75 mb-4 fs-5" style={{ maxWidth: '600px', lineHeight: 1.5 }}>
                                    We provide tailored healthcare solutions, guiding you through every step with personalized experiences that meet your unique medical needs and aspirations.
                                </p>
                                
                                <Button 
                                    variant="light" 
                                    className="d-inline-flex align-items-center gap-3 px-3 py-2 fw-bold border-0 shadow-lg text-dark bg-white rounded-pill mb-4 mb-lg-5"
                                    style={{ fontSize: '15px' }}
                                    onClick={() => navigate('/book-urgent')}
                                >
                                    <span className="ps-2">Book Urgent Visit</span>
                                    <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '34px', height: '34px' }}>
                                        <i className="fa-solid fa-arrow-right-long" style={{ fontSize: '13px', transform: 'rotate(-45deg)' }}></i>
                                    </div>
                                </Button>

                                {/* Stats */}
                                <div className="d-flex flex-wrap gap-4 gap-md-5 mt-2">
                                    <div>
                                        <h2 className="text-white fw-bold mb-0" style={{ fontSize: '2rem' }}>5000+</h2>
                                        <span className="text-white text-opacity-75 small">Happy Patients</span>
                                    </div>
                                    <div>
                                        <h2 className="text-white fw-bold mb-0" style={{ fontSize: '2rem' }}>100+</h2>
                                        <span className="text-white text-opacity-75 small">Expert Nurses</span>
                                    </div>
                                    <div>
                                        <h2 className="text-white fw-bold mb-0" style={{ fontSize: '2rem' }}>15m+</h2>
                                        <span className="text-white text-opacity-75 small">Response Time</span>
                                    </div>
                                </div>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>

                {/* Bottom Right Floating Box (Avatars) */}
                <div 
                    className="position-absolute bg-white d-flex align-items-center gap-3 shadow-sm"
                    style={{ 
                        bottom: '0', 
                        right: '0', 
                        padding: '12px 20px', 
                        borderTopLeftRadius: '24px',
                        zIndex: 10
                    }}
                >
                    <div className="d-flex">
                        <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Agent" className="rounded-circle border border-2 border-white" style={{ width: '38px', height: '38px', zIndex: 4 }} loading="lazy" />
                        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Agent" className="rounded-circle border border-2 border-white" style={{ width: '38px', height: '38px', marginLeft: '-12px', zIndex: 3 }} loading="lazy" />
                        <img src="https://randomuser.me/api/portraits/women/31.jpg" alt="Agent" className="rounded-circle border border-2 border-white" style={{ width: '38px', height: '38px', marginLeft: '-12px', zIndex: 2 }} loading="lazy" />
                        <img src="https://randomuser.me/api/portraits/men/46.jpg" alt="Agent" className="rounded-circle border border-2 border-white" style={{ width: '38px', height: '38px', marginLeft: '-12px', zIndex: 1 }} loading="lazy" />
                    </div>
                    <div>
                        <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>10+ Certified Experts</div>
                        <div className="text-warning" style={{ fontSize: '11px' }}>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <span className="text-dark fw-bold ms-1">5/5</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
