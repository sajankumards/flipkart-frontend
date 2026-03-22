import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './AddressBook.css';

const AddressBook = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '', phone: '', address: '',
        city: '', state: '', pincode: '', type: 'HOME', isDefault: false
    });

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const res = await fetch(`process.env.REACT_APP_API_URL || '$env:REACT_APP_API_URL'/addresses/user/${user.userId}`);
            const data = await res.json();
            if (data.success) setAddresses(data.addresses);
        } catch (error) {
            console.log('Error:', error);
        }
    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('process.env.REACT_APP_API_URL || '$env:REACT_APP_API_URL'/addresses/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, userId: user.userId })
            });
            const data = await res.json();
            if (data.success) {
                setMessage('✅ Address saved!');
                setShowForm(false);
                setFormData({ name: '', phone: '', address: '', city: '', state: '', pincode: '', type: 'HOME', isDefault: false });
                fetchAddresses();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            setMessage('❌ Error saving address!');
        }
    };

    const deleteAddress = async (id) => {
        try {
            await fetch(`process.env.REACT_APP_API_URL || '$env:REACT_APP_API_URL'/addresses/${id}`, { method: 'DELETE' });
            fetchAddresses();
        } catch (error) {
            console.log('Error:', error);
        }
    };

    const setDefault = async (id) => {
        try {
            await fetch(`process.env.REACT_APP_API_URL || '$env:REACT_APP_API_URL'/addresses/${id}/default`, { method: 'PUT' });
            fetchAddresses();
        } catch (error) {
            console.log('Error:', error);
        }
    };

    const getTypeIcon = (type) => {
        if (type === 'HOME') return '🏠';
        if (type === 'WORK') return '🏢';
        return '📍';
    };

    return (
        <div className="address-page">
            <Navbar />
            <div className="address-container">
                <div className="address-header">
                    <h2>📍 My Addresses ({addresses.length})</h2>
                    <button className="add-address-btn" onClick={() => setShowForm(!showForm)}>
                        {showForm ? '✕ Cancel' : '+ Add New Address'}
                    </button>
                </div>

                {message && <div className="address-message">{message}</div>}

                {/* Add Address Form */}
                {showForm && (
                    <div className="address-form-card">
                        <h3>Add New Address</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input type="text" name="name" placeholder="Full Name"
                                        value={formData.name} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Phone *</label>
                                    <input type="tel" name="phone" placeholder="Phone Number"
                                        value={formData.phone} onChange={handleChange} required />
                                </div>
                                <div className="form-group full-width">
                                    <label>Address *</label>
                                    <input type="text" name="address" placeholder="House No, Street, Area"
                                        value={formData.address} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>City *</label>
                                    <input type="text" name="city" placeholder="City"
                                        value={formData.city} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>State *</label>
                                    <input type="text" name="state" placeholder="State"
                                        value={formData.state} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Pincode *</label>
                                    <input type="text" name="pincode" placeholder="Pincode"
                                        value={formData.pincode} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Address Type</label>
                                    <select name="type" value={formData.type} onChange={handleChange}>
                                        <option value="HOME">🏠 Home</option>
                                        <option value="WORK">🏢 Work</option>
                                        <option value="OTHER">📍 Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="default-checkbox">
                                <input type="checkbox" name="isDefault" id="isDefault"
                                    checked={formData.isDefault} onChange={handleChange} />
                                <label htmlFor="isDefault">Set as default address</label>
                            </div>
                            <button type="submit" className="save-btn">Save Address</button>
                        </form>
                    </div>
                )}

                {/* Address List */}
                {addresses.length === 0 && !showForm ? (
                    <div className="empty-address">
                        <h3>📍 No addresses saved!</h3>
                        <p>Add your delivery address</p>
                        <button onClick={() => setShowForm(true)}>Add Address</button>
                    </div>
                ) : (
                    <div className="address-grid">
                        {addresses.map(addr => (
                            <div key={addr.id} className={`address-card ${addr.default ? 'default-card' : ''}`}>
                                {addr.default && <span className="default-badge">✅ Default</span>}
                                <div className="address-type">
                                    <span>{getTypeIcon(addr.type)} {addr.type}</span>
                                </div>
                                <h4>{addr.name}</h4>
                                <p>{addr.address}</p>
                                <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                                <p>📱 {addr.phone}</p>
                                <div className="address-actions">
                                    {!addr.default && (
                                        <button className="default-btn" onClick={() => setDefault(addr.id)}>
                                            Set Default
                                        </button>
                                    )}
                                    <button className="delete-btn" onClick={() => deleteAddress(addr.id)}>
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default AddressBook;

