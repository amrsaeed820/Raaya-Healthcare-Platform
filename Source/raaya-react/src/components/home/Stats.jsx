import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';

const Stats = () => {
    return (
        <section className="section-padding bg-soft" id="about">
            <Container>
                {/* Header */}
                <div className="text-center mb-5 pb-3">
                    <div className="section-badge bg-white shadow-sm border mb-3 d-inline-flex align-items-center rounded-pill px-3 py-2">
                        <i className="fa-solid fa-shield-halved text-primary me-2"></i> Who we are
                    </div>
                    <h2 className="section-title">About <span className="text-primary">Raaya</span></h2>
                    <p className="section-subtitle">
                        India's most trusted healthcare platform, connecting patients with quality healthcare
                    </p>
                </div>

                {/* Stat Cards */}
                <Row className="g-4 mb-5 pb-5">
                    {[
                        { num: "50,000+", text: "Verified Nurses", icon: "fa-user-nurse" },
                        { num: "10K+", text: "Appointments Booked", icon: "fa-calendar-check" },
                        { num: "100+", text: "Cities Covered", icon: "fa-location-dot" },
                        { num: "4.8★", text: "Patient Rating", icon: "fa-medal" }
                    ].map((stat, idx) => (
                        <Col lg={3} md={6} key={idx}>
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                className="h-100"
                            >
                                <Card className="border-0 shadow-sm rounded-4 h-100 text-center p-4 card-hover">
                                    <div className="mx-auto bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center mb-3" style={{width: '50px', height: '50px'}}>
                                        <i className={`fa-solid ${stat.icon} fs-5`}></i>
                                    </div>
                                    <h3 className="fw-bold fs-2 text-dark mb-1">{stat.num}</h3>
                                    <p className="text-muted small mb-0 fw-medium">{stat.text}</p>
                                </Card>
                            </motion.div>
                        </Col>
                    ))}
                </Row>

                {/* Mission Section */}
                <Row className="align-items-center g-5 pt-3">
                    {/* Image Column */}
                    <Col lg={6}>
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="position-relative"
                        >
                            <div className="rounded-5 overflow-hidden shadow-lg position-relative" style={{height: '450px'}}>
                                <img 
                                    src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1000" 
                                    alt="Medical Team" 
                                    className="w-100 h-100 object-fit-cover"
                                    loading="lazy"
                                />
                                <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'}}>
                                    <h4 className="text-white fw-bold mb-1">Our Team of Healthcare Experts</h4>
                                    <p className="text-white text-opacity-75 mb-0 small">Dedicated to your health and wellness</p>
                                </div>
                            </div>
                        </motion.div>
                    </Col>

                    {/* Content Column */}
                    <Col lg={6}>
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h3 className="fw-bold mb-3 fs-2 text-dark">Our Mission</h3>
                            <p className="text-muted mb-4 lh-lg">
                                We believe everyone deserves access to quality healthcare. Our mission is to make healthcare accessible, affordable, and convenient for all Egyptians. Through technology and innovation, we're bridging the gap between patients and healthcare providers.
                            </p>

                            <div className="d-flex flex-column gap-4 mb-4">
                                {[
                                    { title: "Patient-First Approach", text: "Every decision we make is guided by what's best for our patients' health and wellbeing.", icon: "fa-heart" },
                                    { title: "Trust & Transparency", text: "Verified doctors, genuine reviews, and transparent pricing. No hidden charges ever.", icon: "fa-shield-halved" },
                                    { title: "Quality Healthcare", text: "Partnered with top hospitals and experienced doctors to deliver the best care possible.", icon: "fa-award" }
                                ].map((item, idx) => (
                                    <div key={idx} className="d-flex align-items-start gap-3">
                                        <div className="bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{width: '45px', height: '45px'}}>
                                            <i className={`fa-solid ${item.icon}`}></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-1 text-dark">{item.title}</h6>
                                            <p className="text-muted small mb-0 lh-base">{item.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button style={{backgroundColor: 'var(--primary)', borderColor: 'var(--primary)'}} className="rounded-pill px-4 py-2 mt-2 fw-bold border-0 shadow-sm text-white">
                                Learn More About Us <i className="fa-solid fa-arrow-right ms-2"></i>
                            </Button>
                        </motion.div>
                    </Col>
                </Row>
            </Container>
            <style>{`
                .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
                .card-hover:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,77,64,0.1) !important; }
            `}</style>
        </section>
    );
};

export default Stats;
