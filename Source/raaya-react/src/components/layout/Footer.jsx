import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white py-5 border-top" id="contact">
            <Container className="py-4">
                <Row className="g-4">
                    <Col lg={4}>
                        <h4 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
                            <div className="text-white rounded p-1 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'var(--primary)', width: '32px', height: '32px' }}>
                                <i className="fa-solid fa-heart-pulse fs-6"></i>
                            </div>
                            Raaya
                        </h4>
                        <p className="text-muted pe-md-5 mb-4">
                            Raaya is a leading home healthcare platform dedicated to providing quality medical care at your doorstep. We connect you with certified professionals instantly.
                        </p>
                        <div className="d-flex gap-3">
                            <a href="#" aria-label="Facebook" className="text-muted text-decoration-none fs-5 hover-primary"><i className="fa-brands fa-facebook"></i></a>
                            <a href="#" aria-label="Twitter" className="text-muted text-decoration-none fs-5 hover-primary"><i className="fa-brands fa-twitter"></i></a>
                            <a href="#" aria-label="Instagram" className="text-muted text-decoration-none fs-5 hover-primary"><i className="fa-brands fa-instagram"></i></a>
                            <a href="#" aria-label="LinkedIn" className="text-muted text-decoration-none fs-5 hover-primary"><i className="fa-brands fa-linkedin"></i></a>
                        </div>
                    </Col>
                    
                    <Col lg={2} md={4} sm={6}>
                        <h5 className="fw-bold mb-3 text-dark fs-6">Our Services</h5>
                        <ul className="list-unstyled d-flex flex-column gap-2">
                            <li><Link to="/services" className="text-muted text-decoration-none hover-primary">Elderly Care</Link></li>
                            <li><Link to="/services" className="text-muted text-decoration-none hover-primary">Post-Operative Care</Link></li>
                            <li><Link to="/services" className="text-muted text-decoration-none hover-primary">Chronic Disease Care</Link></li>
                            <li><Link to="/services" className="text-muted text-decoration-none hover-primary">Urgent Rapid Care</Link></li>
                        </ul>
                    </Col>
                    
                    <Col lg={2} md={4} sm={6}>
                        <h5 className="fw-bold mb-3 text-dark fs-6">Quick Links</h5>
                        <ul className="list-unstyled d-flex flex-column gap-2">
                            <li><Link to="/book" className="text-muted text-decoration-none hover-primary">Book a Nurse</Link></li>
                            <li><Link to="/articles" className="text-muted text-decoration-none hover-primary">Medical Articles</Link></li>
                            <li><Link to="/about" className="text-muted text-decoration-none hover-primary">About Raaya</Link></li>
                            <li><Link to="/login" className="text-muted text-decoration-none hover-primary">Login / Register</Link></li>
                            <li><a href="http://localhost:5174" target="_blank" rel="noopener noreferrer" className="text-muted text-decoration-none hover-primary">Join as a Nurse</a></li>
                        </ul>
                    </Col>
                    
                    <Col lg={4} md={4}>
                        <h5 className="fw-bold mb-3 text-dark fs-6">Contact Info</h5>
                        <ul className="list-unstyled d-flex flex-column gap-3 mt-3">
                            <li className="text-muted d-flex align-items-center gap-2">
                                <i className="fa-solid fa-location-dot text-primary"></i>
                                Cairo, Egypt
                            </li>
                            <li className="text-muted d-flex align-items-center gap-2">
                                <i className="fa-solid fa-envelope text-primary"></i>
                                support@raaya.com
                            </li>
                            <li className="text-muted d-flex align-items-center gap-2">
                                <i className="fa-solid fa-phone text-primary"></i>
                                +20 100 123 4567
                            </li>
                        </ul>
                    </Col>
                </Row>
                
                <hr className="my-4" style={{ borderColor: 'var(--border-color)' }} />
                
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-muted small">
                    <p className="mb-md-0">&copy; 2026 Raaya Healthcare. All rights reserved.</p>
                    <div className="d-flex gap-4">
                        <Link to="/privacy" className="text-muted text-decoration-none hover-primary">Privacy Policy</Link>
                        <Link to="/terms" className="text-muted text-decoration-none hover-primary">Terms of Service</Link>
                    </div>
                </div>
            </Container>
            
            <style>{`
                .hover-primary { transition: 0.2s ease; }
                .hover-primary:hover { color: var(--primary) !important; display: inline-block;}
            `}</style>
        </footer>
    );
};

export default Footer;
