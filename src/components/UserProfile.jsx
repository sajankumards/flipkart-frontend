import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useToast } from './Toast';
import { useTranslation } from './LanguageSelector';
import './UserProfile.css';

const UserProfile = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { t } = useTranslation();
    const user = JSON.parse(localStorage.getItem('user'));

    const [orders, setOrders] = useState([]);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [loyalty, setLoyalty] = useState(null);
    const [copied, setCopied] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        gender: '',
        dob: ''
    });

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchOrders();
        fetchLoyalty();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')/orders/user/${user.userId}`);
            const data = await res.json();
            if (data.success) setOrders(data.orders);
        } catch (e) { console.log(e); }
    };

    const fetchLoyalty = async () => {
        try {
            const res = await fetch(`(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')/loyalty/${user.userId}`);
            const data = await res.json();
            if (data.success) setLoyalty(data.loyalty);
        } catch (e) { console.log(e); }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updatedUser = { ...user, name: formData.name };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            showToast('Profile updated! ✅', 'success');
            setEditing(false);
        } catch (e) {
            showToast('Could not save!', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        if (!window.confirm('Logout karna chahte ho?')) return;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
        window.location.reload();
    };

    const copyReferralCode = () => {
        const code = loyalty?.referralCode || `FLIP${user.userId}REF`;
        navigator.clipboard.writeText(code);
        setCopied(true);
        showToast('Referral code copied! 📋', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    const getStatusConfig = (status) => {
        const map = {
            'Delivered':       { color: '#388e3c', bg: '#e8f5e9', icon: '📦' },
            'Shipped':         { color: '#1565c0', bg: '#e3f2fd', icon: '🚚' },
            'Confirmed':       { color: '#e65100', bg: '#fff3e0', icon: '✅' },
            'Cancelled':       { color: '#c62828', bg: '#ffebee', icon: '❌' },
            'Out for Delivery':{ color: '#0097a7', bg: '#e0f7fa', icon: '🏍️' },
        };
        return map[status] || { color: '#2874f0', bg: '#e8f0ff', icon: '⏳' };
    };

    const tabs = [
        { id: 'profile',  icon: '👤', label: 'Profile' },
        { id: 'orders',   icon: '📦', label: t.orders || 'Orders' },
        { id: 'address',  icon: '📍', label: 'Address' },
        { id: 'loyalty',  icon: '🎁', label: 'Loyalty' },
        { id: 'security', icon: '🔒', label: 'Security' },
    ];

    const tierIcon = { Gold: '🥇', Platinum: '💎', Silver: '🥈' };

    return (
        <div className="profile-page">
            <Navbar />

            {/* ── HERO ── */}
            <div className="profile-hero">
                <div className="hero-bg-shape s1" />
                <div className="hero-bg-shape s2" />
                <div className="profile-hero-content">
                    <div className="profile-avatar-big">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-hero-info">
                        <h2>{user?.name}</h2>
                        <p>{user?.email}</p>
                        <div className="profile-hero-badges">
                            <span className="hero-badge">✅ Verified</span>
                            <span className="hero-badge">
                                {tierIcon[loyalty?.tier] || '🥈'} {loyalty?.tier || 'Silver'} Member
                            </span>
                            <span className="hero-badge">📦 {orders.length} {t.orders || 'Orders'}</span>
                            {loyalty?.points > 0 && (
                                <span className="hero-badge">⭐ {loyalty.points} Points</span>
                            )}
                        </div>
                    </div>
                    <button className="hero-logout-btn" onClick={handleLogout}>
                        🚪 Logout
                    </button>
                </div>
            </div>

            <div className="profile-container">

                {/* ── SIDEBAR ── */}
                <div className="profile-sidebar">
                    <div className="sidebar-menu">
                        {tabs.map(tab => (
                            <button key={tab.id}
                                className={`sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}>
                                <span className="tab-icon">{tab.icon}</span>
                                <span className="tab-label">{tab.label}</span>
                                <span className="sidebar-arrow">›</span>
                            </button>
                        ))}
                    </div>

                    {/* Quick Stats */}
                    <div className="quick-stats-card">
                        <h4>Quick Stats</h4>
                        <div className="stats-grid">
                            {[
                                { icon: '📦', count: orders.length, label: t.orders || 'Orders', path: '/orders' },
                                { icon: '❤️', count: '—', label: t.wishlist || 'Wishlist', path: '/wishlist' },
                                { icon: '🎁', count: loyalty?.points || 0, label: 'Points', path: '/loyalty' },
                                { icon: '🛒', count: '—', label: t.cart || 'Cart', path: '/cart' },
                            ].map(stat => (
                                <div key={stat.label} className="stat-box"
                                    onClick={() => navigate(stat.path)}>
                                    <span className="stat-icon">{stat.icon}</span>
                                    <span className="stat-count">{stat.count}</span>
                                    <span className="stat-label">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── CONTENT ── */}
                <div className="profile-content">

                    {/* ── PROFILE TAB ── */}
                    {activeTab === 'profile' && (
                        <div className="content-card">
                            <div className="content-header">
                                <div>
                                    <h3>👤 Personal Information</h3>
                                    <p>Manage your personal details</p>
                                </div>
                                <button
                                    className={`edit-toggle-btn ${editing ? 'cancel' : ''}`}
                                    onClick={() => { setEditing(!editing); }}>
                                    {editing ? '✕ Cancel' : '✏️ Edit Profile'}
                                </button>
                            </div>

                            <div className="profile-avatar-section">
                                <div className="profile-avatar-lg">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                {editing && (
                                    <button className="change-photo-btn">📷 Change Photo</button>
                                )}
                            </div>

                            <div className="form-grid-2">
                                {[
                                    { name: 'name',   label: 'Full Name',      type: 'text',  icon: '👤', editable: true },
                                    { name: 'email',  label: 'Email Address',  type: 'email', icon: '📧', editable: false },
                                    { name: 'phone',  label: 'Phone Number',   type: 'tel',   icon: '📱', editable: true, placeholder: '+91 XXXXX XXXXX' },
                                    { name: 'gender', label: 'Gender',         type: 'text',  icon: '👥', editable: true, placeholder: 'Male / Female / Other' },
                                    { name: 'dob',    label: 'Date of Birth',  type: 'date',  icon: '🎂', editable: true },
                                ].map(field => (
                                    <div key={field.name} className="input-field-group">
                                        <label>
                                            <span>{field.icon}</span> {field.label}
                                        </label>
                                        <input
                                            type={field.type}
                                            name={field.name}
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                            disabled={!editing || !field.editable}
                                            placeholder={field.placeholder || ''}
                                            className={!editing || !field.editable ? 'disabled' : ''}
                                        />
                                    </div>
                                ))}
                            </div>

                            {editing && (
                                <div className="form-actions">
                                    <button className="save-profile-btn"
                                        onClick={handleSave} disabled={saving}>
                                        {saving ? '⏳ Saving...' : '💾 Save Changes'}
                                    </button>
                                    <button className="cancel-profile-btn"
                                        onClick={() => setEditing(false)}>
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── ORDERS TAB ── */}
                    {activeTab === 'orders' && (
                        <div className="content-card">
                            <div className="content-header">
                                <div>
                                    <h3>📦 {t.orders || 'My Orders'}</h3>
                                    <p>{orders.length} total orders</p>
                                </div>
                                <button className="view-all-btn" onClick={() => navigate('/orders')}>
                                    View All →
                                </button>
                            </div>

                            {orders.length === 0 ? (
                                <div className="empty-state">
                                    <span>📦</span>
                                    <p>No orders yet!</p>
                                    <button onClick={() => navigate('/')}>Start Shopping</button>
                                </div>
                            ) : (
                                <div className="orders-list">
                                    {orders.slice(0, 5).map(order => {
                                        const sc = getStatusConfig(order.status);
                                        return (
                                            <div key={order.id} className="order-row">
                                                <div className="order-row-left">
                                                    <div className="order-icon-box">{sc.icon}</div>
                                                    <div>
                                                        <p className="order-row-id">Order #{order.id}</p>
                                                        <p className="order-row-date">
                                                            {order.orderedAt && !isNaN(new Date(order.orderedAt))
                                                                ? new Date(order.orderedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                                                                : 'Recently Placed'}
                                                        </p>
                                                        <p className="order-row-address">
                                                            📍 {order.city}, {order.pincode}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="order-row-right">
                                                    <p className="order-row-amount">
                                                        ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                                                    </p>
                                                    <span className="order-status-pill"
                                                        style={{ color: sc.color, background: sc.bg }}>
                                                        {order.status}
                                                    </span>
                                                    <button className="track-btn-sm"
                                                        onClick={() => navigate('/track-order')}>
                                                        Track
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── ADDRESS TAB ── */}
                    {activeTab === 'address' && (
                        <div className="content-card">
                            <div className="content-header">
                                <div>
                                    <h3>📍 Saved Addresses</h3>
                                    <p>Manage your delivery addresses</p>
                                </div>
                                <button className="edit-toggle-btn"
                                    onClick={() => setEditing(!editing)}>
                                    {editing ? '✕ Cancel' : '+ Add Address'}
                                </button>
                            </div>

                            <div className="form-grid-2">
                                {[
                                    { name: 'address', label: 'Full Address', placeholder: 'House no., Street, Area', full: true },
                                    { name: 'city',    label: 'City',    placeholder: 'City' },
                                    { name: 'state',   label: 'State',   placeholder: 'State' },
                                    { name: 'pincode', label: 'Pincode', placeholder: '6-digit pincode' },
                                ].map(field => (
                                    <div key={field.name}
                                        className={`input-field-group ${field.full ? 'full' : ''}`}>
                                        <label>{field.label}</label>
                                        <input
                                            type="text"
                                            name={field.name}
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                            placeholder={field.placeholder}
                                            disabled={!editing}
                                            className={!editing ? 'disabled' : ''}
                                        />
                                    </div>
                                ))}
                            </div>

                            {editing && (
                                <div className="form-actions">
                                    <button className="save-profile-btn" onClick={handleSave}
                                        disabled={saving}>
                                        {saving ? '⏳ Saving...' : '💾 Save Address'}
                                    </button>
                                </div>
                            )}

                            <div className="address-tip">
                                💡 Save addresses for faster checkout at payment!
                            </div>
                        </div>
                    )}

                    {/* ── LOYALTY TAB ── */}
                    {activeTab === 'loyalty' && (
                        <div className="content-card">
                            <div className="content-header">
                                <div>
                                    <h3>🎁 Loyalty & Rewards</h3>
                                    <p>Your points and rewards</p>
                                </div>
                                <button className="view-all-btn" onClick={() => navigate('/loyalty')}>
                                    Full Details →
                                </button>
                            </div>

                            <div className="loyalty-hero-card">
                                <div className="loyalty-tier-badge">
                                    {tierIcon[loyalty?.tier] || '🥈'} {loyalty?.tier || 'Silver'} Member
                                </div>
                                <div className="loyalty-points-big">
                                    {loyalty?.points || 0}
                                    <span>Points</span>
                                </div>
                                <p className="loyalty-worth">
                                    ≈ ₹{((loyalty?.points || 0) * 0.1).toFixed(2)} redeemable value
                                </p>
                            </div>

                            <div className="loyalty-stats-row">
                                {[
                                    { label: 'Total Earned', value: loyalty?.totalEarned || 0, icon: '⭐' },
                                    { label: 'Referrals',    value: loyalty?.referrals   || 0, icon: '👥' },
                                    { label: 'Available',    value: loyalty?.points      || 0, icon: '💰' },
                                ].map(stat => (
                                    <div key={stat.label} className="loyalty-stat">
                                        <span>{stat.icon}</span>
                                        <p className="loyalty-stat-value">{stat.value}</p>
                                        <p className="loyalty-stat-label">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="loyalty-referral-box">
                                <p>Your Referral Code:</p>
                                <div className="referral-code-display">
                                    <strong>{loyalty?.referralCode || `FLIP${user.userId}REF`}</strong>
                                    <button onClick={copyReferralCode}>
                                        {copied ? '✅ Copied!' : '📋 Copy'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── SECURITY TAB ── */}
                    {activeTab === 'security' && (
                        <div className="content-card">
                            <div className="content-header">
                                <div>
                                    <h3>🔒 Security Settings</h3>
                                    <p>Manage your account security</p>
                                </div>
                            </div>

                            <div className="security-items">
                                {[
                                    { icon: '🔑', title: 'Change Password',    desc: 'Update your account password',      action: 'Update' },
                                    { icon: '📱', title: 'Two-Factor Auth',    desc: 'Add extra security to your account', action: 'Enable' },
                                    { icon: '📧', title: 'Email Verification', desc: `${user?.email} — Verified`,          action: '✅ Done', done: true },
                                    { icon: '🔔', title: 'Login Alerts',       desc: 'Get notified of new logins',         action: 'Enable' },
                                ].map(item => (
                                    <div key={item.title} className="security-item">
                                        <span className="security-icon">{item.icon}</span>
                                        <div className="security-info">
                                            <p className="security-title">{item.title}</p>
                                            <p className="security-desc">{item.desc}</p>
                                        </div>
                                        <button className={`security-btn ${item.done ? 'done' : ''}`}>
                                            {item.action}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="danger-zone">
                                <h4>⚠️ Danger Zone</h4>
                                <p className="danger-desc">Permanently delete your account and all data.</p>
                                <button className="delete-account-btn"
                                    onClick={() => {
                                        if (window.confirm('Are you sure? This cannot be undone!')) {
                                            handleLogout();
                                        }
                                    }}>
                                    🗑️ Delete Account
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default UserProfile;





