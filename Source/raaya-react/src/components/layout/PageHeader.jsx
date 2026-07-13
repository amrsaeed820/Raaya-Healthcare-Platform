import { Container } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const PageHeader = ({ title, breadcrumbs, description }) => {
    return (
        <section className="position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)', minHeight: '250px', display: 'flex', alignItems: 'center' }}>
            {/* Decorative Blobs matching the site's identity */}
            <div className="position-absolute rounded-circle" style={{ width: '400px', height: '400px', background: 'rgba(20, 184, 166, 0.08)', top: '-100px', right: '-100px', filter: 'blur(60px)' }}></div>
            <div className="position-absolute rounded-circle" style={{ width: '300px', height: '300px', background: 'rgba(59, 130, 246, 0.05)', bottom: '-50px', left: '-50px', filter: 'blur(50px)' }}></div>
            <div className="position-absolute rounded-circle" style={{ width: '250px', height: '250px', background: 'rgba(255, 123, 41, 0.05)', top: '50px', left: '40%', filter: 'blur(60px)' }}></div>
            
            <Container className="position-relative z-1 py-4 text-center">
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="fw-bold text-dark mb-3" 
                    style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-1px' }}
                >
                    {title}
                </motion.h1>
                
                {description && (
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-muted mx-auto mb-3"
                        style={{ maxWidth: '750px', fontSize: '1rem', lineHeight: 1.6 }}
                    >
                        {description}
                    </motion.p>
                )}

                {breadcrumbs && breadcrumbs.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="d-flex align-items-center justify-content-center gap-2 mt-4" 
                        style={{ fontSize: '0.95rem', fontWeight: '500' }}
                    >
                        {breadcrumbs.map((crumb, idx) => (
                            <span key={idx} className="d-flex align-items-center gap-2">
                                {idx > 0 && <i className="fa-solid fa-angle-right text-muted" style={{ fontSize: '0.75rem' }}></i>}
                                {crumb.link ? (
                                    <Link to={crumb.link} className="text-muted text-decoration-none transition-colors hover-primary">
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-primary fw-bold">{crumb.label}</span>
                                )}
                            </span>
                        ))}
                    </motion.div>
                )}
            </Container>
            <style>{`
                .hover-primary {
                    transition: color 0.2s ease;
                }
                .hover-primary:hover {
                    color: var(--primary) !important;
                }
            `}</style>
        </section>
    );
};

export default PageHeader;
