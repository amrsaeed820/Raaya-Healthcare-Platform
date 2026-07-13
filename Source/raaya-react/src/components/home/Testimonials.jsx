import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';

const Testimonials = () => {
    const reviews = [
        {
            name: "Eleanor Vance",
            role: "Daughter of Patient",
            quote: "The level of professionalism from Ra'aya was beyond our expectations. Nurse Sarah became like family during my father's recovery.",
            img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
            rating: 5
        },
        {
            name: "David Marcus",
            role: "Primary Caregiver",
            quote: "Having a real-time log of my mother's vitals gave us such peace of mind while we were at work. Ra'aya is a game-changer.",
            img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
            rating: 5
        },
        {
            name: "Sophia Taylor",
            role: "Patient",
            quote: "The convenience of booking a lab test at home is incredible. The staff was punctual, very professional, and extremely gentle.",
            img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
            rating: 5
        }
    ];

    // Double the array to ensure the track is wider than the screen
    const trackReviews = [...reviews, ...reviews];

    return (
        <section className="py-5" id="testimonials" style={{ backgroundColor: '#ffffff', overflowX: 'hidden' }}>
            <Container fluid className="py-4 py-md-5 px-xl-5">
                <Row className="align-items-center">
                    
                    {/* Left Static Column */}
                    <Col lg={4} xl={3} className="mb-5 mb-lg-0 position-relative ps-lg-5" style={{ zIndex: 10 }}>
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="pe-lg-4 text-center text-lg-start"
                        >
                            {/* Badge */}
                            <div 
                                className="d-inline-flex align-items-center rounded-pill px-3 py-2 mb-3 shadow-sm border"
                                style={{ backgroundColor: '#ffffff', borderColor: '#eaeeed', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600' }}
                            >
                                <i className="fa-solid fa-shield-halved me-2"></i> Testimonials
                            </div>
                            
                            {/* Title */}
                            <h2 
                                className="fw-bold text-dark mb-4" 
                                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-1px', lineHeight: 1.1 }}
                            >
                                Families We've <span style={{ color: 'var(--primary)' }}>Embraced</span>
                            </h2>
                            
                            {/* Rating */}
                            <div className="d-flex justify-content-center justify-content-lg-start text-warning mb-2" style={{ fontSize: '1.2rem' }}>
                                {[1, 2, 3, 4, 5].map((_, i) => (
                                    <i key={i} className="fa-solid fa-star me-1"></i>
                                ))}
                            </div>
                            <p className="text-muted fw-bold" style={{ fontSize: '1.05rem', color: '#ff8c00' }}>5.0 Average Rating</p>
                        </motion.div>
                    </Col>

                    {/* Right Scrolling Column */}
                    <Col lg={8} xl={9} className="position-relative p-0">
                        
                        {/* Gradient Fade Overlays */}
                        <div className="position-absolute top-0 bottom-0 start-0 z-1 d-none d-lg-block" style={{ width: '100px', background: 'linear-gradient(to right, #ffffff, transparent)' }}></div>
                        <div className="position-absolute top-0 bottom-0 end-0 z-1" style={{ width: '100px', background: 'linear-gradient(to left, #ffffff, transparent)' }}></div>

                        {/* Marquee Container */}
                        <div className="marquee-container d-flex">
                            
                            {/* Track 1 */}
                            <div className="marquee-track d-flex gap-4 pb-4 pt-3 px-2">
                                {trackReviews.map((review, idx) => (
                                    <Card key={`t1-${idx}`} className="border-0 shadow-sm rounded-4 flex-shrink-0 testimonial-card" style={{ width: '380px', border: '1px solid rgba(0,0,0,0.04)' }}>
                                        <Card.Body className="p-4 p-xl-5 d-flex flex-column h-100 card-body-transition">
                                            <p className="mb-4 fst-italic card-text-transition" style={{ fontSize: '1.05rem', lineHeight: 1.7, flexGrow: 1 }}>
                                                "{review.quote}"
                                            </p>
                                            <div className="d-flex align-items-center gap-3 mt-auto">
                                                <img src={review.img} alt={review.name} className="rounded-circle shadow-sm" width="50" height="50" style={{ objectFit: 'cover' }} loading="lazy" />
                                                <div>
                                                    <h3 className="mb-1 fw-bold card-title-transition m-0" style={{ fontSize: '1rem' }}>{review.name}</h3>
                                                    <span className="card-role-transition" style={{ fontSize: '0.85rem' }}>{review.role}</span>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                            
                            {/* Track 2 (Duplicate for infinite loop) */}
                            <div className="marquee-track d-flex gap-4 pb-4 pt-3 px-2" aria-hidden="true">
                                {trackReviews.map((review, idx) => (
                                    <Card key={`t2-${idx}`} className="border-0 shadow-sm rounded-4 flex-shrink-0 testimonial-card" style={{ width: '380px', border: '1px solid rgba(0,0,0,0.04)' }}>
                                        <Card.Body className="p-4 p-xl-5 d-flex flex-column h-100 card-body-transition">
                                            <p className="mb-4 fst-italic card-text-transition" style={{ fontSize: '1.05rem', lineHeight: 1.7, flexGrow: 1 }}>
                                                "{review.quote}"
                                            </p>
                                            <div className="d-flex align-items-center gap-3 mt-auto">
                                                <img src={review.img} alt={review.name} className="rounded-circle shadow-sm" width="50" height="50" style={{ objectFit: 'cover' }} loading="lazy" />
                                                <div>
                                                    <h3 className="mb-1 fw-bold card-title-transition m-0" style={{ fontSize: '1rem' }}>{review.name}</h3>
                                                    <span className="card-role-transition" style={{ fontSize: '0.85rem' }}>{review.role}</span>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                            
                        </div>
                    </Col>
                </Row>
            </Container>

            <style>{`
                /* Infinite Marquee Animation */
                .marquee-container {
                    overflow: hidden;
                    width: 100%;
                }
                .marquee-track {
                    animation: scroll-left 40s linear infinite;
                    flex-shrink: 0;
                    padding-right: 1.5rem; /* Match the gap so loop is seamless */
                }
                
                /* Pause on hover */
                .marquee-container:hover .marquee-track {
                    animation-play-state: paused;
                }
                
                @keyframes scroll-left {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }

                /* Card Styling */
                .testimonial-card {
                    background-color: white;
                    cursor: pointer;
                    transition: transform 0.4s ease, box-shadow 0.4s ease, background-color 0.4s ease;
                }
                .card-body-transition { transition: all 0.4s ease; }
                .card-text-transition { color: #495057; transition: color 0.4s ease; }
                .card-title-transition { color: var(--primary); transition: color 0.4s ease; }
                .card-role-transition { color: #6c757d; transition: color 0.4s ease; }

                /* Card Hover State */
                .testimonial-card:hover {
                    transform: translateY(-8px);
                    background-color: var(--primary);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.15) !important;
                }
                .testimonial-card:hover .card-text-transition {
                    color: rgba(255,255,255,0.95) !important;
                }
                .testimonial-card:hover .card-title-transition {
                    color: #ffffff !important;
                }
                .testimonial-card:hover .card-role-transition {
                    color: rgba(255,255,255,0.7) !important;
                }
            `}</style>
        </section>
    );
};

export default Testimonials;
