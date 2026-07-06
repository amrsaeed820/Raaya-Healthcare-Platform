import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useTranslation } from '../../hooks/useTranslation';

const NotificationsTab = ({ showToast }) => {
    const { t, lang } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get('http://localhost:5000/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
            
            // Mark as read after fetching
            const unread = res.data.filter(n => !n.isRead);
            if (unread.length > 0) {
                await axios.put('http://localhost:5000/api/notifications/read', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm("Are you sure you want to delete all notifications?")) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            await axios.delete('http://localhost:5000/api/notifications/delete-all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications([]);
            showToast('Success', 'All notifications cleared.', 'success');
        } catch (err) {
            console.error("Failed to delete notifications", err);
            showToast('Error', 'Failed to delete notifications.', 'error');
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const getIconForType = (type) => {
        switch (type) {
            case 'new_booking':
                return { icon: 'fa-solid fa-calendar-plus', color: 'success' };
            case 'cancelled_booking':
                return { icon: 'fa-solid fa-calendar-xmark', color: 'danger' };
            case 'rescheduled_booking':
                return { icon: 'fa-solid fa-calendar-day', color: 'warning' };
            default:
                return { icon: 'fa-solid fa-bell', color: 'primary' };
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return lang === 'ar' ? `منذ ${diffMins || 1} دقيقة` : `${diffMins || 1} min ago`;
        if (diffHours < 24) return lang === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return lang === 'ar' ? `منذ ${diffDays} يوم` : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US');
    };

    const translateNotificationMessage = (msg) => {
        if (lang !== 'ar') return msg;
        let translated = msg;
        translated = translated.replace('Patient', 'المريض');
        translated = translated.replace('has requested a new appointment for', 'طلب موعداً جديداً لـ');
        translated = translated.replace('has cancelled their appointment for', 'قام بإلغاء موعده لـ');
        translated = translated.replace('Elderly Care', 'رعاية المسنين');
        translated = translated.replace('Basic Care', 'الرعاية الأساسية');
        translated = translated.replace('Wound Care', 'العناية بالجروح');
        translated = translated.replace('Post-operative Care', 'رعاية ما بعد العمليات');
        translated = translated.replace('on', 'بتاريخ');
        translated = translated.replace('at', 'الساعة');
        translated = translated.replace('Jan', 'يناير').replace('Feb', 'فبراير').replace('Mar', 'مارس');
        translated = translated.replace('Apr', 'أبريل').replace('May', 'مايو').replace('Jun', 'يونيو');
        translated = translated.replace('Jul', 'يوليو').replace('Aug', 'أغسطس').replace('Sep', 'سبتمبر');
        translated = translated.replace('Oct', 'أكتوبر').replace('Nov', 'نوفمبر').replace('Dec', 'ديسمبر');
        translated = translated.replace('AM', 'صباحاً').replace('PM', 'مساءً');
        return translated;
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Header section */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h1 className="fw-bold text-body mb-1 text-24">{t('Notifications')}</h1>
                    <p className="text-muted fw-medium mb-0 text-15">{t('Stay updated with your latest appointments and alerts.')}</p>
                </div>
                <div className="d-flex gap-2">
                    {notifications.length > 0 && (
                        <Button 
                            variant="outline-danger" 
                            className="rounded-3 px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2 hover-lift transition-all text-14"
                            onClick={handleClearAll}
                        >
                            <i className="fa-solid fa-trash-can"></i> {t('Clear All')}
                        </Button>
                    )}
                    <Button 
                        variant="light" 
                        className="rounded-3 px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2 hover-lift transition-all text-14 border"
                        onClick={() => {
                            setLoading(true);
                            fetchNotifications();
                        }}
                    >
                        <i className="fa-solid fa-rotate-right"></i> {t('Refresh')}
                    </Button>
                </div>
            </div>

            {/* Notifications List */}
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-body-tertiary" style={{ minHeight: '500px' }}>
                <Card.Body className="p-0">
                    <div className="px-4 py-3 bg-body border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: '#eef2f5' }}>
                        <h5 className="fw-bold text-body mb-0 text-16">{t('Recent Activity')}</h5>
                        <Badge bg="primary" className="rounded-pill px-3 py-2 border-0 bg-opacity-10 text-primary fw-bold text-12">
                            {notifications.length} {t('Total')}
                        </Badge>
                    </div>

                    <div className="p-4">
                        {loading ? (
                            <div className="text-center py-5">
                                <i className="fa-solid fa-spinner fa-spin fs-2 text-primary"></i>
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="d-flex flex-column gap-3">
                                {notifications.map((notification, idx) => {
                                    const { icon, color } = getIconForType(notification.type);
                                    return (
                                        <motion.div 
                                            key={notification._id || idx}
                                            initial={{ opacity: 0, x: -10 }} 
                                            animate={{ opacity: 1, x: 0 }} 
                                            transition={{ delay: idx * 0.05 }}
                                            className={`p-4 rounded-4 border transition-all hover-lift ${!notification.isRead ? 'bg-primary bg-opacity-10 border-primary border-opacity-25' : 'bg-body'}`}
                                            style={{ borderColor: '#eef2f5' }}
                                        >
                                            <Row className="align-items-center g-3">
                                                <Col xs="auto">
                                                    <div className={`bg-${color} bg-opacity-10 text-${color} rounded-circle d-flex align-items-center justify-content-center`} style={{ width: '56px', height: '56px' }}>
                                                        <i className={`${icon} text-20`}></i>
                                                    </div>
                                                </Col>
                                                <Col>
                                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                                        <h6 className="fw-bold text-body mb-0 text-16" dir="auto">{t(notification.title)}</h6>
                                                        <span className="text-muted text-12 fw-medium"><i className="fa-regular fa-clock me-1"></i> {formatDate(notification.createdAt)}</span>
                                                    </div>
                                                    <p className={`text-muted mb-0 text-14 ${lang === 'ar' ? 'text-end' : 'text-start'}`} style={{ lineHeight: '1.5' }} dir="auto">{translateNotificationMessage(notification.message)}</p>
                                                </Col>
                                                {!notification.isRead && (
                                                    <Col xs="auto">
                                                        <div className="bg-primary rounded-circle" style={{ width: '10px', height: '10px' }}></div>
                                                    </Col>
                                                )}
                                            </Row>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <div className="bg-body-tertiary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                                    <i className="fa-regular fa-bell-slash text-muted fs-1"></i>
                                </div>
                                <h5 className="fw-bold text-body">{t('No Notifications')}</h5>
                                <p className="text-muted">{t('You are all caught up! Check back later for updates.')}</p>
                            </div>
                        )}
                    </div>
                </Card.Body>
            </Card>

            <style>{`
                .hover-lift { transition: all 0.3s ease; }
                .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05) !important; border-color: rgba(2, 89, 85, 0.1) !important; }
                .transition-all { transition: all 0.3s ease-in-out; }
            `}</style>
        </motion.div>
    );
};

export default NotificationsTab;
