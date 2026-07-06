import { Container, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CTA = () => {
    const navigate = useNavigate();
    return (
        <section className="py-5" style={{ backgroundColor: '#ffffff' }}>
            <Container className="py-4 py-md-5">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="position-relative rounded-5 overflow-hidden shadow-lg p-4 p-md-5 mx-auto"
                    style={{ 
                        background: 'linear-gradient(135deg, var(--primary) 0%, #03756f 100%)',
                        maxWidth: '1200px'
                    }}
                >
                    {/* Decorative abstract shapes */}
                    <div className="position-absolute top-0 end-0 p-5 opacity-25 d-none d-lg-block" style={{ transform: 'translate(20%, -20%)' }}>
                        <svg width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                          <path fill="#ffffff" d="M45,-76.3C58.3,-69.1,69.1,-55.8,76.5,-41.2C83.9,-26.7,87.9,-11,85.2,3.8C82.5,18.5,73,32.3,61.9,43.3C50.8,54.2,38.1,62.3,23.9,69.5C9.8,76.6,-5.7,82.8,-19.9,79.5C-34.1,76.1,-46.9,63.1,-58.5,50C-70.2,36.8,-80.6,23.6,-83.4,9C-86.2,-5.7,-81.4,-21.8,-72,-34.5C-62.5,-47.2,-48.4,-56.4,-34.8,-63.3C-21.2,-70.2,-8,-74.8,3.9,-81.4C15.8,-87.9,31.7,-83.5,45,-76.3Z" transform="translate(100 100)" />
                        </svg>
                    </div>
                    
                    <div className="position-absolute bottom-0 start-0 p-5 opacity-25 d-none d-md-block" style={{ transform: 'translate(-30%, 30%)' }}>
                        <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                          <path fill="#ffffff" d="M38.1,-63.5C51.6,-54.6,66.2,-47.3,75.9,-35.1C85.5,-22.9,90.2,-5.7,87,10.2C83.8,26.1,72.7,40.6,60,52.2C47.2,63.8,32.8,72.5,16.5,77.7C0.1,82.9,-18.2,84.7,-34.7,79.2C-51.2,73.8,-65.9,61.2,-74.6,45.8C-83.3,30.3,-86,12.1,-81.2,-3.9C-76.4,-19.8,-64.1,-33.5,-51.2,-43.3C-38.3,-53.1,-24.8,-59,-10.8,-63.6C3.2,-68.2,18,-71.4,38.1,-63.5Z" transform="translate(100 100)" />
                        </svg>
                    </div>

                    <div className="position-relative z-1 text-center py-4 py-lg-5">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-white fw-bold mb-4" 
                            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-1px' }}
                        >
                            Ready to heal at home?
                        </motion.h2>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-white text-opacity-75 mb-5 mx-auto fs-5"
                            style={{ maxWidth: '700px', lineHeight: 1.6 }}
                        >
                            Join thousands of families who trust Raaya for their home healthcare needs. Book your first visit today and experience the difference.
                        </motion.p>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="d-flex flex-column flex-sm-row justify-content-center gap-3"
                        >
                            <Button 
                                variant="light" 
                                size="lg" 
                                className="fw-bold px-5 py-3 rounded-pill shadow-sm d-flex align-items-center justify-content-center cta-btn-primary border-0"
                                style={{ color: 'var(--primary)' }}
                                onClick={() => navigate('/book')}
                            >
                                Book a Nurse Now <i className="fa-solid fa-arrow-right ms-2 transition-transform"></i>
                            </Button>
                            
                            <Button 
                                variant="outline-light" 
                                size="lg" 
                                className="fw-bold px-5 py-3 rounded-pill border-2 d-flex align-items-center justify-content-center cta-btn-outline"
                                onClick={() => navigate('/services')}
                            >
                                Explore Services
                            </Button>
                        </motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                            className="mt-5 pt-3 d-flex justify-content-center align-items-center gap-4 text-white text-opacity-75 flex-wrap"
                        >
                            <span className="d-flex align-items-center fw-medium"><i className="fa-solid fa-check-circle me-2 text-white opacity-50"></i> No hidden fees</span>
                            <span className="d-flex align-items-center fw-medium"><i className="fa-solid fa-check-circle me-2 text-white opacity-50"></i> Certified professionals</span>
                            <span className="d-flex align-items-center fw-medium"><i className="fa-solid fa-check-circle me-2 text-white opacity-50"></i> 24/7 Support</span>
                        </motion.div>
                    </div>
                </motion.div>
            </Container>

            <style>{`
                .cta-btn-primary {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .cta-btn-primary:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
                }
                .cta-btn-primary:hover i {
                    transform: translateX(5px);
                }
                .cta-btn-outline {
                    transition: all 0.3s ease;
                }
                .cta-btn-outline:hover {
                    background-color: white !important;
                    color: var(--primary) !important;
                    transform: translateY(-3px);
                }
            `}</style>
        </section>
    );
};

export default CTA;
