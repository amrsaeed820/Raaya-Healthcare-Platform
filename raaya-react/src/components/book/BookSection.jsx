import { useState, useMemo, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Badge } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../layout/PageHeader';

const SERVICES = [
    { id: 'Elderly Care', title: 'Elderly Care', desc: 'Comprehensive daily assistance and care for seniors.', price: 'Starts at 300 EGP / visit', icon: 'fa-person-cane' },
    { id: 'Post-operative Care', title: 'Post-operative Care', desc: 'Specialized recovery support after surgery.', price: 'Starts at 350 EGP / visit', icon: 'fa-bed-pulse' },
    { id: 'Chronic Care', title: 'Chronic Care', desc: 'Ongoing management for chronic health conditions.', price: 'Starts at 400 EGP / visit', icon: 'fa-heart-pulse' },
    { id: 'Basic Care', title: 'Basic Care', desc: 'Help with daily activities, hygiene, and feeding.', price: 'Starts at 250 EGP / visit', icon: 'fa-hand-holding-medical' },
    { id: 'Wound & Skin Care', title: 'Wound & Skin Care', desc: 'Professional dressing changes and wound management.', price: 'Starts at 200 EGP / visit', icon: 'fa-bandage' },
    { id: 'Escort Services & Responsibilities', title: 'Escort Services', desc: 'Accompanying patients to appointments and outings.', price: 'Starts at 150 EGP / visit', icon: 'fa-wheelchair' }
];

