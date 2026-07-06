import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Dropdown } from 'react-bootstrap';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const menuItems = [
        { path: '/admin', name: 'Dashboard', icon: 'fa-chart-line' },
        { path: '/admin/pending-nurses', name: 'Pending Applications', icon: 'fa-user-clock' },
        { path: '/admin/active-nurses', name: 'Active Nurses', icon: 'fa-user-nurse' },
        { path: '/admin/patients', name: 'Patients Management', icon: 'fa-users' },
        { path: '/admin/bookings', name: 'Bookings & Visits', icon: 'fa-calendar-check' },
        { path: '/admin/financials', name: 'Platform Earnings', icon: 'fa-sack-dollar' },
        { path: '/admin/settings', name: 'System Settings', icon: 'fa-gear' },
        ...(user?.role === 'super_admin' ? [{ path: '/admin/manage-admins', name: 'Admin Management', icon: 'fa-user-shield' }] : []),
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7f6', overflow: 'hidden' }}>
            {/* Sidebar */}
            <aside style={{
                width: isSidebarOpen ? '260px' : '80px',
                backgroundColor: 'white',
                borderRight: '1px solid #e0e6eb',
                transition: 'width 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 1000
            }}>
                <div style={{ height: '70px', display: 'flex', alignItems: 'center', padding: isSidebarOpen ? '0 24px' : '0', justifyContent: isSidebarOpen ? 'flex-start' : 'center', borderBottom: '1px solid #e0e6eb' }}>
                    <Link to="/admin" className="text-decoration-none d-flex align-items-center gap-2">
                        <div className="d-flex align-items-center justify-content-center text-white" style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary)', borderRadius: '8px' }}>
                            <i className="fa-solid fa-heart-pulse fs-6"></i>
                        </div>
                        {isSidebarOpen && <span className="fw-bold text-dark fs-5">Raaya Admin</span>}
                    </Link>
                </div>
                
                <div style={{ flex: 1, padding: '20px 10px', overflowY: 'auto' }}>
                    <ul className="list-unstyled d-flex flex-column gap-2 m-0">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.path}>
                                    <Link 
                                        to={item.path}
                                        className="d-flex align-items-center text-decoration-none transition-all"
                                        style={{
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                                            color: isActive ? 'white' : '#6b7280',
                                            fontWeight: isActive ? '600' : '500',
                                            justifyContent: isSidebarOpen ? 'flex-start' : 'center'
                                        }}
                                    >
                                        <i className={`fa-solid ${item.icon} fs-5`} style={{ minWidth: '30px', textAlign: 'center' }}></i>
                                        {isSidebarOpen && <span className="ms-2">{item.name}</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </aside>

            {/* Main Content Area */}
            <div style={{ 
                flex: 1, 
                marginLeft: isSidebarOpen ? '260px' : '80px',
                transition: 'margin-left 0.3s ease',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Top Header */}
                <header style={{
                    height: '70px',
                    backgroundColor: 'white',
                    borderBottom: '1px solid #e0e6eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 900
                }}>
                    <div>
                        <button 
                            className="btn border-0 shadow-none p-2 text-muted" 
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                        >
                            <i className="fa-solid fa-bars fs-5"></i>
                        </button>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        <Dropdown align="end">
                            <Dropdown.Toggle as="div" style={{ cursor: 'pointer' }} className="d-flex align-items-center gap-2">
                                <div className="rounded-circle bg-light d-flex justify-content-center align-items-center border" style={{ width: '40px', height: '40px' }}>
                                    <i className="fa-solid fa-user-shield text-primary"></i>
                                </div>
                                <div className="d-none d-md-block">
                                    <span className="d-block fw-bold text-dark" style={{ fontSize: '0.9rem', lineHeight: '1' }}>{user?.name || 'Admin'}</span>
                                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Administrator</span>
                                </div>
                                <i className="fa-solid fa-chevron-down ms-1 text-muted fs-7"></i>
                            </Dropdown.Toggle>
                            
                            <Dropdown.Menu className="border-0 shadow-sm rounded-3 mt-2" style={{ border: '1px solid #e0e6eb' }}>
                                <Dropdown.Item className="py-2" onClick={handleLogout}>
                                    <i className="fa-solid fa-arrow-right-from-bracket me-2 text-danger"></i> 
                                    <span className="text-danger fw-medium">Logout</span>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </header>

                {/* Page Content */}
                <main style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
