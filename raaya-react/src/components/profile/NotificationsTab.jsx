import React, { useState, useEffect } from 'react';
import { Card, Badge, Alert, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NotificationsTab = ({ onRead }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/notifications/patient', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);

            // Mark as read only if there are unread notifications
            const hasUnread = res.data.some(n => !n.isRead);
            if (hasUnread) {
                await axios.put('http://localhost:5000/api/notifications/patient/read', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (onRead) onRead();
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
            setError("Failed to load notifications.");
        } finally {
            setLoading(false);
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm("Are you sure you want to clear all notifications?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete('http://localhost:5000/api/notifications/patient/delete-all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications([]);
        } catch (error) {
            console.error("Failed to clear notifications", error);
            alert("Failed to clear notifications.");
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <i className="fa-solid fa-spinner fa-spin fs-2 text-primary"></i>
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <div>
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h4 className="fw-bold text-dark mb-1">Notifications</h4>
                    <p className="text-muted mb-0">Stay updated with your latest alerts and messages.</p>
                </div>
                {notifications.length > 0 && (
                    <Button variant="outline-danger" className="rounded-pill fw-bold" onClick={handleClearAll}>
                        <i className="fa-solid fa-trash-can me-2"></i>Clear All
                    </Button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="text-center py-5">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                        <i className="fa-regular fa-bell-slash text-muted fs-1"></i>
                    </div>
                    <h5 className="fw-bold text-dark">No Notifications</h5>
                    <p className="text-muted">You're all caught up!</p>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {notifications.map(notif => {
                        const isCancelled = notif.type === 'nurse_cancelled';
                        return (
                            <Card 
                                key={notif._id} 
                                className={`border-0 shadow-sm rounded-4 ${!notif.isRead ? 'bg-light' : 'bg-white'} ${isCancelled ? 'border border-danger' : ''}`} 
                                style={{ 
                                    borderLeft: !notif.isRead ? (isCancelled ? '4px solid var(--bs-danger)' : '4px solid var(--primary)') : (isCancelled ? '4px solid var(--bs-danger)' : '4px solid transparent'),
                                    backgroundColor: isCancelled ? '#fff5f5' : ''
                                }}
                            >
                                <Card.Body className="p-4 d-flex align-items-start gap-3">
                                    <div className={`${isCancelled ? 'bg-danger text-danger' : 'bg-primary text-primary'} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0`} style={{ width: '45px', height: '45px' }}>
                                        <i className={`fa-solid ${isCancelled ? 'fa-triangle-exclamation' : 'fa-bell'}`}></i>
                                    </div>
                                    <div>
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <h6 className={`fw-bold ${isCancelled ? 'text-danger' : 'text-dark'} mb-0`}>{notif.title}</h6>
                                            {!notif.isRead && <Badge bg={isCancelled ? "danger" : "primary"} className="rounded-pill" style={{ fontSize: '0.6rem' }}>New</Badge>}
                                        </div>
                                        <p className="text-muted mb-2 text-14" style={{ fontWeight: isCancelled ? '500' : 'normal' }}>{notif.message}</p>
                                        <small className="text-muted fw-medium"><i className="fa-regular fa-clock me-1"></i>{new Date(notif.createdAt).toLocaleString()}</small>
                                    </div>
                                </Card.Body>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default NotificationsTab;
