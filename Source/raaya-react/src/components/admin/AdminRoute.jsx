import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ErrorBoundary from '../common/ErrorBoundary';

const AdminRoute = () => {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // Checking if user exists and has admin role. 
    // Assuming user.role is where the role is stored.
    if (!isAuthenticated || !user || !['admin', 'super_admin'].includes(user.role)) {
        return <Navigate to="/login" replace />;
    }

    return (
        <ErrorBoundary>
            <Outlet />
        </ErrorBoundary>
    );
};

export default AdminRoute;
