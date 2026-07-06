import { Container, Row, Col, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Services = () => {
    const services = [
        {
            icon: "fa-person-cane",
            title: "Elderly Care",
            desc: "Full care for bedridden patients, position changes to prevent bedsores, and personal hygiene assistance.",
            highlight: true,
            link: "/services",
            tabId: "resident"
        },
        {
            icon: "fa-bed-pulse",
            title: "Post-operative Care",
            desc: "Professional vitals monitoring, wound dressing, IV antibiotics, and assistance with gradual mobility.",
            highlight: false,
            link: "/services",
            tabId: "resident"
        },
        {
            icon: "fa-heart-pulse",
            title: "Chronic Care",
            desc: "Comprehensive management for heart, diabetes & BP, including daily vital readings and detailed health logs.",
            highlight: false,
            link: "/services",
            tabId: "resident"
        },
        {
            icon: "fa-syringe",
            title: "Basic Care",
            desc: "Rapid interventions including IM/IV injections, cannula insertion, and treating cases of dehydration.",
            highlight: false,
            link: "/services",
            tabId: "urgent"
        },
        {
            icon: "fa-band-aid",
            title: "Wound & Skin Care",
            desc: "Professional dressing for simple and deep wounds, suture removal, and specialized diabetic foot care.",
            highlight: false,
            link: "/services",
            tabId: "urgent"
        },
        {
            icon: "fa-wheelchair",
            title: "Patient Escort",
            desc: "Professional medical escorts for external appointments, hospital stays, and mobility support outside the home.",
            highlight: false,
            link: "/services",
            tabId: "escort"
        }
    ];

    return (
        <section className="py-5" id="services" style={{ backgroundColor: '#f9fafb' }}>
            <Container className="py-4 py-md-5">
                {/* Header */}
                <Row className="mb-5 align-items-center">
                    <Col lg={8} className="mb-4 mb-lg-0">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="d-inline-flex align-items-center rounded-pill px-3 py-2 mb-3 shadow-sm border"
                            style={{ backgroundColor: '#ffffff', borderColor: '#eaeeed', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600' }}
                        >
                            <i className="fa-solid fa-stethoscope me-2"></i> Our Services
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="fw-bold mb-3 text-dark"
                            style={{ fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', letterSpacing: '-0.5px' }}
                        >
                            Comprehensive <span style={{ color: 'var(--primary)' }}>Care</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-muted mb-0"
                            style={{ fontSize: '0.95rem', maxWidth: '600px', lineHeight: 1.6 }}
                        >
                            Explore our wide range of professional home nursing services designed to provide optimal care, comfort, and peace of mind for you and your loved ones.
                        </motion.p>
                    </Col>
                    <Col lg={4} className="text-lg-end">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mt-4 mt-lg-0"
                        >
                            <Link
                                to="/services"
                                onClick={() => window.scrollTo(0, 0)}
                                className="btn btn-outline-primary rounded-pill px-4 py-2 fw-bold"
                                style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                            >
                                View All Services
                            </Link>
                        </motion.div>
                    </Col>
                </Row>

                {/* Grid */}
                <Row className="g-4">
                    {services.map((service, idx) => (
                        <Col lg={4} md={6} key={idx}>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.6 }}
                                className="h-100"
                            >
                                {service.highlight ? (
                                    <div
                                        className="rounded-4 p-4 p-xl-5 text-white h-100 shadow-sm d-flex flex-column service-card"
                                        style={{
                                            backgroundColor: 'var(--primary)',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <div className="mb-4 text-white opacity-75">
                                            <i className={`fa-solid ${service.icon} fs-4`}></i>
                                        </div>
                                        <h3 className="fw-bold mb-3 text-white" style={{ fontSize: '1.1rem' }}>{service.title}</h3>
                                        <p className="text-white text-opacity-75 mb-4" style={{ fontSize: '0.9rem', lineHeight: 1.6, flexGrow: 1 }}>
                                            {service.desc}
                                        </p>
                                        <div>
                                            <Link to={service.link} aria-label={`Learn more about ${service.title}`} state={{ activeTab: service.tabId }} className="text-white fw-bold text-decoration-none d-inline-flex align-items-center link-hover" style={{ fontSize: '0.9rem' }}>
                                                Learn more <i className="fa-solid fa-chevron-right ms-2" style={{ fontSize: '10px' }}></i>
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="rounded-4 p-4 p-xl-5 bg-white h-100 shadow-sm border d-flex flex-column service-card"
                                        style={{ transition: 'all 0.3s ease' }}
                                    >
                                        <div className="mb-4 text-dark opacity-50">
                                            <i className={`fa-solid ${service.icon} fs-4`}></i>
                                        </div>
                                        <h3 className="fw-bold mb-3 text-dark" style={{ fontSize: '1.1rem' }}>{service.title}</h3>
                                        <p className="text-muted mb-4" style={{ fontSize: '0.9rem', lineHeight: 1.6, flexGrow: 1 }}>
                                            {service.desc}
                                        </p>
                                        <div>
                                            <Link to={service.link} aria-label={`Learn more about ${service.title}`} state={{ activeTab: service.tabId }} className="text-dark fw-bold text-decoration-none d-inline-flex align-items-center link-hover" style={{ fontSize: '0.9rem' }}>
                                                Learn more <i className="fa-solid fa-chevron-right ms-2" style={{ fontSize: '10px' }}></i>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </Col>
                    ))}
                </Row>
            </Container>

            <style>{`
                .service-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.06) !important;
                }
                .link-hover {
                    transition: opacity 0.2s ease;
                }
                .link-hover:hover {
                    opacity: 0.6;
                }
                .service-highlight-btn {
                    transition: all 0.3s ease;
                }
                .service-highlight-btn:hover {
                    background-color: #ffffff !important;
                    color: var(--primary) !important;
                }
            `}</style>
        </section>
    );
};

export default Services;
