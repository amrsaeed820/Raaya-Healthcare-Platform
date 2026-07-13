import { Container, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ArticleDetailsPage = () => {
    const { id } = useParams();

    // Mock article data
    const article = {
        title: "The Future of Digital Innovation in 2025",
        description: "Explore how emerging technologies are reshaping industries and creating new opportunities for businesses and individuals alike. From AI to blockchain, discover the trends that will define the next decade.",
        category: "Featured Article",
        author: "Dr. Salma Tarek",
        date: "Nov 3, 2025",
        readTime: "8 min read",
        img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200",
        content: `
            <h2 id="intro">Introduction</h2>
            <p>The pace of digital innovation is accelerating at an unprecedented rate. As we look toward 2025, several key technologies are poised to move from the fringes into the mainstream, fundamentally altering how we live, work, and interact with the world around us. Healthcare, in particular, is experiencing a renaissance driven by connected devices and data analytics.</p>
            
            <h2 id="ai">The Rise of AI in Everyday Life</h2>
            <p>Artificial Intelligence is no longer just a buzzword; it's becoming an integral part of our daily routines. From predictive text and smart home devices to advanced medical diagnostics, AI is making systems smarter and more efficient. By 2025, we can expect AI to be deeply embedded in almost all digital services, offering highly personalized experiences and rapid response times for critical healthcare needs.</p>
            
            <h2 id="blockchain">Blockchain Beyond Cryptocurrency</h2>
            <p>While blockchain is best known as the underlying technology for cryptocurrencies, its potential extends far beyond finance. In the coming years, we'll see blockchain used for secure data sharing, supply chain transparency, and even voting systems. Its decentralized nature offers a new level of security and trust in digital transactions, especially for sensitive medical records.</p>
            
            <h2 id="healthcare">The Impact on Healthcare</h2>
            <p>Digital innovation is particularly transformative in healthcare. Telemedicine, wearable health monitors, and AI-driven diagnostics are making healthcare more accessible and personalized. By 2025, proactive health monitoring will likely become standard practice, shifting the focus from treatment to prevention. Home healthcare services will leverage these tools to provide hospital-grade care in the comfort of patients' homes.</p>
            
            <h2 id="conclusion">Conclusion</h2>
            <p>The future of digital innovation is bright, but it requires careful navigation. As we embrace these new technologies, we must also address the ethical and security challenges they present. By doing so, we can ensure that the digital revolution benefits everyone, empowering both patients and care providers with better tools and deeper insights.</p>
        `
    };

    const [activeSection, setActiveSection] = useState('intro');

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['intro', 'ai', 'blockchain', 'healthcare', 'conclusion'];
            let current = 'intro';

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    // Offset by 150px to trigger earlier
                    if (rect.top <= 150) {
                        current = section;
                    }
                }
            }
            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (e, id) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -100;
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div className="pt-5" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <Container className="py-5 mt-4">
                
                {/* Back Link */}
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-4"
                >
                    <Link to="/articles" className="text-decoration-none fw-bold d-inline-flex align-items-center" style={{ color: 'var(--primary)' }}>
                        <i className="fa-solid fa-arrow-left me-2"></i> Back to Articles
                    </Link>
                </motion.div>

                {/* Hero Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-4 overflow-hidden shadow-sm mb-5 position-relative bg-white"
                    style={{ border: '1px solid rgba(0,0,0,0.04)' }}
                >
                    <Row className="g-0 align-items-stretch">
                        <Col lg={7} className="p-4 p-md-5 d-flex flex-column justify-content-center" style={{ backgroundColor: 'rgba(20, 184, 166, 0.03)' }}>
                            <div className="d-flex mb-3">
                                <div className="rounded-2 px-3 py-1 shadow-sm" style={{ backgroundColor: 'var(--primary)', color: 'white', fontSize: '0.85rem', fontWeight: '600' }}>
                                    {article.category}
                                </div>
                            </div>
                            <h1 className="fw-bold text-dark mb-4" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', letterSpacing: '-1px', lineHeight: 1.2 }}>
                                {article.title}
                            </h1>
                            <p className="text-muted mb-4" style={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                                {article.description}
                            </p>
                            <div className="d-flex flex-wrap align-items-center gap-4 text-muted fw-medium mt-auto pt-4 border-top" style={{ fontSize: '0.95rem', borderColor: 'rgba(0,0,0,0.05) !important' }}>
                                <div className="d-flex align-items-center">
                                    <i className="fa-regular fa-user me-2" style={{ color: 'var(--primary)' }}></i>
                                    {article.author}
                                </div>
                                <div className="d-flex align-items-center">
                                    <i className="fa-regular fa-clock me-2" style={{ color: 'var(--primary)' }}></i>
                                    {article.readTime}
                                </div>
                                <div className="d-flex align-items-center">
                                    <i className="fa-regular fa-calendar me-2" style={{ color: 'var(--primary)' }}></i>
                                    {article.date}
                                </div>
                            </div>
                        </Col>
                        <Col lg={5} className="d-none d-lg-block p-4" style={{ backgroundColor: 'rgba(20, 184, 166, 0.03)' }}>
                            <div className="rounded-4 overflow-hidden shadow-sm h-100 w-100" style={{ minHeight: '350px', backgroundImage: `url(${article.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                            </div>
                        </Col>
                    </Row>
                </motion.div>

                {/* Content Section */}
                <Row className="g-4 g-lg-5">
                    {/* Sidebar / Table of Contents */}
                    <Col lg={3}>
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="sticky-top rounded-4 p-4 shadow-sm bg-white" 
                            style={{ top: '100px', border: '1px solid rgba(0,0,0,0.04)' }}
                        >
                            <div className="position-relative ps-3" style={{ borderLeft: '3px solid rgba(20, 184, 166, 0.2)' }}>
                                
                                <h6 className="fw-bold mb-4 text-dark text-uppercase" style={{ letterSpacing: '0.5px', fontSize: '0.9rem' }}>Table of Contents</h6>
                                <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                                    {[
                                        { id: 'intro', label: 'Introduction' },
                                        { id: 'ai', label: 'The Rise of AI' },
                                        { id: 'blockchain', label: 'Blockchain Tech' },
                                        { id: 'healthcare', label: 'Healthcare Impact' },
                                        { id: 'conclusion', label: 'Conclusion' }
                                    ].map((item) => (
                                        <li key={item.id} className="position-relative">
                                            {activeSection === item.id && (
                                                <motion.div 
                                                    layoutId="toc-indicator"
                                                    className="position-absolute"
                                                    style={{ 
                                                        left: 'calc(-1rem - 3px)', // Exactly over the border
                                                        top: '0',
                                                        bottom: '0',
                                                        width: '3px',
                                                        backgroundColor: 'var(--primary)',
                                                        borderRadius: '4px'
                                                    }}
                                                    initial={false}
                                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                                />
                                            )}
                                            <a 
                                                href={`#${item.id}`} 
                                                onClick={(e) => scrollToSection(e, item.id)}
                                                className={`text-decoration-none transition-colors ${activeSection === item.id ? 'fw-bold' : 'text-muted fw-medium'}`} 
                                                style={{ 
                                                    color: activeSection === item.id ? 'var(--primary)' : 'inherit',
                                                    fontSize: '0.95rem' 
                                                }}
                                            >
                                                {item.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    </Col>

                    {/* Main Article Content */}
                    <Col lg={9}>
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-4 p-4 p-md-5 shadow-sm"
                            style={{ border: '1px solid rgba(0,0,0,0.04)' }}
                        >
                            <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
                        </motion.div>
                    </Col>
                </Row>
            </Container>

            <style>{`
                .article-content h2 {
                    font-weight: 700;
                    color: #0f172a;
                    margin-top: 2.5rem;
                    margin-bottom: 1.25rem;
                    font-size: 1.75rem;
                    letter-spacing: -0.5px;
                }
                .article-content h2:first-child {
                    margin-top: 0;
                }
                .article-content p {
                    color: #4a5565;
                    line-height: 1.85;
                    font-size: 1.1rem;
                    margin-bottom: 1.5rem;
                }
                .transition-colors {
                    transition: color 0.3s ease;
                }
                .transition-colors:hover {
                    color: var(--primary) !important;
                }
            `}</style>
        </div>
    );
}

export default ArticleDetailsPage;
