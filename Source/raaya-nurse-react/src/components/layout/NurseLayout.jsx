import React, { useEffect, useState } from 'react';
import { Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const NurseLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [nurseData, setNurseData] = useState(null);

    useEffect(() => {
        const nurseStr = localStorage.getItem('nurse');
        const token = localStorage.getItem('token');
        if (!token || !nurseStr) {
            navigate('/');
        } else {
            setNurseData(JSON.parse(nurseStr));
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('nurse');
        navigate('/');
    };

    if (!nurseData) return null;

    const isActive = (path) => location.pathname === path;

    return (
        <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            {/* Sidebar */}
            <div className="sidebar d-none d-lg-flex flex-column flex-shrink-0 p-3 bg-white border-end shadow-sm" style={{ width: '280px', height: '100vh', position: 'sticky', top: 0 }}>
                <div className="d-flex align-items-center mb-4 px-2 mt-2 gap-2">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: 'var(--primary)', color: 'white' }}>
                        <i className="fa-solid fa-heart-pulse fs-5"></i>
                    </div>
                    <span className="fs-4 fw-bold" style={{ color: 'var(--primary)' }}>Raaya Nurse</span>
                </div>
                
                <p className="text-muted fw-semibold mb-2 px-3" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Main Menu</p>
                <ul className="nav nav-pills flex-column mb-auto">
                    <li className="nav-item mb-1">
                        <Link to="/dashboard" className={`nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 ${isActive('/dashboard') ? 'shadow-sm' : 'text-dark hover-bg-light'}`} style={isActive('/dashboard') ? { backgroundColor: 'var(--primary)', color: 'white', fontWeight: 500 } : { fontWeight: 500 }}>
                            <i className="fa-solid fa-table-cells-large"></i> Dashboard
                        </Link>
                    </li>
                    <li className="nav-item mb-1">
                        <Link to="/patients" className={`nav-link d-flex align-items-center justify-content-between py-2 px-3 rounded-3 ${isActive('/patients') ? 'shadow-sm' : 'text-dark hover-bg-light'}`} style={isActive('/patients') ? { backgroundColor: 'var(--primary)', color: 'white', fontWeight: 500 } : { fontWeight: 500 }}>
                            <div className="d-flex align-items-center gap-3">
                                <i className="fa-solid fa-users"></i> Patients
                            </div>
                            <Badge bg="info" className="rounded-pill text-white" style={{ backgroundColor: '#2dd4bf !important' }}>234</Badge>
                        </Link>
                    </li>
                    <li className="nav-item mb-1">
                        <Link to="/calendar" className={`nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 ${isActive('/calendar') ? 'shadow-sm' : 'text-dark hover-bg-light'}`} style={isActive('/calendar') ? { backgroundColor: 'var(--primary)', color: 'white', fontWeight: 500 } : { fontWeight: 500 }}>
                            <i className="fa-regular fa-calendar"></i> Calendar
                        </Link>
                    </li>
                    <li className="nav-item mb-1">
                        <Link to="/earnings" className={`nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 ${isActive('/earnings') ? 'shadow-sm' : 'text-dark hover-bg-light'}`} style={isActive('/earnings') ? { backgroundColor: 'var(--primary)', color: 'white', fontWeight: 500 } : { fontWeight: 500 }}>
                            <i className="fa-solid fa-wallet"></i> Earnings
                        </Link>
                    </li>
                </ul>
                
                <p className="text-muted fw-semibold mb-2 px-3 mt-4" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Communication</p>
                <ul className="nav nav-pills flex-column mb-auto">
                    <li className="nav-item mb-1">
                        <Link to="#" className="nav-link text-dark d-flex align-items-center justify-content-between gap-3 py-2 px-3 rounded-3 hover-bg-light" style={{ fontWeight: 500 }}>
                            <div className="d-flex align-items-center gap-3">
                                <i className="fa-regular fa-bell text-muted"></i> Notifications
                            </div>
                            <Badge bg="danger" className="rounded-pill">5</Badge>
                        </Link>
                    </li>
                    <li className="nav-item mb-1">
                        <Link to="#" className="nav-link text-dark d-flex align-items-center gap-3 py-2 px-3 rounded-3 hover-bg-light" style={{ fontWeight: 500 }}>
                            <i className="fa-solid fa-gear text-muted"></i> Settings
                        </Link>
                    </li>
                </ul>

                <div className="mt-auto px-3 pb-3">
                    <Button variant="light" className="w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold text-danger border" onClick={handleLogout} style={{ borderRadius: '10px' }}>
                        <i className="fa-solid fa-arrow-right-from-bracket"></i> Log Out
                    </Button>
                </div>
            </div>

            {/* Main Column */}
            <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                {/* Topbar */}
                <header className="p-3 bg-white border-bottom shadow-sm d-flex align-items-center justify-content-between sticky-top" style={{ zIndex: 10 }}>
                    <div className="d-flex align-items-center gap-3 w-50">
                        <i className="fa-solid fa-bars fs-4 text-muted d-lg-none cursor-pointer"></i>
                        <InputGroup className="w-100 d-none d-md-flex shadow-sm rounded-pill overflow-hidden border" style={{ maxWidth: '400px' }}>
                            <InputGroup.Text className="bg-light border-0 px-3">
                                <i className="fa-solid fa-search text-muted"></i>
                            </InputGroup.Text>
                            <Form.Control placeholder="Search patients, appointments..." className="bg-light border-0 shadow-none py-2" style={{ fontSize: '0.9rem' }} />
                        </InputGroup>
                    </div>
                    <div className="d-flex align-items-center gap-3 gap-md-4">
                        <div className="d-none d-md-flex align-items-center gap-2 px-2 py-1 bg-light rounded-pill border">
                            <img src="https://flagcdn.com/w20/us.png" alt="English" style={{ width: '20px', borderRadius: '50%' }} />
                        </div>
                        <div className="d-flex align-items-center justify-content-center bg-light rounded-circle border" style={{ width: '38px', height: '38px', cursor: 'pointer' }}>
                            <i className="fa-regular fa-sun text-muted"></i>
                        </div>
                        <div className="d-flex align-items-center gap-2 cursor-pointer border px-2 py-1 rounded-pill">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                {nurseData?.name?.charAt(0) || 'N'}
                            </div>
                            <span className="fw-semibold text-dark d-none d-sm-block me-1" style={{ fontSize: '0.9rem' }}>{nurseData?.name}</span>
                            <i className="fa-solid fa-chevron-down text-muted fs-7 d-none d-sm-block"></i>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-grow-1 p-3 p-md-4 overflow-auto">
                    {/* Render children and pass nurseData if needed by cloning */}
                    {React.Children.map(children, child => {
                        if (React.isValidElement(child)) {
                            return React.cloneElement(child, { nurseData });
                        }
                        return child;
                    })}
                </main>
            </div>
        </div>
    );
};

export default NurseLayout;
