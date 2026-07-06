import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Nav, Button } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/layout/PageHeader';

export default function ServicesPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'resident');

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
            // Scroll to services section immediately without animation
            setTimeout(() => {
                const element = document.getElementById('services');
                if (element) {
                    element.scrollIntoView({ behavior: 'auto' });
                }
            }, 100);
        }
    }, [location.state]);

    const steps = [
        { icon: 'fa-magnifying-glass', title: 'Search & Filter', desc: 'Find the perfect match' },
        { icon: 'fa-calendar-check', title: 'Book Care', desc: 'Scheduled or Urgent' },
        { icon: 'fa-location-dot', title: 'Track Visit', desc: 'Live status tracker' },
        { icon: 'fa-heart-pulse', title: 'Monitor', desc: 'Smart logbook updates' },
        { icon: 'fa-star', title: 'Pay & Review', desc: 'Cash after session' }
    ];

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '76px' }}>
            {/* Page Header (Kept exactly as requested) */}
            <PageHeader
                title={<span>Our <span className="text-primary">Services</span></span>}
                description="Experience the highest standard of medical care delivered directly to your doorstep. We combine professional expertise with smart technology to ensure your absolute comfort and safety."
            />



            {/* 2. Core Medical Services (Tabs Layout matching About Us) */}
            <section className="py-5 bg-light" id="services">
                <Container>
                    <Row className="justify-content-center text-center mb-4">
                        <Col lg={8}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                            >
                                <p className="text-uppercase fw-bold mb-2" style={{ color: 'var(--primary)', letterSpacing: '1px', fontSize: '0.85rem' }}>
                                    CORE SERVICES
                                </p>
                                <h2 className="fw-bold text-dark mb-4" style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', letterSpacing: '-1px' }}>
                                    Our Specialized Medical Care
                                </h2>
                            </motion.div>
                        </Col>
                    </Row>

                    <Row className="justify-content-center">
                        <Col lg={10}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Nav className="justify-content-center mb-4 gap-2 border-0">
                                    {[
                                        { id: 'resident', label: 'Resident Nursing' },
                                        { id: 'urgent', label: 'Urgent Visits' },
                                        { id: 'escort', label: 'Patient Escort' }
                                    ].map((tab) => (
                                        <Nav.Item key={tab.id}>
                                            <Button
                                                variant="link"
                                                className={`text-decoration-none rounded-pill px-4 py-2 fw-bold shadow-sm border ${activeTab === tab.id ? 'bg-primary-custom text-white' : 'bg-white text-muted'}`}
                                                style={{
                                                    backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'white',
                                                    borderColor: activeTab === tab.id ? 'var(--primary)' : '#eaeeed',
                                                    color: activeTab === tab.id ? 'white' : '#687086',
                                                    fontSize: '0.95rem',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onClick={() => setActiveTab(tab.id)}
                                            >
                                                {tab.label}
                                            </Button>
                                        </Nav.Item>
                                    ))}
                                </Nav>
                            </motion.div>

                            {/* Tab Content */}
                            <div className="mt-4">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'resident' && (
                                        <motion.div key="resident" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>

                                            <Row className="g-4">
                                                {[
                                                    { icon: 'fa-person-cane', title: 'Elderly Care', items: ['Full care for bedridden patients', 'Position changes to prevent bedsores', 'Bathing & personal hygiene assistance', 'Feeding & medication organization'] },
                                                    { icon: 'fa-bed-pulse', title: 'Post-operative Care', items: ['Post-surgery vitals monitoring', 'Professional wound dressing', 'Administering IV antibiotics', 'Assisting with gradual mobility'] },
                                                    { icon: 'fa-heart-pulse', title: 'Chronic Care', items: ['Heart, diabetes, & BP management', 'Daily vital readings & logging', 'Detailed health analysis reports', 'Structured follow-up planning'] }
                                                ].map((service, idx) => (
                                                    <Col lg={4} key={idx}>
                                                        <motion.div whileHover={{ y: -10 }} transition={{ duration: 0.3 }} className="h-100">
                                                            <Card className="h-100 border-0 shadow-sm hover-lift" style={{ borderRadius: '24px', backgroundColor: '#ffffff', overflow: 'hidden' }}>
                                                                <Card.Body className="p-4 p-lg-5 position-relative">
                                                                    <div className="position-absolute" style={{ top: '-20px', right: '-20px', width: '120px', height: '120px', backgroundColor: 'rgba(0,102,102,0.03)', borderRadius: '50%', zIndex: 0 }}></div>

                                                                    <div className="position-relative z-1 mb-4 d-inline-flex align-items-center justify-content-center rounded-circle" style={{ width: '70px', height: '70px', backgroundColor: 'rgba(0,102,102,0.06)', color: 'var(--primary)' }}>
                                                                        <i className={`fa-solid ${service.icon} fs-3`}></i>
                                                                    </div>
                                                                    <h4 className="fw-bold mb-4 text-dark position-relative z-1" style={{ letterSpacing: '-0.5px' }}>{service.title}</h4>
                                                                    <ul className="list-unstyled mb-0 position-relative z-1">
                                                                        {service.items.map((item, i) => (
                                                                            <li key={i} className="d-flex mb-3 align-items-start">
                                                                                <i className="fa-solid fa-circle-check mt-1 me-3" style={{ color: 'var(--primary)', fontSize: '1.1rem' }}></i>
                                                                                <span className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>{item}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </Card.Body>
                                                            </Card>
                                                        </motion.div>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </motion.div>
                                    )}

                                    {activeTab === 'urgent' && (
                                        <motion.div key="urgent" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>

                                            <Row className="g-4 justify-content-center">
                                                {[
                                                    { icon: 'fa-syringe', title: 'Basic Care', items: ['IM/IV injections & Cannula insertion', 'Administering IV fluids', 'Measuring glucose, BP, and temperature', 'Treating cases of dehydration'] },
                                                    { icon: 'fa-band-aid', title: 'Wound & Skin Care', items: ['Dressing for simple & deep wounds', 'Professional suture removal', 'Wound cleaning and sterilization', 'Specialized diabetic foot care'] }
                                                ].map((service, idx) => (
                                                    <Col lg={6} key={idx}>
                                                        <motion.div whileHover={{ y: -10 }} transition={{ duration: 0.3 }} className="h-100">
                                                            <Card className="h-100 border-0 shadow-sm hover-lift" style={{ borderRadius: '24px', backgroundColor: '#ffffff', overflow: 'hidden' }}>
                                                                <Card.Body className="p-4 p-lg-5 position-relative">
                                                                    <div className="position-absolute" style={{ top: '-20px', right: '-20px', width: '120px', height: '120px', backgroundColor: 'rgba(0,102,102,0.03)', borderRadius: '50%', zIndex: 0 }}></div>

                                                                    <div className="position-relative z-1 mb-4 d-inline-flex align-items-center justify-content-center rounded-circle" style={{ width: '70px', height: '70px', backgroundColor: 'rgba(0,102,102,0.06)', color: 'var(--primary)' }}>
                                                                        <i className={`fa-solid ${service.icon} fs-3`}></i>
                                                                    </div>
                                                                    <h4 className="fw-bold mb-4 text-dark position-relative z-1" style={{ letterSpacing: '-0.5px' }}>{service.title}</h4>
                                                                    <ul className="list-unstyled mb-0 position-relative z-1">
                                                                        {service.items.map((item, i) => (
                                                                            <li key={i} className="d-flex mb-3 align-items-start">
                                                                                <i className="fa-solid fa-circle-check mt-1 me-3" style={{ color: 'var(--primary)', fontSize: '1.1rem' }}></i>
                                                                                <span className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>{item}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </Card.Body>
                                                            </Card>
                                                        </motion.div>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </motion.div>
                                    )}

                                    {activeTab === 'escort' && (
                                        <motion.div key="escort" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>

                                            <Row className="g-4 justify-content-center">
                                                <Col lg={8}>
                                                    <motion.div whileHover={{ y: -10 }} transition={{ duration: 0.3 }} className="h-100">
                                                        <Card className="h-100 border-0 shadow-sm hover-lift" style={{ borderRadius: '24px', backgroundColor: '#ffffff', overflow: 'hidden' }}>
                                                            <Card.Body className="p-4 p-lg-5 position-relative d-flex flex-column align-items-center text-center">
                                                                <div className="position-absolute" style={{ top: '-30px', left: '-30px', width: '150px', height: '150px', backgroundColor: 'rgba(0,102,102,0.03)', borderRadius: '50%', zIndex: 0 }}></div>
                                                                <div className="position-absolute" style={{ bottom: '-30px', right: '-30px', width: '150px', height: '150px', backgroundColor: 'rgba(0,102,102,0.03)', borderRadius: '50%', zIndex: 0 }}></div>

                                                                <div className="position-relative z-1 mb-4 d-inline-flex align-items-center justify-content-center rounded-circle" style={{ width: '80px', height: '80px', backgroundColor: 'rgba(0,102,102,0.06)', color: 'var(--primary)' }}>
                                                                    <i className="fa-solid fa-wheelchair fs-2"></i>
                                                                </div>
                                                                <h4 className="fw-bold mb-4 text-dark position-relative z-1" style={{ letterSpacing: '-0.5px' }}>Escort Services & Responsibilities</h4>

                                                                <ul className="list-unstyled mb-0 position-relative z-1 text-start d-inline-block mx-auto">
                                                                    {[
                                                                        { title: 'Hospital Stays', desc: 'Continuous monitoring and companionship during admissions.' },
                                                                        { title: 'External Appointments', desc: 'Accompanying patients to clinics and labs.' },
                                                                        { title: 'Medical Translation', desc: "Ensuring full understanding of doctors' instructions." },
                                                                        { title: 'Mobility Support', desc: 'Assisting the patient with movement and transportation.' }
                                                                    ].map((item, i) => (
                                                                        <li key={i} className="d-flex mb-4 align-items-start">
                                                                            <i className="fa-solid fa-circle-check mt-1 me-3" style={{ color: 'var(--primary)', fontSize: '1.2rem' }}></i>
                                                                            <div>
                                                                                <strong className="d-block text-dark mb-1" style={{ fontSize: '1.05rem' }}>{item.title}</strong>
                                                                                <span className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>{item.desc}</span>
                                                                            </div>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </Card.Body>
                                                        </Card>
                                                    </motion.div>
                                                </Col>
                                            </Row>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* 3. The Smart Medical Logbook (Flagship Feature) */}
            <section className="py-5 my-md-5">
                <Container>
                    <Row className="align-items-center g-5">
                        <Col lg={6} className="order-2 order-lg-1">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <p className="text-uppercase fw-bold mb-2" style={{ color: 'var(--primary)', letterSpacing: '1px', fontSize: '0.85rem' }}>
                                    OUR MOST POWERFUL TECH
                                </p>
                                <h2 className="fw-bold text-dark mb-4" style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', letterSpacing: '-1px' }}>
                                    The Smart Digital Logbook
                                </h2>
                                <p className="text-muted mb-4" style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                                    Say goodbye to lost paper records. Our nurses log vital signs <strong>(Blood Pressure, Glucose, Pulse, Temperature)</strong> directly into the Raaya system during each visit.
                                </p>
                                <p className="text-muted mb-4" style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                                    These records are immediately accessible from your personal patient dashboard. You, your family, and remote doctors can track health progress over time through <strong>clear, real-time interactive charts</strong> built straight into our platform.
                                </p>
                            </motion.div>
                        </Col>
                        <Col lg={6} className="order-1 order-lg-2">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="position-relative"
                            >
                                {/* Abstract backdrop */}
                                <div className="position-absolute rounded-circle" style={{ background: 'linear-gradient(135deg, rgba(164,244,207,0.5) 0%, rgba(137,206,255,0.3) 100%)', filter: 'blur(40px)', width: '400px', height: '400px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: -1 }}></div>

                                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" alt="Smart Health Dashboard" className="img-fluid rounded-4 shadow-lg border" style={{ border: '4px solid white', objectFit: 'cover', height: '350px', width: '100%' }} loading="lazy" />

                                {/* Floating Chart Element Simulation */}
                                <div className="position-absolute bg-white rounded-4 shadow-lg p-3 d-flex align-items-center gap-3" style={{ bottom: '-20px', left: '-20px', zIndex: 2 }}>
                                    <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                        <i className="fa-solid fa-heart-pulse"></i>
                                    </div>
                                    <div>
                                        <p className="mb-0 fw-bold" style={{ fontSize: '0.85rem', color: '#64748b' }}>Heart Rate</p>
                                        <h5 className="mb-0 fw-bold text-dark">72 BPM <span className="text-success ms-2" style={{ fontSize: '0.75rem' }}><i className="fa-solid fa-arrow-trend-up"></i> Normal</span></h5>
                                    </div>
                                </div>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* 4. Trust & Transparency Banner */}
            <section className="py-5" style={{ backgroundColor: 'var(--primary)' }}>
                <Container>
                    <Row className="g-4 text-white">
                        {[
                            { icon: 'fa-certificate', title: 'Verified Professionals', text: 'Every specialist undergoes rigorous background checks, interviews, and credential verification.' },
                            { icon: 'fa-wallet', title: 'Transparent Pricing', text: 'No hidden fees whatsoever. Our default "Cash After Session" option guarantees absolute peace of mind.' },
                            { icon: 'fa-star', title: 'Real User Reviews', text: '100% authentic ratings and feedback from real patients and families after verified completed visits.' }
                        ].map((item, idx) => (
                            <Col lg={4} key={idx}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="d-flex flex-column align-items-center text-center h-100 p-3"
                                >
                                    <div className="rounded-circle d-flex align-items-center justify-content-center mb-4 flex-shrink-0" style={{ width: '70px', height: '70px', border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                        <i className={`fa-solid ${item.icon} fs-3 text-white`}></i>
                                    </div>
                                    <div>
                                        <h4 className="fw-bold mb-3 text-white">{item.title}</h4>
                                        <p className="text-white-50 mb-0" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>{item.text}</p>
                                    </div>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* 5. Why Choose Raaya / Smart Features */}
            <section className="py-5" style={{ backgroundColor: '#ffffff' }}>
                <Container className="py-5">
                    <Row className="g-4">
                        {/* Title Block integrated into grid */}
                        <Col lg={4} className="d-flex flex-column justify-content-center text-center text-lg-start mb-4 mb-lg-0 pe-lg-4">
                            <div>
                                <p className="text-uppercase fw-bold mb-2" style={{ color: 'var(--primary)', letterSpacing: '1px', fontSize: '0.85rem' }}>
                                    WHY CHOOSE RAAYA
                                </p>
                                <h2 className="fw-bold text-dark mb-4" style={{ fontSize: 'clamp(2rem, 3vw, 2.4rem)', letterSpacing: '-1px', lineHeight: 1.2 }}>Experience Healthcare Without Friction</h2>
                                <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: 1.8 }}>We combine smart technology with premium services to provide you with the most seamless and reliable home healthcare experience.</p>
                            </div>
                        </Col>
                        <Col lg={4} md={6}>
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }} 
                                whileInView={{ opacity: 1, y: 0 }} 
                                whileHover={{ y: -8 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                                viewport={{ once: true }} 
                                className="h-100"
                            >
                                <Card className="p-4 p-xl-5 h-100 text-center text-md-start border-0" style={{ borderRadius: '24px', backgroundColor: '#fcfcfc', boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
                                    <div className="d-flex align-items-center justify-content-center rounded-circle mb-4 mx-auto mx-md-0" style={{ width: '65px', height: '65px', backgroundColor: 'rgba(0,102,102,0.05)', color: 'var(--primary)' }}>
                                        <i className="fa-solid fa-sliders fs-3"></i>
                                    </div>
                                    <h5 className="fw-bold mb-3 text-dark" style={{ letterSpacing: '-0.5px', fontSize: '1.25rem' }}>Smart Matching Engine</h5>
                                    <p className="text-muted mb-0" style={{ lineHeight: 1.7, fontSize: '0.95rem' }}>
                                        Find your perfect caregiver instantly by filtering nurses by specialization, gender preference, user rating, and precise location.
                                    </p>
                                </Card>
                            </motion.div>
                        </Col>
                        <Col lg={4} md={6}>
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }} 
                                whileInView={{ opacity: 1, y: 0 }} 
                                whileHover={{ y: -8 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.05 }}
                                viewport={{ once: true }} 
                                className="h-100"
                            >
                                <Card className="p-4 p-xl-5 h-100 text-center text-md-start border-0" style={{ borderRadius: '24px', backgroundColor: '#fcfcfc', boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
                                    <div className="d-flex align-items-center justify-content-center rounded-circle mb-4 mx-auto mx-md-0" style={{ width: '65px', height: '65px', backgroundColor: 'rgba(0,102,102,0.05)', color: 'var(--primary)' }}>
                                        <i className="fa-regular fa-comments fs-3"></i>
                                    </div>
                                    <h5 className="fw-bold mb-3 text-dark" style={{ letterSpacing: '-0.5px', fontSize: '1.25rem' }}>Pre-visit Direct Chat</h5>
                                    <p className="text-muted mb-0" style={{ lineHeight: 1.7, fontSize: '0.95rem' }}>
                                        Communicate securely with your assigned nurse before they arrive. Share patient details, access instructions, and prepare them for the case.
                                    </p>
                                </Card>
                            </motion.div>
                        </Col>
                        <Col lg={4} md={6}>
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }} 
                                whileInView={{ opacity: 1, y: 0 }} 
                                whileHover={{ y: -8 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.1 }}
                                viewport={{ once: true }} 
                                className="h-100"
                            >
                                <Card className="p-4 p-xl-5 h-100 text-center text-md-start border-0" style={{ borderRadius: '24px', backgroundColor: '#fcfcfc', boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
                                    <div className="d-flex align-items-center justify-content-center rounded-circle mb-4 mx-auto mx-md-0" style={{ width: '65px', height: '65px', backgroundColor: 'rgba(0,102,102,0.05)', color: 'var(--primary)' }}>
                                        <i className="fa-solid fa-clock-rotate-left fs-3"></i>
                                    </div>
                                    <h5 className="fw-bold mb-3 text-dark" style={{ letterSpacing: '-0.5px', fontSize: '1.25rem' }}>1-Click Re-book</h5>
                                    <p className="text-muted mb-0" style={{ lineHeight: 1.7, fontSize: '0.95rem' }}>
                                        Ensure continuity of care by instantly re-booking your preferred nurse with a single click. Includes flexible 8, 12, or 24-hour shifts scheduling.
                                    </p>
                                </Card>
                            </motion.div>
                        </Col>
                        <Col lg={4} md={6}>
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }} 
                                whileInView={{ opacity: 1, y: 0 }} 
                                whileHover={{ y: -8 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.15 }}
                                viewport={{ once: true }} 
                                className="h-100"
                            >
                                <Card className="p-4 p-xl-5 h-100 text-center text-md-start border-0" style={{ borderRadius: '24px', backgroundColor: '#fcfcfc', boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
                                    <div className="d-flex align-items-center justify-content-center rounded-circle mb-4 mx-auto mx-md-0" style={{ width: '65px', height: '65px', backgroundColor: 'rgba(0,102,102,0.05)', color: 'var(--primary)' }}>
                                        <i className="fa-solid fa-bolt fs-3"></i>
                                    </div>
                                    <h5 className="fw-bold mb-3 text-dark" style={{ letterSpacing: '-0.5px', fontSize: '1.25rem' }}>Urgent Request Path</h5>
                                    <p className="text-muted mb-0" style={{ lineHeight: 1.7, fontSize: '0.95rem' }}>
                                        Bypass standard scheduling for rapid interventions. Our urgent request path ensures nurses arrive promptly to perform required medical tasks.
                                    </p>
                                </Card>
                            </motion.div>
                        </Col>
                        <Col lg={4} md={6}>
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }} 
                                whileInView={{ opacity: 1, y: 0 }} 
                                whileHover={{ y: -8 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.2 }}
                                viewport={{ once: true }} 
                                className="h-100"
                            >
                                <Card className="p-4 p-xl-5 h-100 text-center text-md-start border-0" style={{ borderRadius: '24px', backgroundColor: '#fcfcfc', boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
                                    <div className="d-flex align-items-center justify-content-center rounded-circle mb-4 mx-auto mx-md-0" style={{ width: '65px', height: '65px', backgroundColor: 'rgba(0,102,102,0.05)', color: 'var(--primary)' }}>
                                        <i className="fa-solid fa-user-shield fs-3"></i>
                                    </div>
                                    <h5 className="fw-bold mb-3 text-dark" style={{ letterSpacing: '-0.5px', fontSize: '1.25rem' }}>Professional Medical Escort</h5>
                                    <p className="text-muted mb-0" style={{ lineHeight: 1.7, fontSize: '0.95rem' }}>
                                        Never navigate the healthcare system alone. We provide professional medical escorts to ensure safety, mobility, and clear communication outside the home.
                                    </p>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* 6. How it Works (Stepper/Timeline) */}
            <section className="py-5" style={{ backgroundColor: '#f8fafc' }}>
                <Container className="py-5">
                    <Row className="mb-5 text-center justify-content-center">
                        <Col lg={8}>
                            <p className="text-uppercase fw-bold mb-2" style={{ color: 'var(--primary)', letterSpacing: '1px', fontSize: '0.85rem' }}>
                                WORKFLOW
                            </p>
                            <h2 className="fw-bold text-dark">How Raaya Works</h2>
                        </Col>
                    </Row>

                    <div className="position-relative mt-5">
                        {/* Horizontal Line for Desktop */}
                        <div className="d-none d-lg-block position-absolute" style={{ top: '33px', left: '10%', right: '10%', height: '4px', backgroundColor: '#e2e8f0', zIndex: 0 }}></div>

                        <Row className="gx-4 position-relative z-1">
                            {steps.map((step, idx) => (
                                <Col lg key={idx} className="text-center mb-5 mb-lg-0">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="d-flex flex-column align-items-center"
                                    >
                                        <div className="rounded-circle d-flex align-items-center justify-content-center mb-4" style={{ width: '70px', height: '70px', backgroundColor: 'var(--primary)', color: 'white', border: '6px solid #f8fafc', zIndex: 2, position: 'relative' }}>
                                            <i className={`fa-solid ${step.icon} fs-4`}></i>
                                        </div>
                                        <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.1rem' }}>{idx + 1}. {step.title}</h5>
                                        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>{step.desc}</p>
                                    </motion.div>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </Container>
            </section>

            {/* 7. CTA Section */}
            <section className="py-5 my-5">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="rounded-4 p-5 text-center shadow-lg position-relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)', border: '1px solid #d1efea' }}
                    >
                        {/* Decorative background circle */}
                        <div className="position-absolute rounded-circle" style={{ background: 'rgba(0,102,102,0.05)', width: '300px', height: '300px', top: '-100px', right: '-100px' }}></div>

                        <div className="position-relative z-1">
                            <h2 className="fw-bold text-dark mb-3" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', letterSpacing: '-0.5px' }}>
                                Ready to experience premium home healthcare?
                            </h2>
                            <p className="text-muted mx-auto mb-5" style={{ fontSize: '1.1rem', maxWidth: '600px' }}>
                                Join thousands of families who trust Raaya for their medical needs. Safe, verified, and always reliable.
                            </p>
                            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                                <Button 
                                    className="px-5 py-3 rounded-pill border-0 fw-bold shadow-sm hover-lift text-white" 
                                    style={{ backgroundColor: 'var(--primary)', transition: 'all 0.3s' }}
                                    onClick={() => navigate('/book')}
                                >
                                    Book a Nurse Now
                                </Button>
                                <Button className="btn px-5 py-3 rounded-pill fw-bold shadow-sm hover-lift bg-white" style={{ color: 'var(--primary)', border: '2px solid var(--primary)', transition: 'all 0.3s' }}>
                                    Create an Account
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </Container>
            </section>
        </div>
    );
}
