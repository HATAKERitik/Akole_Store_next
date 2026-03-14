"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

const ProductModal = ({ product, onClose, userId }) => {
    const [activeImage, setActiveImage] = useState(0);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [address, setAddress] = useState('');

    let images = [];
    if (product.imageUrls) {
        try {
            images = JSON.parse(product.imageUrls);
        } catch (e) { }
    }

    const handleOrderSubmit = async (e) => {
        e.preventDefault();
        if (!userId) {
            Swal.fire({ icon: 'warning', title: 'Action Required', text: 'Please log in again' });
            return;
        }

        try {
            await axios.post('/api/orders', {
                productId: product.id,
                userId,
                quantity: 1,
                address
            });
            Swal.fire({ icon: 'success', title: 'Success', text: 'Order placed successfully!' });
            onClose();
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.error || 'Failed to place order.' });
        }
    };

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{product.name}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="image-gallery">
                        {images.length > 0 ? (
                            <>
                                <img src={images[activeImage]} alt="Main product" className="main-image" />
                                {images.length > 1 && (
                                    <div className="thumbnail-list">
                                        {images.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`Thumbnail ${idx}`}
                                                className={`thumbnail ${idx === activeImage ? 'active' : ''}`}
                                                onClick={() => setActiveImage(idx)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="main-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ color: '#94a3b8' }}>No Images</span>
                            </div>
                        )}
                    </div>

                    <div className="product-details">
                        <p className="product-desc" style={{ fontSize: '1rem' }}>{product.description}</p>
                        <div className="price">${product.price.toFixed(2)}</div>

                        {!showAddressForm ? (
                            <button className="btn-primary" onClick={() => setShowAddressForm(true)} style={{ mt: 'auto' }}>
                                Order Now
                            </button>
                        ) : (
                            <form className="address-form animate-fade-in" onSubmit={handleOrderSubmit}>
                                <h3 style={{ marginBottom: '1rem' }}>Shipping Address</h3>
                                <textarea
                                    placeholder="Enter your full shipping address..."
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    required
                                    rows="3"
                                />
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Confirm Order</button>
                                    <button type="button" className="btn-secondary" onClick={() => setShowAddressForm(false)}>Cancel</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Home() {
    const { token, role, loaded } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);

    let userId = null;
    if (token && typeof token === 'string' && token.split('.').length === 3) {
        try {
            const decoded = jwtDecode(token);
            userId = decoded.id;
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        if (!loaded) return;
        if (!token) {
            router.push('/login');
        } else if (role === 'ADMIN') {
            router.push('/admin');
        }
    }, [token, role, router, loaded]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get('/api/products');
                setProducts(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        if (token && role !== 'ADMIN') {
             fetchProducts();
        }
    }, [selectedProduct, token, role]);

    if (!loaded || !token || role === 'ADMIN') {
        return null;
    }

    return (
        <div className="animate-fade-in">
            <div className="dashboard-header">
                <h2>Available Products</h2>
            </div>
            <div className="products-grid">
                {products.map(product => {
                    let firstImage = null;
                    if (product.imageUrls) {
                        try {
                            const images = JSON.parse(product.imageUrls);
                            if (images.length > 0) firstImage = images[0];
                        } catch (e) { }
                    }

                    return (
                        <div key={product.id} className="product-card">
                            {firstImage ? (
                                <img src={firstImage} alt={product.name} className="product-image" />
                            ) : (
                                <div className="product-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ color: '#94a3b8' }}>No Image</span>
                                </div>
                            )}
                            <div className="product-info">
                                <div className="product-title">{product.name}</div>
                                <div className="product-desc">{product.description}</div>
                                <div className="product-price">${product.price.toFixed(2)}</div>
                                <button className="btn-primary" onClick={() => setSelectedProduct(product)}>View Details</button>
                            </div>
                        </div>
                    )
                })}
                {products.length === 0 && <p>No products available right now.</p>}
            </div>

            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    userId={userId}
                />
            )}
        </div>
    );
}
