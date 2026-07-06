import re

with open('raaya-react/src/components/profile/BookingHistoryTab.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add states
content = re.sub(
    r'const \[loading, setLoading\] = useState\(true\);',
    '''const [loading, setLoading] = useState(true);

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
    const [rescheduleError, setRescheduleError] = useState('');''',
    content
)

logic = '''
    useEffect(() => {
        if (!bookingToReschedule || !nurseDetails) return;

        const dates = [];
        const tMap = {};
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() + (weekOffset * 7));

        const hasShifts = bookingToReschedule.shift !== 'Quick Visit';
        const selectedShift = bookingToReschedule.shift;

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
                    const canDoQuick = wh.availableForQuickVisits !== false;
                    const canDoLong = wh.availableForLongShifts !== false;

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
                            times.push(`\\`${displayH < 10 ? '0'+displayH : displayH}:${displayM} ${ampm}\\``);
                            
                            curM += 30;
                            if (curM >= 60) {
                                curH += 1;
                                curM -= 60;
                            }
                        }
                    } else if (hasShifts && canDoLong) {
                        const shiftHours = parseInt(selectedShift.split(' ')[0]);
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
                const LEAD_TIME_BUFFER = 120; // 2 hours
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
            await axios.put(`\\`http://localhost:5000/api/bookings/patient/${bookingToCancel._id}/cancel\\``, {}, {
                headers: { Authorization: `\\`Bearer ${token}\\`` }
            });
            setBookings(prev => prev.map(b => b._id === bookingToCancel._id ? { ...b, status: 'cancelled' } : b));
            setShowCancelModal(false);
        } catch (error) {
            console.error('Failed to cancel booking', error);
            setCancelError('Failed to cancel booking. Please try again.');
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
            const res = await axios.get(`\\`http://localhost:5000/api/public/nurses/${nurseId}\\``);
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
            await axios.put(`\\`http://localhost:5000/api/bookings/patient/${bookingToReschedule._id}/reschedule\\``, {
                date: selectedDate,
                time: selectedTime,
                shift: bookingToReschedule.shift
            }, {
                headers: { Authorization: `\\`Bearer ${token}\\`` }
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
            setRescheduleError('Failed to reschedule. The slot might be booked.');
        } finally {
            setRescheduleLoading(false);
        }
    };

    const oldHandleCancel = async (bookingId) => {'''

content = re.sub(
    r'const handleCancel = async \(bookingId\) => \{',
    logic,
    content
)

content = content.replace(
    'onClick={() => handleCancel(booking._id)}',
    'onClick={() => handleCancelClick(booking)}'
)

content = content.replace(
    'onClick={() => handleRebook(booking, true)}',
    'onClick={() => handleRescheduleClick(booking)}'
)

modals = '''
            {/* Cancel Modal */}
            <Modal show={showCancelModal} onHide={() => !cancelLoading && setShowCancelModal(false)} centered>
                <Modal.Header closeButton={!cancelLoading}>
                    <Modal.Title className="fw-bold text-danger"><i className="fa-solid fa-triangle-exclamation me-2"></i>Cancel Booking</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {cancelError && <div className="alert alert-danger py-2">{cancelError}</div>}
                    <p>Are you sure you want to cancel your <strong>{bookingToCancel?.service}</strong> booking?</p>
                    <p className="text-muted text-14 mb-0">This action will release the slot and cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" onClick={() => setShowCancelModal(false)} disabled={cancelLoading} className="rounded-pill fw-bold px-4">Keep Booking</Button>
                    <Button variant="danger" onClick={confirmCancel} disabled={cancelLoading} className="rounded-pill fw-bold px-4">
                        {cancelLoading ? <i className="fa-solid fa-spinner fa-spin me-2"></i> : null}
                        Yes, Cancel
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Reschedule Modal */}
            <Modal show={showRescheduleModal} onHide={() => !rescheduleLoading && setShowRescheduleModal(false)} centered size="lg">
                <Modal.Header closeButton={!rescheduleLoading}>
                    <Modal.Title className="fw-bold text-primary"><i className="fa-solid fa-calendar-days me-2"></i>Reschedule Booking</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-light">
                    {rescheduleError && <div className="alert alert-danger py-2">{rescheduleError}</div>}
                    {!nurseDetails ? (
                        <div className="text-center py-5"><i className="fa-solid fa-spinner fa-spin fs-2 text-primary"></i></div>
                    ) : (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-bold mb-0">Select Date</h6>
                                <div>
                                    <Button variant="light" size="sm" onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))} disabled={weekOffset === 0} className="rounded-circle me-2" style={{width:'32px',height:'32px'}}><i className="fa-solid fa-chevron-left"></i></Button>
                                    <Button variant="light" size="sm" onClick={() => setWeekOffset(weekOffset + 1)} className="rounded-circle" style={{width:'32px',height:'32px'}}><i className="fa-solid fa-chevron-right"></i></Button>
                                </div>
                            </div>
                            
                            <div className="d-flex gap-2 overflow-auto pb-2 custom-scrollbar mb-4">
                                {availableDates.map((d, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`\\`${d.isPast ? "bg-light text-muted opacity-50" : d.id === selectedDate ? "bg-primary text-white border-primary shadow-sm" : d.isWorking ? "bg-white hover-bg-light cursor-pointer" : "bg-white text-muted opacity-50"} text-center p-2 rounded-4 border flex-shrink-0\\``}
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
                                                className={`\\`${time === selectedTime ? "bg-primary text-white border-primary shadow-sm" : "bg-white text-dark hover-bg-light cursor-pointer"} px-3 py-2 rounded-pill border\\``}
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
                                <div className="text-center p-4 bg-white rounded border text-muted">
                                    No available times for this date.
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" onClick={() => setShowRescheduleModal(false)} disabled={rescheduleLoading} className="rounded-pill fw-bold px-4">Discard</Button>
                    <Button variant="primary" onClick={confirmReschedule} disabled={rescheduleLoading || !selectedDate || !selectedTime} className="rounded-pill fw-bold px-4">
                        {rescheduleLoading ? <i className="fa-solid fa-spinner fa-spin me-2"></i> : null}
                        Confirm Reschedule
                    </Button>
                </Modal.Footer>
            </Modal>
        </motion.div>
'''

content = re.sub(r'</motion\.div>', modals, content)

with open('raaya-react/src/components/profile/BookingHistoryTab.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement successful")
