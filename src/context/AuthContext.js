"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedRole = localStorage.getItem('role');
        const storedName = localStorage.getItem('name');
        
        if (storedToken) setToken(storedToken);
        if (storedRole) setRole(storedRole);
        if (storedName && storedRole) setUser({ name: storedName, role: storedRole });
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (!loaded) return;
        if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('role', role || '');
            if (user?.name) localStorage.setItem('name', user.name);
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('name');
        }
    }, [token, role, user, loaded]);

    const loginContext = (newToken, newRole, name) => {
        setToken(newToken);
        setRole(newRole);
        setUser({ name, role: newRole });
    };

    const logoutContext = () => {
        setToken(null);
        setRole(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, role, loginContext, logoutContext, loaded }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
