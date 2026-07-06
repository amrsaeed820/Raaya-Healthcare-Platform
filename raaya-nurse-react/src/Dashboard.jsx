import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast, ToastContainer } from 'react-bootstrap';
import { Sidebar, MobileSidebar } from './components/dashboard/Sidebar';
import Topbar from './components/dashboard/Topbar';
import OverviewTab from './components/dashboard/OverviewTab';
import PatientsTab from './components/dashboard/PatientsTab';
import CalendarTab from './components/dashboard/CalendarTab';
import EarningsTab from './components/dashboard/EarningsTab';
import ProfileTab from './components/dashboard/ProfileTab';
import NotificationsTab from './components/dashboard/NotificationsTab';
import EmergencyTab from './components/dashboard/EmergencyTab';
import ErrorBoundary from './components/common/ErrorBoundary';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [nurseData, setNurseData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [selectedBookingFromCalendar, setSelectedBookingFromCalendar] = useState(null);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    
    // Toast State for Mock Interactions
    const [toastState, setToastState] = useState({ show: false, title: '', message: '', type: 'primary' });

    const fetchUnreadNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get('http://localhost:5000/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const unread = res.data.filter(n => !n.isRead).length;
            setUnreadNotifications(unread);
        } catch (err) {
            console.error("Failed to fetch unread notifications", err);
        }
    };

    useEffect(() => {
        fetchUnreadNotifications();
        // Optional: Polling every 30 seconds for real-time feel
        const intervalId = setInterval(fetchUnreadNotifications, 30000);
        return () => clearInterval(intervalId);
    }, []);

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

    const showToast = (title, message, type = 'primary') => {
        const toastType = type === 'error' ? 'danger' : type;
        setToastState({ show: true, title, message, type: toastType });
        setTimeout(() => setToastState(prev => ({ ...prev, show: false })), 4000);
    };

    if (!nurseData) return null;

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab nurseData={nurseData} showToast={showToast} />;
            case 'patients':
                return (
                    <PatientsTab 
                        showToast={showToast} 
                        initialBooking={selectedBookingFromCalendar} 
                        clearInitialBooking={() => setSelectedBookingFromCalendar(null)} 
                    />
                );
            case 'calendar':
                return (
                    <CalendarTab 
                        showToast={showToast} 
                        onViewPatientDetails={(booking) => {
                            setSelectedBookingFromCalendar(booking);
                            setActiveTab('patients');
                        }} 
                    />
                );
            case 'earnings':
                return (
                    <ErrorBoundary>
                        <EarningsTab showToast={showToast} />
                    </ErrorBoundary>
                );
            case 'profile':
                return <ProfileTab nurseData={nurseData} showToast={showToast} />;
            case 'emergency':
                return <EmergencyTab showToast={showToast} setActiveTab={setActiveTab} />;
            case 'notifications':
                return <NotificationsTab showToast={showToast} />;
            default:
                return (
                    <div className="d-flex align-items-center justify-content-center h-100">
                        <div className="text-center">
                            <i className="fa-solid fa-person-digging text-muted fs-1 mb-3"></i>
                            <h4 className="fw-bold text-dark">Under Construction</h4>
                            <p className="text-muted">This section is coming soon.</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="d-flex bg-body" style={{ minHeight: '100vh' }}>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} unreadNotifications={unreadNotifications} />
            <MobileSidebar 
                show={showMobileMenu} 
                onHide={() => setShowMobileMenu(false)} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                handleLogout={handleLogout} 
                unreadNotifications={unreadNotifications}
            />

            <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                <Topbar 
                    nurseData={nurseData} 
                    toggleMobileMenu={() => setShowMobileMenu(true)} 
                    showToast={showToast}
                    unreadNotifications={unreadNotifications}
                    setActiveTab={setActiveTab}
                />
                
                <main className="flex-grow-1 p-3 p-md-5 overflow-auto custom-scrollbar">
                    {renderContent()}
                </main>
            </div>

            {/* Global Toast for Interactions */}
            <ToastContainer position="bottom-end" className="p-4" style={{ zIndex: 1050 }}>
                <Toast show={toastState.show} onClose={() => setToastState({ ...toastState, show: false })} bg={toastState.type === 'info' ? 'primary' : toastState.type} className="border-0 shadow-lg rounded-3">
                    <Toast.Header className={`border-0 rounded-top-3 text-${toastState.type === 'warning' ? 'dark' : 'white'} bg-${toastState.type === 'info' ? 'primary' : toastState.type}`} closeButton={false}>
                        <div className="me-auto fw-bold d-flex align-items-center gap-2">
                            {toastState.type === 'success' && <i className="fa-solid fa-circle-check"></i>}
                            {toastState.type === 'danger' && <i className="fa-solid fa-circle-xmark"></i>}
                            {toastState.type === 'info' && <i className="fa-solid fa-circle-info"></i>}
                            {toastState.title}
                        </div>
                    </Toast.Header>
                    <Toast.Body className={`fw-medium ${toastState.type === 'warning' ? 'text-dark' : 'text-white'}`}>
                        {toastState.message}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
};

export default Dashboard;
