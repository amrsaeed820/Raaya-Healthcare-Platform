import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import PageHeader from '../components/layout/PageHeader';

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
    },
    {
        title: "Mental Health Support for Chronic Patients",
        excerpt: "Exploring the psychological impact of chronic illnesses and how home-based therapy provides essential emotional relief.",
        date: "Oct 5, 2026",
        readTime: "7 min read",
        category: "Mental Health",
        author: "Dr. Youssef Mahmoud",
        img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Nutrition Tips for Faster Recovery",
        excerpt: "A balanced diet is key to healing. Here are the top dietary recommendations for patients recovering at home.",
        date: "Oct 1, 2026",
        readTime: "4 min read",
        category: "Nutrition",
        author: "Dr. Salma Tarek",
        img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Fall Prevention Strategies for Seniors",
        excerpt: "Practical modifications and exercises to make your home safer and prevent dangerous falls for elderly family members.",
        date: "Sep 28, 2026",
        readTime: "5 min read",
        category: "Safety",
        author: "Ahmed Hassan, RN",
        img: "https://images.unsplash.com/photo-1536856136534-bb679c52a9aa?auto=format&fit=crop&q=80&w=800"
    }
];

const ArticlesPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredArticles = useMemo(() => {
        if (!searchQuery.trim()) return articles;
        
        const lowerCaseQuery = searchQuery.toLowerCase().trim();
        
        return articles.filter(article => {
            return (
                article.title.toLowerCase().includes(lowerCaseQuery) ||
                article.excerpt.toLowerCase().includes(lowerCaseQuery) ||
                article.category.toLowerCase().includes(lowerCaseQuery) ||
                article.author.toLowerCase().includes(lowerCaseQuery)
            );
        });
    }, [searchQuery]);

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingTop: '76px' }}>
            {/* Page Header (Matched with Services / About Pages) */}
            <PageHeader
                title={<span>Articles & <span className="text-primary">Insights</span></span>}
                description="Stay informed with the latest trends, expert advice, and comprehensive guides in healthcare. Discover insights that matter for you and your loved ones."
            />
            
            {/* Articles Grid */}
            <section className="py-5 bg-white">
                <Container className="py-3">
                    {/* Search Bar moved out of header */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mx-auto mb-5" style={{ maxWidth: '650px' }}
                    >
                        <div className="bg-white p-2 rounded-4 shadow-sm d-flex align-items-center" style={{ border: '1px solid #e0e6eb' }}>
                            <div className="ps-3 text-muted">
                                <i className="fa-solid fa-magnifying-glass" style={{ color: '#6a7282' }}></i>
                            </div>
                            <Form.Control 
                                type="text" 
                                placeholder="Enter article title, category, or author..." 
                                className="border-0 shadow-none bg-transparent py-2"
                                style={{ fontSize: '1rem', color: '#6a7282' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button variant="primary" className="rounded-3 px-4 py-2 fw-bold d-flex align-items-center gap-2 border-0" style={{ backgroundColor: 'var(--primary)' }}>
                                Search
                            </Button>
                        </div>
                    </motion.div>

                    <Row className="g-4 g-xl-5">
                        <AnimatePresence mode="popLayout">
                            {filteredArticles.length > 0 ? (
                                filteredArticles.map((article, idx) => (
                                    <Col lg={4} md={6} key={article.title}>
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3 }}
                                            className="h-100"
                                        >
                                            <Card 
                                                className="border-0 h-100 rounded-4 overflow-hidden bg-white shadow-sm d-flex flex-column article-card" 
                                                style={{ border: '1px solid rgba(0,0,0,0.04) !important', transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'pointer' }}
                                                onClick={() => navigate('/articles/1')}
                                            >
                                                {/* Image Container */}
                                                <div className="position-relative overflow-hidden" style={{ height: '220px', margin: '12px', borderRadius: '12px' }}>
                                                    <motion.div 
                                                        className="h-100 w-100"
                                                        style={{ backgroundImage: `url(${article.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                                        whileHover={{ scale: 1.05 }}
                                                        transition={{ duration: 0.4 }}
                                                    />
                                                    {/* Badge Over Image */}
                                                    <div className="position-absolute top-0 start-0 m-3 z-1">
                                                        <span className="badge px-3 py-2 rounded-3 shadow-sm" style={{ backgroundColor: 'rgba(0,102,102,0.85)', backdropFilter: 'blur(4px)', color: 'white', fontWeight: '600', fontSize: '0.75rem' }}>
                                                            {article.category}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* Content Container */}
                                                <Card.Body className="px-4 pb-4 pt-2 d-flex flex-column flex-grow-1">
                                                    <Card.Title className="fw-bold text-dark mb-3" style={{ fontSize: '1.2rem', lineHeight: 1.4, letterSpacing: '-0.3px', color: '#0f172a' }}>
                                                        {article.title}
                                                    </Card.Title>
                                                    <Card.Text className="text-muted mb-4 flex-grow-1" style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#4a5565' }}>
                                                        {article.excerpt}
                                                    </Card.Text>
                                                    
                                                    {/* Footer with Author and Read Time matching Figma */}
                                                    <div className="mt-auto d-flex justify-content-between align-items-center">
                                                        <div className="fw-medium text-dark" style={{ fontSize: '0.9rem', color: '#6a7282' }}>
                                                            {article.author}
                                                        </div>
                                                        <div className="d-flex align-items-center fw-medium" style={{ fontSize: '0.9rem', color: '#6a7282' }}>
                                                            <i className="fa-regular fa-clock me-1"></i>
                                                            {article.readTime}
                                                        </div>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </motion.div>
                                    </Col>
                                ))
                            ) : (
                                <Col xs={12}>
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center py-5 my-5"
                                    >
                                        <div className="mb-4">
                                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{ width: '80px', height: '80px', backgroundColor: 'rgba(20, 184, 166, 0.1)' }}>
                                                <i className="fa-solid fa-magnifying-glass text-primary" style={{ fontSize: '2.5rem' }}></i>
                                            </div>
                                        </div>
                                        <h3 className="fw-bold text-dark mb-3" style={{ letterSpacing: '-0.5px' }}>No articles found</h3>
                                        <p className="text-muted mb-4 mx-auto" style={{ fontSize: '1.1rem', maxWidth: '500px' }}>
                                            We couldn't find any articles matching <span className="fw-bold text-dark">"{searchQuery}"</span>. <br/>
                                            Try checking your spelling or searching for a different keyword.
                                        </p>
                                        <Button 
                                            variant="outline-primary" 
                                            className="rounded-pill px-4 py-2 fw-bold" 
                                            onClick={() => setSearchQuery('')}
                                            style={{ borderWidth: '2px' }}
                                        >
                                            Clear Search
                                        </Button>
                                    </motion.div>
                                </Col>
                            )}
                        </AnimatePresence>
                    </Row>
                </Container>
            </section>
            
            <style>{`
                .article-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.08) !important;
                }
            `}</style>
        </div>
    );
}

export default ArticlesPage;
