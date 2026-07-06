import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from 'axios';


export default function NurseProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [nurseData, setNurseData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [availableDates, setAvailableDates] = useState([]);
    const [timesMap, setTimesMap] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);

    const preSelectedService = location.state?.preSelectedService || null;

    const handleBackClick = () => {
        if (preSelectedService) {
            navigate('/book', { state: { preSelectedService } });
        } else {
            navigate(-1);
        }
    };

    useEffect(() => {
        const fetchNurse = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/public/nurses/${id}`);
                setNurseData(res.data);
            } catch (err) {
                console.error("Error fetching nurse:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNurse();
    }, [id]);

    useEffect(() => {
        if (nurseData && nurseData.workingHours && nurseData.workingHours.length > 0) {
            const dates = [];
            const tMap = {};
            let currentDate = new Date();
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            
            for (let count = 0; count < 7; count++) {
                const dayName = daysOfWeek[currentDate.getDay()];
                const wh = nurseData.workingHours.find(w => w.day === dayName);
                
                const dateStr = currentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                let dayLabel = dayName.slice(0, 3);
                if (count === 0) dayLabel = 'Today';
                else if (count === 1) dayLabel = 'Tomorrow';

                const availableQuick = [];
                const availableLong = [];
                let isWorkingDay = false;

                if (wh) {
                    if (wh.availableForQuickVisits) {
                        isWorkingDay = true;
                        let [startH, startM] = (wh.startTime || '09:00').split(':').map(Number);
                        let [endH, endM] = (wh.endTime || '17:00').split(':').map(Number);
                        
                        let curH = startH;
                        let curM = startM;
                        
                        while (curH < endH || (curH === endH && curM < endM)) {
                            const ampm = curH >= 12 ? 'PM' : 'AM';
                            const displayH = curH % 12 === 0 ? 12 : curH % 12;
                            const displayM = curM === 0 ? '00' : curM;
                            availableQuick.push(`${displayH < 10 ? '0'+displayH : displayH}:${displayM} ${ampm}`);
                            
                            curM += 60; // 1 hour intervals
                            if (curM >= 60) {
                                curH += 1;
                                curM -= 60;
                            }
                        }
                    }

                    if (wh.availableForLongShifts) {
                        if (wh.dayShift) availableLong.push('Day Shift');
                        if (wh.nightShift) availableLong.push('Night Shift');
                        if (wh.dayShift && wh.nightShift) availableLong.push('24-Hour Shift');
                        if (availableLong.length > 0) isWorkingDay = true;
                    }
                }
                
                dates.push({ id: dateStr, day: dayLabel, date: dateStr, isWorkingDay });
                tMap[dateStr] = { quickVisits: availableQuick, longShifts: availableLong };
                
                currentDate.setDate(currentDate.getDate() + 1);
            }
            
            setAvailableDates(dates);
            setTimesMap(tMap);
            setSelectedDate(dates[0].id);
        }
    }, [nurseData]);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
    };

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '80px', paddingTop: '90px' }}>
            <Container className="px-lg-4" style={{ maxWidth: '1140px' }}>
                {/* Back Button */}
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                    <Button 
                        variant="link" 
                        className="text-decoration-none text-muted mb-3 px-0 d-inline-flex align-items-center gap-2 fw-medium btn-back"
                        onClick={handleBackClick}
                        style={{ fontSize: '0.9rem' }}
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                        Back to search
                    </Button>
                </motion.div>

                {loading ? (
                    <div className="text-center py-5 w-100">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : nurseData ? (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Row className="g-4">
                        {/* Left Column: Main Profile Info */}
                        <Col lg={8} className="d-flex flex-column gap-4">
                            
                            {/* 1. Main Profile Header Card */}
                            <motion.div variants={itemVariants} className="bg-white p-4 rounded-4 shadow-sm section-card">
                                <div className="d-flex flex-column flex-md-row gap-4 align-items-center align-items-md-start">
                                    
                                    {/* Image Section */}
                                    <div className="position-relative shrink-0 text-center">
                                        <div className="rounded-4 overflow-hidden" style={{ width: '120px', height: '120px' }}>
                                            <img 
                                                src={nurseData.profilePicture ? (nurseData.profilePicture.startsWith('data:') ? nurseData.profilePicture : `http://localhost:5000/uploads/${nurseData.profilePicture}`) : `https://placehold.co/100x100/025955/ffffff?text=${nurseData.name ? nurseData.name.charAt(0).toUpperCase() : 'N'}`}
                                                alt={nurseData.name} 
                                                onError={(e) => { e.target.src = 'https://placehold.co/120x120/025955/ffffff?text=Nurse' }}
                                                className="w-100 h-100"
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="position-absolute start-50 translate-middle-x" style={{ bottom: '-10px' }}>
                                            <Badge className="rounded-pill px-2 py-1 shadow-sm d-flex align-items-center gap-1 border border-2 border-white fw-bold" style={{ fontSize: '0.7rem', backgroundColor: '#ff7b29' }}>
                                                <i className="fa-solid fa-check-circle"></i> Verified
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    {/* Info Section */}
                                    <div className="flex-grow-1 text-center text-md-start w-100">
                                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-start mb-2">
                                            <div>
                                                <h1 className="fw-bold text-dark mb-1" style={{ fontSize: '1.4rem', letterSpacing: '-0.3px' }}>{nurseData.name}</h1>
                                                <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-3">
                                                    <div className="d-flex align-items-center gap-1 px-2 rounded-2" style={{ backgroundColor: '#e7f9ed', color: '#00a67d', paddingBottom: '2px', paddingTop: '2px' }}>
                                                        <i className="fa-solid fa-star text-warning" style={{ fontSize: '0.75rem' }}></i>
                                                        <span className="fw-bold" style={{ fontSize: '0.8rem' }}>{nurseData.rating || 'New'}</span>
                                                    </div>
                                                    <span className="text-muted fw-medium" style={{ fontSize: '0.8rem' }}>({nurseData.shiftsCompleted || 0} visits)</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="row g-2 text-start mt-2 border-top pt-3 border-light">
                                            <div className="col-12 col-sm-6">
                                                <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.85rem' }}>
                                                    <i className="fa-solid fa-stethoscope" style={{ color: 'var(--primary)', width: '16px' }}></i>
                                                    <span className="fw-medium text-dark">{nurseData.qualification || 'Nurse'}</span>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-6">
                                                <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.85rem' }}>
                                                    <i className="fa-solid fa-briefcase" style={{ color: 'var(--primary)', width: '16px' }}></i>
                                                    <span className="fw-medium text-dark">{nurseData.experienceYears ? `${nurseData.experienceYears}+ Years Experience` : 'Experience'}</span>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-6">
                                                <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.85rem' }}>
                                                    <i className="fa-solid fa-language" style={{ color: 'var(--primary)', width: '16px' }}></i>
                                                    <span className="fw-medium text-dark">{nurseData.languages || 'Arabic, English'}</span>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-6">
                                                <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.85rem' }}>
                                                    <i className="fa-solid fa-location-dot" style={{ color: 'var(--primary)', width: '16px' }}></i>
                                                    <span className="fw-medium text-dark">{nurseData.city || 'Cairo'}, {nurseData.governorate || 'Egypt'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </motion.div>

                            {/* 2. Medical Skills */}
                            <motion.div variants={itemVariants} className="bg-white p-4 rounded-4 shadow-sm section-card">
                                <h6 className="fw-bold text-dark mb-3">Medical Services</h6>
                                <div className="d-flex flex-wrap gap-2">
                                    {(nurseData.skills ? nurseData.skills.split(', ') : []).map((skill, index) => (
                                        <Badge key={index} bg="light" text="dark" className="px-3 py-2 rounded-pill border fw-medium" style={{ fontSize: '0.8rem', color: '#4b5563' }}>
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </motion.div>

                            {/* 3. Available Time Slots */}
                            <motion.div variants={itemVariants} className="bg-white p-4 rounded-4 shadow-sm section-card">
                                <h6 className="fw-bold text-dark mb-3">Availability (Next 7 Days)</h6>
                                
                                {availableDates.length > 0 ? (
                                    <>
                                        {/* Days selection */}
                                        <div className="d-flex overflow-auto pb-2 mb-4 hide-scrollbar gap-2">
                                            {availableDates.map((item) => (
                                                <div 
                                                    key={item.id} 
                                                    onClick={() => setSelectedDate(item.id)}
                                                    className={`d-flex flex-column align-items-center justify-content-center py-2 px-3 border cursor-pointer transition-all ${
                                                        selectedDate === item.id 
                                                            ? 'shadow-sm' 
                                                            : 'bg-white text-muted hover-bg-light'
                                                    }`}
                                                    style={{ 
                                                        minWidth: '75px', 
                                                        cursor: 'pointer', 
                                                        borderRadius: '12px',
                                                        backgroundColor: selectedDate === item.id ? 'var(--primary)' : '#fff',
                                                        borderColor: selectedDate === item.id ? 'var(--primary)' : '#e2e8f0'
                                                    }}
                                                >
                                                    <span className="fw-bold mb-1" style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: selectedDate === item.id ? 'rgba(255,255,255,0.9)' : '#94a3b8' }}>{item.day}</span>
                                                    <span className="fw-bold mb-0" style={{ fontSize: '1.3rem', lineHeight: '1.2', color: selectedDate === item.id ? '#ffffff' : 'var(--text-main)' }}>{item.date.split(' ')[0]}</span>
                                                    <span className="fw-bold mt-1" style={{ fontSize: '0.75rem', color: selectedDate === item.id ? 'rgba(255,255,255,0.9)' : '#64748b' }}>{item.date.split(' ')[1]}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Times for selected date */}
                                        {selectedDate && (
                                            <div>
                                                <h6 className="fw-bold text-dark mb-3 text-15">
                                                    Available options for {availableDates.find(d => d.id === selectedDate)?.date}:
                                                </h6>
                                                
                                                {availableDates.find(d => d.id === selectedDate)?.isWorkingDay ? (
                                                    <div className="d-flex flex-column gap-3">
                                                        {timesMap[selectedDate]?.longShifts?.length > 0 && (
                                                            <div>
                                                                <span className="text-muted fw-bold d-block mb-2 text-14">Long Shifts:</span>
                                                                <div className="d-flex flex-wrap gap-2">
                                                                    {timesMap[selectedDate].longShifts.map((shift, index) => (
                                                                        <Badge key={index} bg="success" text="light" className="px-3 py-2 rounded-3 border-0 fw-bold" style={{ fontSize: '0.85rem' }}>
                                                                            <i className="fa-solid fa-bed me-2"></i>{shift}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {timesMap[selectedDate]?.quickVisits?.length > 0 && (
                                                            <div>
                                                                <span className="text-muted fw-bold d-block mb-2 text-14">Quick Visits:</span>
                                                                <div className="time-slots-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                                                                    {timesMap[selectedDate].quickVisits.map((time, index) => (
                                                                        <div
                                                                            key={index}
                                                                            className="rounded-3 fw-bold py-2 px-2 border-0 text-center w-100 text-primary"
                                                                            style={{ backgroundColor: '#f0f5f4', fontSize: '0.85rem' }}
                                                                        >
                                                                            {time}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {timesMap[selectedDate]?.longShifts?.length === 0 && timesMap[selectedDate]?.quickVisits?.length === 0 && (
                                                            <div className="p-4 bg-light rounded-4 text-center border">
                                                                <i className="fa-solid fa-clock text-muted fs-4 mb-2"></i>
                                                                <p className="fw-bold text-muted mb-0">No specific hours found.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="p-4 bg-light rounded-4 text-center border">
                                                        <i className="fa-regular fa-calendar-xmark text-danger fs-3 mb-2 opacity-75"></i>
                                                        <p className="fw-bold text-danger mb-0">Nurse is not available on this day.</p>
                                                        <span className="text-muted text-14">There are no working hours set.</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="p-4 bg-light rounded-4 text-center border">
                                        <p className="fw-bold text-muted mb-0">Availability is not set by the nurse.</p>
                                    </div>
                                )}
                            </motion.div>

                            {/* 4. Patient Reviews */}
                            <motion.div variants={itemVariants} className="bg-white p-4 rounded-4 shadow-sm section-card">
                                <h6 className="fw-bold text-dark mb-3">Patient Reviews ({nurseData.reviewCount || 0})</h6>
                                <div className="d-flex flex-column gap-3">
                                    {nurseData.reviews && nurseData.reviews.length > 0 ? (
                                        nurseData.reviews.map((review, idx) => (
                                            <div key={idx} className="pb-3 border-bottom border-light">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-primary shadow-sm" style={{ width: '38px', height: '38px', backgroundColor: '#e7f9ed', fontSize: '1rem', textTransform: 'uppercase' }}>
                                                            {(review.patientName || 'P')[0]}
                                                        </div>
                                                        <div>
                                                            <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.9rem' }}>{review.patientName || 'Patient'}</h6>
                                                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                                {new Date(review.date).toLocaleDateString()}
                                                            </small>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex text-warning gap-1" style={{ fontSize: '0.8rem' }}>
                                                        {[...Array(5)].map((_, i) => (
                                                            <i key={i} className={`fa-${i < review.rating ? 'solid' : 'regular'} fa-star`}></i>
                                                        ))}
                                                    </div>
                                                </div>
                                                {review.comment && (
                                                    <p className="text-muted mb-0" style={{ lineHeight: '1.5', fontSize: '0.85rem' }}>
                                                        {review.comment}
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted text-center py-3">No reviews yet.</p>
                                    )}
                                </div>
                            </motion.div>

                        </Col>

                        {/* Right Column: Sticky Booking Card */}
                        <Col lg={4}>
                            <motion.div variants={itemVariants} className="sticky-top" style={{ top: '110px', zIndex: 10 }}>
                                <div className="bg-white p-4 rounded-4 shadow-sm section-card text-center d-flex flex-column justify-content-center h-100">
                                    
                                    <h5 className="fw-bolder text-dark mb-3 mt-2" style={{ fontSize: '1.2rem', letterSpacing: '-0.3px' }}>
                                        Ready to book?
                                    </h5>
                                    
                                    <Button 
                                        variant="primary" 
                                        onClick={() => navigate(`/book-appointment/${nurseData._id}`, { state: { preSelectedService } })}
                                        className="w-100 rounded-3 py-2 fw-bold shadow-sm d-flex justify-content-center align-items-center gap-2 btn-book-premium mb-3"
                                        style={{ backgroundColor: 'var(--primary)', border: 'none', fontSize: '0.95rem' }}
                                    >
                                        Book Appointment <i className="fa-solid fa-arrow-right fs-6"></i>
                                    </Button>
                                    
                                    <p className="text-muted mb-0 fw-medium d-flex align-items-center justify-content-center gap-2" style={{ fontSize: '0.75rem' }}>
                                        <i className="fa-solid fa-shield-halved text-success"></i> Secure payment & Verified
                                    </p>
                                </div>
                            </motion.div>
                        </Col>

                    </Row>
                </motion.div>
                ) : (
                    <div className="text-center py-5 w-100">
                        <h4 className="fw-bold text-dark">Nurse not found</h4>
                    </div>
                )}
            </Container>

            <style>{`
                /* General Enhancements */
                .section-card {
                    border: 1px solid #e0e6eb !important;
                    transition: box-shadow 0.3s ease;
                }
                .section-card:hover {
                    box-shadow: 0 10px 25px -10px rgba(0,0,0,0.08) !important;
                }
                
                /* Back Button */
                .btn-back {
                    transition: all 0.2s ease;
                }
                .btn-back:hover {
                    color: var(--primary) !important;
                    transform: translateX(-4px);
                }

                /* Time Slots Grid */
                .time-slots-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
                    gap: 0.75rem;
                }

                /* Booking Button */
                .btn-book-premium {
                    transition: all 0.3s ease;
                }
                .btn-book-premium:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 15px rgba(2, 89, 85, 0.25) !important;
                }
            `}</style>
        </div>
    );
}