const BookSection = () => {
    const navigate = useNavigate();
    const [selectedService, setSelectedService] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        gender: 'All',
        rating: 'All',
        experience: 'All'
    });
    const [prices, setPrices] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [nursesRes, settingsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/public/nurses'),
                    axios.get('http://localhost:5000/api/settings')
                ]);
                setProviders(nursesRes.data);
                if (settingsRes.data && settingsRes.data.servicesPricing) {
                    setPrices(settingsRes.data.servicesPricing);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const hasAvailableSlots = (provider) => {
        const bookings = provider.bookings || [];
        const activeBookings = bookings.filter(b => b.status !== 'cancelled');
        const workingHours = provider.workingHours || [];

        const hasShifts = ['Elderly Care', 'Post-operative Care', 'Basic Care', 'Escort Services & Responsibilities'].includes(selectedService);

        const now = new Date();
        const startDate = new Date();
        if (now.getHours() >= 17) {
            startDate.setDate(startDate.getDate() + 1);
        }
        startDate.setHours(0, 0, 0, 0);

        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        for (let i = 0; i < 14; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const dateStr = currentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            const dayName = daysOfWeek[currentDate.getDay()];
            
            const wh = workingHours.find(w => w.day === dayName);
            if (!wh) continue; // Not working this day

            let canDoQuick = wh.availableForQuickVisits !== false;
            let canDoLong = wh.availableForLongShifts !== false;
            const dayBookings = activeBookings.filter(b => b.date === dateStr);

            if (canDoQuick && canDoLong && dayBookings.length > 0) {
                const hasQuick = dayBookings.some(b => b.shift === 'Single Visit' || b.shift === 'Quick Visit' || (b.shift && !b.shift.includes('Hour')));
                const hasLong = dayBookings.some(b => b.shift && b.shift.includes('Hour'));
                if (hasQuick) canDoLong = false;
                if (hasLong) canDoQuick = false;
            }

            let times = [];
            if (!hasShifts && canDoQuick) {
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
                // For shift check, we assume the smallest shift (6 Hour or 12 Hour). Let's use 6 as minimum if possible.
                // Or just if they allow dayShift or nightShift.
                if (wh.dayShift) {
                    times.push("09:00 AM");
                }
                if (wh.nightShift) {
                    times.push("09:00 PM");
                }
            }

            // Filter past times
            if (i === 0 && now.getHours() < 17 && currentDate.getDate() === now.getDate()) {
                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                const LEAD_TIME_BUFFER = 120;
                times = times.filter(timeStr => {
                    let [t, ampm] = timeStr.split(' ');
                    let [slotH, slotM] = t.split(':').map(Number);
                    if (ampm === 'PM' && slotH !== 12) slotH += 12;
                    if (ampm === 'AM' && slotH === 12) slotH = 0;
                    return (slotH * 60 + slotM) >= (currentMinutes + LEAD_TIME_BUFFER);
                });
            }

            // Filter overlaps
            if (dayBookings.length > 0) {
                times = times.filter(timeStr => {
                    let [t, ampm] = timeStr.split(' ');
                    let [slotH, slotM] = t.split(':').map(Number);
                    if (ampm === 'PM' && slotH !== 12) slotH += 12;
                    if (ampm === 'AM' && slotH === 12) slotH = 0;
                    const slotTimeInMinutes = slotH * 60 + slotM;
                    const slotEndInMinutes = slotTimeInMinutes + (hasShifts ? 360 : 120); // assume minimum 6 hour shift or 2 hr task

                    for (let b of dayBookings) {
                        if (!b.time) continue;
                        let [bt, bampm] = b.time.split(' ');
                        let [bh, bm] = bt.split(':').map(Number);
                        if (bampm === 'PM' && bh !== 12) bh += 12;
                        if (bampm === 'AM' && bh === 12) bh = 0;
                        const bookingStartInMinutes = bh * 60 + bm;
                        
                        let bookingDurationInMinutes = 120;
                        if (b.shift && b.shift.includes('Hour')) {
                            bookingDurationInMinutes = parseInt(b.shift.split(' ')[0]) * 60;
                        }
                        const bookingEndInMinutes = bookingStartInMinutes + bookingDurationInMinutes;

                        if (slotTimeInMinutes < bookingEndInMinutes && slotEndInMinutes > bookingStartInMinutes) {
                            return false; // Collision
                        }
                    }
                    return true;
                });
            }

            if (times.length > 0) {
                return true;
            }
        }

        return false;
    };

    const filteredProviders = useMemo(() => {
        return providers.filter(provider => {
            if (!selectedService) return false;

            // Service Match (Assuming provider.skills is an array of strings or comma separated string)
            const skillsStr = provider.skills ? (Array.isArray(provider.skills) ? provider.skills.join(',') : provider.skills) : '';
            const matchesService = skillsStr.includes(selectedService);
            if (!matchesService) return false;

            // Availability Match
            if (!hasAvailableSlots(provider)) return false;

            // Search Match
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch = !query || 
                (provider.name && provider.name.toLowerCase().includes(query)) || 
                (provider.city && provider.city.toLowerCase().includes(query));
            
            // Gender Match
            const matchesGender = filters.gender === 'All' || provider.gender === filters.gender;
            
            // Rating Match
            let matchesRating = true;
            const provRating = parseFloat(provider.rating) || 0;
            if (filters.rating === '4.8 & Above') matchesRating = provRating >= 4.8;
            else if (filters.rating === '4.5 & Above') matchesRating = provRating >= 4.5;
            else if (filters.rating === 'Top Rated (5.0)') matchesRating = provRating === 5.0;

            // Experience Match
            let matchesExp = true;
            const provExp = parseInt(provider.experienceYears) || 0;
            if (filters.experience === '1-3 Years') matchesExp = provExp >= 1 && provExp <= 3;
            else if (filters.experience === '3-5 Years') matchesExp = provExp >= 3 && provExp <= 5;
            else if (filters.experience === '5+ Years') matchesExp = provExp >= 5;

            return matchesSearch && matchesGender && matchesRating && matchesExp;
        });
    }, [searchQuery, filters, providers, selectedService]);

    const handleFilterChange = (type, value) => {
        setFilters(prev => ({ ...prev, [type]: value }));
    };

    const handleBookNow = (provider) => {
        // Send them to the booking page with the nurse ID, and we can pass state if needed
        navigate(`/book-appointment/${provider._id}`, { state: { preSelectedService: selectedService } });
    };

    return (
        <>
            <AnimatePresence mode="wait">
                {!selectedService ? (
                    <motion.div 
                        key="header-service"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <PageHeader
                            title={<span>Which service do <span className="text-primary">you want to book?</span></span>}
                            description="Select the healthcare service you need, and we'll match you with the best professionals."
                        />
                    </motion.div>
                ) : (
                    <motion.div 
                        key="header-nurses"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <PageHeader
                            title={<span>Find & Book <span className="text-primary">Top Nurses</span></span>}
                            description="Search from 50,000+ verified professionals across all specialities. Book your appointment instantly and securely."
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <section className="py-5" style={{ backgroundColor: '#f8fafc', minHeight: '80vh' }}>
                <Container className="py-4">
                    
                    <AnimatePresence mode="wait">
                        {!selectedService ? (
                            /* STEP 1: SERVICE SELECTION */
                            <motion.div 
                                key="service-selection"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Row className="g-4 justify-content-center">
                                {SERVICES.map(service => (
                                    <Col key={service.id} md={6} lg={4}>
                                        <div 
                                            className="service-selection-card bg-white rounded-4 p-4 h-100 d-flex flex-column cursor-pointer"
                                            onClick={() => setSelectedService(service.id)}
                                        >
                                            <div className="d-flex align-items-center mb-3 gap-3">
                                                <div 
                                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                                    style={{ width: '50px', height: '50px', backgroundColor: 'rgba(2, 89, 85, 0.1)', color: 'var(--primary)' }}
                                                >
                                                    <i className={`fa-solid ${service.icon} fs-4`}></i>
                                                </div>
                                                <h5 className="fw-bold mb-0 text-dark">{service.title}</h5>
                                            </div>
                                            <p className="text-muted mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{service.desc}</p>
                                            <div className="mt-auto d-flex align-items-center justify-content-between border-top pt-3" style={{ borderColor: '#f1f5f9' }}>
                                                <span className="fw-bold" style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>
                                                    {prices[service.title] ? `Starts at ${prices[service.title]} EGP / ${['Elderly Care', 'Post-operative Care', 'Basic Care', 'Escort Services & Responsibilities'].includes(service.id) ? 'Hour' : 'Visit'}` : service.price}
                                                </span>
                                                <Button variant="link" className="p-0 text-decoration-none fw-bold text-dark d-flex align-items-center gap-2 btn-select-service">
                                                    Select <i className="fa-solid fa-arrow-right-long transition-all"></i>
                                                </Button>
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </motion.div>
                    ) : (
                        /* STEP 2: NURSE SELECTION */
                        <motion.div 
                            key="nurse-selection"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            {/* Header with Back Button */}
                            <div className="d-flex flex-column flex-md-row align-items-center justify-content-between mb-5 bg-white p-4 rounded-4 shadow-sm border" style={{ borderColor: '#e2e8f0' }}>
                                <div className="d-flex align-items-center gap-3 mb-3 mb-md-0">
                                    <Button 
                                        variant="light" 
                                        className="rounded-circle d-flex align-items-center justify-content-center border-0" 
                                        style={{ width: '45px', height: '45px', backgroundColor: '#f1f5f9' }}
                                        onClick={() => setSelectedService(null)}
                                    >
                                        <i className="fa-solid fa-arrow-left text-dark"></i>
                                    </Button>
                                    <div>
                                        <p className="text-muted mb-0" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Selected Service</p>
                                        <h4 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                                            {SERVICES.find(s => s.id === selectedService)?.title}
                                            <i className="fa-solid fa-circle-check text-success" style={{ fontSize: '1rem' }}></i>
                                        </h4>
                                    </div>
                                </div>
                                <div className="bg-light px-4 py-2 rounded-pill fw-bold text-dark">
                                    {filteredProviders.length} Professionals Available
                                </div>
                            </div>

                            {/* Search Bar - Clean & Modern */}
                            <div className="mx-auto mb-4" style={{ maxWidth: '700px' }}>
                                <div className="bg-white p-2 rounded-pill shadow-sm d-flex align-items-center search-bar-wrapper border">
                                    <div className="ps-4 text-muted">
                                        <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--primary)' }}></i>
                                    </div>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Search by name or city..." 
                                        className="border-0 shadow-none bg-transparent py-2 px-3 fw-medium"
                                        style={{ fontSize: '1rem', color: 'var(--text-main)' }}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <i 
                                            className="fa-solid fa-xmark text-muted me-3 cursor-pointer" 
                                            onClick={() => setSearchQuery('')}
                                        ></i>
                                    )}
                                </div>
                            </div>

                            {/* Filters - Interactive Dropdowns */}
                            <div className="d-flex flex-nowrap overflow-auto gap-3 mb-5 pb-2 justify-content-md-center custom-scrollbar">
                                <div className="d-flex align-items-center gap-2 fw-bold text-muted flex-shrink-0 px-2" style={{ fontSize: '0.9rem' }}>
                                    <i className="fa-solid fa-sliders"></i> Filters
                                </div>
                                <div className="border-start mx-1 d-none d-md-block" style={{ borderColor: '#e2e8f0' }}></div>
                                
                                {/* Gender Select */}
                                <Form.Select 
                                    value={filters.gender}
                                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                                    className={`rounded-pill px-4 py-2 border shadow-sm fw-medium filter-select ${filters.gender !== 'All' ? 'active-filter' : ''}`}
                                    style={{ width: 'auto', minWidth: '130px', cursor: 'pointer', fontSize: '0.95rem' }}
                                >
                                    <option value="All">Any Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </Form.Select>

                                {/* Rating Select */}
                                <Form.Select 
                                    value={filters.rating}
                                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                                    className={`rounded-pill px-4 py-2 border shadow-sm fw-medium filter-select ${filters.rating !== 'All' ? 'active-filter' : ''}`}
                                    style={{ width: 'auto', minWidth: '140px', cursor: 'pointer', fontSize: '0.95rem' }}
                                >
                                    <option value="All">Any Rating</option>
                                    <option value="4.5 & Above">4.5 & Above</option>
                                    <option value="4.8 & Above">4.8 & Above</option>
                                    <option value="Top Rated (5.0)">Top Rated (5.0)</option>
                                </Form.Select>

                                {/* Experience Select */}
                                <Form.Select 
                                    value={filters.experience}
                                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                                    className={`rounded-pill px-4 py-2 border shadow-sm fw-medium filter-select ${filters.experience !== 'All' ? 'active-filter' : ''}`}
                                    style={{ width: 'auto', minWidth: '160px', cursor: 'pointer', fontSize: '0.95rem' }}
                                >
                                    <option value="All">Any Experience</option>
                                    <option value="1-3 Years">1 - 3 Years</option>
                                    <option value="3-5 Years">3 - 5 Years</option>
                                    <option value="5+ Years">5+ Years</option>
                                </Form.Select>

                                {/* Clear Filters */}
                                {(filters.gender !== 'All' || filters.rating !== 'All' || filters.experience !== 'All') && (
                                    <Button 
                                        variant="link" 
                                        className="text-danger fw-medium text-decoration-none p-0 px-2 flex-shrink-0 d-flex align-items-center gap-1"
                                        style={{ fontSize: '0.95rem' }}
                                        onClick={() => setFilters({ gender: 'All', rating: 'All', experience: 'All' })}
                                    >
                                        <i className="fa-solid fa-rotate-left"></i> Clear
                                    </Button>
                                )}
                            </div>

                            {/* Grid Cards - Clean, Premium, Minimalist */}
                            <Row className="g-4">
                                <AnimatePresence mode="popLayout">
                                    {loading ? (
                                        <div className="text-center py-5 w-100">
                                            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    ) : filteredProviders.length > 0 ? (
                                        filteredProviders.map((provider) => (
                                            <Col key={provider._id} md={6} xl={4}>
                                                <motion.div 
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="bg-white p-4 h-100 d-flex flex-column provider-card rounded-4 border"
                                                    style={{ borderColor: '#f1f5f9' }}
                                                >
                                                    {/* Top: Image & Basic Info */}
                                                    <div className="d-flex gap-3 mb-4">
                                                        <div className="position-relative flex-shrink-0" style={{ width: '70px', height: '70px' }}>
                                                            <img 
                                                                src={provider.profilePicture ? (provider.profilePicture.startsWith('data:') ? provider.profilePicture : `http://localhost:5000/uploads/${provider.profilePicture}`) : `https://placehold.co/100x100/025955/ffffff?text=${provider.name ? provider.name.charAt(0).toUpperCase() : 'N'}`}
                                                                alt={provider.name} 
                                                                onError={(e) => { e.target.src = 'https://placehold.co/100x100/025955/ffffff?text=N' }}
                                                                className="rounded-circle shadow-sm w-100 h-100" 
                                                                style={{ objectFit: 'cover', border: '3px solid #f8fafc' }} 
                                                            />
                                                        </div>
                                                        <div className="flex-grow-1 overflow-hidden">
                                                            <div className="d-flex justify-content-between align-items-start">
                                                                <h5 className="fw-bold mb-1 text-truncate text-dark" style={{ fontSize: '1.15rem' }}>{provider.name}</h5>
                                                                <div className="d-flex align-items-center gap-1 bg-light px-2 py-1 rounded-3">
                                                                    <i className="fa-solid fa-star text-warning" style={{ fontSize: '0.8rem' }}></i>
                                                                    <span className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{provider.rating || 'New'}</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-muted mb-1 text-truncate" style={{ fontSize: '0.9rem' }}>
                                                                {provider.qualification || 'Certified Nurse'}
                                                            </p>
                                                            <div className="d-flex gap-2 align-items-center text-muted" style={{ fontSize: '0.85rem' }}>
                                                                <span><i className="fa-solid fa-briefcase me-1"></i>{provider.experienceYears ? `${provider.experienceYears}+ Yrs` : 'Exp'}</span>
                                                                <span>•</span>
                                                                <span><i className="fa-solid fa-location-dot me-1"></i>{provider.city || 'Cairo'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Middle: Skills/Badges */}
                                                    <div className="mb-4 flex-grow-1">
                                                        <p className="text-muted mb-2" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Matched Service</p>
                                                        <div className="d-flex flex-wrap gap-2">
                                                            <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill fw-medium" style={{ fontSize: '0.85rem' }}>
                                                                <i className="fa-solid fa-check-circle me-1"></i> {selectedService}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    {/* Bottom: Action Buttons */}
                                                    <div className="mt-auto d-flex gap-2 pt-3 border-top" style={{ borderColor: '#f1f5f9' }}>
                                                        <Button 
                                                            variant="light" 
                                                            className="rounded-3 fw-bold flex-grow-1 py-2 text-dark border hover-bg-gray"
                                                            onClick={() => navigate(`/nurse/${provider._id}`, { state: { preSelectedService: selectedService } })}
                                                            style={{ fontSize: '0.95rem' }}
                                                        >
                                                            View Profile
                                                        </Button>
                                                        <Button 
                                                            variant="primary" 
                                                            className="rounded-3 fw-bold flex-grow-1 py-2 d-flex align-items-center justify-content-center gap-2 btn-book-premium"
                                                            onClick={() => handleBookNow(provider)}
                                                            style={{ fontSize: '0.95rem', backgroundColor: 'var(--primary)', border: 'none' }}
                                                        >
                                                            Book Now <i className="fa-solid fa-arrow-right"></i>
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            </Col>
                                        ))
                                    ) : (
                                        <Col xs={12}>
                                            <motion.div 
                                                initial={{ opacity: 0 }} 
                                                animate={{ opacity: 1 }} 
                                                className="text-center py-5 bg-white rounded-4 border"
                                                style={{ borderColor: '#e2e8f0' }}
                                            >
                                                <div className="mb-4">
                                                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light" style={{ width: '80px', height: '80px' }}>
                                                        <i className="fa-solid fa-user-doctor text-muted opacity-50" style={{ fontSize: '2.5rem' }}></i>
                                                    </div>
                                                </div>
                                                <h4 className="fw-bold text-dark">No professionals found</h4>
                                                <p className="text-muted mx-auto" style={{ maxWidth: '400px' }}>We couldn't find any nurses matching your exact filters for this service. Try clearing some filters.</p>
                                                <Button 
                                                    variant="primary" 
                                                    className="mt-2 rounded-pill px-4 py-2 fw-bold shadow-sm" 
                                                    style={{ backgroundColor: 'var(--primary)', border: 'none' }}
                                                    onClick={() => { setSearchQuery(''); setFilters({ gender: 'All', rating: 'All', experience: 'All' }); }}
                                                >
                                                    Clear All Filters
                                                </Button>
                                            </motion.div>
                                        </Col>
                                    )}
                                </AnimatePresence>
                            </Row>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Container>

            <style>{`
                .cursor-pointer { cursor: pointer; }
                .transition-all { transition: all 0.3s ease; }
                .hover-bg-gray:hover { background-color: #f8fafc !important; }
                
                /* Service Card Styles */
                .service-selection-card {
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .service-selection-card:hover {
                    border-color: var(--primary);
                    box-shadow: 0 10px 15px -3px rgba(2, 89, 85, 0.1);
                    transform: translateY(-4px);
                }
                .service-selection-card:hover .btn-select-service {
                    color: var(--primary) !important;
                }
                .service-selection-card:hover .fa-arrow-right-long {
                    transform: translateX(5px);
                }

                /* Search Bar Styles */
                .search-bar-wrapper {
                    border-color: #e2e8f0 !important;
                    transition: all 0.3s ease;
                }
                .search-bar-wrapper:focus-within {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 4px rgba(2, 89, 85, 0.1) !important;
                }

                /* Filter Select Styles */
                .filter-select {
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
                    background-repeat: no-repeat;
                    background-position: right 1rem center;
                    background-size: 16px 12px;
                    color: #475569 !important;
                    border-color: #e2e8f0 !important;
                    transition: all 0.2s ease;
                }
                .filter-select:hover {
                    background-color: #f8fafc !important;
                    border-color: #cbd5e1 !important;
                }
                .filter-select:focus {
                    box-shadow: 0 0 0 3px rgba(2, 89, 85, 0.1) !important;
                    border-color: var(--primary) !important;
                }
                .filter-select.active-filter {
                    background-color: rgba(2, 89, 85, 0.05) !important;
                    border-color: var(--primary) !important;
                    color: var(--primary) !important;
                }

                /* Provider Card Styles */
                .provider-card {
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .provider-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 15px 25px -5px rgba(0, 0, 0, 0.1);
                    border-color: #e2e8f0 !important;
                }
                
                .btn-book-premium {
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 10px rgba(2, 89, 85, 0.2);
                }
                .btn-book-premium:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 15px rgba(2, 89, 85, 0.3);
                }

                /* Scrollbar */
                .custom-scrollbar::-webkit-scrollbar { height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #94a3b8; }
            `}</style>
            </section>
        </>
    );
};

export default BookSection;
