import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Nav, Card } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/layout/PageHeader';

export default function AboutPage() {
    const [activeTab, setActiveTab] = useState('mission');
    const navigate = useNavigate();

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '76px' }}>
            {/* 1. Reusable Page Header */}
            <PageHeader 
                title={<span>About <span className="text-primary">Us</span></span>} 
                description="Discover our mission, our values, and the dedicated team of professionals working tirelessly to redefine home healthcare and improve patient lives."
            />

            {/* 2. Company About / Why Choose Us */}
            <section className="py-5" style={{ marginTop: '40px', marginBottom: '40px' }}>
                <Container>
                    <Row className="align-items-center g-5">
                        {/* Left Side: Overlapping Images */}
                        <Col lg={6} className="position-relative">
                            <motion.div 
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="position-relative"
                                style={{ height: '550px' }}
                            >
                                {/* Background Image */}
                                <div 
                                    className="position-absolute shadow-lg" 
                                    style={{ 
                                        width: '80%', 
                                        height: '400px', 
                                        top: 0, 
                                        left: 0, 
                                        borderRadius: '32px',
                                        backgroundColor: '#e2e8f0',
                                        backgroundImage: 'url(https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80)',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                ></div>

                                {/* Floating Badge */}
                                <div 
                                    className="position-absolute d-flex flex-column align-items-center justify-content-center text-white shadow-lg"
                                    style={{
                                        width: '180px',
                                        height: '140px',
                                        backgroundColor: 'var(--primary)',
                                        borderRadius: '24px 24px 24px 0',
                                        top: '40px',
                                        right: '0',
                                        zIndex: 3
                                    }}
                                >
                                    <h2 className="fw-bold mb-0" style={{ fontSize: '2.5rem' }}>10+</h2>
                                    <p className="mb-0 text-center" style={{ fontSize: '0.85rem', fontWeight: '500', letterSpacing: '1px', opacity: 0.9 }}>YEARS<br/>OF EXPERIENCE</p>
                                </div>

                                {/* Foreground Overlapping Image */}
                                <div 
                                    className="position-absolute shadow-lg" 
                                    style={{ 
                                        width: '65%', 
                                        height: '280px', 
                                        bottom: 0, 
                                        right: '5%', 
                                        borderRadius: '24px',
                                        border: '8px solid white',
                                        backgroundImage: 'url(https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80)',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        zIndex: 2
                                    }}
                                ></div>
                            </motion.div>
                        </Col>

                        {/* Right Side: Text & Features */}
                        <Col lg={6}>
                            <motion.div 
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <p className="text-uppercase fw-bold mb-2" style={{ color: 'var(--primary)', letterSpacing: '1px', fontSize: '0.85rem' }}>
                                    COMPANY ABOUT
                                </p>
                                <h2 className="fw-bold text-dark mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', letterSpacing: '-1px', lineHeight: 1.2 }}>
                                    Elevating Home Healthcare to a New Standard
                                </h2>
                                <p className="text-muted mb-4" style={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
                                    Raaya is a smart digital platform designed to organize and secure the home healthcare sector. We prioritize patient safety and comfort by offering a secure, structured home healthcare experience for you and your loved ones.
                                </p>
                                
                                {/* Why Choose Us Features inside the section */}
                                <h6 className="fw-bold mb-3" style={{ color: '#0f172a' }}>Why Choose Us:</h6>
                                <Row className="g-3 mb-5">
                                    {[
                                        { title: 'The Smart Digital Logbook' },
                                        { title: 'Fast & Urgent Care' },
                                        { title: 'Verified & Trusted Nurses' },
                                        { title: 'Reliable & Experienced Team' }
                                    ].map((feature, idx) => (
                                        <Col sm={6} key={idx}>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', backgroundColor: 'rgba(0,102,102,0.1)', color: 'var(--primary)' }}>
                                                    <i className="fa-solid fa-check" style={{ fontSize: '12px' }}></i>
                                                </div>
                                                <span className="text-muted" style={{ fontSize: '0.95rem', fontWeight: '500' }}>{feature.title}</span>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>

                                <Button 
                                    className="px-4 py-3 rounded-pill border-0 fw-bold shadow-sm hover-lift"
                                    style={{ backgroundColor: 'var(--primary)', fontSize: '0.95rem', transition: 'all 0.3s' }}
                                    onClick={() => navigate('/book')}
                                >
                                    BOOK A NURSE <i className="fa-solid fa-arrow-right ms-2"></i>
                                </Button>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* 3. Stats Banner */}
            <section className="py-5" style={{ backgroundColor: 'var(--primary)' }}>
                <Container>
                    <Row className="g-4 text-white text-center text-md-start align-items-center">
                        {[
                            { icon: 'fa-users', number: '10K+', text: 'Patients Served' },
                            { icon: 'fa-file-contract', number: '200+', text: 'Verified Nurses' },
                            { icon: 'fa-user-doctor', number: '68+', text: 'Medical Experts' },
                            { icon: 'fa-trophy', number: '99%', text: 'Satisfaction Rate' }
                        ].map((stat, idx) => (
                            <Col md={6} lg={3} key={idx} className={idx !== 0 ? 'border-start-lg border-light-subtle' : ''}>
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-3"
                                >
                                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                        <i className={`fa-solid ${stat.icon} fs-4`}></i>
                                    </div>
                                    <div>
                                        <h3 className="fw-bold mb-0 text-white" style={{ fontSize: '2rem' }}>{stat.number}</h3>
                                        <p className="mb-0 text-white-50" style={{ fontSize: '0.9rem' }}>{stat.text}</p>
                                    </div>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* 4. Mission / Vision / Goal Section */}
            <section className="py-5 my-5">
                <Container>
                    <Row className="g-5 align-items-center">
                        {/* Left Side: Tabs & Text */}
                        <Col lg={6}>
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <p className="text-uppercase fw-bold mb-2" style={{ color: 'var(--primary)', letterSpacing: '1px', fontSize: '0.85rem' }}>
                                    ABOUT MISSION
                                </p>
                                <h2 className="fw-bold text-dark mb-4" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', letterSpacing: '-1px', lineHeight: 1.2 }}>
                                    Our Main Goal is to Satisfy Local & Global Clients
                                </h2>

                                {/* Custom Tabs */}
                                <Nav className="mb-4 gap-2 border-0">
                                    {['mission', 'vision', 'goal'].map((tab) => (
                                        <Nav.Item key={tab}>
                                            <Button
                                                variant="link"
                                                className={`text-decoration-none rounded-pill px-4 py-2 fw-bold shadow-sm border ${activeTab === tab ? 'bg-primary-custom text-white' : 'bg-white text-muted'}`}
                                                style={{ 
                                                    backgroundColor: activeTab === tab ? 'var(--primary)' : 'white',
                                                    borderColor: activeTab === tab ? 'var(--primary)' : '#eaeeed',
                                                    color: activeTab === tab ? 'white' : '#687086',
                                                    fontSize: '0.85rem',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onClick={() => setActiveTab(tab)}
                                            >
                                                OUR {tab.toUpperCase()}
                                            </Button>
                                        </Nav.Item>
                                    ))}
                                </Nav>

                                {/* Tab Content */}
                                <div style={{ minHeight: '150px' }}>
                                    <AnimatePresence mode="wait">
                                        {activeTab === 'mission' && (
                                            <motion.div key="mission" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                                <h5 className="fw-bold text-dark mb-3">Our Company Mission</h5>
                                                <p className="text-muted" style={{ lineHeight: 1.7 }}>
                                                    To provide exceptional, accessible, and reliable home healthcare services that improve the quality of life for our patients. We strive to bring medical expertise directly to your doorstep with compassion and professionalism.
                                                </p>
                                                <p className="text-muted" style={{ lineHeight: 1.7 }}>
                                                    By thoroughly vetting our nursing staff, we ensure that every patient receives the highest standard of care in a safe environment.
                                                </p>
                                            </motion.div>
                                        )}
                                        {activeTab === 'vision' && (
                                            <motion.div key="vision" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                                <h5 className="fw-bold text-dark mb-3">Our Future Vision</h5>
                                                <p className="text-muted" style={{ lineHeight: 1.7 }}>
                                                    To become the leading digital platform for home healthcare in the region, recognized for our commitment to innovation, patient safety, and seamless service delivery.
                                                </p>
                                                <p className="text-muted" style={{ lineHeight: 1.7 }}>
                                                    We envision a future where high-quality medical care is universally accessible to everyone, right from the comfort of their own homes.
                                                </p>
                                            </motion.div>
                                        )}
                                        {activeTab === 'goal' && (
                                            <motion.div key="goal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                                <h5 className="fw-bold text-dark mb-3">Our Primary Goal</h5>
                                                <p className="text-muted" style={{ lineHeight: 1.7 }}>
                                                    To streamline the healthcare booking process by replacing traditional methods with a smart, structured ecosystem that guarantees transparency and speed.
                                                </p>
                                                <p className="text-muted" style={{ lineHeight: 1.7 }}>
                                                    Through our digital logbooks and verified professional network, we aim to deliver 100% satisfaction and peace of mind to all families we serve.
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </Col>

                        {/* Right Side: Image */}
                        <Col lg={6}>
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <div 
                                    className="rounded-4 shadow-lg overflow-hidden w-100"
                                    style={{ 
                                        height: '450px',
                                        backgroundImage: 'url(https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=800&q=80)',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                ></div>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* 5. Meet our verified professionals */}
            <section className="py-5 bg-white">
                <Container className="py-5">
                    <Row className="mb-5 text-center justify-content-center">
                        <Col lg={8}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <p className="text-uppercase fw-bold mb-2" style={{ color: 'var(--primary)', letterSpacing: '1px', fontSize: '0.85rem' }}>
                                    EXPERT CAREGIVERS
                                </p>
                                <h2 className="fw-bold text-dark mb-3" style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', letterSpacing: '-1px' }}>
                                    Meet the Professionals
                                </h2>
                                <p className="text-muted mx-auto" style={{ fontSize: '1.05rem', maxWidth: '600px', lineHeight: 1.8 }}>
                                    Our carefully selected team of medical experts is dedicated to providing you with the highest standard of care.
                                </p>
                            </motion.div>
                        </Col>
                    </Row>
                    <Row className="g-4 justify-content-center">
                        {[
                            { name: 'Dr. Salma Tarek', title: 'Senior Care Specialist', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&q=80', rating: '4.9' },
                            { name: 'Ahmed Hassan', title: 'Registered Nurse', img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&q=80', rating: '4.8' },
                            { name: 'Nourhan Ali', title: 'Pediatric Nurse', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80', rating: '5.0' },
                            { name: 'Dr. Youssef Mahmoud', title: 'General Practitioner', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&q=80', rating: '4.9' }
                        ].map((pro, idx) => (
                            <Col lg={3} md={6} key={idx}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1, type: 'spring', stiffness: 300, damping: 24 }}
                                    whileHover={{ y: -8 }}
                                    className="h-100"
                                >
                                    <Card className="p-3 border-0 h-100" style={{ borderRadius: '24px', backgroundColor: '#fcfcfc', boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
                                        {/* Image Container */}
                                        <div style={{ borderRadius: '16px', overflow: 'hidden', height: '260px', position: 'relative' }}>
                                            {/* Floating Badge */}
                                            <div className="position-absolute z-2" style={{ top: '12px', right: '12px' }}>
                                                <div className="d-flex align-items-center gap-1 px-3 py-1.5 rounded-pill shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)', fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>
                                                    <i className="fa-solid fa-circle-check"></i> Verified
                                                </div>
                                            </div>
                                            <motion.div 
                                                style={{ 
                                                    width: '100%', 
                                                    height: '100%', 
                                                    backgroundColor: '#e2e8f0', 
                                                    backgroundImage: `url(${pro.img})`, 
                                                    backgroundSize: 'cover', 
                                                    backgroundPosition: 'center top' 
                                                }}
                                                whileHover={{ scale: 1.05 }}
                                                transition={{ duration: 0.4 }}
                                            />
                                        </div>
                                        
                                        <Card.Body className="px-2 pt-4 pb-2 text-center d-flex flex-column justify-content-between">
                                            <div>
                                                <h5 className="fw-bold mb-1 text-dark" style={{ fontSize: '1.15rem', letterSpacing: '-0.5px' }}>{pro.name}</h5>
                                                <p className="mb-3" style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '600' }}>{pro.title}</p>
                                            </div>
                                            
                                            <div className="d-flex justify-content-center mt-auto">
                                                <div className="d-flex align-items-center justify-content-center rounded-pill px-3 py-1.5" style={{ backgroundColor: '#ffffff', border: '1px solid #eaeeed' }}>
                                                    <i className="fa-solid fa-star text-warning me-2" style={{ fontSize: '0.85rem' }}></i>
                                                    <span className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{pro.rating}</span>
                                                    <span className="text-muted ms-1" style={{ fontSize: '0.85rem' }}>/ 5.0</span>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* 6. CTA for Nurses */}
            <section className="py-5" style={{ backgroundColor: 'var(--primary)' }}>
                <Container className="py-4">
                    <Row className="align-items-center justify-content-center text-center text-lg-start">
                        <Col lg={8} className="mb-4 mb-lg-0">
                            <h2 className="fw-bold text-white mb-2" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.2rem)', letterSpacing: '-0.5px' }}>
                                Are you a qualified nurse?
                            </h2>
                            <p className="text-white-50 mb-0" style={{ fontSize: '1.1rem' }}>
                                Join our network of professional caregivers and start making a difference today.
                            </p>
                        </Col>
                        <Col lg={4} className="text-lg-end">
                            <a 
                                href="http://localhost:5174" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn btn-light rounded-pill px-5 py-3 fw-bold shadow-sm d-inline-flex align-items-center justify-content-center"
                                style={{ color: 'var(--primary)', fontSize: '1.05rem', transition: 'all 0.3s' }}
                                onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
                                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                                Join as a Nurse <i className="fa-solid fa-arrow-right ms-2"></i>
                            </a>
                        </Col>
                    </Row>
                </Container>
            </section>

        </div>
    );
}
