import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Modal, Badge, Spinner } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function FamilyMembersTab() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [userAddress, setUserAddress] = useState('');

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/user/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data) {
                if (res.data.familyMembers) setMembers(res.data.familyMembers);
                if (res.data.address) setUserAddress(res.data.address);
            }
        } catch (error) {
            console.error("Failed to fetch family members:", error);
        } finally {
            setLoading(false);
        }
    };

    const [showModal, setShowModal] = useState(false);
    const [editingMemberId, setEditingMemberId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        relationship: 'Other',
        age: '',
        gender: 'Male',
        diseases: [],
        address: ''
    });

    const relationships = ['Father', 'Mother', 'Son/Daughter', 'Spouse', 'Other'];
    const diseaseOptions = ['Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'None'];

    const handleOpenModal = () => {
        setEditingMemberId(null);
        setFormData({
            name: '',
            relationship: 'Other',
            age: '',
            gender: 'Male',
            diseases: [],
            address: userAddress // Default to primary user address
        });
        setShowModal(true);
    };

    const handleEditMember = (member) => {
        setEditingMemberId(member._id || member.id);
        setFormData({
            name: member.name || '',
            relationship: member.relationship || 'Other',
            age: member.age || '',
            gender: member.gender || 'Male',
            diseases: member.diseases || [],
            address: member.address || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        setActionLoading(true);
        try {
            const updatedMembers = members.filter(member => member._id !== id && member.id !== id);
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/user/profile', {
                familyMembers: updatedMembers
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMembers(updatedMembers);
        } catch (error) {
            console.error("Failed to delete member:", error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckboxChange = (disease) => {
        let updatedDiseases = [...formData.diseases];
        if (disease === 'None') {
            updatedDiseases = ['None'];
        } else {
            updatedDiseases = updatedDiseases.filter(d => d !== 'None');
            if (updatedDiseases.includes(disease)) {
                updatedDiseases = updatedDiseases.filter(d => d !== disease);
            } else {
                updatedDiseases.push(disease);
            }
        }
        setFormData({ ...formData, diseases: updatedDiseases });
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setActionLoading(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`);
                if (res.data && res.data.display_name) {
                    setFormData(prev => ({ ...prev, address: res.data.display_name }));
                }
            } catch (error) {
                console.error("Failed to fetch address from location", error);
                alert("Failed to fetch address from location");
            } finally {
                setActionLoading(false);
            }
        }, (error) => {
            alert("Failed to get your location. Please check permissions.");
            setActionLoading(false);
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.age) return;

        setActionLoading(true);
        try {
            let updatedMembers = [...members];

            if (editingMemberId) {
                updatedMembers = updatedMembers.map(m => {
                    if ((m._id && m._id === editingMemberId) || (m.id && m.id === editingMemberId)) {
                        return {
                            ...m,
                            name: formData.name,
                            relationship: formData.relationship,
                            age: parseInt(formData.age),
                            gender: formData.gender,
                            diseases: formData.diseases.length > 0 ? formData.diseases : ['None'],
                            address: formData.address
                        };
                    }
                    return m;
                });
            } else {
                const newMember = {
                    id: Date.now().toString(),
                    name: formData.name,
                    relationship: formData.relationship,
                    age: parseInt(formData.age),
                    gender: formData.gender,
                    diseases: formData.diseases.length > 0 ? formData.diseases : ['None'],
                    address: formData.address
                };
                updatedMembers.push(newMember);
            }

            const token = localStorage.getItem('token');
            const res = await axios.put('http://localhost:5000/api/user/profile', {
                familyMembers: updatedMembers
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.user && res.data.user.familyMembers) {
                setMembers(res.data.user.familyMembers);
            } else {
                setMembers(updatedMembers);
            }

            setShowModal(false);
            setEditingMemberId(null);
        } catch (error) {
            console.error("Failed to save member:", error);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center p-5">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.5px' }}>Family Members</h4>
                <Button
                    variant="primary"
                    className="rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
                    style={{ backgroundColor: 'var(--primary)', border: 'none' }}
                    onClick={handleOpenModal}
                    disabled={actionLoading}
                >
                    <i className="fa-solid fa-plus"></i> Add New Member
                </Button>
            </div>

            <Row className="g-4">
                <AnimatePresence>
                    {members.map(member => (
                        <Col md={6} xl={4} key={member._id || member.id}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                layout
                                className="bg-white p-4 rounded-4 shadow-sm border position-relative h-100 d-flex flex-column"
                                style={{ borderColor: '#eef2f5' }}
                            >
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div
                                            className="d-flex align-items-center justify-content-center rounded-circle"
                                            style={{ width: '50px', height: '50px', backgroundColor: 'rgba(2, 89, 85, 0.1)', color: 'var(--primary)' }}
                                        >
                                            <i className={`fa-solid ${member.gender === 'Female' ? 'fa-person-dress' : 'fa-person'} fs-4`}></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold text-dark mb-1">{member.name}</h6>
                                            <span className="text-muted fw-medium" style={{ fontSize: '0.85rem' }}>{member.relationship} • {member.age} years</span>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-1">
                                        <Button
                                            variant="link"
                                            className="text-primary p-0 m-0 text-decoration-none"
                                            onClick={() => handleEditMember(member)}
                                            disabled={actionLoading}
                                            title="Edit"
                                        >
                                            <div className="d-flex align-items-center justify-content-center rounded-circle hover-bg-light transition-all" style={{ width: '32px', height: '32px' }}>
                                                <i className="fa-solid fa-pen fs-6"></i>
                                            </div>
                                        </Button>
                                        <Button
                                            variant="link"
                                            className="text-danger p-0 m-0 text-decoration-none"
                                            onClick={() => handleDelete(member._id || member.id)}
                                            disabled={actionLoading}
                                            title="Delete"
                                        >
                                            <div className="d-flex align-items-center justify-content-center rounded-circle hover-bg-light transition-all" style={{ width: '32px', height: '32px' }}>
                                                <i className="fa-solid fa-trash-can fs-6"></i>
                                            </div>
                                        </Button>
                                    </div>
                                </div>

                                {member.address && (
                                    <div className="mb-3 d-flex align-items-start gap-2 text-muted" style={{ fontSize: '0.85rem' }}>
                                        <i className="fa-solid fa-location-dot mt-1" style={{ color: 'var(--primary)' }}></i>
                                        <span>{member.address}</span>
                                    </div>
                                )}

                                <div className="mt-auto pt-3 border-top border-light">
                                    <span className="text-muted d-block mb-2" style={{ fontSize: '0.8rem' }}>Chronic Diseases:</span>
                                    <div className="d-flex flex-wrap gap-2">
                                        {member.diseases.map((disease, idx) => (
                                            <Badge
                                                key={idx}
                                                bg="light"
                                                text="dark"
                                                className="px-3 py-2 rounded-pill border fw-medium"
                                                style={{ fontSize: '0.75rem', color: '#4b5563' }}
                                            >
                                                {disease}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </Col>
                    ))}
                </AnimatePresence>

                {members.length === 0 && (
                    <Col xs={12}>
                        <div className="text-center p-5 bg-light rounded-4 border border-dashed">
                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: '60px', height: '60px', backgroundColor: '#e2e8f0', color: '#64748b' }}>
                                <i className="fa-solid fa-users-slash fs-3"></i>
                            </div>
                            <h5 className="fw-bold text-dark">No Family Members Found</h5>
                            <p className="text-muted mb-0">Add your family members to easily book appointments for them later.</p>
                        </div>
                    </Col>
                )}
            </Row>

            {/* Add/Edit Member Modal */}
            <Modal
                show={showModal}
                onHide={() => { setShowModal(false); setEditingMemberId(null); }}
                centered
                backdrop="static"
            >
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold text-dark w-100 fs-5">
                        {editingMemberId ? 'Edit Family Member' : 'Add New Family Member'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="pt-3">
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>Full Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter member's name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="py-2 px-3 shadow-none bg-light"
                                style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid #e2e8f0' }}
                            />
                        </Form.Group>

                        <Row className="g-3 mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>Relationship</Form.Label>
                                    <Form.Select
                                        value={formData.relationship}
                                        onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                                        className="py-2 px-3 shadow-none bg-light"
                                        style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid #e2e8f0' }}
                                    >
                                        {relationships.map(rel => <option key={rel} value={rel}>{rel}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>Age</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="1" max="120"
                                        placeholder="e.g. 30"
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        required
                                        className="py-2 px-3 shadow-none bg-light"
                                        style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid #e2e8f0' }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold text-dark mb-2" style={{ fontSize: '0.9rem' }}>Gender</Form.Label>
                            <div className="d-flex gap-4">
                                <Form.Check
                                    type="radio"
                                    id="gender-male"
                                    label="Male"
                                    name="gender"
                                    checked={formData.gender === 'Male'}
                                    onChange={() => setFormData({ ...formData, gender: 'Male' })}
                                    className="fw-medium text-muted"
                                />
                                <Form.Check
                                    type="radio"
                                    id="gender-female"
                                    label="Female"
                                    name="gender"
                                    checked={formData.gender === 'Female'}
                                    onChange={() => setFormData({ ...formData, gender: 'Female' })}
                                    className="fw-medium text-muted"
                                />
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <Form.Label className="fw-semibold text-dark mb-0" style={{ fontSize: '0.9rem' }}>Address</Form.Label>
                                <Button
                                    variant="link"
                                    className="text-primary text-decoration-none p-0 d-flex align-items-center gap-1"
                                    style={{ fontSize: '0.85rem', fontWeight: '500' }}
                                    onClick={handleUseCurrentLocation}
                                    disabled={actionLoading}
                                >
                                    <i className="fa-solid fa-location-crosshairs"></i>
                                    Use Current Location
                                </Button>
                            </div>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Enter member's full address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="py-2 px-3 shadow-none bg-light"
                                style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid #e2e8f0', resize: 'none' }}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label className="fw-semibold text-dark mb-2" style={{ fontSize: '0.9rem' }}>Chronic Diseases (if any)</Form.Label>
                            <div className="d-flex flex-wrap gap-2">
                                {diseaseOptions.map((disease) => (
                                    <div
                                        key={disease}
                                        onClick={() => handleCheckboxChange(disease)}
                                        className={`rounded-pill py-2 px-3 cursor-pointer transition-all border ${formData.diseases.includes(disease) ? 'border-primary bg-primary text-white shadow-sm' : 'bg-white text-muted hover-bg-light'}`}
                                        style={{
                                            fontSize: '0.85rem',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            backgroundColor: formData.diseases.includes(disease) ? 'var(--primary)' : '#fff',
                                            borderColor: formData.diseases.includes(disease) ? 'var(--primary)' : '#e2e8f0',
                                            color: formData.diseases.includes(disease) ? '#fff' : '#64748b'
                                        }}
                                    >
                                        <i className={`fa-solid ${formData.diseases.includes(disease) ? 'fa-check' : 'fa-plus'} me-2`}></i>
                                        {disease}
                                    </div>
                                ))}
                            </div>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0 pb-4 px-4 d-flex gap-2">
                        <Button
                            variant="light"
                            onClick={() => { setShowModal(false); setEditingMemberId(null); }}
                            className="flex-grow-1 py-2 rounded-3 fw-bold text-muted border"
                            style={{ backgroundColor: '#f8fafc' }}
                            disabled={actionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-grow-1 py-2 rounded-3 fw-bold border-0 text-white"
                            style={{ backgroundColor: 'var(--primary)' }}
                            disabled={actionLoading}
                        >
                            {actionLoading ? 'Saving...' : (editingMemberId ? 'Save Changes' : 'Save & Add')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </motion.div>
    );
}
