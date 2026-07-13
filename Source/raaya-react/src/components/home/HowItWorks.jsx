import { useState } from 'react';
import { Container, Button, Card, Row, Col } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';

const HowItWorks = () => {
    const [activeTab, setActiveTab] = useState('patient');

    const patientSteps = [
        { id: 1, title: "Choose the Service", text: "Browse 15+ home medical services with transparent fixed pricing. No negotiation — what you see is what you pay." },
        { id: 2, title: "Set Location & Time", text: "Use GPS to auto-detect your address or enter it manually, then pick the time slot that suits you best." },
        { id: 3, title: "Receive the Nurse", text: "We automatically assign the closest certified nurse. Track their location on the map until arrival in under 15 minutes." },
        { id: 4, title: "Pay & Rate", text: "After the visit, pay securely and rate the nurse. Your feedback helps us maintain top-quality service for everyone." }
    ];

    const nurseSteps = [
        { id: 1, title: "Create Your Profile", text: "Sign up, upload your credentials and certifications, and complete a quick verification to join our network." },
        { id: 2, title: "Get Verified", text: "Our team reviews your documents within 24 hours. Once approved, you're ready to start accepting requests." },
        { id: 3, title: "Accept Requests", text: "Receive nearby visit requests in real time. Choose the ones that fit your schedule and head to the patient." },
        { id: 4, title: "Get Paid Instantly", text: "Earnings are deposited directly after each completed visit. Track your performance and grow your reputation." }
    ];

    const steps = activeTab === 'patient' ? patientSteps : nurseSteps;

    return (
        <section className="py-5" style={{ backgroundColor: '#ffffff' }} id="how-it-works">
            <Container className="py-4 py-md-5">
                <div className="text-center mb-5 pb-4">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="d-inline-flex align-items-center rounded-pill px-3 py-2 mb-3 shadow-sm border"
                        style={{ backgroundColor: '#ffffff', borderColor: '#eaeeed', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600' }}
                    >
                        <i className="fa-solid fa-wand-magic-sparkles me-2"></i> How It Works
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="fw-bold text-dark mb-3" 
                        style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', letterSpacing: '-0.5px' }}
                    >
                        Just <span style={{ color: 'var(--primary)' }}>4 simple steps</span> to home care
                    </motion.h2>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-muted mb-5 mx-auto"
                        style={{ maxWidth: '700px', fontSize: '1rem', lineHeight: 1.6 }}
                    >
                        Whether you're a patient who needs care or a nurse looking for organized work — we built it to be simple for both of you.
                    </motion.p>
                    
                    {/* Toggle Buttons */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="bg-white p-1 rounded-pill shadow-sm d-inline-flex border"
                        style={{ borderColor: '#eaeeed' }}
                    >
                        <Button 
                            variant="light"
                            className={`rounded-pill px-4 py-2 border-0 fw-bold d-flex align-items-center gap-2 transition-all`}
                            onClick={() => setActiveTab('patient')}
                            style={{
                                backgroundColor: activeTab === 'patient' ? 'var(--primary)' : 'transparent',
                                color: activeTab === 'patient' ? 'white' : '#6b7280',
                                fontSize: '0.9rem'
                            }}
                        >
                            <i className="fa-regular fa-user"></i> For Patient
                        </Button>
                        <Button 
                            variant="light"
                            className={`rounded-pill px-4 py-2 border-0 fw-bold d-flex align-items-center gap-2 transition-all`}
                            onClick={() => setActiveTab('nurse')}
                            style={{
                                backgroundColor: activeTab === 'nurse' ? 'var(--primary)' : 'transparent',
                                color: activeTab === 'nurse' ? 'white' : '#6b7280',
                                fontSize: '0.9rem'
                            }}
                        >
                            <i className="fa-solid fa-user-nurse"></i> For Nurse
                        </Button>
                    </motion.div>
                </div>

                {/* Timeline */}
                <div className="position-relative mx-auto mt-5" style={{ maxWidth: '900px', padding: '20px 0' }}>
                    {/* Vertical Line */}
                    <motion.div 
                        initial={{ height: 0 }}
                        whileInView={{ height: '100%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        className="position-absolute top-0 start-50 translate-middle-x d-none d-md-block" 
                        style={{ width: '2px', backgroundColor: 'rgba(2, 89, 85, 0.3)' }}
                    />
                    
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {steps.map((step, index) => {
                                // 0 (Step 1) -> Left Card, Right Num. 1 (Step 2) -> Right Card, Left Num.
                                const isRightCard = index % 2 !== 0; 
                                
                                return (
                                    <div key={step.id} className="position-relative mb-4 mb-md-5 w-100 timeline-row" style={{ minHeight: '140px' }}>
                                        
                                        {/* Mobile Vertical Line */}
                                        <div className="position-absolute top-0 bottom-0 start-0 ms-3 d-md-none" style={{ width: '2px', backgroundColor: 'rgba(2, 89, 85, 0.3)' }}></div>
                                        
                                        <Row className="align-items-center m-0 w-100">
                                            {/* Left Column */}
                                            <Col md={6} className={`d-flex ${!isRightCard ? 'justify-content-md-end ps-5 ps-md-3 pe-md-5 mb-4 mb-md-0' : 'justify-content-md-end align-items-center d-none d-md-flex pe-md-5'}`}>
                                                {!isRightCard ? (
                                                    <motion.div 
                                                        initial={{ opacity: 0, x: -50 }}
                                                        whileInView={{ opacity: 1, x: 0 }}
                                                        viewport={{ once: true, margin: "-50px" }}
                                                        transition={{ duration: 0.5, delay: 0.1 }}
                                                        className="w-100 timeline-card-wrapper"
                                                        style={{ maxWidth: '380px' }}
                                                    >
                                                        <Card className="border shadow-sm rounded-4 text-start w-100 timeline-card" style={{ borderColor: '#f3f4f6' }}>
                                                            <Card.Body className="p-4 p-xl-5 card-body-transition">
                                                                <h3 className="fw-bold mb-3 card-title-transition" style={{ fontSize: '1.25rem' }}>{step.title}</h3>
                                                                <p className="mb-0 card-text-transition" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{step.text}</p>
                                                            </Card.Body>
                                                        </Card>
                                                    </motion.div>
                                                ) : (
                                                    /* Number on Left for Right-side cards */
                                                    <motion.div 
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        whileInView={{ scale: 1, opacity: 1 }}
                                                        viewport={{ once: true, margin: "-50px" }}
                                                        transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
                                                        className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center" 
                                                        style={{ 
                                                            width: '50px', height: '50px', fontSize: '1.2rem',
                                                            backgroundColor: 'var(--primary)',
                                                            boxShadow: '0 0 20px rgba(2, 89, 85, 0.4)'
                                                        }}
                                                    >
                                                        {step.id}
                                                    </motion.div>
                                                )}
                                            </Col>

                                            {/* Right Column */}
                                            <Col md={6} className={`d-flex ${isRightCard ? 'justify-content-md-start ps-5 ps-md-5' : 'justify-content-md-start align-items-center d-none d-md-flex ps-md-5'}`}>
                                                {isRightCard ? (
                                                    <motion.div 
                                                        initial={{ opacity: 0, x: 50 }}
                                                        whileInView={{ opacity: 1, x: 0 }}
                                                        viewport={{ once: true, margin: "-50px" }}
                                                        transition={{ duration: 0.5, delay: 0.1 }}
                                                        className="w-100 timeline-card-wrapper"
                                                        style={{ maxWidth: '380px' }}
                                                    >
                                                        <Card className="border shadow-sm rounded-4 text-start w-100 timeline-card" style={{ borderColor: '#f3f4f6' }}>
                                                            <Card.Body className="p-4 p-xl-5 card-body-transition">
                                                                <h3 className="fw-bold mb-3 card-title-transition" style={{ fontSize: '1.25rem' }}>{step.title}</h3>
                                                                <p className="mb-0 card-text-transition" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{step.text}</p>
                                                            </Card.Body>
                                                        </Card>
                                                    </motion.div>
                                                ) : (
                                                    /* Number on Right for Left-side cards */
                                                    <motion.div 
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        whileInView={{ scale: 1, opacity: 1 }}
                                                        viewport={{ once: true, margin: "-50px" }}
                                                        transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
                                                        className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center" 
                                                        style={{ 
                                                            width: '50px', height: '50px', fontSize: '1.2rem',
                                                            backgroundColor: 'var(--primary)',
                                                            boxShadow: '0 0 20px rgba(2, 89, 85, 0.4)'
                                                        }}
                                                    >
                                                        {step.id}
                                                    </motion.div>
                                                )}
                                            </Col>
                                        </Row>

                                        {/* Mobile Node (Hidden on Desktop) */}
                                        <div className="position-absolute start-0 ms-3 translate-middle-x d-flex align-items-center justify-content-center d-md-none" style={{ zIndex: 5, top: '24px' }}>
                                            <motion.div 
                                                initial={{ scale: 0, opacity: 0 }}
                                                whileInView={{ scale: 1, opacity: 1 }}
                                                viewport={{ once: true, margin: "-50px" }}
                                                transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
                                                className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center" 
                                                style={{ 
                                                    width: '35px', height: '35px', fontSize: '1rem',
                                                    backgroundColor: 'var(--primary)',
                                                    boxShadow: '0 0 15px rgba(2, 89, 85, 0.4)'
                                                }}
                                            >
                                                {step.id}
                                            </motion.div>
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </Container>

            <style>{`
                .timeline-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
                    background-color: white;
                }
                .card-title-transition {
                    color: #212529;
                    transition: color 0.3s ease;
                }
                .card-text-transition {
                    color: #6c757d;
                    transition: color 0.3s ease;
                }
                
                /* Hover Effects */
                .timeline-card-wrapper:hover .timeline-card {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
                    background-color: var(--primary);
                }
                .timeline-card-wrapper:hover .card-title-transition {
                    color: white !important;
                }
                .timeline-card-wrapper:hover .card-text-transition {
                    color: rgba(255, 255, 255, 0.85) !important;
                }

                .transition-all {
                    transition: all 0.3s ease;
                }
                
                @media (min-width: 768px) {
                    .timeline-node {
                        top: 50% !important;
                        transform: translate(-50%, -50%) !important;
                    }
                }
                @media (max-width: 767px) {
                    .timeline-node {
                        transform: translateX(-50%) !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default HowItWorks;
