import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, Button, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarTab = ({ showToast, onViewPatientDetails }) => {
    const { t } = useTranslation();
    const [events, setEvents] = useState([]);
    const [showManageHours, setShowManageHours] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [view, setView] = useState('month');
    const [date, setDate] = useState(new Date());
    const [workingHours, setWorkingHours] = useState([
        { day: t('Monday'), startTime: '09:00', endTime: '17:00', availableForQuickVisits: true, availableForLongShifts: false, dayShift: false, nightShift: false },
        { day: t('Tuesday'), startTime: '09:00', endTime: '17:00', availableForQuickVisits: true, availableForLongShifts: false, dayShift: false, nightShift: false },
        { day: t('Wednesday'), startTime: '09:00', endTime: '17:00', availableForQuickVisits: true, availableForLongShifts: false, dayShift: false, nightShift: false },
        { day: t('Thursday'), startTime: '09:00', endTime: '17:00', availableForQuickVisits: true, availableForLongShifts: false, dayShift: false, nightShift: false },
        { day: t('Friday'), startTime: '09:00', endTime: '17:00', availableForQuickVisits: false, availableForLongShifts: false, dayShift: false, nightShift: false },
        { day: t('Saturday'), startTime: '09:00', endTime: '17:00', availableForQuickVisits: false, availableForLongShifts: false, dayShift: false, nightShift: false },
        { day: t('Sunday'), startTime: '09:00', endTime: '17:00', availableForQuickVisits: true, availableForLongShifts: false, dayShift: false, nightShift: false },
    ]);
    const [accepts24HourShifts, setAccepts24HourShifts] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [bookingsRes, profileRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/bookings/nurse', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:5000/api/nurse/auth/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                if (profileRes.data.workingHours && profileRes.data.workingHours.length > 0) {
                    setWorkingHours(profileRes.data.workingHours.map(wh => ({
                        ...wh,
                        availableForQuickVisits: wh.availableForQuickVisits ?? true,
                        availableForLongShifts: wh.availableForLongShifts ?? true,
                        dayShift: wh.dayShift ?? false,
                        nightShift: wh.nightShift ?? false
                    })));
                }
                
                const parseBookingDate = (dateString, timeString) => {
                    let d = new Date(dateString);
                    if (isNaN(d.getTime()) || d.getFullYear() < 2020) {
                        const currentYear = new Date().getFullYear();
                        d = new Date(`${dateString} ${currentYear}`);
                        if (isNaN(d.getTime())) {
                            d = new Date();
                        } else if (d < new Date(new Date().setMonth(new Date().getMonth() - 3))) {
                            d = new Date(`${dateString} ${currentYear + 1}`);
                        }
                    }
                    
                    let timeStr = timeString || '12:00 AM';
                    let [t, ampm] = timeStr.split(' ');
                    if (t && ampm) {
                        let [h, m] = t.split(':').map(Number);
                        if (ampm === 'PM' && h !== 12) h += 12;
                        if (ampm === 'AM' && h === 12) h = 0;
                        d.setHours(h, m, 0, 0);
                    }
                    return d;
                };

                const mappedEvents = bookingsRes.data.map(booking => {
                    let start = parseBookingDate(booking.date, booking.time);

                    const end = new Date(start);
                    // Add duration based on shift
                    let durationHours = 2; // Default for quick visit
                    if (booking.shift && booking.shift.includes('Hour')) {
                        durationHours = parseInt(booking.shift.split(' ')[0]);
                    }
                    end.setHours(end.getHours() + durationHours);

                    let status = booking.status || 'upcoming';
                    if (status === 'upcoming' || status === 'confirmed' || status === 'in-progress' || status === 'Accepted') {
                        let isMissed = false;
                        const now = new Date();
                        try {
                            if (booking.isUrgent || status === 'Accepted') {
                                const createdDate = new Date(booking.createdAt || booking.date || Date.now());
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                createdDate.setHours(0, 0, 0, 0);
                                if (today > createdDate) {
                                    isMissed = true;
                                }
                            } else {
                                const diffHours = (now - start) / (1000 * 60 * 60);
                                isMissed = diffHours >= 3;
                            }
                        } catch(e) {}
                        
                        if (isMissed) {
                            status = 'missed';
                        } else if (status === 'upcoming' || status === 'confirmed' || status === 'Accepted') {
                            if (now >= start && now <= end) {
                                status = 'in-progress';
                            }
                        }
                    }

                    return {
                        id: booking._id,
                        title: booking.service || 'Appointment',
                        start,
                        end,
                        patient: booking.patientDetails?.name || 'Unknown Patient',
                        age: booking.patientId?.age || 30, // Mock age fallback
                        avatar: booking.patientId?.profilePicture?.startsWith('data:') ? booking.patientId.profilePicture : ('https://ui-avatars.com/api/?name=' + encodeURIComponent(booking.patientDetails?.name || 'Unknown Patient')),
                        address: booking.patientDetails?.address || 'No Address',
                        notes: booking.patientDetails?.message || 'No notes.',
                        phone: booking.patientDetails?.phone || 'No Phone',
                        shift: booking.shift || 'Quick Visit',
                        status: status,
                        rawBooking: booking
                    };
                });
                setEvents(mappedEvents);

            } catch (err) {
                console.error("Error fetching calendar data:", err);
            }
        };
        fetchData();
    }, []);

    const handleSaveWorkingHours = async () => {
        try {
            const token = localStorage.getItem('token');
            const payload = workingHours.map(wh => ({
                ...wh,
                isWorking: wh.availableForQuickVisits || wh.availableForLongShifts
            }));
            await axios.put('http://localhost:5000/api/nurse/auth/working-hours', { workingHours: payload }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast(t('Saved'), t('Working hours updated successfully.'), 'success');
            setShowManageHours(false);
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.message || error.message || t('Failed to save working hours.');
            showToast(t('Error'), errorMsg, 'error');
        }
    };

    const handleEventClick = (event) => {
        let status = event.status;
        const now = new Date();
        if (status === 'upcoming' || status === 'confirmed') {
            if (now >= event.start && now <= event.end) status = 'in-progress';
        }
        setSelectedEvent({ ...event, status });
    };

    const handleCloseEventModal = () => setSelectedEvent(null);

    const getStatusColor = (status) => {
        if (status === 'in-progress') return '#10b981'; // Green
        if (status === 'completed') return '#059669'; // Teal
        if (status === 'missed' || status === 'expired') return '#64748b'; // Gray
        if (status === 'cancelled') return '#ef4444'; // Red
        if (status === 'Pending_Emergency') return '#f59e0b'; // Orange
        return '#0ea5e9'; // Blue for upcoming/confirmed and fallback
    };

    const eventStyleGetter = (event, start, end, isSelected) => {
        let backgroundColor = getStatusColor(event.status);
        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
                fontWeight: '600',
                fontSize: '0.8rem',
                padding: '2px 5px'
            }
        };
    };

    const handleWorkingHourChange = (index, field, value) => {
        const newHours = [...workingHours];
        newHours[index][field] = value;
        setWorkingHours(newHours);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Header section with Actions */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h1 className="fw-bold text-dark mb-1 text-24">{t('My Schedule')}</h1>
                    <p className="text-muted fw-medium mb-0 text-15">{t('Manage your appointments and availability.')}</p>
                </div>
                
                <div className="d-flex flex-wrap gap-2">
                    <Button 
                        variant="primary" 
                        className="rounded-3 px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2 hover-lift transition-all text-14"
                        onClick={() => setShowManageHours(true)}
                    >
                        <i className="fa-solid fa-clock"></i> {t('Manage Working Hours')}
                    </Button>
                </div>
            </div>

            {/* The Big Calendar */}
            <Card className="border shadow-sm rounded-4 p-4 bg-body-tertiary" style={{ minHeight: '600px' }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '70vh' }}
                    onSelectEvent={handleEventClick}
                    eventPropGetter={eventStyleGetter}
                    views={['month', 'week', 'day']}
                    view={view}
                    onView={setView}
                    date={date}
                    onNavigate={setDate}
                    popup
                    rtl={document.documentElement.dir === 'rtl'}
                    messages={{
                        allDay: t('All Day'),
                        previous: t('Back'),
                        next: t('Next'),
                        today: t('Today'),
                        month: t('Month'),
                        week: t('Week'),
                        day: t('Day'),
                        agenda: t('Agenda'),
                        date: t('Date'),
                        time: t('Time'),
                        event: t('Event'),
                        noEventsInRange: t('No events in this range.'),
                        showMore: total => `+ ${total} ${t('more')}`
                    }}
                />
            </Card>

            {/* Event Details Modal */}
            <AnimatePresence>
                {selectedEvent && (
                    <Modal show={true} onHide={handleCloseEventModal} centered backdrop="static" contentClassName="border-0 rounded-4 shadow-lg overflow-hidden">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                            <div className="position-relative p-0">
                                {/* Header */}
                                <div className="p-4" style={{ backgroundColor: getStatusColor(selectedEvent.status), color: 'white' }}>
                                    <button onClick={handleCloseEventModal} className="btn btn-link text-white position-absolute" style={{ top: '15px', right: '15px', textDecoration: 'none' }}>
                                        <i className="fa-solid fa-xmark fs-5"></i>
                                    </button>
                                    <Badge bg="white" text="dark" className="mb-3 px-3 py-1 rounded-pill fw-bold border-0 text-capitalize" style={{ color: '#0f172a' }}>
                                        {t(selectedEvent.status.replace('_', ' '))}
                                    </Badge>
                                    <h4 className="fw-bold mb-1">{t(selectedEvent.title)}</h4>
                                    <p className="mb-0 text-white-50"><i className="fa-regular fa-calendar me-2"></i> {format(selectedEvent.start, 'PPpp')}</p>
                                </div>

                                {/* Body */}
                                <div className="p-4 bg-body-tertiary">
                                    <h6 className="fw-bold text-muted mb-3 text-12 text-uppercase" style={{ letterSpacing: '1px' }}>{t('Patient Details')}</h6>
                                    <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-body border">
                                        <img src={selectedEvent.avatar} alt="Patient" className="rounded-circle object-fit-cover shadow-sm" style={{ width: '60px', height: '60px' }} />
                                        <div>
                                            <h5 className="fw-bold text-dark mb-1 text-18">{selectedEvent.patient}</h5>
                                            <span className="text-muted text-14"><i className="fa-solid fa-phone me-2 text-secondary"></i> {selectedEvent.phone}</span>
                                        </div>
                                    </div>
                                    
                                    <h6 className="fw-bold text-muted mb-2 text-12 text-uppercase" style={{ letterSpacing: '1px' }}>{t('Shift Details')}</h6>
                                    <p className="text-dark mb-4 text-15 fw-bold" style={{ lineHeight: '1.6' }}>{selectedEvent.shift}</p>

                                    <h6 className="fw-bold text-muted mb-2 text-12 text-uppercase" style={{ letterSpacing: '1px' }}>{t('Service Notes')}</h6>
                                    <p className="text-dark mb-4 text-15" style={{ lineHeight: '1.6' }}>{selectedEvent.notes}</p>

                                    <h6 className="fw-bold text-muted mb-2 text-12 text-uppercase" style={{ letterSpacing: '1px' }}>{t('Location')}</h6>
                                    <div className="d-flex justify-content-between align-items-center p-3 rounded-3 bg-body border mb-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="rounded-circle bg-body shadow-sm d-flex align-items-center justify-content-center text-primary" style={{ width: '40px', height: '40px' }}>
                                                <i className="fa-solid fa-location-dot"></i>
                                            </div>
                                            <span className="fw-medium text-dark text-15">{selectedEvent.address}</span>
                                        </div>
                                    </div>

                                    {/* Actions based on status */}
                                    <div className="d-flex gap-2 pt-2 border-top border-secondary border-opacity-25 mt-3">
                                        {(selectedEvent.status === 'upcoming' || selectedEvent.status === 'confirmed' || selectedEvent.status === 'Accepted' || selectedEvent.status === 'in-progress') ? (
                                            <>
                                                {!selectedEvent.rawBooking?.isUrgent && (
                                                    <Button 
                                                        variant="danger" 
                                                        className="w-100 rounded-3 fw-bold py-3 shadow-sm border-0 hover-danger text-14 text-white" 
                                                        style={{ backgroundColor: '#dc3545' }}
                                                        onClick={() => { 
                                                            showToast('Cancelled', 'Visit cancelled for emergency.', 'error'); 
                                                            handleCloseEventModal(); 
                                                        }}
                                                    >
                                                        <i className="fa-solid fa-triangle-exclamation me-2"></i> {t('Cancel')}
                                                    </Button>
                                                )}
                                                <Button 
                                                    variant="primary" 
                                                    className="w-100 rounded-3 fw-bold py-3 shadow-sm border-0 text-14 text-white" 
                                                    onClick={() => {
                                                        if (onViewPatientDetails && selectedEvent.rawBooking) {
                                                            onViewPatientDetails(selectedEvent.rawBooking);
                                                        }
                                                    }}
                                                >
                                                    <i className="fa-solid fa-file-medical me-2"></i> {t('View Details')}
                                                </Button>
                                            </>
                                        ) : (
                                            <Button 
                                                variant="secondary" 
                                                className="w-100 rounded-3 fw-bold py-3 shadow-sm border-0 d-flex justify-content-center align-items-center gap-2 text-15 text-white" 
                                                onClick={() => { 
                                                    if (onViewPatientDetails && selectedEvent.rawBooking) {
                                                        onViewPatientDetails(selectedEvent.rawBooking);
                                                    }
                                                }}
                                            >
                                                <i className="fa-solid fa-file-medical me-2"></i> {t('View Full Details')}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* Manage Working Hours Modal */}
            <Modal show={showManageHours} onHide={() => setShowManageHours(false)} centered backdrop="static" size="lg" contentClassName="border-0 rounded-4 shadow-lg">
                <div className="p-4 p-md-5 position-relative">
                    <button onClick={() => setShowManageHours(false)} className="btn btn-link text-muted position-absolute" style={{ top: '15px', right: '15px', textDecoration: 'none' }}>
                        <i className="fa-solid fa-xmark fs-5"></i>
                    </button>
                    
                    <div className="mb-4">
                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                            <i className="fa-solid fa-clock-rotate-left fs-3"></i>
                        </div>
                        <h4 className="fw-bold text-dark mb-1">{t('Manage Working Hours')}</h4>
                        <p className="text-muted mb-0">{t('Set your availability to let the system automatically schedule your slots.')}</p>
                    </div>

                    <Form>
                        {workingHours.map((wh, idx) => (
                            <div key={idx} className="mb-4 p-4 border border-secondary border-opacity-25 rounded-4 bg-body shadow-sm">
                                <h5 className="fw-bold text-primary mb-3 pb-2 border-bottom">{wh.day}</h5>
                                
                                {/* Quick Visits Section */}
                                <div className="mb-4">
                                    <Form.Check 
                                        type="switch" 
                                        id={`quick-${idx}`} 
                                        label={<span className="fw-bold text-dark">{t('Quick Visits (Tasks)')}</span>} 
                                        checked={wh.availableForQuickVisits} 
                                        onChange={(e) => handleWorkingHourChange(idx, 'availableForQuickVisits', e.target.checked)} 
                                        className="mb-3 text-15"
                                    />
                                    {wh.availableForQuickVisits && (
                                        <div className="d-flex align-items-center gap-2 ps-4 ms-2 border-start border-3 border-primary">
                                            <Form.Control 
                                                type="time" 
                                                value={wh.startTime} 
                                                onChange={(e) => handleWorkingHourChange(idx, 'startTime', e.target.value)} 
                                                className="rounded-3 shadow-none border-secondary border-opacity-25 bg-body-tertiary" 
                                                style={{ maxWidth: '140px' }}
                                            />
                                            <span className="text-muted fw-bold px-2">{t('TO')}</span>
                                            <Form.Control 
                                                type="time" 
                                                value={wh.endTime} 
                                                onChange={(e) => handleWorkingHourChange(idx, 'endTime', e.target.value)} 
                                                className="rounded-3 shadow-none border-secondary border-opacity-25 bg-body-tertiary" 
                                                style={{ maxWidth: '140px' }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Long Shifts Section */}
                                <div>
                                    <Form.Check 
                                        type="switch" 
                                        id={`long-${idx}`} 
                                        label={<span className="fw-bold text-dark">{t('Long Shifts (Hours)')}</span>} 
                                        checked={wh.availableForLongShifts} 
                                        onChange={(e) => handleWorkingHourChange(idx, 'availableForLongShifts', e.target.checked)} 
                                        className="mb-3 text-15"
                                    />
                                    {wh.availableForLongShifts && (
                                        <div className="ps-4 ms-2 border-start border-3 border-success">
                                            <Form.Check 
                                                type="checkbox"
                                                id={`day-shift-${idx}`}
                                                label={<span className="text-14 text-dark">{t('Day Shift (9:00 AM → 9:00 PM)')}</span>}
                                                checked={wh.dayShift}
                                                onChange={(e) => handleWorkingHourChange(idx, 'dayShift', e.target.checked)}
                                                className="mb-2"
                                            />
                                            <Form.Check 
                                                type="checkbox"
                                                id={`night-shift-${idx}`}
                                                label={<span className="text-14 text-dark">{t('Night Shift (9:00 PM → 9:00 AM)')}</span>}
                                                checked={wh.nightShift}
                                                onChange={(e) => handleWorkingHourChange(idx, 'nightShift', e.target.checked)}
                                            />
                                            {wh.dayShift && wh.nightShift && (
                                                <div className="mt-2 text-success fw-bold text-14 bg-success bg-opacity-10 p-2 rounded-2 d-inline-block">
                                                    <i className="fa-solid fa-check-circle me-1"></i> {t('24-Hour Shift Automatically Enabled')}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        <div className="d-flex justify-content-end gap-2 mt-5">
                            <Button variant="light" className="rounded-3 fw-bold px-4 py-2 text-dark border hover-bg-body-tertiary" onClick={() => setShowManageHours(false)}>{t('Cancel')}</Button>
                            <Button variant="primary" className="rounded-3 fw-bold px-5 py-2 shadow-sm" onClick={handleSaveWorkingHours}>{t('Save Changes')}</Button>
                        </div>
                    </Form>
                </div>
            </Modal>

            <style>{`
                .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
                .hover-bg-body-tertiary:hover { background-color: #f1f5f9 !important; }
                .hover-danger:hover { background-color: #b91c1c !important; color: #fff !important; }
                .cursor-pointer { cursor: pointer; }
                .transition-all { transition: all 0.2s ease-in-out; }

                /* Big Calendar Overrides */
                .rbc-calendar {
                    font-family: inherit;
                }
                .rbc-toolbar button {
                    border-radius: 6px;
                    border: 1px solid #cbd5e1;
                    color: #334155;
                    font-weight: 600;
                    padding: 8px 16px;
                    margin-right: 8px;
                    transition: all 0.2s ease;
                }
                .rbc-toolbar button:hover {
                    background-color: #f1f5f9;
                }
                .rbc-toolbar button.rbc-active {
                    background-color: rgba(2, 89, 85, 0.1);
                    color: var(--primary);
                    border-color: rgba(2, 89, 85, 0.3);
                    box-shadow: none;
                }
                .rbc-header {
                    padding: 10px;
                    font-weight: 700;
                    color: #64748b;
                    background-color: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                }
                .rbc-today {
                    background-color: rgba(2, 89, 85, 0.05);
                }
                .rbc-event {
                    transition: transform 0.1s ease;
                }
                .rbc-event:hover {
                    transform: scale(1.02);
                }
            `}</style>
        </motion.div>
    );
};

export default CalendarTab;
