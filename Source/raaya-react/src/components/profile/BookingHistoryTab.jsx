import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Form, Row, Col } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function BookingHistoryTab() {
    const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'completed', 'cancelled'
    const [showRateModal, setShowRateModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [bookings, setBookings] = useState([]);
    const [prices, setPrices] = useState({});
    const [loading, setLoading] = useState(true);

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelError, setCancelError] = useState('');

    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [bookingToReschedule, setBookingToReschedule] = useState(null);
    const [nurseDetails, setNurseDetails] = useState(null);
    const [availableDates, setAvailableDates] = useState([]);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [timesMap, setTimesMap] = useState({});
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [weekOffset, setWeekOffset] = useState(0);
    const [rescheduleLoading, setRescheduleLoading] = useState(false);
    const [rescheduleError, setRescheduleError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const [bookingsRes, settingsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/bookings/patient', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:5000/api/settings')
                ]);
                
                const processedBookings = bookingsRes.data.map(booking => {
                    if (booking.status === 'upcoming' || booking.status === 'confirmed' || booking.status === 'in-progress') {
                        let isMissed = false;
                        try {
                            let d = new Date(booking.date);
                            if (d.getFullYear() < 2020) {
                                const currentYear = new Date().getFullYear();
                                d = new Date(`${booking.date} ${currentYear}`);
                                if (d < new Date(new Date().setMonth(new Date().getMonth() - 3))) {
                                    d = new Date(`${booking.date} ${currentYear + 1}`);
                                }
                            }
                            if (booking.time) {
                                const [timeStr, modifier] = booking.time.split(' ');
                                let [h, m] = timeStr.split(':');
                                let hours = parseInt(h, 10);
                                if (hours === 12 && modifier === 'AM') hours = 0;
                                if (hours !== 12 && modifier === 'PM') hours += 12;
                                d.setHours(hours, parseInt(m, 10) || 0);
                            }
                            const diffHours = (new Date() - d) / (1000 * 60 * 60);
                            if (diffHours >= 3) isMissed = true;
                        } catch (e) {}

                        if (isMissed) {
                            return { ...booking, status: booking.status === 'in-progress' ? 'expired' : 'missed' };
                        }
                    }
                    return booking;
                });
                
                setBookings(processedBookings);
                if (settingsRes.data && settingsRes.data.servicesPricing) {
                    setPrices(settingsRes.data.servicesPricing);
                }
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const parseBookingDate = (dateString) => {
        let d = new Date(dateString);
        if (d.getFullYear() < 2020) {
            const currentYear = new Date().getFullYear();
            d = new Date(`${dateString} ${currentYear}`);
            // If it appears more than 3 months in the past, assume it's for next year
            if (d < new Date(new Date().setMonth(new Date().getMonth() - 3))) {
                d = new Date(`${dateString} ${currentYear + 1}`);
            }
        }
        return d;
    };

    const formatDate = (dateString, timeString) => {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        const d = parseBookingDate(dateString).toLocaleDateString('en-US', options);
        return timeString ? `${d}, ${timeString}` : d;
    };

    const getStatusBadge = (status) => {
        switch(status.toLowerCase()) {
            case 'completed': 
                return <span className="badge rounded-pill fw-bold px-3 py-2" style={{ backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}><i className="fa-solid fa-check-circle me-1"></i> Completed</span>;
            case 'pending': 
                return <span className="badge rounded-pill fw-bold px-3 py-2" style={{ backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}><i className="fa-solid fa-clock-rotate-left me-1"></i> Pending</span>;
            case 'in-progress': 
                return <span className="badge rounded-pill fw-bold px-3 py-2" style={{ backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}><i className="fa-solid fa-spinner me-1"></i> In Progress</span>;
            case 'confirmed': 
                return <span className="badge rounded-pill fw-bold px-3 py-2" style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}><i className="fa-solid fa-thumbs-up me-1"></i> Confirmed</span>;
            case 'cancelled': 
                return <span className="badge rounded-pill fw-bold px-3 py-2" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}><i className="fa-solid fa-times-circle me-1"></i> Cancelled</span>;
            case 'upcoming': 
                return <span className="badge rounded-pill fw-bold px-3 py-2" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}><i className="fa-solid fa-calendar-check me-1"></i> Upcoming</span>;
            case 'pending_emergency':
                return <span className="badge rounded-pill fw-bold px-3 py-2" style={{ backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}><i className="fa-solid fa-hourglass-half me-1"></i> Pending Acceptance</span>;
            case 'missed':
                return <span className="badge rounded-pill fw-bold px-3 py-2" style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1' }}><i className="fa-solid fa-user-slash me-1"></i> Missed</span>;
            case 'expired':
                return <span className="badge rounded-pill fw-bold px-3 py-2" style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1' }}><i className="fa-solid fa-clock me-1"></i> Expired</span>;
            default: 
                return <span className="badge bg-secondary rounded-pill fw-bold px-3 py-2">{status}</span>;
        }
    };

    let filteredBookings = bookings.filter(booking => {
        if (filter === 'upcoming') return booking.status === 'upcoming' || booking.status === 'confirmed' || booking.status === 'in-progress' || booking.status === 'Pending_Emergency';
        if (filter === 'completed') return booking.status === 'completed' || booking.status === 'missed' || booking.status === 'expired';
        if (filter === 'cancelled') return booking.status === 'cancelled';
        return true;
    }).sort((a, b) => {
        if (filter === 'upcoming') return parseBookingDate(a.date) - parseBookingDate(b.date);
        return parseBookingDate(b.date) - parseBookingDate(a.date);
    });

    if (filter === 'cancelled') {
        filteredBookings = filteredBookings.slice(0, 5);
    }

    const handleDeleteCancelled = async (bookingId) => {
        if (!window.confirm("Are you sure you want to permanently delete this cancelled booking?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/bookings/patient/${bookingId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(prev => prev.filter(b => b._id !== bookingId));
        } catch (error) {
            console.error("Failed to delete booking", error);
            alert("Failed to delete booking.");
        }
    };

    const handleRateClick = (booking) => {
        setSelectedBooking(booking);
        setShowRateModal(true);
        setRating(0);
        setReviewText('');
    };

    
    useEffect(() => {
        if (!bookingToReschedule || !nurseDetails) return;

        const dates = [];
        const tMap = {};
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() + (weekOffset * 7));

        const hasShifts = bookingToReschedule.shift && bookingToReschedule.shift !== 'Single Visit' && bookingToReschedule.shift !== 'Quick Visit';
        const selectedShift = bookingToReschedule.shift || '12 Hour';

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayName = daysOfWeek[currentDate.getDay()];
            const dateStr = currentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            
            let dayLabel = dayName.slice(0, 3);
            if (weekOffset === 0 && i === 0) dayLabel = 'Today';
            else if (weekOffset === 0 && i === 1) dayLabel = 'Tomorrow';

            let isWorking = false;
            let times = [];
            
            if (nurseDetails && nurseDetails.workingHours) {
                const wh = nurseDetails.workingHours.find(w => w.day === dayName);
                if (wh) {
                    let canDoQuick = wh.availableForQuickVisits !== false;
                    let canDoLong = wh.availableForLongShifts !== false;

                    if (canDoQuick && canDoLong && nurseDetails.bookings && nurseDetails.bookings.length > 0) {
                        const dayBookings = nurseDetails.bookings.filter(b => b.date === dateStr && b.status !== 'cancelled');
                        const activeDayBookings = dayBookings.filter(b => b._id !== bookingToReschedule._id);
                        
                        if (activeDayBookings.length > 0) {
                            const hasQuick = activeDayBookings.some(b => b.shift === 'Single Visit' || b.shift === 'Quick Visit' || (b.shift && !b.shift.includes('Hour')));
                            const hasLong = activeDayBookings.some(b => b.shift && b.shift.includes('Hour'));
                            
                            if (hasQuick) canDoLong = false;
                            if (hasLong) canDoQuick = false;
                        }
                    }

                    if (!hasShifts && canDoQuick) {
                        isWorking = true;
                        let [startH, startM] = (wh.startTime || '09:00').split(':').map(Number);
                        let [endH, endM] = (wh.endTime || '17:00').split(':').map(Number);
                        
                        let curH = startH;
                        let curM = startM;
                        
                        while (curH < endH || (curH === endH && curM < endM)) {
                            const ampm = curH >= 12 ? 'PM' : 'AM';
                            const displayH = curH % 12 === 0 ? 12 : curH % 12;
                            const displayM = curM === 0 ? '00' : curM;
                            times.push(`${displayH < 10 ? '0'+displayH : displayH}:${displayM < 10 && displayM !== '00' ? '0'+displayM : displayM} ${ampm}`);
                            
                            curM += 30;
                            if (curM >= 60) {
                                curH += 1;
                                curM -= 60;
                            }
                        }
                    } else if (hasShifts && canDoLong) {
                        const shiftHours = parseInt((selectedShift || '12 Hour').split(' ')[0]);
                        if (shiftHours) {
                            if (shiftHours === 12) {
                                if (wh.dayShift) times.push('09:00 AM');
                                if (wh.nightShift) times.push('09:00 PM');
                            } else if (shiftHours === 6) {
                                if (wh.dayShift) {
                                    times.push('09:00 AM');
                                    times.push('03:00 PM');
                                }
                                if (wh.nightShift) {
                                    times.push('09:00 PM');
                                    times.push('03:00 AM');
                                }
                            } else if (shiftHours === 24) {
                                if (wh.dayShift && wh.nightShift) times.push('09:00 AM');
                            }
                            if (times.length > 0) isWorking = true;
                        }
                    }
                    // Remove the current appointment's time from the options
                    if (bookingToReschedule && parseBookingDate(bookingToReschedule.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) === dateStr) {
                        times = times.filter(t => t !== bookingToReschedule.time);
                    }

                    // FILTER OUT BOOKED SLOTS
                    const filterTimesByBookings = (bookingsArray) => {
                        if (!bookingsArray || bookingsArray.length === 0 || times.length === 0) return;
                        
                        const dayBookings = bookingsArray.filter(b => b.date === dateStr && b.status?.toLowerCase() !== 'cancelled' && String(b._id) !== String(bookingToReschedule._id));
                        if (dayBookings.length === 0) return;

                        const newTimes = [];
                        for (let t of times) {
                            const [tHStr, tMStr_ampm] = t.split(':');
                            const tMStr = tMStr_ampm.split(' ')[0];
                            const tAmPm = tMStr_ampm.split(' ')[1];
                            let tH = parseInt(tHStr);
                            if (tAmPm === 'PM' && tH !== 12) tH += 12;
                            if (tAmPm === 'AM' && tH === 12) tH = 0;
                            const tMin = tH * 60 + parseInt(tMStr);
                            
                            const endTMin = tMin + (hasShifts ? parseInt((selectedShift || '12 Hour').split(' ')[0]) * 60 : 120);

                            let overlaps = false;
                            for (let b of dayBookings) {
                                if (!b.time) continue;
                                const [bHStr, bMStr_ampm] = b.time.split(':');
                                const bMStr = bMStr_ampm.split(' ')[0];
                                const bAmPm = bMStr_ampm.split(' ')[1];
                                let bH = parseInt(bHStr);
                                if (bAmPm === 'PM' && bH !== 12) bH += 12;
                                if (bAmPm === 'AM' && bH === 12) bH = 0;
                                const bStartMin = bH * 60 + parseInt(bMStr);
                                
                                const isBShift = b.shift && b.shift !== 'Single Visit' && b.shift !== 'Quick Visit';
                                const bDuration = isBShift ? parseInt(b.shift.split(' ')[0]) * 60 : 120; // 2 hours for Quick Visit
                                const bEndMin = bStartMin + bDuration;

                                if (tMin < bEndMin && endTMin > bStartMin) {
                                    overlaps = true;
                                    break;
                                }
                            }
                            if (!overlaps) {
                                newTimes.push(t);
                            }
                        }
                        times = newTimes;
                        if (times.length === 0) isWorking = false;
                    };

                    // Filter out times blocked by nurse's existing bookings
                    filterTimesByBookings(nurseDetails.bookings);

                    // Filter out times blocked by patient's own existing bookings
                    filterTimesByBookings(bookings);
                }
            }

            dates.push({ 
                id: dateStr, 
                day: dayLabel,
                fullDayName: dayName, 
                date: dateStr, 
                isWorking,
                isPast: currentDate < new Date(new Date().setHours(0,0,0,0)),
            });
            tMap[dateStr] = times.length > 0 ? times : [];
        }

        setAvailableDates(dates);
        setTimesMap(tMap);
        
        const firstAvailable = dates.find(d => d.isWorking && !d.isPast);
        if (firstAvailable && (!selectedDate || !dates.find(d => d.id === selectedDate && d.isWorking))) {
            setSelectedDate(firstAvailable.id);
        }
    }, [nurseDetails, weekOffset, bookingToReschedule, selectedDate]);

    useEffect(() => {
        if (timesMap[selectedDate]) {
            let times = timesMap[selectedDate];
            const now = new Date();
            const dateObj = availableDates.find(d => d.id === selectedDate);
            if (dateObj && dateObj.day === 'Today') {
                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                const LEAD_TIME_BUFFER = 60; // 1 hour
                times = times.filter(timeStr => {
                    const [time, period] = timeStr.split(' ');
                    let [hours, minutes] = time.split(':').map(Number);
                    if (period === 'PM' && hours !== 12) hours += 12;
                    if (period === 'AM' && hours === 12) hours = 0;
                    const slotMinutes = hours * 60 + minutes;
                    return slotMinutes > (currentMinutes + LEAD_TIME_BUFFER);
                });
            }
            setAvailableTimes(times);
            if (!times.includes(selectedTime)) {
                setSelectedTime(times[0] || '');
            }
        }
    }, [selectedDate, timesMap, availableDates, selectedTime]);

    const handleCancelClick = (booking) => {
        setBookingToCancel(booking);
        setShowCancelModal(true);
        setCancelError('');
    };

    const confirmCancel = async () => {
        if (!bookingToCancel) return;
        setCancelLoading(true);
        setCancelError('');
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/bookings/patient/${bookingToCancel._id}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(prev => prev.map(b => b._id === bookingToCancel._id ? { ...b, status: 'cancelled' } : b));
            setShowCancelModal(false);
        } catch (error) {
            console.error('Failed to cancel booking', error);
            setCancelError(error.response?.data?.message || 'Failed to cancel booking. Please try again.');
        } finally {
            setCancelLoading(false);
        }
    };

    const handleRescheduleClick = async (booking) => {
        setBookingToReschedule(booking);
        setRescheduleError('');
        setWeekOffset(0);
        setSelectedDate('');
        setSelectedTime('');
        setShowRescheduleModal(true);
        try {
            const nurseId = typeof booking.nurseId === 'object' && booking.nurseId !== null ? booking.nurseId._id : booking.nurseId;
            const res = await axios.get(`http://localhost:5000/api/public/nurses/${nurseId}`);
            setNurseDetails(res.data);
        } catch (error) {
            setRescheduleError('Failed to load nurse availability.');
        }
    };

    const confirmReschedule = async () => {
        if (!selectedDate || !selectedTime) {
            setRescheduleError('Please select a date and time.');
            return;
        }
        setRescheduleLoading(true);
        setRescheduleError('');
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/bookings/patient/${bookingToReschedule._id}/reschedule`, {
                date: selectedDate,
                time: selectedTime,
                shift: bookingToReschedule.shift
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update local state
            setBookings(prev => prev.map(b => {
                if (b._id === bookingToReschedule._id) {
                    return { ...b, date: selectedDate, time: selectedTime, status: 'upcoming' };
                }
                return b;
            }));
            setShowRescheduleModal(false);
        } catch (error) {
            setRescheduleError(error.response?.data?.message || 'Failed to reschedule. The slot might be booked.');
        } finally {
            setRescheduleLoading(false);
        }
    };

    const [showRebookModal, setShowRebookModal] = useState(false);
    const [bookingToRebook, setBookingToRebook] = useState(null);
    const [rebookService, setRebookService] = useState('');
    const [rebookShift, setRebookShift] = useState('');
    const [rebookLoading, setRebookLoading] = useState(false);
    const [rebookError, setRebookError] = useState('');

    const handleRebookClick = async (booking) => {
        setBookingToRebook(booking);
        setRebookError('');
        setWeekOffset(0);
        setSelectedDate('');
        setSelectedTime('');
        setRebookService(booking.service);
        setRebookShift(booking.shift || 'Single Visit');
        setShowRebookModal(true);
        try {
            const nurseId = typeof booking.nurseId === 'object' && booking.nurseId !== null ? booking.nurseId._id : booking.nurseId;
            const res = await axios.get(`http://localhost:5000/api/public/nurses/${nurseId}`);
            setNurseDetails(res.data);
            
            // Note: we can reuse the same effect for available dates/times by tricking it into thinking we are rescheduling,
            // but we need to make sure the time overlap check works.
            // We temporarily set bookingToReschedule to a dummy object just to make the effect run.
            setBookingToReschedule({ _id: 'dummy', shift: booking.shift || 'Single Visit', date: 'dummy' });
        } catch (error) {
            setRebookError('Failed to load nurse availability.');
        }
    };

    // Update effect dependency for rebook shift change
    useEffect(() => {
        if (showRebookModal && bookingToRebook) {
            setBookingToReschedule({ _id: 'dummy', shift: rebookShift, date: 'dummy' });
            setSelectedDate('');
            setSelectedTime('');
        }
    }, [rebookShift, showRebookModal, bookingToRebook]);

    const confirmRebook = async () => {
        if (!selectedDate || !selectedTime || !rebookService) {
            setRebookError('Please complete all selections.');
            return;
        }
        setRebookLoading(true);
        setRebookError('');
        try {
            const token = localStorage.getItem('token');
            const nurseId = typeof bookingToRebook.nurseId === 'object' && bookingToRebook.nurseId !== null ? bookingToRebook.nurseId._id : bookingToRebook.nurseId;
            
            const calculateTotalCost = (service, shift) => {
                if (!service || !prices[service]) return 0;
                const basePrice = prices[service];
                const hasShifts = ['Elderly Care', 'Post-operative Care', 'Basic Care', 'Escort Services & Responsibilities'].includes(service);
                if (hasShifts && shift && shift.includes('Hour')) {
                    const hours = parseInt(shift.split(' ')[0]) || 1;
                    return basePrice * hours;
                }
                return basePrice;
            };

            const totalCost = calculateTotalCost(rebookService, rebookShift);

            const res = await axios.post(`http://localhost:5000/api/bookings/patient`, {
                nurseId,
                service: rebookService,
                shift: rebookShift,
                date: selectedDate,
                time: selectedTime,
                patientDetails: bookingToRebook.patientDetails || {},
                paymentMethod: 'cash',
                totalCost
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Add new booking to list
            setBookings(prev => [res.data.booking, ...prev]);
            setShowRebookModal(false);
            
            // Clear dummy
            setBookingToReschedule(null);
        } catch (error) {
            setRebookError(error.response?.data?.message || 'Failed to book. The slot might be booked.');
        } finally {
            setRebookLoading(false);
        }
    };

    const oldHandleCancel = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/bookings/patient/${bookingId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
        } catch (error) {
            console.error("Failed to cancel booking", error);
            alert("Failed to cancel booking.");
        }
    };

    const handleDeleteAllCancelled = async () => {
        if (!window.confirm("Are you sure you want to delete all cancelled bookings?")) return;
        try {
            const token = localStorage.getItem('token');
            const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
            await Promise.all(cancelledBookings.map(b => 
                axios.delete(`http://localhost:5000/api/bookings/patient/${b._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ));
            setBookings(prev => prev.filter(b => b.status !== 'cancelled'));
        } catch (error) {
            console.error("Failed to delete cancelled bookings", error);
            alert("Failed to delete all cancelled bookings. Some may have been deleted.");
            window.location.reload();
        }
    };


    const handleRebook = (booking, isReschedule = false) => {
        // Find nurse ID (if booking.nurseId is an object, get its _id, otherwise use it directly)
        const nurseId = typeof booking.nurseId === 'object' && booking.nurseId !== null ? booking.nurseId._id : booking.nurseId;
        navigate('/book', { 
            state: { 
                preSelectedService: booking.service,
                preSelectedNurse: nurseId,
                preSelectedShift: booking.shift,
                reschedulingFrom: isReschedule ? booking._id : undefined
            }
        });
    };

    const isPastOrToday = (dateString) => {
        const bookingDate = parseBookingDate(dateString);
        bookingDate.setHours(0,0,0,0);
        const today = new Date();
        today.setHours(0,0,0,0);
        return bookingDate <= today;
    };

    const submitRating = async () => {
        if (!selectedBooking || rating === 0) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/bookings/patient/${selectedBooking._id}/rate`, {
                rating,
                comment: reviewText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(prev => prev.map(b => b._id === selectedBooking._id ? { ...b, isRated: true } : b));
            setShowRateModal(false);
        } catch (error) {
            console.error("Failed to submit rating", error);
            alert(error.response?.data?.message || "Failed to submit rating.");
        }
    };

    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceBooking, setInvoiceBooking] = useState(null);

    const handleViewInvoice = (booking) => {
        setInvoiceBooking(booking);
        setShowInvoiceModal(true);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -15 }}
            className="w-100"
        >
            <style>{`
                .custom-modal-backdrop { 
                    background-color: rgba(15, 23, 42, 0.4); 
                    backdrop-filter: blur(8px); 
                    -webkit-backdrop-filter: blur(8px);
                } 
                .custom-modal .modal-content { 
                    border-radius: 1.5rem; 
                    border: none; 
                    box-shadow: 0 20px 50px rgba(0,0,0,0.15); 
                    overflow: hidden;
                }
            `}</style>
            <div className="mb-4">
                <h4 className="fw-bold text-dark mb-1">Booking History</h4>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Track your upcoming appointments and past visits.</p>
            </div>

            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <div className="bg-white p-1 rounded-pill d-inline-flex shadow-sm border align-items-center" style={{ borderColor: '#e2e8f0' }}>
                    <Button 
                        variant={filter === 'upcoming' ? 'primary' : 'transparent'} 
                        className={`rounded-pill fw-bold px-4 py-2 border-0 ${filter !== 'upcoming' && 'text-muted hover-bg-gray'}`}
                        onClick={() => setFilter('upcoming')}
                        style={{ transition: 'all 0.3s ease', fontSize: '0.95rem' }}
                    >
                        <i className="fa-solid fa-calendar-day me-2"></i>Upcoming
                    </Button>
                    <Button 
                        variant={filter === 'completed' ? 'primary' : 'transparent'} 
                        className={`rounded-pill fw-bold px-4 py-2 border-0 ${filter !== 'completed' && 'text-muted hover-bg-gray'}`}
                        onClick={() => setFilter('completed')}
                        style={{ transition: 'all 0.3s ease', fontSize: '0.95rem' }}
                    >
                        <i className="fa-solid fa-clipboard-check me-2"></i>Completed
                    </Button>
                    <Button 
                        variant={filter === 'cancelled' ? 'primary' : 'transparent'} 
                        className={`rounded-pill fw-bold px-4 py-2 border-0 ${filter !== 'cancelled' && 'text-muted hover-bg-gray'}`}
                        onClick={() => setFilter('cancelled')}
                        style={{ transition: 'all 0.3s ease', fontSize: '0.95rem' }}
                    >
                        <i className="fa-solid fa-ban me-2"></i>Cancelled
                    </Button>
                </div>
                {filter === 'cancelled' && filteredBookings.length > 0 && (
                    <Button variant="danger" className="rounded-pill fw-bold px-4 py-2 shadow-sm d-flex align-items-center gap-2 border-0 hover-bg-danger" onClick={handleDeleteAllCancelled}>
                        <i className="fa-solid fa-trash-can"></i> Delete All Cancelled
                    </Button>
                )}
            </div>

            {/* Bookings List */}
            <div className="d-flex flex-column gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
                        <motion.div
                            key={booking._id || booking.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="border-0 rounded-4 overflow-hidden position-relative booking-card mb-4" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
                                {/* Left Accent Line based on status */}
                                <div className="position-absolute h-100" style={{ 
                                    width: '6px', left: 0, top: 0,
                                    backgroundColor: booking.status === 'completed' ? '#10b981' : booking.status === 'cancelled' ? '#ef4444' : booking.status === 'confirmed' ? '#3b82f6' : 'var(--primary)'
                                }}></div>

                                <Card.Body className="p-4 p-md-5 ps-md-5">
                                    <Row className="align-items-center g-4">
                                        {/* Booking Info */}
                                        <Col md={8} lg={9}>
                                            <div className="d-flex flex-wrap align-items-center gap-3 mb-2">
                                                {getStatusBadge(booking.status)}
                                                <span className="badge rounded-pill fw-medium px-3 py-2" style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>#{booking._id.substring(0, 8).toUpperCase()}</span>
                                            </div>
                                            <h4 className="fw-bold text-dark mb-1" style={{ fontSize: '1.4rem', letterSpacing: '-0.5px' }}>{booking.service}</h4>
                                            
                                            <div className="d-flex align-items-center gap-2 mb-4 text-muted">
                                                <i className="fa-solid fa-user-nurse" style={{ color: 'var(--primary)' }}></i>
                                                <span className="fw-medium" style={{ fontSize: '1.05rem' }}>Nurse: <span className="text-dark">{booking.nurseId?.name || 'Assigned Nurse'}</span></span>
                                            </div>
                                            
                                            <div className="d-flex flex-wrap gap-4 mt-3 pt-4 border-top" style={{ borderColor: '#f1f5f9' }}>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', backgroundColor: 'rgba(2, 89, 85, 0.08)' }}>
                                                        <i className="fa-regular fa-calendar-days" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}></i>
                                                    </div>
                                                    <div>
                                                        <span className="d-block text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Date & Time</span>
                                                        <span className="fw-bold text-dark" style={{ fontSize: '1.05rem' }}>{formatDate(booking.date, booking.time)}</span>
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff' }}>
                                                        <i className="fa-regular fa-clock text-primary" style={{ fontSize: '1.25rem' }}></i>
                                                    </div>
                                                    <div>
                                                        <span className="d-block text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Duration</span>
                                                        <span className="fw-bold text-dark" style={{ fontSize: '1.05rem' }}>{booking.shift || 'Task-based'}</span>
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', backgroundColor: '#ecfdf5' }}>
                                                        <i className="fa-solid fa-money-bill-wave text-success" style={{ fontSize: '1.25rem' }}></i>
                                                    </div>
                                                    <div>
                                                        <span className="d-block text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Total Cost</span>
                                                        <span className="fw-bold text-dark" style={{ fontSize: '1.05rem' }}>{booking.totalCost} EGP</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>

                                        {/* Actions */}
                                        <Col md={4} lg={3} className="d-flex flex-column gap-2 border-start-md ps-md-4">
                                            {(booking.status === 'upcoming' || booking.status === 'confirmed' || booking.status === 'in-progress' || booking.status === 'Pending_Emergency') && (
                                                (booking.status === 'in-progress') ? (
                                                    <div className="text-center py-2 px-3 rounded-3" style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }}>
                                                        <span className="fw-bold text-dark d-block" style={{ fontSize: '0.9rem', color: '#c2410c' }}>
                                                            <i className="fa-solid fa-spinner me-2"></i>In Progress
                                                        </span>
                                                    </div>
                                                ) : (booking.status === 'Pending_Emergency') ? (
                                                    <Button variant="light" className="rounded-pill fw-bold w-100 text-danger bg-danger bg-opacity-10 border-0 hover-bg-danger py-2 d-flex align-items-center justify-content-center gap-2" onClick={() => handleCancelClick(booking)}>
                                                        <i className="fa-solid fa-xmark"></i> Cancel Request
                                                    </Button>
                                                ) : isPastOrToday(booking.date) ? (
                                                    <div className="text-center py-2 px-3 rounded-3" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                                                        <span className="fw-bold text-dark d-block" style={{ fontSize: '0.9rem', color: '#16a34a' }}>
                                                            <i className="fa-regular fa-clock me-2"></i>Visit is Today
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Button variant="outline-primary" className="rounded-pill fw-bold w-100 border-2 hover-lift py-2 d-flex align-items-center justify-content-center gap-2" onClick={() => handleRescheduleClick(booking)}>
                                                            <i className="fa-solid fa-calendar-days"></i> Reschedule
                                                        </Button>
                                                        <Button variant="light" className="rounded-pill fw-bold w-100 text-danger bg-danger bg-opacity-10 border-0 hover-bg-danger py-2 d-flex align-items-center justify-content-center gap-2" onClick={() => handleCancelClick(booking)}>
                                                            <i className="fa-solid fa-xmark"></i> Cancel
                                                        </Button>
                                                    </>
                                                )
                                            )}

                                            {booking.status === 'completed' && (
                                                <>
                                                    <Button variant="primary" className="rounded-pill fw-bold w-100 shadow-sm hover-lift" onClick={() => handleRebookClick(booking)}>
                                                        <i className="fa-solid fa-rotate-right me-2"></i> Rebook
                                                    </Button>
                                                    {!booking.isRated && (
                                                        <Button variant="outline-warning" className="rounded-pill fw-bold w-100 border-2 text-dark" onClick={() => handleRateClick(booking)}>
                                                            <i className="fa-solid fa-star text-warning me-2"></i> Rate Nurse
                                                        </Button>
                                                    )}
                                                    <Button variant="link" className="text-decoration-none fw-medium text-muted w-100 p-0 mt-1" style={{ fontSize: '0.85rem' }} onClick={() => handleViewInvoice(booking)}>
                                                        View Invoice
                                                    </Button>
                                                </>
                                            )}

                                            {booking.status === 'cancelled' && (
                                                <>
                                                    <Button variant="light" className="rounded-pill fw-bold w-100 text-danger bg-danger bg-opacity-10 border-0 hover-bg-danger py-2 d-flex align-items-center justify-content-center gap-2" onClick={() => handleDeleteCancelled(booking._id)}>
                                                        <i className="fa-solid fa-trash"></i> Delete Record
                                                    </Button>
                                                </>
                                            )}
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        

        </motion.div>

                    )) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-5 bg-white rounded-4 shadow-sm border" style={{ borderColor: '#eef2f5' }}>
                            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                                <i className="fa-regular fa-calendar-xmark fs-2 text-muted"></i>
                            </div>
                            <h5 className="fw-bold text-dark">No Bookings Found</h5>
                            <p className="text-muted">You don't have any {filter} bookings at the moment.</p>
                            {filter !== 'upcoming' && (
                                <Button variant="primary" className="rounded-pill fw-bold px-4 py-2 mt-2 shadow-sm" onClick={() => setFilter('upcoming')}>
                                    View Upcoming
                                </Button>
                            )}
                        

        </motion.div>

                    )}
                </AnimatePresence>
            </div>

            {/* Rate Nurse Modal */}
            <Modal show={showRateModal} onHide={() => setShowRateModal(false)} centered backdrop="static" contentClassName="border-0 rounded-4 shadow-lg overflow-hidden">
                <div className="p-4 p-md-5 position-relative">
                    <button onClick={() => setShowRateModal(false)} className="btn btn-link text-muted position-absolute" style={{ top: '15px', right: '15px', textDecoration: 'none' }}>
                        <i className="fa-solid fa-xmark fs-5"></i>
                    </button>
                    
                    <div className="text-center mb-4">
                        <img 
                            src={selectedBooking?.nurseId?.profilePicture ? (selectedBooking.nurseId.profilePicture.startsWith('data:') ? selectedBooking.nurseId.profilePicture : `http://localhost:5000/uploads/${selectedBooking.nurseId.profilePicture}`) : `https://placehold.co/100x100/025955/ffffff?text=${selectedBooking?.nurseId?.name ? selectedBooking.nurseId.name.charAt(0).toUpperCase() : 'N'}`} 
                            onError={(e) => { e.target.src = 'https://placehold.co/100x100/025955/ffffff?text=N' }}
                            alt="Nurse" 
                            className="rounded-circle mb-3 shadow-sm object-fit-cover" 
                            style={{ width: '80px', height: '80px', border: '3px solid white' }} 
                        />
                        <h4 className="fw-bold text-dark mb-1">Rate Your Experience</h4>
                        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>How was your visit with <span className="fw-bold text-dark">{selectedBooking?.nurseId?.name || 'the nurse'}</span>?</p>
                    </div>

                    <div className="d-flex justify-content-center gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <i 
                                key={star}
                                className={`fa-star fs-1 cursor-pointer transition-all ${star <= (hoverRating || rating) ? 'fa-solid text-warning' : 'fa-regular text-muted'}`}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                                style={{ cursor: 'pointer', transform: star <= (hoverRating || rating) ? 'scale(1.1)' : 'scale(1)' }}
                            ></i>
                        ))}
                    </div>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>Leave a comment (Optional)</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            placeholder="Share details of your own experience..." 
                            className="bg-light border-0 shadow-none rounded-3 py-2 px-3"
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                        />
                    </Form.Group>

                    <Button 
                        variant="primary" 
                        className="w-100 rounded-pill fw-bold py-3 shadow-sm border-0"
                        onClick={submitRating}
                        disabled={rating === 0}
                        style={{ fontSize: '1.05rem', transition: 'all 0.3s' }}
                    >
                        Submit Review
                    </Button>
                </div>
            </Modal>

            {/* Invoice Modal */}
            <Modal show={showInvoiceModal} onHide={() => setShowInvoiceModal(false)} centered backdrop="static" className="custom-modal">
                <Modal.Header closeButton className="border-0 pb-0 mt-2 px-4">
                    <Modal.Title className="fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: '1.25rem' }}>
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <i className="fa-solid fa-file-invoice-dollar text-primary"></i>
                        </div>
                        Invoice Details
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 py-4">
                    {invoiceBooking && (
                        <div>
                            <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                                <span className="text-muted fw-bold">Booking ID</span>
                                <span className="fw-bold text-dark">#{invoiceBooking.bookingId || invoiceBooking._id.substring(0,8).toUpperCase()}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                                <span className="text-muted fw-bold">Service</span>
                                <span className="fw-bold text-dark">{invoiceBooking.service}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                                <span className="text-muted fw-bold">Nurse</span>
                                <span className="fw-bold text-dark">{invoiceBooking.nurseId?.name || 'N/A'}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                                <span className="text-muted fw-bold">Date & Time</span>
                                <span className="fw-bold text-dark">{invoiceBooking.date} - {invoiceBooking.time}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                                <span className="text-muted fw-bold">Payment Method</span>
                                <span className="fw-bold text-dark" style={{ textTransform: 'capitalize' }}>{invoiceBooking.paymentMethod || 'Cash'}</span>
                            </div>
                            <div className="d-flex justify-content-between mt-4">
                                <span className="text-muted fw-bold fs-5">Total Paid</span>
                                <span className="fw-bold text-success fs-5">{invoiceBooking.totalCost} EGP</span>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 px-4 pb-4 pt-0">
                    <Button variant="primary" onClick={() => setShowInvoiceModal(false)} className="rounded-pill fw-bold px-4 w-100 shadow-sm">
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <style>{`
                .hover-bg-gray:hover { background-color: #f8fafc !important; color: #0f172a !important; }
                .hover-bg-danger:hover { background-color: #fee2e2 !important; color: #991b1b !important; }
                .booking-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .booking-card:hover { transform: translateY(-3px); box-shadow: 0 12px 25px rgba(0,0,0,0.06) !important; border-color: #e2e8f0 !important; }
                .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(2, 89, 85, 0.15) !important; }
                .transition-all { transition: all 0.2s ease-in-out; }
                .border-start-md { border-left: 1px solid #eef2f5; }
                @media (max-width: 768px) {
                    .border-start-md { border-left: none; border-top: 1px solid #eef2f5; padding-top: 1rem; padding-left: 0 !important; }
                }
                .custom-modal-backdrop { background-color: rgba(15, 23, 42, 0.4) !important; backdrop-filter: blur(8px) !important; }
                .custom-modal .modal-content { border-radius: 20px; border: none; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
                .custom-modal .btn-close { box-shadow: none !important; }
                .custom-modal .btn-close:focus { outline: none; }
            `}</style>
        
            {/* Cancel Modal */}
            <Modal show={showCancelModal} onHide={() => !cancelLoading && setShowCancelModal(false)} centered backdrop="static" backdropClassName="custom-modal-backdrop" className="custom-modal">
                <Modal.Header closeButton={!cancelLoading} className="border-0 pb-0 mt-2 px-4">
                    <Modal.Title className="fw-bold text-danger d-flex align-items-center gap-2" style={{ fontSize: '1.25rem' }}>
                        <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <i className="fa-solid fa-triangle-exclamation"></i>
                        </div>
                        Cancel Booking
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 py-4">
                    {cancelError && <div className="alert alert-danger py-2 fw-medium border-0 rounded-3"><i className="fa-solid fa-circle-exclamation me-2"></i>{cancelError}</div>}
                    <p className="fs-5 text-dark mb-2">Are you sure you want to cancel your <strong>{bookingToCancel?.service}</strong> booking?</p>
                    <p className="text-muted text-14 mb-0">This action will release the slot and cannot be undone. Please confirm to proceed.</p>
                </Modal.Body>
                <Modal.Footer className="border-0 px-4 pb-4 pt-0">
                    <Button variant="light" onClick={() => setShowCancelModal(false)} disabled={cancelLoading} className="rounded-pill fw-bold px-4 hover-bg-gray">Keep Booking</Button>
                    <Button variant="danger" onClick={confirmCancel} disabled={cancelLoading} className="rounded-pill fw-bold px-4 shadow-sm">
                        {cancelLoading ? <i className="fa-solid fa-spinner fa-spin me-2"></i> : null}
                        Yes, Cancel
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Reschedule Modal */}
            <Modal show={showRescheduleModal} onHide={() => !rescheduleLoading && setShowRescheduleModal(false)} centered size="lg" backdrop="static" backdropClassName="custom-modal-backdrop" className="custom-modal">
                <Modal.Header closeButton={!rescheduleLoading} className="border-0 pb-0 mt-2 px-4">
                    <Modal.Title className="fw-bold text-primary d-flex align-items-center gap-2" style={{ fontSize: '1.25rem' }}>
                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <i className="fa-solid fa-calendar-days"></i>
                        </div>
                        Reschedule Booking
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-white px-4 py-4">
                    {rescheduleError && <div className="alert alert-danger py-2 fw-medium border-0 rounded-3"><i className="fa-solid fa-circle-exclamation me-2"></i>{rescheduleError}</div>}
                    {!nurseDetails ? (
                        <div className="text-center py-5"><i className="fa-solid fa-spinner fa-spin fs-2 text-primary"></i></div>
                    ) : (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-bold mb-0">Select Date</h6>
                                <div>
                                    <Button variant="light" size="sm" onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))} disabled={weekOffset === 0} className="rounded-circle me-2 hover-bg-gray" style={{width:'32px',height:'32px', border:'1px solid #e2e8f0'}}><i className="fa-solid fa-chevron-left"></i></Button>
                                    <Button variant="light" size="sm" onClick={() => setWeekOffset(weekOffset + 1)} className="rounded-circle hover-bg-gray" style={{width:'32px',height:'32px', border:'1px solid #e2e8f0'}}><i className="fa-solid fa-chevron-right"></i></Button>
                                </div>
                            </div>
                            
                            <div className="d-flex gap-2 overflow-auto pb-2 custom-scrollbar mb-4">
                                {availableDates.map((d, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`${d.isPast ? "bg-light text-muted opacity-50" : d.id === selectedDate ? "bg-primary text-white border-primary shadow-sm" : d.isWorking ? "bg-white hover-bg-light cursor-pointer" : "bg-white text-muted opacity-50"} text-center p-2 rounded-4 border flex-shrink-0`}
                                        style={{ minWidth: '75px', cursor: d.isPast || !d.isWorking ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
                                        onClick={() => !d.isPast && d.isWorking && setSelectedDate(d.id)}
                                    >
                                        <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>{d.day}</div>
                                        <div className="fw-bold mt-1" style={{ fontSize: '1.1rem' }}>{d.id.split(' ')[0]}</div>
                                        <div style={{ fontSize: '0.75rem' }}>{d.id.split(' ')[1]}</div>
                                    </div>
                                ))}
                            </div>
                            
                            {selectedDate && availableTimes.length > 0 && (
                                <>
                                    <h6 className="fw-bold mb-3">Select Time</h6>
                                    <div className="d-flex flex-wrap gap-2">
                                        {availableTimes.map((time, idx) => (
                                            <div 
                                                key={idx} 
                                                className={`${time === selectedTime ? "bg-primary text-white border-primary shadow-sm" : "bg-white text-dark hover-bg-light cursor-pointer"} px-3 py-2 rounded-pill border`}
                                                style={{ fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '500' }}
                                                onClick={() => setSelectedTime(time)}
                                            >
                                                {time}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            {selectedDate && availableTimes.length === 0 && (
                                <div className="text-center p-4 bg-white rounded-4 border text-muted">
                                    <i className="fa-regular fa-clock fs-3 mb-2 opacity-50"></i>
                                    <br/>
                                    No available times for this date.
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 bg-light px-4 py-3 rounded-bottom-4">
                    <Button variant="light" onClick={() => setShowRescheduleModal(false)} disabled={rescheduleLoading} className="rounded-pill fw-bold px-4 bg-white border hover-bg-gray">Discard</Button>
                    <Button variant="primary" onClick={confirmReschedule} disabled={rescheduleLoading || !selectedDate || !selectedTime} className="rounded-pill fw-bold px-4 shadow-sm">
                        {rescheduleLoading ? <i className="fa-solid fa-spinner fa-spin me-2"></i> : null}
                        Confirm Reschedule
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Rebook Modal */}
            <Modal show={showRebookModal} onHide={() => { if(!rebookLoading) { setShowRebookModal(false); setBookingToReschedule(null); } }} centered size="lg" backdrop="static" backdropClassName="custom-modal-backdrop" className="custom-modal">
                <Modal.Header closeButton={!rebookLoading} className="border-0 pb-0 mt-2 px-4">
                    <Modal.Title className="fw-bold text-primary d-flex align-items-center gap-2" style={{ fontSize: '1.25rem' }}>
                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <i className="fa-solid fa-rotate-right"></i>
                        </div>
                        Book Again
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-white px-4 py-4">
                    {rebookError && <div className="alert alert-danger py-2 fw-medium border-0 rounded-3"><i className="fa-solid fa-circle-exclamation me-2"></i>{rebookError}</div>}
                    {!nurseDetails ? (
                        <div className="text-center py-5"><i className="fa-solid fa-spinner fa-spin fs-2 text-primary"></i></div>
                    ) : (
                        <div>
                            <div className="mb-4">
                                <h6 className="fw-bold mb-3">1. Select Service</h6>
                                <div className="d-flex flex-wrap gap-2">
                                    {(nurseDetails.skills || 'Elderly Care').split(', ').map(service => (
                                        <div 
                                            key={service} 
                                            className={`${service === rebookService ? "bg-primary text-white border-primary shadow-sm" : "bg-white text-dark hover-bg-light cursor-pointer"} px-3 py-2 rounded-pill border`}
                                            style={{ fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '500' }}
                                            onClick={() => {
                                                setRebookService(service);
                                                const hasShifts = ['Elderly Care', 'Post-operative Care', 'Basic Care', 'Escort Services & Responsibilities'].includes(service);
                                                setRebookShift(hasShifts ? '6 Hour' : 'Single Visit');
                                            }}
                                        >
                                            {service}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <h6 className="fw-bold mb-3">2. Select Shift Duration</h6>
                                <div className="d-flex flex-wrap gap-2">
                                    {['Elderly Care', 'Post-operative Care', 'Basic Care', 'Escort Services & Responsibilities'].includes(rebookService) 
                                        ? ['6 Hour', '12 Hour', '24 Hour'].map(shift => (
                                            <div 
                                                key={shift} 
                                                className={`${shift === rebookShift ? "bg-primary text-white border-primary shadow-sm" : "bg-white text-dark hover-bg-light cursor-pointer"} px-3 py-2 rounded-pill border`}
                                                style={{ fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '500' }}
                                                onClick={() => setRebookShift(shift)}
                                            >
                                                {shift}
                                            </div>
                                        ))
                                        : ['Single Visit'].map(shift => (
                                            <div 
                                                key={shift} 
                                                className={`${shift === rebookShift ? "bg-primary text-white border-primary shadow-sm" : "bg-white text-dark hover-bg-light cursor-pointer"} px-3 py-2 rounded-pill border`}
                                                style={{ fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '500' }}
                                                onClick={() => setRebookShift(shift)}
                                            >
                                                {shift}
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-bold mb-0">3. Select Date</h6>
                                <div>
                                    <Button variant="light" size="sm" onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))} disabled={weekOffset === 0} className="rounded-circle me-2 hover-bg-gray" style={{width:'32px',height:'32px', border:'1px solid #e2e8f0'}}><i className="fa-solid fa-chevron-left"></i></Button>
                                    <Button variant="light" size="sm" onClick={() => setWeekOffset(weekOffset + 1)} className="rounded-circle hover-bg-gray" style={{width:'32px',height:'32px', border:'1px solid #e2e8f0'}}><i className="fa-solid fa-chevron-right"></i></Button>
                                </div>
                            </div>
                            
                            <div className="d-flex gap-2 overflow-auto pb-2 custom-scrollbar mb-4">
                                {availableDates.map((d, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`${d.isPast ? "bg-light text-muted opacity-50" : d.id === selectedDate ? "bg-primary text-white border-primary shadow-sm" : d.isWorking ? "bg-white hover-bg-light cursor-pointer" : "bg-white text-muted opacity-50"} text-center p-2 rounded-4 border flex-shrink-0`}
                                        style={{ minWidth: '75px', cursor: d.isPast || !d.isWorking ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
                                        onClick={() => !d.isPast && d.isWorking && setSelectedDate(d.id)}
                                    >
                                        <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>{d.day}</div>
                                        <div className="fw-bold mt-1" style={{ fontSize: '1.1rem' }}>{d.id.split(' ')[0]}</div>
                                        <div style={{ fontSize: '0.75rem' }}>{d.id.split(' ')[1]}</div>
                                    </div>
                                ))}
                            </div>
                            
                            {selectedDate && availableTimes.length > 0 && (
                                <>
                                    <h6 className="fw-bold mb-3">4. Select Time</h6>
                                    <div className="d-flex flex-wrap gap-2">
                                        {availableTimes.map((time, idx) => (
                                            <div 
                                                key={idx} 
                                                className={`${time === selectedTime ? "bg-primary text-white border-primary shadow-sm" : "bg-white text-dark hover-bg-light cursor-pointer"} px-3 py-2 rounded-pill border`}
                                                style={{ fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '500' }}
                                                onClick={() => setSelectedTime(time)}
                                            >
                                                {time}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            {selectedDate && availableTimes.length === 0 && (
                                <div className="text-center p-4 bg-white rounded-4 border text-muted">
                                    <i className="fa-regular fa-clock fs-3 mb-2 opacity-50"></i>
                                    <br/>
                                    No available times for this date.
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 bg-light px-4 py-3 rounded-bottom-4">
                    <Button variant="light" onClick={() => { setShowRebookModal(false); setBookingToReschedule(null); }} disabled={rebookLoading} className="rounded-pill fw-bold px-4 bg-white border hover-bg-gray">Discard</Button>
                    <Button variant="primary" onClick={confirmRebook} disabled={rebookLoading || !selectedDate || !selectedTime || !rebookService} className="rounded-pill fw-bold px-4 shadow-sm">
                        {rebookLoading ? <i className="fa-solid fa-spinner fa-spin me-2"></i> : null}
                        Confirm Booking
                    </Button>
                </Modal.Footer>
            </Modal>
        </motion.div>

    );
}
