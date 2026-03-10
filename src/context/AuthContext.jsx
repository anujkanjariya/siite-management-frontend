import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (number, password) => {
        const { data } = await api.login(number, password);
        // User's example has token and user details at the top level
        const token = data.token;
        const userDetails = { id: data._id, name: data.name, number: data.number };

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userDetails));
        setUser(userDetails);
        return userDetails;
    };

    const register = async (userData) => {
        const { data } = await api.register(userData);
        const token = data.token;
        const userDetails = { id: data._id, name: data.name, number: data.number };

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userDetails));
        setUser(userDetails);
        return userDetails;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
