import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const articles = [
    {
        title: "How Home Healthcare Can Improve Patient Outcomes",
        excerpt: "Discover how specialized care plans and familiar environments significantly boost recovery times and overall well-being.",
        date: "Oct 12, 2026",
        readTime: "5 min read",
        category: "Patient Care",
        author: "Dr. Salma Tarek",
        img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "The Importance of Vitals Monitoring for the Elderly",
        excerpt: "Learn why continuous tracking of vital signs is crucial for early detection and prevention of severe health complications.",
        date: "Oct 10, 2026",
        readTime: "4 min read",
        category: "Elderly Health",
        author: "Ahmed Hassan, RN",
        img: "https://images.unsplash.com/photo-1581594549595-35f6edc7b762?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Post-Surgery Care at Home: What You Need to Know",
        excerpt: "A comprehensive guide to managing pain, preventing infections, and accelerating healing after major surgical procedures.",
        date: "Oct 8, 2026",
        readTime: "6 min read",
        category: "Recovery",
        author: "Nourhan Ali, RN",
        img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800"
    }
];

const Articles = () => {
    const navigate = useNavigate();

    return (
        <section className="py-5" id="articles" style={{ backgroundColor: '#f8fafc' }}>
            <Container className="py-4 py-md-5">
                {/* Header Section */}
                <div className="text-center mb-5 pb-3">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="d-inline-flex align-items-center rounded-pill px-3 py-2 mb-3 shadow-sm border"
                        style={{ backgroundColor: '#ffffff', borderColor: '#eaeeed', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600' }}
                    >
                        <i className="fa-solid fa-newspaper me-2"></i> Our Blog
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="fw-bold text-dark mb-3" 
                        style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', letterSpacing: '-0.5px' }}
                    >
                        Latest <span style={{ color: 'var(--primary)' }}>Healthcare</span> Insights
                    </motion.h2>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-muted mx-auto mb-0"
                        style={{ maxWidth: '600px', fontSize: '1rem', lineHeight: 1.6 }}
                    >
                        Stay updated with the latest medical news, tips for healthy living, and expert advice from our top professionals.
                    </motion.p>
                </div>
                
                {/* Articles Grid */}
                <Row className="g-4 g-xl-5">
                    {articles.map((article, idx) => (
                        <Col lg={4} md={6} key={idx}>
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.15 }}
                                className="h-100"
                            >
                                <Card 
                                    className="border-0 shadow-sm h-100 rounded-4 overflow-hidden article-card bg-white" 
                                    style={{ border: '1px solid rgba(0,0,0,0.03)', cursor: 'pointer' }}
                                    onClick={() => navigate('/articles/1')}
                                >
                                    
                                    {/* Image Container */}
                                    <div className="position-relative overflow-hidden" style={{ height: '240px' }}>
                                        <Card.Img 
                                            variant="top" 
                                            src={article.img} 
                                            alt={article.title}
                                            className="h-100 w-100 object-fit-cover article-img"
                                        />
                                        <div className="position-absolute top-0 start-0 m-3">
                                            <span className="badge px-3 py-2 rounded-pill shadow-sm" style={{ backgroundColor: '#ffffff', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                                {article.category}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Content Container */}
                                    <Card.Body className="p-4 p-xl-4 d-flex flex-column">
                                        
                                        {/* Metadata */}
                                        <div className="d-flex align-items-center text-muted fw-medium mb-3" style={{ fontSize: '0.85rem' }}>
                                            <span className="d-flex align-items-center"><i className="fa-regular fa-calendar me-2" style={{ color: 'var(--primary)' }}></i>{article.date}</span>
                                            <span className="mx-2 text-opacity-25">•</span>
                                            <span className="d-flex align-items-center"><i className="fa-regular fa-clock me-2" style={{ color: 'var(--primary)' }}></i>{article.readTime}</span>
                                        </div>
                                        
                                        {/* Title */}
                                        <Card.Title className="fw-bold text-dark mb-4 article-title flex-grow-1" style={{ fontSize: '1.25rem', lineHeight: 1.4 }}>
                                            {article.title}
                                        </Card.Title>
                                        {/* Footer Link */}
                                        <div className="mt-auto pt-3 border-top" style={{ borderColor: 'rgba(0,0,0,0.05) !important' }}>
                                            <span className="text-decoration-none fw-bold d-inline-flex align-items-center article-link" style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>
                                                Read Article <i className="fa-solid fa-arrow-right ms-2 transition-transform"></i>
                                            </span>
                                        </div>
                                        
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        </Col>
                    ))}
                </Row>
                
                {/* View All Button */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-5 pt-3"
                >
                    <button 
                        onClick={() => navigate('/articles')} 
                        className="btn btn-outline-primary rounded-pill px-5 py-2 fw-bold" 
                        style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                    >
                        View All Articles
                    </button>
                </motion.div>
            </Container>

            <style>{`
                .article-card {
                    transition: transform 0.4s ease, box-shadow 0.4s ease;
                }
                .article-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important;
                }
                .article-img {
                    transition: transform 0.6s ease;
                }
                .article-card:hover .article-img {
                    transform: scale(1.08);
                }
                .article-title {
                    transition: color 0.3s ease;
                }
                .article-card:hover .article-title {
                    color: var(--primary) !important;
                }
                .article-link i {
                    transition: transform 0.3s ease;
                }
                .article-card:hover .article-link i {
                    transform: translateX(5px);
                }
                .btn-outline-primary:hover {
                    background-color: var(--primary) !important;
                    color: white !important;
                }
            `}</style>
        </section>
    );
};

export default Articles;
