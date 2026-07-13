import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Prevent flash of Login

    const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // You can import axios or use fetch
                const res = await fetch('http://localhost:5000/api/user/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                    setIsAuthenticated(true);
                } else {
                    console.error("fetchUser failed with status:", res.status);
                    logout();
                }
            } catch (error) {
                console.error("Failed to fetch user in AuthContext", error);
                logout();
            }
        } else {
            setIsAuthenticated(false);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = async () => {
        setIsAuthenticated(true);
        await fetchUser();
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout, refreshUser: fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
