import React, { useState, useEffect } from 'react';
import { Card, Button, Form, InputGroup, Row, Col, Badge } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function MedicalRecordsTab() {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
    const [serviceFilter, setServiceFilter] = useState('All');
    const [expandedRecord, setExpandedRecord] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await axios.get('http://localhost:5000/api/bookings/patient', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Filter only completed bookings that have a report
                const completedWithReports = res.data.filter(b => b.status === 'completed' && b.report);
                
                setRecords(completedWithReports);
            } catch (err) {
                console.error("Failed to fetch medical records", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, []);

    const toggleExpand = (id) => {
        if (expandedRecord === id) {
            setExpandedRecord(null);
        } else {
            setExpandedRecord(id);
        }
    };

    const parseBookingDate = (dateString) => {
        let d = new Date(dateString);
        if (d.getFullYear() < 2020) {
            const currentYear = new Date().getFullYear();
            d = new Date(`${dateString} ${currentYear}`);
            if (d < new Date(new Date().setMonth(new Date().getMonth() - 3))) {
                d = new Date(`${dateString} ${currentYear + 1}`);
            }
        }
        return d;
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return parseBookingDate(dateString).toLocaleDateString('en-US', options);
    };

    const downloadPDF = (record) => {
        const printWindow = window.open('', '_blank');
        
        const html = `
            <html>
                <head>
                    <title>Medical Report - ${record.service}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                        h1 { color: #025955; border-bottom: 2px solid #025955; padding-bottom: 10px; }
                        h3 { color: #025955; margin-top: 30px; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                        .info-box { background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
                        .label { font-weight: bold; color: #64748b; font-size: 0.9em; display: block; margin-bottom: 5px; }
                        .value { font-size: 1.1em; }
                        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                        th, td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }
                        th { background-color: #f8fafc; color: #64748b; }
                    </style>
                </head>
                <body>
                    <h1>Medical Service Report</h1>
                    <div class="info-grid">
                        <div class="info-box">
                            <span class="label">Patient Name</span>
                            <span class="value">${record.patientDetails?.name || 'N/A'}</span>
                        </div>
                        <div class="info-box">
                            <span class="label">Nurse Name</span>
                            <span class="value">${record.nurseId?.name || 'N/A'}</span>
                        </div>
                        <div class="info-box">
                            <span class="label">Service Date</span>
                            <span class="value">${formatDate(record.date)}</span>
                        </div>
                        <div class="info-box">
                            <span class="label">Service Type</span>
                            <span class="value">${record.service}</span>
                        </div>
                    </div>

                    ${record.report?.vitals ? `
                        <h3>Vital Signs</h3>
                        <table>
                            <tr><th>Blood Pressure</th><td>${record.report.vitals.bloodPressure || 'N/A'}</td></tr>
                            <tr><th>Heart Rate</th><td>${record.report.vitals.heartRate || 'N/A'}</td></tr>
                            <tr><th>Temperature</th><td>${record.report.vitals.temperature || 'N/A'}</td></tr>
                        </table>
                    ` : ''}

                    ${record.report?.serviceAnswers && Object.keys(record.report.serviceAnswers).length > 0 ? `
                        <h3>Service Details</h3>
                        <table>
                            ${Object.entries(record.report.serviceAnswers).map(([k, v]) => `<tr><th style="text-transform: capitalize;">${k.replace(/([A-Z])/g, ' $1').trim()}</th><td>${v}</td></tr>`).join('')}
                        </table>
                    ` : ''}

                    ${record.report?.notes ? `
                        <h3>Nurse Notes & Observations</h3>
                        <div class="info-box">
                            ${record.report.notes}
                        </div>
                    ` : ''}
                </body>
            </html>
        `;
        
        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    const filteredRecords = records.filter(record => {
        const matchesSearch = record.service.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (record.nurseId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (record.report?.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesService = serviceFilter === 'All' || record.service === serviceFilter;
        return matchesSearch && matchesService;
    }).sort((a, b) => {
        if (sortOrder === 'newest') return parseBookingDate(b.date) - parseBookingDate(a.date);
        return parseBookingDate(a.date) - parseBookingDate(b.date);
    });

    const uniqueServices = ['All', ...new Set(records.map(r => r.service))];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -15 }}
            className="w-100"
        >
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h4 className="fw-bold text-dark mb-1">Medical Records</h4>
                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Track your health history and past treatments.</p>
                </div>
            </div>

            {/* Filters Section */}
            <Card className="border-0 shadow-sm rounded-4 mb-4" style={{ backgroundColor: '#f8fafc' }}>
                <Card.Body className="p-3">
                    <Row className="g-3">
                        <Col lg={5}>
                            <InputGroup className="bg-white rounded-3 overflow-hidden shadow-sm border" style={{ borderColor: '#e2e8f0' }}>
                                <InputGroup.Text className="bg-transparent border-0 pe-1">
                                    <i className="fa-solid fa-search text-muted"></i>
                                </InputGroup.Text>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Search by keyword, nurse..." 
                                    className="border-0 shadow-none py-2"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col lg={3} md={6}>
                            <Form.Select 
                                className="bg-white rounded-3 shadow-sm border py-2" 
                                style={{ borderColor: '#e2e8f0', cursor: 'pointer' }}
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </Form.Select>
                        </Col>
                        <Col lg={4} md={6}>
                            <Form.Select 
                                className="bg-white rounded-3 shadow-sm border py-2" 
                                style={{ borderColor: '#e2e8f0', cursor: 'pointer' }}
                                value={serviceFilter}
                                onChange={(e) => setServiceFilter(e.target.value)}
                            >
                                {uniqueServices.map(service => (
                                    <option key={service} value={service}>{service} Services</option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Records List */}
            <div className="d-flex flex-column gap-3">
                {loading ? (
                    <div className="text-center py-5">
                        <i className="fa-solid fa-spinner fa-spin fs-2 text-primary"></i>
                    </div>
                ) : filteredRecords.length > 0 ? filteredRecords.map((record) => (
                    <Card 
                        key={record._id} 
                        className={`border-0 shadow-sm rounded-4 overflow-hidden transition-all`}
                        style={{ border: expandedRecord === record._id ? '1px solid var(--primary)' : '1px solid #eef2f5' }}
                    >
                        {/* Collapsed Header */}
                        <div 
                            className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 bg-white cursor-pointer hover-bg-light"
                            onClick={() => toggleExpand(record._id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-primary" style={{ width: '48px', height: '48px' }}>
                                    <i className="fa-solid fa-briefcase-medical fs-5"></i>
                                </div>
                                <div>
                                    <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                                        {record.service}
                                    </h6>
                                    <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.85rem' }}>
                                        <i className="fa-regular fa-calendar text-primary"></i> {formatDate(record.date)}
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex align-items-center gap-4">
                                <div className="d-flex align-items-center gap-2">
                                    <img src={record.nurseId?.profilePicture ? (record.nurseId.profilePicture.startsWith('data:') ? record.nurseId.profilePicture : `http://localhost:5000/uploads/${record.nurseId.profilePicture}`) : `https://placehold.co/100x100/025955/ffffff?text=${record.nurseId?.name ? record.nurseId.name.charAt(0).toUpperCase() : 'N'}`} alt="Nurse" className="rounded-circle object-fit-cover shadow-sm" style={{ width: '32px', height: '32px' }} />
                                    <span className="fw-medium text-dark" style={{ fontSize: '0.9rem' }}>{record.nurseId?.name || 'Assigned Nurse'}</span>
                                </div>
                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-muted transition-all" style={{ width: '32px', height: '32px', transform: expandedRecord === record._id ? 'rotate(180deg)' : 'rotate(0)' }}>
                                    <i className="fa-solid fa-chevron-down"></i>
                                </div>
                            </div>
                        </div>

                        {/* Expanded Content */}
                        <AnimatePresence>
                            {expandedRecord === record._id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="border-top"
                                    style={{ overflow: 'hidden', backgroundColor: '#fcfdfd' }}
                                >
                                    <div className="p-4">
                                        <Row className="g-4 mb-4">
                                            {/* Vitals */}
                                            <Col md={4}>
                                                <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    <i className="fa-solid fa-heart-pulse text-danger me-2"></i> Vitals
                                                </h6>
                                                <div className="bg-white p-3 rounded-3 shadow-sm border" style={{ borderColor: '#e2e8f0' }}>
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>Blood Pressure</span>
                                                        <span className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{record.report?.vitals?.bloodPressure || 'N/A'}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>Heart Rate</span>
                                                        <span className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{record.report?.vitals?.heartRate || 'N/A'}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between">
                                                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>Temperature</span>
                                                        <span className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{record.report?.vitals?.temperature ? `${record.report.vitals.temperature} °C` : 'N/A'}</span>
                                                    </div>
                                                </div>
                                                
                                                {record.report?.serviceAnswers && Object.keys(record.report.serviceAnswers).length > 0 && (
                                                    <div className="mt-4">
                                                        <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                            <i className="fa-solid fa-list-check text-success me-2"></i> Details
                                                        </h6>
                                                        <div className="bg-white p-3 rounded-3 shadow-sm border" style={{ borderColor: '#e2e8f0' }}>
                                                            {Object.entries(record.report.serviceAnswers).map(([k, v]) => (
                                                                <div className="mb-2 last-mb-0" key={k}>
                                                                    <span className="text-muted d-block text-capitalize" style={{ fontSize: '0.75rem' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                                    <span className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{v}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </Col>

                                            {/* Notes */}
                                            <Col md={8}>
                                                <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    <i className="fa-solid fa-clipboard-user text-primary me-2"></i> Nurse's Notes
                                                </h6>
                                                <div className="bg-white p-3 rounded-3 shadow-sm border h-100" style={{ borderColor: '#e2e8f0' }}>
                                                    <p className="text-dark mb-0" style={{ fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                                        {record.report?.notes || 'No notes provided.'}
                                                    </p>
                                                </div>
                                            </Col>
                                        </Row>

                                        {/* Footer Actions & Attachments */}
                                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pt-3 border-top">
                                            <div className="d-flex flex-wrap gap-2 align-items-center">
                                                <span className="text-muted me-2" style={{ fontSize: '0.85rem' }}><i className="fa-solid fa-paperclip me-1"></i> Attachments:</span>
                                                {record.report?.attachments && record.report.attachments.length > 0 ? record.report.attachments.map((att, idx) => (
                                                    <a key={idx} href={att} target="_blank" rel="noopener noreferrer" className="d-inline-block">
                                                        <img src={att} alt="Attachment" className="rounded-3 shadow-sm border hover-shadow transition-all" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                                    </a>
                                                )) : (
                                                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>None</span>
                                                )}
                                            </div>
                                            
                                            <Button variant="primary" className="rounded-pill fw-bold shadow-sm px-4 py-2 d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }} onClick={(e) => { e.stopPropagation(); downloadPDF(record); }}>
                                                <i className="fa-solid fa-file-pdf"></i> Download PDF Report
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                )) : (
                    <div className="text-center py-5 bg-white rounded-4 shadow-sm border" style={{ borderColor: '#eef2f5' }}>
                        <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                            <i className="fa-solid fa-notes-medical fs-2 text-muted"></i>
                        </div>
                        <h5 className="fw-bold text-dark">No Records Found</h5>
                        <p className="text-muted">We couldn't find any medical records matching your criteria.</p>
                    </div>
                )}
            </div>

            <style>{`
                .hover-bg-light:hover { background-color: #f8fafc !important; }
                .hover-shadow:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important; transform: translateY(-2px); }
                .transition-all { transition: all 0.2s ease-in-out; }
                .last-mb-0:last-child { margin-bottom: 0 !important; }
            `}</style>
        </motion.div>
    );
}
