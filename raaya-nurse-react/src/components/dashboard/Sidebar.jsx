import React from 'react';
import { Badge, Button, Offcanvas } from 'react-bootstrap';
import { useTranslation } from '../../hooks/useTranslation';

const SidebarContent = ({ activeTab, setActiveTab, handleLogout, unreadNotifications }) => {
    const { t } = useTranslation();

    const navItems = [
        { id: 'overview', icon: 'fa-table-cells-large', label: t('Dashboard Overview') },
        { id: 'emergency', icon: 'fa-truck-medical', label: 'Emergency Requests', badgeColor: 'danger' },
        { id: 'patients', icon: 'fa-users', label: t('Patients') },
        { id: 'calendar', icon: 'fa-regular fa-calendar', label: t('Calendar') },
        { id: 'earnings', icon: 'fa-wallet', label: t('Earnings') },
    ];

    const commItems = [
        { id: 'notifications', icon: 'fa-regular fa-bell', label: t('Notifications'), badge: unreadNotifications > 0 ? unreadNotifications : null, badgeColor: 'danger' },
        { id: 'profile', icon: 'fa-user', label: t('My Profile') },
    ];

    const renderNav = (items) => (
        <ul className="nav nav-pills flex-column mb-auto">
            {items.map(item => {
                const isActive = activeTab === item.id;
                return (
                    <li className="nav-item mb-2" key={item.id}>
                        <button 
                            onClick={() => setActiveTab(item.id)}
                            className={`nav-link w-100 text-start d-flex align-items-center justify-content-between py-3 px-4 rounded-xl transition-all border-0 ${isActive ? 'shadow-sm active-tab' : 'text-secondary hover-bg-body-tertiary'}`}
                            style={{ 
                                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                                color: isActive ? 'white' : 'inherit',
                                fontWeight: isActive ? 600 : 500,
                                fontSize: '15px'
                            }}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <i className={`fa-solid ${item.icon} ${isActive ? 'text-white' : 'text-muted'}`} style={{ width: '20px', textAlign: 'center' }}></i> 
                                {item.label}
                            </div>
                            {item.badge && (
                                <Badge bg={item.badgeColor} className={`rounded-pill px-2 py-1 text-12 ${isActive ? 'text-white' : ''}`} style={isActive && item.badgeColor === 'info' ? { backgroundColor: 'rgba(255,255,255,0.2) !important' } : {}}>
                                    {item.badge}
                                </Badge>
                            )}
                        </button>
                    </li>
                )
            })}
        </ul>
    );

    return (
        <div className="d-flex flex-column h-100">
            <div className="d-flex align-items-center mb-4 px-3 mt-2 gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '45px', height: '45px', backgroundColor: 'var(--primary)', color: 'white' }}>
                    <i className="fa-solid fa-heart-pulse fs-5"></i>
                </div>
                <span className="fs-4 fw-bold" style={{ color: 'var(--primary)', letterSpacing: '-0.5px' }}>Raaya Nurse</span>
            </div>
            
            <p className="text-muted fw-bold mb-2 px-4 text-12" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{t('MAIN MENU')}</p>
            {renderNav(navItems)}
            
            <p className="text-muted fw-bold mb-2 px-4 mt-3 text-12" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{t('COMMUNICATION')}</p>
            {renderNav(commItems)}

            <div className="mt-auto px-4 pb-2 pt-2">
                <Button 
                    variant="light" 
                    className="w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold text-danger border-0 shadow-sm py-2 rounded-xl hover-danger text-15" 
                    onClick={handleLogout}
                    style={{ backgroundColor: '#fff5f5' }}
                >
                    <i className="fa-solid fa-arrow-right-from-bracket"></i> {t('Log Out')}
                </Button>
            </div>
        </div>
    );
};

export const Sidebar = ({ activeTab, setActiveTab, handleLogout, unreadNotifications }) => {
    return (
        <div className="sidebar d-none d-lg-flex flex-column flex-shrink-0 py-3 px-2 bg-body border-end shadow-sm" style={{ width: '300px', height: '100vh', position: 'sticky', top: 0, zIndex: 100 }}>
            <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} unreadNotifications={unreadNotifications} />
        </div>
    );
};

export const MobileSidebar = ({ show, onHide, activeTab, setActiveTab, handleLogout, unreadNotifications }) => {
    return (
        <Offcanvas show={show} onHide={onHide} placement="start" style={{ width: '300px', borderRight: 'none' }} className="shadow">
            <Offcanvas.Header closeButton className="pb-0 border-0">
            </Offcanvas.Header>
            <Offcanvas.Body className="px-2 pt-0">
                <SidebarContent 
                    activeTab={activeTab} 
                    setActiveTab={(tab) => { setActiveTab(tab); onHide(); }} 
                    handleLogout={handleLogout} 
                    unreadNotifications={unreadNotifications}
                />
            </Offcanvas.Body>
        </Offcanvas>
    );
};
