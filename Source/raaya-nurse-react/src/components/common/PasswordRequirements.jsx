import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const PasswordRequirements = ({ password }) => {
    const { t } = useTranslation();
    const hasLowercase = /[a-z]/.test(password || '');
    const hasUppercase = /[A-Z]/.test(password || '');
    const hasNumber = /[0-9]/.test(password || '');
    const hasSpecial = /[^A-Za-z0-9\s]/.test(password || '');

    const reqs = [
        { label: t('Lowercase letters'), met: hasLowercase },
        { label: t('Uppercase letters'), met: hasUppercase },
        { label: t('Numbers'), met: hasNumber },
        { label: t('Special characters'), met: hasSpecial },
    ];

    return (
        <div className="mt-2 mb-3 p-3 rounded-3 bg-body-secondary border" style={{ fontSize: '0.85rem' }}>
            <p className="mb-2 fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>{t('Password must be at least 8 characters, contain no spaces, and include at least 3 of the following:')}</p>
            <div className="d-flex flex-column gap-2">
                <div className="d-flex flex-wrap gap-2">
                    {reqs.slice(0, 2).map((req, idx) => (
                        <div key={idx} className="d-flex align-items-center gap-2" style={{ width: '45%' }}>
                            {req.met ? (
                                <i className="fa-solid fa-check-circle" style={{ color: 'var(--primary)' }}></i>
                            ) : (
                                <i className="fa-solid fa-times-circle" style={{ color: '#ef4444' }}></i>
                            )}
                            <span className={req.met ? 'text-dark fw-medium' : 'text-muted'}>{req.label}</span>
                        </div>
                    ))}
                </div>
                <div className="d-flex flex-wrap gap-2">
                    {reqs.slice(2, 4).map((req, idx) => (
                        <div key={idx} className="d-flex align-items-center gap-2" style={{ width: '45%' }}>
                            {req.met ? (
                                <i className="fa-solid fa-check-circle" style={{ color: 'var(--primary)' }}></i>
                            ) : (
                                <i className="fa-solid fa-times-circle" style={{ color: '#ef4444' }}></i>
                            )}
                            <span className={req.met ? 'text-dark fw-medium' : 'text-muted'}>{req.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const validatePassword = (password) => {
    const hasLowercase = /[a-z]/.test(password || '');
    const hasUppercase = /[A-Z]/.test(password || '');
    const hasNumber = /[0-9]/.test(password || '');
    const hasSpecial = /[^A-Za-z0-9\s]/.test(password || '');
    
    const conditionsMet = [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
    const isValid = conditionsMet >= 3 && password.length >= 8 && !/\s/.test(password);
    return isValid;
};

export default PasswordRequirements;
