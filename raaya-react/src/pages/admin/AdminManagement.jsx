import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Table } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminManagement = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/list-admins', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAdmins(res.data);
        } catch (error) {
            console.error("Error fetching admins", error);
        } finally {
            setLoading(false);
        }
    };

    if (user?.role !== 'super_admin') {
        return <Navigate to="/admin" replace />;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const triggerToast = (msg) => {
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/admin/create-admin', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAdmins([...admins, res.data.admin]);
            triggerToast(`New Admin added: ${formData.name}`);
            setFormData({ name: '', email: '', password: '' });
        } catch (error) {
            console.error("Error creating admin", error);
            triggerToast(error.response?.data?.message || 'Error creating admin');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this admin?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/admin/delete-admin/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAdmins(admins.filter(a => a._id !== id));
            triggerToast('Admin deleted successfully');
        } catch (error) {
            console.error("Error deleting admin", error);
            triggerToast(error.response?.data?.message || 'Error deleting admin');
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            
            {showToast && (
                <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
                    <div className="bg-success text-white px-4 py-2 rounded shadow-sm d-flex align-items-center gap-2">
                        <i className="fa-solid fa-circle-check"></i>
                        <span className="fw-medium">{toastMessage}</span>
                    </div>
                </div>
            )}

            <h4 className="fw-bold text-dark mb-4" style={{ fontSize: '20px' }}>Admin Management</h4>

            <Row className="g-4">
                <Col lg={7}>
                    <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                        <Card.Body className="p-4">
                            <h5 className="fw-bold text-dark mb-4" style={{ fontSize: '18px' }}>Current Administrators</h5>
                            <div className="table-responsive">
                                <Table hover className="mb-0 align-middle">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="py-3 px-3 text-muted fw-semibold" style={{ fontSize: '14px' }}>Name</th>
                                            <th className="py-3 px-3 text-muted fw-semibold" style={{ fontSize: '14px' }}>Email</th>
                                            <th className="py-3 px-3 text-muted fw-semibold" style={{ fontSize: '14px' }}>Role</th>
                                            <th className="py-3 px-3 text-end text-muted fw-semibold" style={{ fontSize: '14px' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {admins.map(admin => (
                                            <tr key={admin._id}>
                                                <td className="py-3 px-3 fw-medium text-dark" style={{ fontSize: '15px' }}>{admin.name}</td>
                                                <td className="py-3 px-3 text-muted" style={{ fontSize: '15px' }}>{admin.email}</td>
                                                <td className="py-3 px-3">
                                                    <span className={`badge rounded-pill fw-medium px-3 py-2 ${admin.role === 'super_admin' ? 'bg-primary bg-opacity-10 text-primary' : 'bg-secondary bg-opacity-10 text-secondary'}`}>
                                                        {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-end">
                                                    {admin.role !== 'super_admin' && (
                                                        <Button 
                                                            variant="link" 
                                                            className="text-danger p-0 shadow-none border-0" 
                                                            onClick={() => handleDelete(admin._id)}
                                                        >
                                                            <i className="fa-solid fa-trash fs-5"></i>
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={5}>
                    <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                        <Card.Body className="p-4">
                            <div className="mb-4">
                                <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-3" style={{ width: '50px', height: '50px' }}>
                                    <i className="fa-solid fa-user-plus fs-4"></i>
                                </div>
                                <h5 className="fw-bold text-dark" style={{ fontSize: '18px' }}>Add New Admin</h5>
                                <p className="text-muted" style={{ fontSize: '14px' }}>Create a new administrator account with dashboard access.</p>
                            </div>

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium text-dark" style={{ fontSize: '14px' }}>Full Name</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Enter admin name" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required
                                        className="py-2 px-3 shadow-none custom-input" 
                                        style={{ border: '1px solid #e0e6eb', borderRadius: '8px', fontSize: '15px' }}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium text-dark" style={{ fontSize: '14px' }}>Email Address</Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        placeholder="admin@raaya.com" 
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                        className="py-2 px-3 shadow-none custom-input" 
                                        style={{ border: '1px solid #e0e6eb', borderRadius: '8px', fontSize: '15px' }}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-medium text-dark" style={{ fontSize: '14px' }}>Temporary Password</Form.Label>
                                    <Form.Control 
                                        type="password" 
                                        placeholder="Enter secure password" 
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        required
                                        className="py-2 px-3 shadow-none custom-input" 
                                        style={{ border: '1px solid #e0e6eb', borderRadius: '8px', fontSize: '15px' }}
                                    />
                                </Form.Group>

                                <Button 
                                    type="submit" 
                                    variant="primary" 
                                    className="w-100 py-2 rounded-3 fw-bold shadow-sm"
                                    style={{ fontSize: '15px' }}
                                >
                                    Add New Admin
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </motion.div>
    );
};

export default AdminManagement;
