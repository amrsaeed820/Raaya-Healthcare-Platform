import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Badge } from 'react-bootstrap';
import { useTranslation } from '../../hooks/useTranslation';

const Topbar = ({ nurseData, toggleMobileMenu, showToast, unreadNotifications, setActiveTab }) => {
    const [lang, setLang] = useState(localStorage.getItem('raaya_lang') || 'en');
    const [theme, setTheme] = useState(localStorage.getItem('raaya_theme') || 'light');

    useEffect(() => {
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
        if (lang === 'ar') {
            document.body.style.fontFamily = "'Cairo', sans-serif";
        } else {
            document.body.style.fontFamily = "";
        }
    }, [lang]);

    useEffect(() => {
        document.documentElement.setAttribute('data-bs-theme', theme);
    }, [theme]);

    const toggleLang = () => {
        const newLang = lang === 'en' ? 'ar' : 'en';
        setLang(newLang);
        localStorage.setItem('raaya_lang', newLang);
        window.dispatchEvent(new Event('languageChange'));
        // showToast('Language Changed', `Switched to ${newLang === 'ar' ? 'Arabic' : 'English'}.`, 'info');
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('raaya_theme', newTheme);
        // showToast('Theme Changed', `Switched to ${newTheme} mode.`, 'info');
    };

    return (
    <header className="py-3 px-4 bg-body border-bottom shadow-sm d-flex align-items-center justify-content-between sticky-top" style={{ zIndex: 10, borderColor: '#eef2f5' }}>
        <div className="d-flex align-items-center gap-3">
            <div 
                className="d-lg-none d-flex align-items-center justify-content-center rounded-circle bg-body-tertiary cursor-pointer transition-all border" 
                style={{ width: '45px', height: '45px', borderColor: '#eef2f5' }}
                onClick={toggleMobileMenu}
            >
                <i className="fa-solid fa-bars fs-5 text-dark"></i>
            </div>
            <div className="d-none d-md-block ms-3">
                <h5 className="fw-bold text-dark mb-0 text-16">{lang === 'ar' ? 'لوحة تحكم الممرض' : 'Nurse Dashboard'}</h5>
                <span className="text-muted text-12">{lang === 'ar' ? 'رعاية منزلية' : 'Raaya Home Healthcare'}</span>
            </div>
        </div>
        <div className="d-flex align-items-center gap-3 gap-md-4">
            <div 
                className="d-none d-md-flex align-items-center gap-2 px-3 py-2 bg-body-tertiary rounded-pill border cursor-pointer transition-all"
                style={{ borderColor: '#eef2f5' }}
                onClick={toggleLang}
            >
                {lang === 'ar' ? (
                    <>
                        <img src="https://flagcdn.com/w20/eg.png" alt="Arabic" style={{ width: '20px', borderRadius: '50%' }} />
                        <span className="fw-bold text-dark text-13">AR</span>
                    </>
                ) : (
                    <>
                        <img src="https://flagcdn.com/w20/us.png" alt="English" style={{ width: '20px', borderRadius: '50%' }} />
                        <span className="fw-bold text-dark text-13">EN</span>
                    </>
                )}
            </div>
            <div 
                className="d-flex align-items-center justify-content-center bg-body-tertiary rounded-circle border cursor-pointer transition-all" 
                style={{ width: '45px', height: '45px', borderColor: '#eef2f5' }}
                onClick={toggleTheme}
            >
                <i className={`fa-solid ${theme === 'dark' ? 'fa-sun text-warning' : 'fa-moon text-dark'} fs-5`}></i>
            </div>
            <div 
                className="d-flex align-items-center justify-content-center bg-body-tertiary rounded-circle border cursor-pointer transition-all position-relative" 
                style={{ width: '45px', height: '45px', borderColor: '#eef2f5' }}
                onClick={() => setActiveTab('notifications')}
            >
                <i className="fa-regular fa-bell fs-5 text-primary"></i>
                {unreadNotifications > 0 && (
                    <Badge 
                        bg="danger" 
                        pill 
                        className="position-absolute top-0 start-100 translate-middle border border-white border-2 p-1 shadow-sm"
                        style={{ fontSize: '0.65rem' }}
                    >
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </Badge>
                )}
            </div>
            <div 
                className="d-flex align-items-center gap-3 cursor-pointer p-1 pe-3 rounded-pill bg-body-tertiary transition-all border"
                style={{ borderColor: '#eef2f5' }}
                onClick={() => setActiveTab('profile')}
            >
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center overflow-hidden shadow-sm" style={{ width: '40px', height: '40px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {nurseData?.profilePicture ? (
                        <img src={nurseData.profilePicture.startsWith('data:') ? nurseData.profilePicture : `http://localhost:5000/uploads/${nurseData.profilePicture}`} alt={nurseData.name} className="w-100 h-100 object-fit-cover" />
                    ) : (
                        nurseData?.name?.charAt(0) || 'N'
                    )}
                </div>
                <div className="d-none d-sm-flex flex-column">
                    <span className="fw-bold text-dark lh-1 text-14">{nurseData?.name || 'Nurse'}</span>
                    <span className="text-primary lh-1 mt-1 text-12 fw-medium">{lang === 'ar' ? 'عرض الملف الشخصي' : 'View Profile'}</span>
                </div>
            </div>
        </div>
    </header>
    );
};

export default Topbar;
