"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const { token, role, loaded } = useAuth();
    const router = useRouter();
    
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [formData, setFormData] = useState({ name: '', description: '', price: '' });
    const [images, setImages] = useState([]);

    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if (!loaded) return;
        if (!token || role !== 'ADMIN') {
            router.push('/');
        }
    }, [token, role, router, loaded]);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/orders');
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (token && role === 'ADMIN') {
            fetchOrders();
        }
    }, [token, role]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 4) {
            Swal.fire({ icon: 'warning', title: 'Limit Exceeded', text: 'You can only upload up to 4 images.' });
            setImages(files.slice(0, 4));
        } else {
            setImages(files);
        }
    };

    const handleSubmitProduct = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', formData.price);
        images.forEach(image => {
            data.append('images', image);
        });

        try {
            await axios.post('/api/products', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            Swal.fire({ icon: 'success', title: 'Success', text: 'Product Added Successfully' });
            setFormData({ name: '', description: '', price: '' });
            setImages([]);
            document.querySelector('input[type="file"]').value = '';
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to add product' });
        }
    };

    const handleContactedToggle = async (orderId, currentStatus) => {
        try {
            await axios.put(`/api/orders/${orderId}/contacted`, {
                contacted: !currentStatus
            });
            fetchOrders();
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update status' });
        }
    };

    const handleDeleteOrder = async (orderId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#475569',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(`/api/orders/${orderId}`);
            fetchOrders();
            Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Order has been deleted.', timer: 1500, showConfirmButton: false });
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete order' });
        }
    };

    const handleShowUser = (user) => {
        if (user) {
            setSelectedUser(user);
        } else {
            Swal.fire({ icon: 'info', title: 'Not Found', text: 'User details not found.' });
        }
    };
    
    if (!loaded || role !== 'ADMIN') return null;

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', position: 'relative' }}>
            <section className="card">
                <h2>Add New Product</h2>
                <form onSubmit={handleSubmitProduct} className="form-container" style={{ margin: '1rem 0', maxWidth: '600px' }}>
                    <input type="text" name="name" placeholder="Product Name" value={formData.name} required onChange={handleInputChange} />
                    <textarea name="description" placeholder="Description" value={formData.description} required onChange={handleInputChange} rows="3"></textarea>
                    <input type="number" step="0.01" name="price" placeholder="Price" value={formData.price} required onChange={handleInputChange} />
                    <input type="file" name="images" accept="image/*" multiple onChange={handleFileChange} />
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>Select up to 4 images.</p>
                    <button type="submit" className="btn-primary">Create Product</button>
                </form>
            </section>

            <section className="card">
                <h2>Admin Controls (Orders list)</h2>
                <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Product Name</th>
                                <th>Address</th>
                                <th>Quantity</th>
                                <th>Contacted</th>
                                <th>Actions</th>
                                <th>User Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(o => (
                                <tr key={o.id}>
                                    <td>{o.id}</td>
                                    <td>{o.product?.name}</td>
                                    <td>{o.address}</td>
                                    <td>{o.quantity}</td>
                                    <td>
                                        <button
                                            className={`btn-${o.contacted ? 'primary' : 'secondary'}`}
                                            onClick={() => handleContactedToggle(o.id, o.contacted)}
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                                        >
                                            {o.contacted ? 'Yes' : 'No'}
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-danger"
                                            onClick={() => handleDeleteOrder(o.id)}
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', background: '#e11d48', color: 'white' }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-primary"
                                            onClick={() => handleShowUser(o.user)}
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                                        >
                                            Show User
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center' }}>No orders yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </section>

            {selectedUser && (
                <div className="modal-overlay animate-fade-in" onClick={() => setSelectedUser(null)}>
                    <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>User Context</h2>
                            <button className="close-btn" onClick={() => setSelectedUser(null)}>×</button>
                        </div>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', gridTemplateColumns: '1fr' }}>
                            <p><strong>Name:</strong> {selectedUser.name}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Phone:</strong> {selectedUser.phoneNo}</p>
                            <button
                                className="btn-secondary"
                                onClick={() => setSelectedUser(null)}
                                style={{ marginTop: '1rem' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
