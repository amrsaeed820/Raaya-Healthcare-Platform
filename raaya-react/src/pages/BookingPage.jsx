import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Card } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
export default function BookingPage({ isUrgent = false }) {
    const navigate = useNavigate();
    const { id: nurseId } = useParams();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();

    // Determine the pre-selected service and state
    const preSelectedService = location.state?.preSelectedService || 'Wound & Skin Care';
    const isRescheduling = !!location.state?.reschedulingFrom;
    const preSelectedShift = location.state?.preSelectedShift || '12 Hour';
    const [selectedService, setSelectedService] = useState(preSelectedService);

    // Fetch Nurse Details for the summary
    const [nurseDetails, setNurseDetails] = useState(null);
    const [prices, setPrices] = useState({});
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (nurseId) {
                    const res = await axios.get(`http://localhost:5000/api/public/nurses/${nurseId}`);
                    setNurseDetails(res.data);
                }
                const settingsRes = await axios.get('http://localhost:5000/api/settings');
                if (settingsRes.data && settingsRes.data.servicesPricing) {
                    setPrices(settingsRes.data.servicesPricing);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };
        fetchData();
    }, [nurseId]);

    // Fetch Patient's Existing Bookings to prevent overlap
    const [patientBookings, setPatientBookings] = useState([]);
    useEffect(() => {
        const fetchPatientBookings = async () => {
            if (!isAuthenticated) return;
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get('http://localhost:5000/api/bookings/patient', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPatientBookings(res.data);
            } catch (err) {
                console.error("Error fetching patient bookings:", err);
            }
        };
        fetchPatientBookings();
    }, [isAuthenticated]);

    // Determine if the selected service has shifts
    const hasShifts = ['Elderly Care', 'Post-operative Care', 'Basic Care', 'Escort Services & Responsibilities'].includes(selectedService);

    // Stepper and Selection State
    // If rescheduling, skip to Date & Time. Otherwise, if no shifts are available, skip to step 2.
    const [currentStep, setCurrentStep] = useState(isRescheduling ? 2 : (hasShifts ? 1 : 2));
    const [isForSomeoneElse, setIsForSomeoneElse] = useState(false);

    // Scroll to top when changing steps, and reset to 'Book for Me' on Step 3
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (currentStep === 3) {
            setIsForSomeoneElse(false);
        }
    }, [currentStep]);

    const [selectedShift, setSelectedShift] = useState(preSelectedShift);
    const [selectedDate, setSelectedDate] = useState('21 Jan');
    const [selectedTime, setSelectedTime] = useState('09:00 AM');

    // Form Data State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        message: '',
        theirName: '',
        theirPhone: '',
        theirAddress: '',
        theirMessage: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFamilyMemberIndex, setSelectedFamilyMemberIndex] = useState('');

    useEffect(() => {
        if (isAuthenticated && user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                phone: user.phone || prev.phone,
                address: user.address || prev.address
            }));
            
            if (isForSomeoneElse && selectedFamilyMemberIndex !== '' && user.familyMembers) {
                const member = user.familyMembers[selectedFamilyMemberIndex];
                if (member) {
                    setFormData(prev => ({
                        ...prev,
                        theirName: member.name || '',
                        theirPhone: user.phone || '', // Primary user contact
                        theirAddress: member.address || '',
                    }));
                }
            } else if (isForSomeoneElse && selectedFamilyMemberIndex === '') {
                setFormData(prev => ({
                    ...prev,
                    theirName: '',
                    theirPhone: user.phone || prev.theirPhone, // Set default contact
                    theirAddress: '',
                }));
            }
        }
    }, [isAuthenticated, user, isForSomeoneElse, selectedFamilyMemberIndex]);

    // Validation for Step 3
    const isStep3Valid = isForSomeoneElse
        ? formData.theirName.trim() !== '' && formData.theirPhone.trim() !== '' && formData.theirAddress.trim() !== '' && (isAuthenticated || formData.email.trim() !== '')
        : formData.name.trim() !== '' && formData.email.trim() !== '' && formData.phone.trim() !== '' && formData.address.trim() !== '';

    const calculateTotalCost = () => {
        if (!selectedService || !prices[selectedService]) return 0;
        const basePrice = prices[selectedService];
        if (hasShifts && selectedShift && selectedShift.includes('Hour')) {
            const hours = parseInt(selectedShift.split(' ')[0]) || 1;
            return basePrice * hours;
        }
        return basePrice;
    };

    const handleConfirmBooking = async () => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const endpoint = isAuthenticated ? 'http://localhost:5000/api/bookings/patient' : 'http://localhost:5000/api/bookings/guest';
            const headers = isAuthenticated && token ? { Authorization: `Bearer ${token}` } : {};

            const patientDetails = isForSomeoneElse ? {
                name: formData.theirName,
                phone: formData.theirPhone,
                address: formData.theirAddress,
                message: formData.theirMessage,
                email: !isAuthenticated ? formData.email : '',
                isForSomeoneElse: true
            } : {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                message: formData.message,
                isForSomeoneElse: false
            };

            await axios.post(endpoint, {
                nurseId: nurseId || '60d21b4667d0d8992e610c85', // Fallback if general booking
                service: selectedService,
                shift: hasShifts ? selectedShift : 'Single Visit',
                date: selectedDate,
                time: selectedTime,
                patientDetails,
                paymentMethod,
                totalCost: calculateTotalCost(), // Send actual calculated cost
                reschedulingFrom: location.state?.reschedulingFrom
            }, { headers });

            setCurrentStep(5);
        } catch (error) {
            console.error("Booking failed:", error);
            alert(error.response?.data?.message || "Failed to submit booking. Please log in or try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmReschedule = async () => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const bookingId = location.state.reschedulingFrom;
            
            await axios.put(`http://localhost:5000/api/bookings/patient/${bookingId}/reschedule`, {
                date: selectedDate,
                time: selectedTime,
                shift: hasShifts ? selectedShift : 'Single Visit'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Head back to Profile Page Booking tab
            navigate('/profile', { state: { activeTab: 'booking', toast: { message: 'Booking rescheduled successfully!', type: 'success' } } });
        } catch (error) {
            console.error("Reschedule failed:", error);
            alert(error.response?.data?.message || "Failed to reschedule booking. The slot might be taken or you are unauthorized.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Relevant home care shifts
    const shiftTypes = [
        { id: '24 Hour', icon: 'fa-clock', label: '24 Hours' },
        { id: '12 Hour', icon: 'fa-stopwatch', label: '12 Hours' },
        { id: '6 Hour', icon: 'fa-hourglass-half', label: '6 Hours' }
    ].filter(shift => {
        if (shift.id === '24 Hour' && nurseDetails && nurseDetails.workingHours) {
            const has24h = nurseDetails.workingHours.some(wh => wh.dayShift && wh.nightShift && wh.availableForLongShifts);
            if (!has24h) return false;
        }
        return true;
    });

    const [availableDates, setAvailableDates] = useState([]);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [timesMap, setTimesMap] = useState({});
    
    // Weekly calendar state
    const [weekOffset, setWeekOffset] = useState(0);

    // Dynamically generate dates for the selected week based on nurse's working hours
    useEffect(() => {
        const dates = [];
        const tMap = {};
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        // Start from today + weekOffset * 7 days
        startDate.setDate(startDate.getDate() + (weekOffset * 7));

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayName = daysOfWeek[currentDate.getDay()];
            const dateStr = currentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            
            let dayLabel = dayName.slice(0, 3);
            if (weekOffset === 0 && i === 0) dayLabel = 'Today';
            else if (weekOffset === 0 && i === 1) dayLabel = 'Tomorrow';

            // Check if nurse works on this day
            let isWorking = false;
            let times = [];
            let timeLabels = {};
            
            if (nurseDetails && nurseDetails.workingHours) {
                const wh = nurseDetails.workingHours.find(w => w.day === dayName);
                if (wh) {
                    // Check hybrid day logic
                    let canDoQuick = wh.availableForQuickVisits !== false;
                    let canDoLong = wh.availableForLongShifts !== false;

                    if (canDoQuick && canDoLong && nurseDetails.bookings && nurseDetails.bookings.length > 0) {
                        const dayBookings = nurseDetails.bookings.filter(b => b.date === dateStr && b.status !== 'cancelled');
                        const activeDayBookings = location.state?.reschedulingFrom ? dayBookings.filter(b => b._id !== location.state.reschedulingFrom) : dayBookings;
                        
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
                            
                            curM += 30; // 30 min intervals
                            if (curM >= 60) {
                                curH += 1;
                                curM -= 60;
                            }
                        }
                    } else if (hasShifts && canDoLong) {
                        const shiftHours = parseInt((selectedShift || '12 Hour').split(' ')[0]);
                        if (shiftHours) {
                            if (shiftHours === 12) {
                                if (wh.dayShift) {
                                    times.push("09:00 AM");
                                    timeLabels["09:00 AM"] = "Day Shift (09:00 AM → 09:00 PM)";
                                }
                                if (wh.nightShift) {
                                    times.push("09:00 PM");
                                    timeLabels["09:00 PM"] = "Night Shift (09:00 PM → 09:00 AM)";
                                }
                            } else if (shiftHours === 6) {
                                if (wh.dayShift) {
                                    times.push("09:00 AM");
                                    timeLabels["09:00 AM"] = "Day Shift (Part 1): 09:00 AM → 03:00 PM";
                                    times.push("03:00 PM");
                                    timeLabels["03:00 PM"] = "Day Shift (Part 2): 03:00 PM → 09:00 PM";
                                }
                                if (wh.nightShift) {
                                    times.push("09:00 PM");
                                    timeLabels["09:00 PM"] = "Night Shift (Part 1): 09:00 PM → 03:00 AM";
                                    times.push("03:00 AM");
                                    timeLabels["03:00 AM"] = "Night Shift (Part 2): 03:00 AM → 09:00 AM";
                                }
                            } else if (shiftHours === 24) {
                                if (wh.dayShift && wh.nightShift) {
                                    times.push("09:00 AM");
                                    timeLabels["09:00 AM"] = "24 Hour Shift (09:00 AM → 09:00 AM)";
                                }
                            }
                            if (times.length > 0) isWorking = true;
                        }
                    }

                    // FILTER OUT BOOKED SLOTS
                    if (nurseDetails.bookings && nurseDetails.bookings.length > 0) {
                        const dayBookings = nurseDetails.bookings.filter(b => b.date === dateStr && b.status !== 'cancelled');

                        // Ignore the booking we are currently rescheduling from (if any)
                        const activeDayBookings = location.state?.reschedulingFrom ? dayBookings.filter(b => b._id !== location.state.reschedulingFrom) : dayBookings;

                        if (activeDayBookings.length > 0 && times.length > 0) {
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
                                for (let b of activeDayBookings) {
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
                        }
                    }
                }
            } else if (!nurseDetails) {
                // Fallback dummy data if no nurse
                isWorking = true;
                times = ['09:00 AM', '10:00 AM', '11:00 AM'];
            }

            dates.push({ 
                id: dateStr, 
                day: dayLabel,
                fullDayName: dayName, 
                date: dateStr, 
                isWorking,
                isPast: currentDate < new Date(new Date().setHours(0,0,0,0)),
                timeLabels
            });
            tMap[dateStr] = times.length > 0 ? times : [];
        }

        setAvailableDates(dates);
        setTimesMap(tMap);
    }, [nurseDetails, weekOffset, selectedShift, hasShifts]);

    useEffect(() => {
        if (timesMap[selectedDate]) {
            setAvailableTimes(timesMap[selectedDate]);
            if (!timesMap[selectedDate].includes(selectedTime)) {
                setSelectedTime(timesMap[selectedDate][0]);
            }
        }
    }, [selectedDate, timesMap]);

    const getFilteredTimes = (targetDate = selectedDate) => {
        if (!timesMap[targetDate]) return [];
        let times = [...timesMap[targetDate]];

        // Filter out past times for Today (including a 1-hour buffer for travel/preparation)
        const now = new Date();
        const dateObj = availableDates.find(d => d.id === targetDate);
        if (dateObj && dateObj.day === 'Today') {
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const LEAD_TIME_BUFFER = 60; // 1 hour minimum notice
            times = times.filter(timeStr => {
                let [t, ampm] = timeStr.split(' ');
                let [slotH, slotM] = t.split(':').map(Number);
                if (ampm === 'PM' && slotH !== 12) slotH += 12;
                if (ampm === 'AM' && slotH === 12) slotH = 0;
                const slotTimeInMinutes = slotH * 60 + slotM;
                return slotTimeInMinutes >= (currentMinutes + LEAD_TIME_BUFFER);
            });
        }

        // Helper function for checking overlap against an array of bookings
        const filterByBookings = (bookingsArray) => {
            if (!bookingsArray || bookingsArray.length === 0) return;
            const dateBookings = bookingsArray.filter(b => b.date === targetDate && b.status?.toLowerCase() !== 'cancelled' && String(b._id) !== String(location.state?.reschedulingFrom));
            if (dateBookings.length === 0) return;

            times = times.filter(timeStr => {
                let [t, ampm] = timeStr.split(' ');
                let [slotH, slotM] = t.split(':').map(Number);
                if (ampm === 'PM' && slotH !== 12) slotH += 12;
                if (ampm === 'AM' && slotH === 12) slotH = 0;
                
                const slotTimeInMinutes = slotH * 60 + slotM;
                const requestedDurationInMinutes = hasShifts ? (parseInt(selectedShift.split(' ')[0]) * 60) : 120;
                const slotEndInMinutes = slotTimeInMinutes + requestedDurationInMinutes;

                for (let b of dateBookings) {
                    if (!b.time) continue;
                    let [bt, bampm] = b.time.split(' ');
                    let [bh, bm] = bt.split(':').map(Number);
                    if (bampm === 'PM' && bh !== 12) bh += 12;
                    if (bampm === 'AM' && bh === 12) bh = 0;
                    
                    const bookingStartInMinutes = bh * 60 + bm;
                    let bookingDurationInMinutes = 120; // Default buffer for Quick Visit
                    if (b.shift && b.shift.includes('Hour')) {
                        bookingDurationInMinutes = parseInt(b.shift.split(' ')[0]) * 60;
                    }
                    const bookingEndInMinutes = bookingStartInMinutes + bookingDurationInMinutes;

                    // Check for overlap: slotStart < bookingEnd AND slotEnd > bookingStart
                    if (slotTimeInMinutes < bookingEndInMinutes && slotEndInMinutes > bookingStartInMinutes) {
                        return false; // Collision
                    }
                }
                return true;
            });
        };

        // Filter out times blocked by nurse's existing bookings
        if (nurseDetails) {
            filterByBookings(nurseDetails.bookings);
        }

        // Filter out times blocked by patient's existing bookings (so they can't double book themselves)
        filterByBookings(patientBookings);

        return times;
    };

    useEffect(() => {
        if (!availableDates || availableDates.length === 0) return;

        const isDateValid = (dateId) => {
            const dateObj = availableDates.find(d => d.id === dateId);
            if (!dateObj || !dateObj.isWorking || dateObj.isPast) return false;
            return getFilteredTimes(dateId).length > 0;
        };

        if (selectedDate && !isDateValid(selectedDate)) {
            const firstAvailable = availableDates.find(d => isDateValid(d.id));
            if (firstAvailable) {
                setSelectedDate(firstAvailable.id);
            } else if (selectedDate !== availableDates[0]?.id) {
                setSelectedDate(availableDates[0]?.id);
            }
        } else if (!selectedDate) {
            const firstAvailable = availableDates.find(d => isDateValid(d.id));
            if (firstAvailable) {
                setSelectedDate(firstAvailable.id);
            } else if (availableDates[0]) {
                setSelectedDate(availableDates[0].id);
            }
        }
    }, [availableDates, timesMap, selectedDate, patientBookings, nurseDetails, selectedShift, hasShifts]);

    // Handle Back Navigation
    const handleBackClick = () => {
        if (isRescheduling) {
            navigate('/profile', { state: { activeTab: 'booking' } });
            return;
        }

        if (currentStep === 1) {
            navigate('/book', { state: { preSelectedService: selectedService } });
        } else if (currentStep === 2) {
            if (hasShifts) setCurrentStep(1);
            else navigate('/book', { state: { preSelectedService: selectedService } });
        } else if (currentStep === 3) {
            setCurrentStep(isUrgent ? (hasShifts ? 1 : 2) : 2);
        } else if (currentStep === 4) {
            setCurrentStep(3);
        }
    };

    // Stepper component for visual progress
    const Stepper = () => (
        <div className="d-flex align-items-center justify-content-center flex-wrap gap-2 gap-md-4 mb-5 mx-auto" style={{ maxWidth: '700px' }}>
            {/* Step 1: Shift Selection (Only if hasShifts) */}
            {hasShifts && (
                <>
                    <div className={`d-flex flex-column align-items-center position-relative z-1 ${currentStep < 1 ? 'opacity-50' : ''}`}>
                        <div className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${currentStep >= 1 ? 'text-white shadow-sm' : 'bg-white border'}`}
                            style={{ width: '48px', height: '48px', backgroundColor: currentStep >= 1 ? 'var(--primary)' : 'transparent', color: currentStep >= 1 ? '#fff' : '#6c757d', borderColor: '#e0e6eb' }}>
                            {currentStep > 1 ? <i className="fa-solid fa-check fs-5"></i> : <i className="fa-regular fa-clock fs-5"></i>}
                        </div>
                        <span className={currentStep >= 1 ? 'fw-bold' : 'fw-medium text-muted'} style={{ color: currentStep >= 1 ? 'var(--primary)' : 'inherit', fontSize: '0.8rem' }}>Choose Shift</span>
                    </div>

                    {/* Divider */}
                    <div className="flex-grow-1 rounded" style={{ height: '2px', minWidth: '30px', maxWidth: '60px', marginTop: '-20px', backgroundColor: currentStep > 1 ? 'var(--primary)' : '#f8f9fa' }}></div>
                </>
            )}

            {/* Step 2 */}
            {!isUrgent && (
                <>
                    <div className={`d-flex flex-column align-items-center position-relative z-1 ${currentStep < 2 ? 'opacity-50' : ''}`}>
                        <div className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${currentStep >= 2 ? 'text-white shadow-sm' : 'bg-white border'}`}
                            style={{ width: '48px', height: '48px', backgroundColor: currentStep >= 2 ? 'var(--primary)' : 'transparent', color: currentStep >= 2 ? '#fff' : '#6c757d', borderColor: '#e0e6eb' }}>
                            {currentStep > 2 ? <i className="fa-solid fa-check fs-5"></i> : <i className="fa-regular fa-calendar fs-5"></i>}
                        </div>
                        <span className={currentStep >= 2 ? 'fw-bold' : 'fw-medium text-muted'} style={{ color: currentStep >= 2 ? 'var(--primary)' : 'inherit', fontSize: '0.8rem' }}>Select Date</span>
                    </div>

                    {/* Divider */}
                    <div className="flex-grow-1 rounded" style={{ height: '2px', minWidth: '30px', maxWidth: '60px', marginTop: '-20px', backgroundColor: currentStep > 2 ? 'var(--primary)' : '#f8f9fa' }}></div>
                </>
            )}

            {/* Step 3 */}
            <div className={`d-flex flex-column align-items-center position-relative z-1 ${currentStep < 3 ? 'opacity-50' : ''}`}>
                <div className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${currentStep >= 3 ? 'text-white shadow-sm' : 'bg-white border'}`}
                    style={{ width: '48px', height: '48px', backgroundColor: currentStep >= 3 ? 'var(--primary)' : 'transparent', color: currentStep >= 3 ? '#fff' : '#6c757d', borderColor: '#e0e6eb' }}>
                    {currentStep > 3 ? <i className="fa-solid fa-check fs-5"></i> : <i className="fa-regular fa-user fs-5"></i>}
                </div>
                <span className={currentStep >= 3 ? 'fw-bold' : 'fw-medium text-muted'} style={{ color: currentStep >= 3 ? 'var(--primary)' : 'inherit', fontSize: '0.8rem' }}>Your Details</span>
            </div>

            {/* Divider */}
            <div className="flex-grow-1 rounded" style={{ height: '2px', minWidth: '30px', maxWidth: '60px', marginTop: '-20px', backgroundColor: currentStep > 3 ? 'var(--primary)' : '#f8f9fa' }}></div>

            {/* Step 4 */}
            <div className={`d-flex flex-column align-items-center position-relative z-1 ${currentStep < 4 ? 'opacity-50' : ''}`}>
                <div className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${currentStep >= 4 ? 'text-white shadow-sm' : 'bg-white border'}`}
                    style={{ width: '48px', height: '48px', backgroundColor: currentStep >= 4 ? 'var(--primary)' : 'transparent', color: currentStep >= 4 ? '#fff' : '#6c757d', borderColor: '#e0e6eb' }}>
                    {currentStep > 4 ? <i className="fa-solid fa-check fs-5"></i> : <i className="fa-regular fa-circle-check fs-5"></i>}
                </div>
                <span className={currentStep >= 4 ? 'fw-bold' : 'fw-medium text-muted'} style={{ color: currentStep >= 4 ? 'var(--primary)' : 'inherit', fontSize: '0.8rem' }}>Confirm</span>
            </div>
        </div>
    );

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '100px', paddingTop: '100px' }}>
            <Container className="px-lg-4">

                {/* Header Section */}
                {currentStep < 5 && (
                    <div className="text-center mb-5">
                        <h2 className="fw-bold text-dark mb-2">Book Your Appointment</h2>
                        <p className="text-muted" style={{ fontSize: '0.95rem' }}>Quick, easy, and secure booking. Your appointment is just a few clicks away.</p>
                    </div>
                )}

                {/* Progress Stepper */}
                {currentStep < 5 && <Stepper />}

                {/* Main Booking Card */}
                {currentStep < 5 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mx-auto"
                        style={{ maxWidth: '800px' }}
                    >
                    <Card className="border-0 shadow-sm rounded-4 p-4 bg-white" style={{ border: '1px solid #e0e6eb' }}>
                        <div className="d-flex align-items-center gap-3 mb-4 pb-2 border-bottom border-light">
                            <button
                                type="button"
                                className="btn border-0 p-0 text-dark d-flex align-items-center justify-content-center hover-primary transition-all"
                                onClick={handleBackClick}
                                style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f1f5f9' }}
                            >
                                <i className="fa-solid fa-arrow-left fs-6"></i>
                            </button>
                            <h5 className="fw-bold text-dark mb-0" style={{ letterSpacing: '0.2px' }}>
                                {currentStep === 1 && 'Choose Shift Type'}
                                {currentStep === 2 && 'Select Date & Time'}
                                {currentStep === 3 && 'Patient Information'}
                                {currentStep === 4 && 'Confirm Booking'}
                            </h5>
                        </div>

                        <Form>
                            {currentStep === 1 && hasShifts && (
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                    {/* Shift Type Section */}
                                    <div className="mb-4">
                                        <Form.Label className="fw-bold text-dark mb-3" style={{ fontSize: '0.9rem', letterSpacing: '0.3px' }}>Select Shift Type</Form.Label>
                                        <Row className="g-3">
                                            {shiftTypes.map((shift) => (
                                                <Col key={shift.id} xs={12} sm={6} md={3}>
                                                    <div
                                                        className={`selection-card p-3 rounded-3 d-flex align-items-center gap-3 cursor-pointer transition-all h-100 ${selectedShift === shift.id ? 'selected shadow-sm' : 'hover-bg-light'
                                                            }`}
                                                        onClick={() => setSelectedShift(shift.id)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            border: selectedShift === shift.id ? '1.5px solid var(--primary)' : '1px solid #e0e6eb',
                                                            backgroundColor: selectedShift === shift.id ? 'rgba(2, 89, 85, 0.04)' : '#fff'
                                                        }}
                                                    >
                                                        {/* Radio button circle */}
                                                        <div className="shrink-0 d-flex align-items-center justify-content-center">
                                                            {selectedShift === shift.id ? (
                                                                <i className="fa-solid fa-circle-dot fs-6" style={{ color: 'var(--primary)' }}></i>
                                                            ) : (
                                                                <i className="fa-regular fa-circle fs-6" style={{ color: '#ced4da' }}></i>
                                                            )}
                                                        </div>

                                                        <div className="d-flex align-items-center gap-2">
                                                            {shift.icon && (
                                                                <i className={`fa-solid ${shift.icon}`} style={{ color: selectedShift === shift.id ? 'var(--primary)' : '#6c757d', fontSize: '0.9rem' }}></i>
                                                            )}
                                                            <span className="text-dark" style={{ fontSize: '0.85rem', fontWeight: selectedShift === shift.id ? '700' : '500' }}>
                                                                {shift.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>

                                    {/* Continue Button */}
                                    <Button
                                        variant="primary"
                                        className="w-100 py-2 rounded-3 fw-bold mt-2 shadow-sm d-flex justify-content-center align-items-center gap-2"
                                        style={{ backgroundColor: 'var(--primary)', border: 'none', fontSize: '1rem', opacity: !selectedShift ? 0.6 : 1 }}
                                        onClick={() => setCurrentStep(isUrgent ? 3 : 2)}
                                        disabled={!selectedShift}
                                    >
                                        Continue <i className="fa-solid fa-arrow-right"></i>
                                    </Button>
                                </motion.div>
                            )}

                            {currentStep === 2 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    {/* Date Selection */}
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <Form.Label className="fw-bold text-dark mb-0" style={{ fontSize: '0.9rem', letterSpacing: '0.3px' }}>Select Date</Form.Label>
                                            <div className="d-flex gap-2">
                                                <Button 
                                                    variant="outline-secondary" 
                                                    size="sm" 
                                                    className="rounded-circle d-flex align-items-center justify-content-center p-0"
                                                    style={{ width: '30px', height: '30px', borderColor: '#e0e6eb' }}
                                                    onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                                                    disabled={weekOffset === 0}
                                                >
                                                    <i className="fa-solid fa-chevron-left fs-7"></i>
                                                </Button>
                                                <Button 
                                                    variant="outline-secondary" 
                                                    size="sm" 
                                                    className="rounded-circle d-flex align-items-center justify-content-center p-0"
                                                    style={{ width: '30px', height: '30px', borderColor: '#e0e6eb' }}
                                                    onClick={() => setWeekOffset(weekOffset + 1)}
                                                >
                                                    <i className="fa-solid fa-chevron-right fs-7"></i>
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="d-flex flex-nowrap gap-2 overflow-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                            {availableDates.map((dateObj) => {
                                                const hasAvailableTimes = getFilteredTimes(dateObj.id).length > 0;
                                                const isDisabled = !dateObj.isWorking || dateObj.isPast || !hasAvailableTimes;
                                                return (
                                                    <div
                                                        key={dateObj.id}
                                                        className={`selection-card rounded-3 d-flex flex-column align-items-center justify-content-center p-3 flex-shrink-0 transition-all ${selectedDate === dateObj.id ? 'selected shadow-sm' : ''} ${isDisabled ? 'opacity-50' : 'cursor-pointer hover-bg-light'}`}
                                                        onClick={() => !isDisabled && setSelectedDate(dateObj.id)}
                                                        style={{
                                                            border: selectedDate === dateObj.id ? '1.5px solid var(--primary)' : '1px solid #e0e6eb',
                                                            backgroundColor: selectedDate === dateObj.id ? 'rgba(2, 89, 85, 0.04)' : (isDisabled ? '#f8fafc' : '#fff'),
                                                            minWidth: '85px',
                                                            cursor: isDisabled ? 'not-allowed' : 'pointer'
                                                        }}
                                                    >
                                                        <span className="fw-medium mb-1" style={{ fontSize: '0.8rem', color: selectedDate === dateObj.id ? 'var(--primary)' : '#6c757d' }}>{dateObj.day}</span>
                                                        <span className="fw-bold" style={{ fontSize: '0.95rem', color: selectedDate === dateObj.id ? 'var(--primary)' : 'var(--text-main)' }}>{dateObj.date}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Time Selection */}
                                    <div className="mb-4">
                                        <Form.Label className="fw-bold text-dark mb-3" style={{ fontSize: '0.9rem', letterSpacing: '0.3px' }}>Select Time</Form.Label>
                                        <div className="d-flex flex-wrap gap-2 gap-md-3">
                                            {getFilteredTimes().length > 0 ? getFilteredTimes().map((time) => {
                                                const dateObj = availableDates.find(d => d.id === selectedDate);
                                                const label = (dateObj && dateObj.timeLabels && dateObj.timeLabels[time]) ? dateObj.timeLabels[time] : time;
                                                return (
                                                    <div
                                                        key={time}
                                                        className={`selection-card rounded-3 d-flex flex-column align-items-center justify-content-center p-3 cursor-pointer transition-all ${selectedTime === time ? 'selected shadow-sm' : 'hover-bg-light'
                                                            }`}
                                                        onClick={() => setSelectedTime(time)}
                                                        style={{
                                                            border: selectedTime === time ? '1.5px solid var(--primary)' : '1px solid #e0e6eb',
                                                            backgroundColor: selectedTime === time ? 'rgba(2, 89, 85, 0.04)' : '#fff',
                                                            minWidth: hasShifts ? '100%' : 'auto',
                                                            flex: hasShifts ? '1 1 100%' : '0 1 auto'
                                                        }}
                                                    >
                                                        <span className="fw-bold" style={{ fontSize: hasShifts ? '0.95rem' : '0.85rem', color: selectedTime === time ? 'var(--primary)' : 'var(--text-main)' }}>{label}</span>
                                                    </div>
                                                );
                                            }) : (
                                                <div className="text-muted w-100 text-center py-3 bg-light rounded-3" style={{ fontSize: '0.9rem' }}>
                                                    <i className="fa-solid fa-calendar-xmark mb-2 d-block fs-4 text-secondary"></i>
                                                    No available times on this day.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Continue Button */}
                                    {isRescheduling ? (
                                        <Button
                                            variant="primary"
                                            className="w-100 py-2 rounded-3 fw-bold mt-2 shadow-sm d-flex justify-content-center align-items-center gap-2"
                                            style={{ backgroundColor: 'var(--primary)', border: 'none', fontSize: '1rem', transition: 'all 0.3s ease', opacity: (isSubmitting || !selectedDate || getFilteredTimes().length === 0 || !getFilteredTimes().includes(selectedTime)) ? 0.6 : 1 }}
                                            onClick={handleConfirmReschedule}
                                            disabled={isSubmitting || !selectedDate || getFilteredTimes().length === 0 || !getFilteredTimes().includes(selectedTime)}
                                        >
                                            {isSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'} <i className="fa-solid fa-check"></i>
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="primary"
                                            className="w-100 py-2 rounded-3 fw-bold mt-2 shadow-sm d-flex justify-content-center align-items-center gap-2"
                                            style={{ backgroundColor: 'var(--primary)', border: 'none', fontSize: '1rem', transition: 'all 0.3s ease', opacity: (!selectedDate || getFilteredTimes().length === 0 || !getFilteredTimes().includes(selectedTime)) ? 0.6 : 1 }}
                                            onClick={() => setCurrentStep(3)}
                                            disabled={!selectedDate || getFilteredTimes().length === 0 || !getFilteredTimes().includes(selectedTime)}
                                        >
                                            Continue <i className="fa-solid fa-arrow-right"></i>
                                        </Button>
                                    )}
                                </motion.div>
                            )}

                            {currentStep === 3 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>Booking For</Form.Label>
                                        <Form.Select 
                                            value={isForSomeoneElse ? (selectedFamilyMemberIndex !== '' ? `family_${selectedFamilyMemberIndex}` : 'other') : 'myself'}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === 'myself') {
                                                    setIsForSomeoneElse(false);
                                                    setSelectedFamilyMemberIndex('');
                                                } else if (val.startsWith('family_')) {
                                                    setIsForSomeoneElse(true);
                                                    setSelectedFamilyMemberIndex(val.split('_')[1]);
                                                } else {
                                                    setIsForSomeoneElse(true);
                                                    setSelectedFamilyMemberIndex('');
                                                }
                                            }}
                                            className="py-2 px-3 shadow-none custom-input"
                                            style={{ border: '1px solid #e0e6eb', borderRadius: '8px', fontSize: '0.9rem' }}
                                        >
                                            <option value="myself">Myself</option>
                                            {isAuthenticated && user?.familyMembers?.map((member, index) => (
                                                <option key={member._id || index} value={`family_${index}`}>{member.name} ({member.relationship})</option>
                                            ))}
                                            <option value="other">Someone Else</option>
                                        </Form.Select>
                                    </Form.Group>

                                    {(!isForSomeoneElse && isAuthenticated && user) || (isForSomeoneElse && selectedFamilyMemberIndex !== '' && user?.familyMembers?.[selectedFamilyMemberIndex]) ? (
                                        <>
                                            {(()=>{
                                                const targetUser = !isForSomeoneElse ? user : user.familyMembers[selectedFamilyMemberIndex];
                                                const isMissingInfo = !targetUser.name || !targetUser.phone || !targetUser.address || (!isForSomeoneElse && !targetUser.email);
                                                
                                                if(isMissingInfo) {
                                                    return (
                                                        <div className="alert alert-warning rounded-3 mb-4 d-flex align-items-start gap-3 border-warning" style={{ backgroundColor: '#fff3cd' }}>
                                                            <i className="fa-solid fa-triangle-exclamation fs-5 text-warning mt-1"></i>
                                                            <div>
                                                                <h6 className="fw-bold mb-1 text-dark">Incomplete Profile Information</h6>
                                                                <p className="mb-2 text-dark" style={{ fontSize: '0.9rem' }}>
                                                                    {!isForSomeoneElse 
                                                                        ? "Your profile is missing some required details (e.g., phone or address). Please complete your profile to continue booking."
                                                                        : "The selected family member is missing some required details. Please update their info to continue."}
                                                                </p>
                                                                <button type="button" onClick={() => navigate('/profile')} className="btn btn-sm btn-warning fw-bold text-dark border-0 shadow-sm" style={{ backgroundColor: '#ffc107' }}>
                                                                    Go to Profile <i className="fa-solid fa-arrow-right ms-1"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}

                                            <div className="p-4 mb-4 rounded-3 bg-light" style={{ border: '1px solid #e0e6eb' }}>
                                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--primary)' }}>
                                                    <i className="fa-regular fa-id-card fs-5"></i> 
                                                    Patient Details
                                                </h6>
                                                <Row className="gy-3">
                                                    <Col sm={6}>
                                                        <span className="text-muted d-block mb-1" style={{ fontSize: '0.8rem' }}>Full Name</span>
                                                        <span className="fw-medium text-dark">{!isForSomeoneElse ? user.name : user.familyMembers[selectedFamilyMemberIndex].name}</span>
                                                    </Col>
                                                    <Col sm={6}>
                                                        <span className="text-muted d-block mb-1" style={{ fontSize: '0.8rem' }}>Contact Phone</span>
                                                        <span className="fw-medium text-dark">{user.phone}</span>
                                                    </Col>
                                                    {!isForSomeoneElse && user.email && (
                                                        <Col sm={6}>
                                                            <span className="text-muted d-block mb-1" style={{ fontSize: '0.8rem' }}>Email Address</span>
                                                            <span className="fw-medium text-dark">{user.email}</span>
                                                        </Col>
                                                    )}
                                                    {(!isForSomeoneElse ? user.age : user.familyMembers[selectedFamilyMemberIndex].age) && (
                                                        <Col sm={6}>
                                                            <span className="text-muted d-block mb-1" style={{ fontSize: '0.8rem' }}>Age</span>
                                                            <span className="fw-medium text-dark">{!isForSomeoneElse ? user.age : user.familyMembers[selectedFamilyMemberIndex].age} Years</span>
                                                        </Col>
                                                    )}
                                                    {(!isForSomeoneElse ? user.gender : user.familyMembers[selectedFamilyMemberIndex].gender) && (
                                                        <Col sm={6}>
                                                            <span className="text-muted d-block mb-1" style={{ fontSize: '0.8rem' }}>Gender</span>
                                                            <span className="fw-medium text-dark text-capitalize">{!isForSomeoneElse ? user.gender : user.familyMembers[selectedFamilyMemberIndex].gender}</span>
                                                        </Col>
                                                    )}
                                                    <Col sm={12}>
                                                        <span className="text-muted d-block mb-1" style={{ fontSize: '0.8rem' }}>Home Address</span>
                                                        <span className="fw-medium text-dark">{!isForSomeoneElse ? user.address : user.familyMembers[selectedFamilyMemberIndex].address}</span>
                                                    </Col>
                                                </Row>
                                            </div>
                                            <Form.Group className="mb-4">
                                                <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>Any special instructions?</Form.Label>
                                                <Form.Control 
                                                    as="textarea" 
                                                    rows={4}
                                                    value={!isForSomeoneElse ? formData.message : formData.theirMessage}
                                                    onChange={(e) => !isForSomeoneElse 
                                                        ? setFormData({...formData, message: e.target.value}) 
                                                        : setFormData({...formData, theirMessage: e.target.value})
                                                    }
                                                    placeholder="Write any instructions for the nurse here..."
                                                    className="py-2 px-3 shadow-none custom-input" 
                                                    style={{ border: '1px solid #e0e6eb', borderRadius: '8px', fontSize: '0.9rem', resize: 'none' }}
                                                />
                                            </Form.Group>
                                        </>
                                    ) : (
                                        <>
                                            {!isForSomeoneElse ? (
                                                <>
                                                    <Row className="g-3 mb-3">
                                                        <Col md={6}>
                                                            <Form.Group>
                                                                <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>Full Name <span className="text-danger">*</span></Form.Label>
                                                                <Form.Control 
                                                                    type="text" 
                                                                    value={formData.name}
                                                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                                    className="py-2 px-3 shadow-none custom-input" 
                                                                    style={{ border: '1px solid #e0e6eb', borderRadius: '8px', fontSize: '0.9rem' }}
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md={6}>
                                                            <Form.Group>
                                                                <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>Phone Number <span className="text-danger">*</span></Form.Label>
                                                                <Form.Control 
                                                                    type="tel" 
                                                                    value={formData.phone}
                                                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                                    className="py-2 px-3 shadow-none custom-input" 
                                                                    style={{ border: '1px solid #e0e6eb', borderRadius: '8px', fontSize: '0.9rem' }}
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Row className="g-3 mb-3">
                                                        <Col md={12}>
                                                            <Form.Group>
                                                                <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>Email Address <span className="text-danger">*</span></Form.Label>
                                                                <Form.Control 
                                                                    type="email" 
                                                                    value={formData.email}
                                                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                                    className="py-2 px-3 shadow-none custom-input" 
                                                                    style={{ border: '1px solid #e0e6eb', borderRadius: '8px', fontSize: '0.9rem' }}
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>Home Address <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control 
                                                            type="text" 
                                                            value={formData.address}
                                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                                            placeholder="Building, Street, Area, City"
                                                            className="py-2 px-3 shadow-none custom-input" 
                                                            style={{ border: '1px solid #e0e6eb', borderRadius: '8px', fontSize: '0.9rem' }}
                                                        />
                                                    </Form.Group>
                                                    <Form.Group className="mb-4">
                                                        <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>Any special instructions?</Form.Label>
                                                        <Form.Control 
                                                            as="textarea" 
                                                            rows={3}
                                                            value={formData.message}
                                                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                                                            className="py-2 px-3 shadow-none custom-input" 
                                                            style={{ border: '1px solid #e0e6eb', borderRadius: '8px', fontSize: '0.9rem', resize: 'none' }}
                                                        />
                                                    </Form.Group>
                                                </>
                                            ) : (
                                                <>
                                                    <Row className="g-3 mb-3">
                                                        <Col md={6}>
                                                            <Form.Group>
                                                                <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>Patient's Full Name <span className="text-danger">*</span></Form.Label>
                                                                <Form.Control 
                                                                    type="text" 
                                                                    value={formData.theirName}
                                                                    onChange={(e) => setFormData({...formData, theirName: e.target.value})}
                                                                    className="py-2 px-3 shadow-none custom-input" 
                                                                    style={{ border: '1px solid #e0e6eb', borderRadius: '8px', fontSize: '0.9rem' }}
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md={6}>
                                                            <Form.Group>
                                                                <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>Contact Phone <span className="text-danger">*</span></Form.Label>
                                                                <Form.Control 
                                                                    type="tel" 
                                                                    value={formData.theirPhone}
                                                                    onChange={(e) => setFormData({...formData, theirPhone: e.target.value})}
                                                                    className="py-2 px-3 shadow-none custom-input" 
                                                                    style={{ border: '1px solid #e0e6eb', borderRadius: '8px', fontSize: '0.9rem' }}
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    
                                                    {!isAuthenticated && (
                                                        <Row className="g-3 mb-3">
                                                            <Col md={12}>
                                                                <Form.Group>
                                                                    <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>Your Email Address (For booking confirmation) <span className="text-danger">*</span></Form.Label>
                                                                    <Form.Control 
                                                                        type="email" 
                                                                        value={formData.email}
                                                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                                        className="py-2 px-3 shadow-none custom-input" 
                                                                        style={{ border: '1px solid #e0e6eb', borderRadius: '8px', fontSize: '0.9rem' }}
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                        </Row>
                                                    )}

                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>Patient's Home Address <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control 
                                                            type="text" 
                                                            value={formData.theirAddress}
                                                            onChange={(e) => setFormData({...formData, theirAddress: e.target.value})}
                                                            className="py-2 px-3 shadow-none custom-input" 
                                                            style={{ border: '1px solid #e0e6eb', borderRadius: '8px', fontSize: '0.9rem' }}
                                                        />
                                                    </Form.Group>

                                                    <Form.Group className="mb-4">
                                                        <Form.Label className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>Any special instructions?</Form.Label>
                                                        <Form.Control 
                                                            as="textarea" 
                                                            rows={4}
                                                            value={formData.theirMessage}
                                                            onChange={(e) => setFormData({...formData, theirMessage: e.target.value})}
                                                            className="py-2 px-3 shadow-none custom-input" 
                                                            style={{ border: '1px solid #e0e6eb', borderRadius: '8px', fontSize: '0.9rem', resize: 'none' }}
                                                        />
                                                    </Form.Group>
                                                </>
                                            )}
                                        </>
                                    )}

                                    {/* Continue Button */}
                                    <Button 
                                        variant="primary" 
                                        disabled={!isStep3Valid}
                                        className={`w-100 py-2 rounded-3 fw-bold mt-2 shadow-sm d-flex justify-content-center align-items-center gap-2 ${!isStep3Valid ? 'opacity-50' : ''}`}
                                        style={{ backgroundColor: 'var(--primary)', border: 'none', fontSize: '1rem', transition: 'all 0.3s ease' }}
                                        onClick={() => setCurrentStep(4)}
                                    >
                                        Continue <i className="fa-solid fa-arrow-right"></i>
                                    </Button>
                                </motion.div>
                            )}

                            {currentStep === 4 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    
                                    {/* Nurse Details Section */}
                                    {nurseDetails && (
                                        <div className="mb-4">
                                            <h6 className="fw-bold text-dark mb-3">Selected Professional</h6>
                                            <div className="p-3 rounded-3 d-flex align-items-center gap-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e0e6eb' }}>
                                                <div className="position-relative flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                                                    <img 
                                                        src={nurseDetails.profilePicture ? (nurseDetails.profilePicture.startsWith('data:') ? nurseDetails.profilePicture : `http://localhost:5000/uploads/${nurseDetails.profilePicture}`) : `https://placehold.co/100x100/025955/ffffff?text=${nurseDetails.name ? nurseDetails.name.charAt(0).toUpperCase() : 'N'}`}
                                                        alt={nurseDetails.name} 
                                                        onError={(e) => { e.target.src = 'https://placehold.co/100x100/025955/ffffff?text=N' }}
                                                        className="rounded-circle shadow-sm w-100 h-100" 
                                                        style={{ objectFit: 'cover' }} 
                                                    />
                                                </div>
                                                <div>
                                                    <h6 className="fw-bold text-dark mb-1">{nurseDetails.name}</h6>
                                                    <div className="text-muted d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                                                        <span><i className="fa-solid fa-star text-warning me-1"></i>{nurseDetails.rating || 'New'}</span>
                                                        <span>•</span>
                                                        <span>{nurseDetails.qualification || 'Certified Nurse'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Summary Section */}
                                    <div className="mb-4">
                                        <h6 className="fw-bold text-dark mb-3">Appointment Summary</h6>
                                        <div className="p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e0e6eb' }}>
                                            <Row className="g-3">
                                                <Col sm={6}>
                                                    <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Service</span>
                                                    <span className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{selectedService}</span>
                                                </Col>
                                                <Col sm={6}>
                                                    <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Shift Type</span>
                                                    <span className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                                                        {hasShifts ? selectedShift : 'Single Visit'}
                                                    </span>
                                                </Col>
                                                {!isUrgent && (
                                                    <>
                                                        <Col sm={6}>
                                                            <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Date</span>
                                                            <span className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{availableDates.find(d => d.id === selectedDate)?.date}</span>
                                                        </Col>
                                                        <Col sm={6}>
                                                            <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Time</span>
                                                            <span className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{selectedTime}</span>
                                                        </Col>
                                                    </>
                                                )}
                                            </Row>
                                        </div>
                                    </div>

                                    {/* Patient Details Section */}
                                    <div className="mb-4">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <h6 className="fw-bold text-dark mb-0">Patient Details</h6>
                                            {!isUrgent && (
                                                <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: 'rgba(2, 89, 85, 0.1)', color: 'var(--primary)', fontWeight: '600' }}>
                                                    {isForSomeoneElse ? 'Booking for Someone Else' : 'Booking for Myself'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e0e6eb' }}>
                                            <Row className="g-3">
                                                <Col sm={6}>
                                                    <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Name</span>
                                                    <span className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{isForSomeoneElse ? formData.theirName : formData.name}</span>
                                                </Col>
                                                <Col sm={6}>
                                                    <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Phone</span>
                                                    <span className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{isForSomeoneElse ? formData.theirPhone : formData.phone}</span>
                                                </Col>
                                                {!isForSomeoneElse && (
                                                    <Col sm={12}>
                                                        <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Email</span>
                                                        <span className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{formData.email}</span>
                                                    </Col>
                                                )}
                                                <Col sm={12}>
                                                    <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Address</span>
                                                    <span className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{isForSomeoneElse ? formData.theirAddress : formData.address}</span>
                                                </Col>
                                                <Col sm={12}>
                                                    <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Additional Message</span>
                                                    <span className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{isForSomeoneElse ? (formData.theirMessage || 'None') : (formData.message || 'None')}</span>
                                                </Col>
                                            </Row>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="mb-4">
                                        <h6 className="fw-bold text-dark mb-3">Payment Method</h6>
                                        <div 
                                            className="p-3 rounded-3 d-flex align-items-center justify-content-between" 
                                            style={{ backgroundColor: '#fff', border: '1.5px solid var(--primary)' }}
                                        >
                                            <div className="d-flex align-items-center gap-3">
                                                <i className="fa-solid fa-money-bill-wave fs-5 text-success"></i>
                                                <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>Cash on Service</span>
                                            </div>
                                            <i className="fa-solid fa-circle-check text-primary fs-5"></i>
                                        </div>
                                    </div>

                                    {/* Total and Submit */}
                                    <div className="border-top pt-4 d-flex align-items-center justify-content-between mb-4">
                                        <div>
                                            <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>Total Cost Estimate</span>
                                            <h4 className="fw-bold mb-0" style={{ color: 'var(--primary)' }}>{calculateTotalCost()} EGP</h4>
                                        </div>
                                        <Button 
                                            variant="primary" 
                                            className="rounded-3 px-4 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm"
                                            onClick={handleConfirmBooking}
                                            disabled={isSubmitting}
                                            style={{ backgroundColor: 'var(--primary)', border: 'none', fontSize: '1.05rem' }}
                                        >
                                            {isSubmitting ? 'Confirming...' : 'Confirm Appointment'} <i className="fa-solid fa-check"></i>
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                        </Form>
                    </Card>
                    </motion.div>
                ) : (
                    /* Step 5: Success Message */
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mx-auto" 
                        style={{ maxWidth: '500px' }}
                    >
                        <Card className="border-0 shadow-sm rounded-4 p-5 bg-white text-center" style={{ border: '1px solid #e0e6eb' }}>
                            <div className="mb-4 d-flex justify-content-center">
                                <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                    <i className="fa-solid fa-check text-success" style={{ fontSize: '2.5rem' }}></i>
                                </div>
                            </div>
                            <h3 className="fw-bold text-dark mb-3">Booking Confirmed!</h3>
                            <p className="text-muted mb-4" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                                Your appointment has been successfully booked. We've sent a confirmation message to your email.
                            </p>
                            <Button 
                                variant="primary" 
                                className="rounded-pill px-4 py-2 fw-bold shadow-sm w-100" 
                                onClick={() => navigate('/profile', { state: { activeTab: 'booking' } })}
                                style={{ backgroundColor: 'var(--primary)', border: 'none', fontSize: '1.05rem' }}
                            >
                                View My Bookings
                            </Button>
                        </Card>
                    </motion.div>
                )}

            </Container>

            <style>{`
                .selection-card:hover {
                    background-color: #f8fafc !important;
                }
                .hover-bg-light:hover { background-color: #f8fafc !important; }
                .hover-primary:hover {
                    color: var(--primary) !important;
                    background-color: rgba(2, 89, 85, 0.1) !important;
                }
                .hover-primary-text:hover { color: #024642 !important; }
                .custom-input:focus {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 4px rgba(2, 89, 85, 0.1) !important;
                }
            `}</style>
        </div>
    );
}
