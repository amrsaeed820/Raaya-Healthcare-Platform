import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated, user, isLoading } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={`w-100 transition-all bg-white py-1 ${scrolled ? 'shadow-sm' : ''}`} style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1050, transition: 'all 0.3s ease' }}>
            <Container>
                <Navbar expand="lg" className="px-0 border-0 py-1">
                    <Navbar.Brand as={Link} to="/" className="fw-bold m-0 d-flex align-items-center gap-2 text-dark" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="d-flex align-items-center justify-content-center text-white shadow-sm" style={{ width: '34px', height: '34px', backgroundColor: 'var(--primary)', borderRadius: '8px' }}>
                            <i className="fa-solid fa-heart-pulse fs-6"></i>
                        </div>
                        <span style={{ letterSpacing: '0.5px', color: '#111827', fontSize: '1.1rem' }}>RAAYA</span>
                    </Navbar.Brand>
                    
                    <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />
                    
                    <Navbar.Collapse id="basic-navbar-nav">
                        {/* Desktop Nav - Absolutely centered on large screens */}
                        <div className="d-none d-lg-flex position-absolute start-50 translate-middle-x">
                            <Nav className="gap-1 align-items-center">
                                <Nav.Link as={Link} to="/" className="nav-custom-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</Nav.Link>
                                <Nav.Link as={Link} to="/about" className="nav-custom-link">About us</Nav.Link>
                                <Nav.Link as={Link} to="/services" className="nav-custom-link">Services</Nav.Link>
                                <Nav.Link as={Link} to="/articles" className="nav-custom-link">Articles</Nav.Link>
                                <Nav.Link as={Link} to="/#contact" className="nav-custom-link">Contact us</Nav.Link>
                            </Nav>
                        </div>
                        
                        {/* Mobile Nav */}
                        <Nav className="d-lg-none my-4 text-center gap-2">
                            <Nav.Link as={Link} to="/" className="nav-custom-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</Nav.Link>
                            <Nav.Link as={Link} to="/about" className="nav-custom-link">About us</Nav.Link>
                            <Nav.Link as={Link} to="/services" className="nav-custom-link">Services</Nav.Link>
                            <Nav.Link as={Link} to="/articles" className="nav-custom-link">Articles</Nav.Link>
                            <Nav.Link as={Link} to="/#contact" className="nav-custom-link">Contact us</Nav.Link>
                        </Nav>

                        <div className="d-flex flex-wrap align-items-center justify-content-center gap-2 gap-lg-3 ms-lg-auto mx-auto mx-lg-0 mt-3 mt-lg-0">


                            {isLoading ? (
                                <div style={{ width: '32px', height: '32px' }} className="spinner-border text-primary spinner-border-sm" role="status"></div>
                            ) : isAuthenticated ? (
                                <Link to="/profile" className="text-dark fw-bold text-decoration-none nav-login-link d-flex align-items-center gap-2" style={{ fontSize: '14.5px' }}>
                                    {user?.profilePicture ? (
                                        <div className="overflow-hidden rounded-circle" style={{ width: '32px', height: '32px', border: '2px solid var(--primary)' }}>
                                            <img src={user.profilePicture} alt="User" className="w-100 h-100 object-fit-cover" />
                                        </div>
                                    ) : (
                                        <i className="fa-solid fa-circle-user fs-4" style={{ color: 'var(--primary)' }}></i>
                                    )}
                                </Link>
                            ) : (
                                <Link to="/login" className="text-dark fw-bold text-decoration-none nav-login-link" style={{ fontSize: '14.5px' }}>
                                    Login
                                </Link>
                            )}
                            <Button 
                                className="d-flex align-items-center px-3 py-2 border-0 shadow-sm fw-bold btn-hover-effect"
                                style={{ backgroundColor: 'var(--primary)', color: 'white', borderRadius: '10px', fontSize: '14.5px', transition: 'all 0.3s ease' }}
                                onClick={() => navigate('/book')}
                            >
                                Book Now
                            </Button>
                        </div>
                    </Navbar.Collapse>
                </Navbar>
            </Container>
            <style>{`
                .nav-custom-link {
                    color: #6b7280 !important;
                    font-weight: 500 !important;
                    font-size: 14.5px;
                    transition: color 0.3s ease;
                    padding: 6px 8px !important;
                    outline: none !important;
                    box-shadow: none !important;
                }
                .nav-custom-link:focus, .nav-custom-link:active, .nav-custom-link.active {
                    color: #6b7280 !important;
                    font-weight: 500 !important;
                }
                .nav-custom-link:hover {
                    color: var(--primary) !important;
                    font-weight: 700 !important;
                }

                .nav-login-link {
                    transition: color 0.2s ease;
                }
                .nav-login-link:hover {
                    color: var(--primary) !important;
                }
                
                .icon-btn {
                    background: transparent;
                    border: none;
                    color: #6b7280;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                
                .icon-btn:hover {
                    background-color: #f3f4f6;
                    color: var(--primary);
                    transform: translateY(-2px);
                }

                .btn-hover-effect:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(2, 89, 85, 0.25) !important;
                    background-color: #024542 !important;
                }
            `}</style>
        </div>
    );
};

export default Header;
