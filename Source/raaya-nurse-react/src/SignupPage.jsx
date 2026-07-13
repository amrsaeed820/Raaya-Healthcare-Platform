import React, { useState } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PasswordRequirements, { validatePassword } from './components/common/PasswordRequirements';

export default function SignupPage() {
    const [step, setStep] = useState(1);
    
    // Step 1: Personal Info
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('');
    const [governorate, setGovernorate] = useState('');
    const [city, setCity] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Step 2: Experience & Education
    const [university, setUniversity] = useState('');
    const [faculty, setFaculty] = useState('');
    const [degree, setDegree] = useState('');
    const [languages, setLanguages] = useState([]);
    const [previousWork, setPreviousWork] = useState('');
    const [yearsOfExperience, setYearsOfExperience] = useState('');
    const [skills, setSkills] = useState([]);

    // Step 3: Documents
    const [documentsFile, setDocumentsFile] = useState(null);

    const navigate = useNavigate();

    const slideVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    const nextStep = (e) => {
        if (e) e.preventDefault();
        
        if (step === 1) {
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }
            if (!validatePassword(password)) {
                setError('Password must be at least 8 characters, contain no spaces, and meet the complexity requirements.');
                return;
            }
        }
        
        setError('');
        setStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const prevStep = () => {
        setError('');
        setStep(prev => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setDocumentsFile(e.target.files[0]);
        }
    };

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!documentsFile) {
            setError('Please upload your documents before submitting.');
            return;
        }
        
        setError('');
        setLoading(true);
        
        try {
            const formData = new FormData();
            formData.append('name', fullName);
            formData.append('email', email);
            formData.append('phone', phone);
            formData.append('password', password);
            formData.append('qualification', `${degree} - ${university} (${faculty})`);
            formData.append('degree', degree);
            formData.append('university', university);
            formData.append('faculty', faculty);
            formData.append('skills', skills.join(', '));
            formData.append('gender', gender);
            formData.append('governorate', governorate);
            formData.append('city', city);
            formData.append('languages', languages.join(', '));
            formData.append('previousWork', previousWork);
            formData.append('licenseNumber', 'LN-' + Math.floor(Math.random() * 90000 + 10000));
            formData.append('experienceYears', Number(yearsOfExperience) || 0);
            
            if (documentsFile) {
                formData.append('documentFile', documentsFile);
            }

            await axios.post('http://localhost:5000/api/nurse/auth/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setStep(4); // Go to success page
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        }
    };

    // Stepper Component
    const Stepper = () => {
        const steps = [
            { num: 1, label: 'Personal Info', icon: 'fa-user' },
            { num: 2, label: 'Experience', icon: 'fa-briefcase' },
            { num: 3, label: 'Documents', icon: 'fa-file-arrow-up' },
            { num: 4, label: 'Complete', icon: 'fa-check' }
        ];

        return (
            <div className="d-flex justify-content-between align-items-center mb-5 position-relative mt-2">
                <div className="position-absolute" style={{ top: '20px', left: '12%', right: '12%', height: '2px', backgroundColor: '#e2e8f0', zIndex: 0 }}></div>
                <div className="position-absolute" style={{ top: '20px', left: '12%', width: `${((step - 1) / 3) * 76}%`, height: '2px', backgroundColor: '#025955', zIndex: 1, transition: 'width 0.4s ease' }}></div>
                
                {steps.map((s, idx) => {
                    const isCompleted = step > s.num;
                    const isActive = step === s.num;
                    
                    return (
                        <div key={idx} className="d-flex flex-column align-items-center position-relative bg-white" style={{ zIndex: 2, width: '25%' }}>
                            <div 
                                className="d-flex align-items-center justify-content-center rounded-circle mb-2"
                                style={{ 
                                    width: '40px', height: '40px', 
                                    backgroundColor: isCompleted || isActive ? '#025955' : '#ffffff',
                                    border: isCompleted || isActive ? '2px solid #025955' : '2px solid #e2e8f0',
                                    color: isCompleted || isActive ? '#ffffff' : '#94a3b8',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <i className={`fa-solid ${isCompleted ? 'fa-check' : s.icon}`}></i>
                            </div>
                            <span 
                                className="fw-semibold text-center"
                                style={{ 
                                    fontSize: '0.75rem',
                                    color: isCompleted || isActive ? '#025955' : '#94a3b8',
                                    transition: 'color 0.3s ease',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {s.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderStep = () => {
        if (step === 1) {
            return (
                <motion.div key="step1" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                    <div className="mb-4 text-start">
                        <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.5px', fontSize: '1.5rem', color: '#025955' }}>Personal Details</h2>
                        <p className="text-muted" style={{ fontSize: '0.95rem' }}>Let's get started with your basic information.</p>
                    </div>

                    <Form onSubmit={nextStep} className="text-start">
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Full Name</Form.Label>
                            <Form.Control type="text" placeholder="Enter your full name" className="py-2 px-3 shadow-none custom-input" style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid #e2e8f0', backgroundColor: '#f9fafb' }} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Phone Number</Form.Label>
                                    <Form.Control type="tel" placeholder="Enter phone number" className="py-2 px-3 shadow-none custom-input" style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid #e2e8f0', backgroundColor: '#f9fafb' }} value={phone} onChange={(e) => setPhone(e.target.value)} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Gender</Form.Label>
                                    <Form.Select className="py-2 px-3 shadow-none custom-input text-muted" style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid #e2e8f0', backgroundColor: '#f9fafb' }} value={gender} onChange={(e) => setGender(e.target.value)} required>
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Governorate</Form.Label>
                                    <Form.Select className="py-2 px-3 shadow-none custom-input text-muted" style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid #e2e8f0', backgroundColor: '#f9fafb' }} value={governorate} onChange={(e) => setGovernorate(e.target.value)} required>
                                        <option value="">Select Governorate</option>
                                        <option value="Cairo">Cairo</option>
                                        <option value="Alexandria">Alexandria</option>
                                        <option value="Giza">Giza</option>
                                        <option value="Dakahlia">Dakahlia</option>
                                        <option value="Red Sea">Red Sea</option>
                                        <option value="Aswan">Aswan</option>
                                        <option value="Assiut">Assiut</option>
                                        <option value="Beheira">Beheira</option>
                                        <option value="Beni Suef">Beni Suef</option>
                                        <option value="Damietta">Damietta</option>
                                        <option value="Fayoum">Fayoum</option>
                                        <option value="Gharbia">Gharbia</option>
                                        <option value="Ismailia">Ismailia</option>
                                        <option value="Kafr El Sheikh">Kafr El Sheikh</option>
                                        <option value="Luxor">Luxor</option>
                                        <option value="Matrouh">Matrouh</option>
                                        <option value="Minya">Minya</option>
                                        <option value="Monufia">Monufia</option>
                                        <option value="New Valley">New Valley</option>
                                        <option value="North Sinai">North Sinai</option>
                                        <option value="Port Said">Port Said</option>
                                        <option value="Qalyubia">Qalyubia</option>
                                        <option value="Qena">Qena</option>
                                        <option value="Sharqia">Sharqia</option>
                                        <option value="Sohag">Sohag</option>
                                        <option value="South Sinai">South Sinai</option>
                                        <option value="Suez">Suez</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>City</Form.Label>
                                    <Form.Control type="text" placeholder="Enter your city" className="py-2 px-3 shadow-none custom-input" style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid #e2e8f0', backgroundColor: '#f9fafb' }} value={city} onChange={(e) => setCity(e.target.value)} required />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Email</Form.Label>
                            <Form.Control type="email" placeholder="name@example.com" className="py-2 px-3 shadow-none custom-input" style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid #e2e8f0', backgroundColor: '#f9fafb' }} value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Password</Form.Label>
                                    <div className="position-relative">
                                        <Form.Control type={showPassword ? "text" : "password"} placeholder="Create password" className="py-2 px-3 shadow-none custom-input pe-5" style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid #e2e8f0', backgroundColor: '#f9fafb' }} value={password} onChange={(e) => setPassword(e.target.value)} required />
                                        <span className="position-absolute" style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#94a3b8' }} onClick={() => setShowPassword(!showPassword)}>
                                            <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </span>
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Confirm Password</Form.Label>
                                    <div className="position-relative">
                                        <Form.Control type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password" className="py-2 px-3 shadow-none custom-input pe-5" style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid #e2e8f0', backgroundColor: '#f9fafb' }} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                        <span className="position-absolute" style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#94a3b8' }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </span>
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="mb-4">
                            <PasswordRequirements password={password} />
                        </div>

                        {error && (
                            <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: '0.85rem', borderRadius: '8px' }}>
                                <i className="fa-solid fa-circle-exclamation me-2"></i>
                                {error}
                            </div>
                        )}

                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                            <Button type="submit" className="w-100 py-2 rounded-3 fw-bold shadow-sm text-white" style={{ backgroundColor: '#025955', border: 'none', fontSize: '1rem' }}>
                                Next: Education & Experience <i className="fa-solid fa-arrow-right ms-2"></i>
                            </Button>
                        </motion.div>
                        
                        <div className="mt-4 text-center">
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                Already have an account? <Link to="/" className="text-decoration-none fw-bold" style={{ color: '#025955' }}>Sign in</Link>
                            </p>
                        </div>
                    </Form>
                </motion.div>
            );
        }

        if (step === 2) {
            return (
                <motion.div key="step2" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                    <div className="mb-4 text-start">
                        <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.5px', fontSize: '1.5rem', color: '#025955' }}>Education & Experience</h2>
                        <p className="text-muted" style={{ fontSize: '0.95rem' }}>Tell us about your background and qualifications.</p>
                    </div>

                    <Form onSubmit={nextStep} className="text-start">
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>University</Form.Label>
                                    <Form.Control type="text" placeholder="e.g. Cairo University" className="py-2 px-3 shadow-none custom-input" style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid #e2e8f0', backgroundColor: '#f9fafb' }} value={university} onChange={(e) => setUniversity(e.target.value)} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Faculty/College</Form.Label>
                                    <Form.Control type="text" placeholder="e.g. Faculty of Nursing" className="py-2 px-3 shadow-none custom-input" style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid #e2e8f0', backgroundColor: '#f9fafb' }} value={faculty} onChange={(e) => setFaculty(e.target.value)} required />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Highest Degree</Form.Label>
                                    <Form.Select className="py-2 px-3 shadow-none custom-input text-muted" style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid #e2e8f0', backgroundColor: '#f9fafb' }} value={degree} onChange={(e) => setDegree(e.target.value)} required>
                                        <option value="">Select Degree</option>
                                        <option value="Diploma">Diploma / Institute</option>
                                        <option value="Bachelor">Bachelor's Degree</option>
                                        <option value="Master">Master's Degree</option>
                                        <option value="PhD">PhD</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Languages Spoken</Form.Label>
                                    <Row className="g-2 mt-1">
                                        {['Arabic', 'English', 'French', 'German', 'Spanish'].map(lang => (
                                            <Col xs={6} key={lang}>
                                                <Form.Check 
                                                    type="checkbox" 
                                                    id={`lang-${lang}`}
                                                    label={lang}
                                                    className="fw-medium text-muted custom-checkbox"
                                                    style={{ fontSize: '0.9rem' }}
                                                    checked={languages.includes(lang)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setLanguages([...languages, lang]);
                                                        else setLanguages(languages.filter(l => l !== lang));
                                                    }}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="bg-light p-3 rounded-3 mb-4 mt-2 border" style={{ borderColor: '#e2e8f0' }}>
                            <h6 className="fw-bold text-dark mb-3">Work Experience</h6>
                            <Row>
                                <Col md={8}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Current or Previous Workplace(s)</Form.Label>
                                        <Form.Control type="text" placeholder="Where do/did you work?" className="py-2 px-3 shadow-none custom-input" style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }} value={previousWork} onChange={(e) => setPreviousWork(e.target.value)} required />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Years of Exp.</Form.Label>
                                        <Form.Control type="number" placeholder="e.g. 3" className="py-2 px-3 shadow-none custom-input" style={{ borderRadius: '10px', fontSize: '0.95rem', border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }} value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value)} required min="0" />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-2 mt-3">
                                <Form.Label className="fw-semibold text-dark d-block" style={{ fontSize: '0.85rem' }}>Relevant Nursing Services</Form.Label>
                                <Form.Text className="text-muted d-block mb-3" style={{ fontSize: '0.8rem' }}>
                                    Select the services you are willing to provide. <a href="http://localhost:5173/services" target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none fw-bold">Read about our services here</a>.
                                </Form.Text>
                                <Row className="g-3">
                                    {[
                                        'Elderly Care', 'Post-operative Care', 'Chronic Care', 
                                        'Basic Care', 'Wound & Skin Care', 'Escort Services & Responsibilities'
                                    ].map(service => (
                                        <Col xs={12} md={6} key={service}>
                                            <Form.Check 
                                                type="checkbox" 
                                                id={`service-${service}`}
                                                label={service}
                                                className="fw-medium text-dark custom-checkbox"
                                                style={{ fontSize: '0.9rem' }}
                                                checked={skills.includes(service)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSkills([...skills, service]);
                                                    else setSkills(skills.filter(s => s !== service));
                                                }}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            </Form.Group>
                        </div>

                        <div className="d-flex gap-3 mt-4">
                            <Button variant="light" className="py-2 rounded-3 fw-bold" style={{ width: '30%', border: '1px solid #e2e8f0', color: '#475569' }} onClick={prevStep}>
                                Back
                            </Button>
                            <motion.div style={{ width: '70%' }} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                <Button type="submit" className="w-100 py-2 rounded-3 fw-bold shadow-sm text-white" style={{ backgroundColor: '#025955', border: 'none', fontSize: '1rem' }}>
                                    Next: Documents <i className="fa-solid fa-arrow-right ms-2"></i>
                                </Button>
                            </motion.div>
                        </div>
                    </Form>
                </motion.div>
            );
        }

        if (step === 3) {
            return (
                <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                    <div className="mb-4 text-start">
                        <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.5px', fontSize: '1.5rem', color: '#025955' }}>Upload Documents</h2>
                        <p className="text-muted" style={{ fontSize: '0.95rem' }}>Please upload your verification documents to complete the application.</p>
                    </div>

                    <Form onSubmit={handleSubmit} className="text-start">
                        {error && <div className="alert alert-danger mb-4">{error}</div>}
                        <div className="border rounded-4 p-4 mb-4 text-center" style={{ backgroundColor: '#f8fafc', borderStyle: 'dashed !important', borderColor: '#cbd5e1', borderWidth: '2px' }}>
                            <div className="mb-3">
                                <div className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{ width: '60px', height: '60px', backgroundColor: 'rgba(2, 89, 85, 0.1)', color: '#025955' }}>
                                    <i className="fa-solid fa-cloud-arrow-up fs-3"></i>
                                </div>
                            </div>
                            <h6 className="fw-bold text-dark mb-2">Upload a single PDF or ZIP file</h6>
                            <p className="text-muted mx-auto mb-3" style={{ fontSize: '0.85rem', maxWidth: '400px' }}>
                                Ensure your file contains: <br/>
                                <span className="fw-semibold text-dark">1. National ID (Front & Back)</span><br/>
                                <span className="fw-semibold text-dark">2. Educational Certificates</span><br/>
                                <span className="fw-semibold text-dark">3. Criminal Record (فيش وتشبيه)</span>
                            </p>
                            
                            <Form.Group>
                                <Form.Control 
                                    type="file" 
                                    accept=".pdf,.zip,.rar" 
                                    onChange={handleFileChange}
                                    className="d-none"
                                    id="document-upload"
                                />
                                <label htmlFor="document-upload" className="btn px-4 py-2 rounded-pill fw-semibold custom-upload-btn" style={{ border: '2px solid #025955', color: '#025955', cursor: 'pointer', transition: 'all 0.3s' }}>
                                    {documentsFile ? documentsFile.name : 'Browse Files'}
                                </label>
                            </Form.Group>
                        </div>

                        <div className="d-flex gap-3 mt-4">
                            <Button variant="light" className="py-2 rounded-3 fw-bold" style={{ width: '30%', border: '1px solid #e2e8f0', color: '#475569' }} onClick={prevStep}>
                                Back
                            </Button>
                            <motion.div style={{ width: '70%' }} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                <Button type="submit" className="w-100 py-2 rounded-3 fw-bold shadow-sm text-white" style={{ backgroundColor: '#025955', border: 'none', fontSize: '1rem' }}>
                                    Submit Application <i className="fa-solid fa-paper-plane ms-2"></i>
                                </Button>
                            </motion.div>
                        </div>
                    </Form>
                </motion.div>
            );
        }

        if (step === 4) {
            return (
                <motion.div key="step4" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="text-center py-4">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
                        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 shadow-sm" 
                        style={{ width: '80px', height: '80px', backgroundColor: '#00a67d', color: '#ffffff' }}
                    >
                        <i className="fa-solid fa-check fs-1"></i>
                    </motion.div>
                    
                    <h2 className="fw-bold mb-3" style={{ letterSpacing: '-0.5px', fontSize: '1.75rem', color: '#025955' }}>Application Submitted!</h2>
                    
                    <p className="text-muted mx-auto mb-5" style={{ fontSize: '1rem', maxWidth: '400px', lineHeight: '1.6' }}>
                        Your application is currently under review. We will send you an email once your details and documents are verified. You can log in after approval.
                    </p>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mx-auto" style={{ maxWidth: '300px' }}>
                        <Button 
                            onClick={() => navigate('/')}
                            className="w-100 py-3 rounded-4 fw-bold shadow-sm text-white d-flex justify-content-center align-items-center gap-2"
                            style={{ backgroundColor: '#025955', border: 'none', fontSize: '1rem' }}
                        >
                            Go to Login Page <i className="fa-solid fa-arrow-right"></i>
                        </Button>
                    </motion.div>
                </motion.div>
            );
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', position: 'relative', paddingTop: '60px', paddingBottom: '60px' }} className="d-flex align-items-center justify-content-center overflow-hidden">
            
            {/* Decorative background elements */}
            <div className="position-absolute rounded-circle" style={{ width: '500px', height: '500px', background: 'rgba(2, 89, 85, 0.08)', top: '-150px', right: '-150px', filter: 'blur(70px)', zIndex: 0 }}></div>
            <div className="position-absolute rounded-circle" style={{ width: '400px', height: '400px', background: 'rgba(2, 89, 85, 0.05)', bottom: '-100px', left: '-100px', filter: 'blur(60px)', zIndex: 0 }}></div>

            <Container className="position-relative" style={{ zIndex: 1 }}>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
                    className="shadow-lg bg-white mx-auto overflow-hidden" 
                    style={{ maxWidth: step === 4 ? '500px' : '650px', borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)', transition: 'max-width 0.4s ease' }}
                >
                    <div className="p-4 p-md-5">
                        
                        {/* Show Stepper unless on the final success step */}
                        {step < 4 && <Stepper />}

                        <AnimatePresence mode="wait">
                            {renderStep()}
                        </AnimatePresence>
                        
                    </div>
                </motion.div>
            </Container>
            
            <style>{`
                .custom-input::placeholder {
                    color: #94a3b8;
                }
                .custom-input:focus {
                    border-color: #025955 !important;
                    box-shadow: 0 0 0 3px rgba(2, 89, 85, 0.15) !important;
                }
                .form-select.text-muted {
                    color: #64748b !important;
                }
                .form-select:not([value=""]) {
                    color: #212529 !important;
                }
                .custom-upload-btn:hover {
                    background-color: #025955 !important;
                    color: #ffffff !important;
                }
            `}</style>
        </div>
    );
}
