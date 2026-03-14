"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Register() {
    const [formData, setFormData] = useState({ name: '', phoneNumber: '', email: '', password: '' });
    const [error, setError] = useState('');
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/auth/register', formData);
            router.push('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="form-container animate-fade-in">
            <div className="card">
                <h2>Create Account</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input type="text" name="name" placeholder="Full Name" required onChange={handleChange} />
                    <input type="text" name="phoneNumber" placeholder="Phone Number" required onChange={handleChange} />
                    <input type="email" name="email" placeholder="Email Address" required onChange={handleChange} />
                    <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Register</button>
                </form>
            </div>
        </div>
    );
}
