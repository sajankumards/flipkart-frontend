import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useTranslation } from './LanguageSelector';
import './OrderTracking.css';

// ── SKELETON ──
const TrackingSkeleton = () => (
    <div className="tracking-layout">
        <div className="orders-list-panel">
            {[1,2,3].map(i => (
                <div key={i} className="order-skel-card">
                    <div className="skel skel-line w60" />
                    <div className="skel skel-line w40" />
                    <div className="skel skel-line w30" />
                </div>
            ))}
        </div>
        <div className="tracking-details-panel">
            <div className="skel skel-info-bar" />
            {[1,2,3,4].map(i => (
                <div key={i} className="skel-timeline-step">
                    <div className="skel skel-circle" />
                    <div className="skel-step-lines">
                        <div className="skel skel-line w50" />
                        <div className="skel skel-line w30" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// ── STATUS CONFIG ──
const STATUS_CONFIG = {
    'Confirmed':  { color: '#2874f0', bg: '#e8f0ff', icon: '✅' },
    'Processing': { color: '#ff9f00', bg: '#fff8e6', icon: '⏳' },
    'Shipped':    { color: '#7b1fa2', bg: '#f3e5f5', icon: '🚚' },
    'Delivered':  { color: '#388e3c', bg: '#e8f5e9', icon: '📦' },
    'Cancelled':  { color: '#d32f2f', bg: '#ffebee', icon: '❌' },
};

const OrderTracking = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [tracking, setTracking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [searchId, setSearchId] = useState('');
    const [searchResult, setSearchResult] = useState(null);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')/orders/user/${user.userId}`);
            const data = await res.json();
            if (data.success && data.orders?.length > 0) {
                setOrders(data.orders);
                handleSelectOrder(data.orders[0]);
            }
        } catch (error) {
            console.log('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectOrder = async (order) => {
        setSelectedOrder(order);
        setTrackingLoading(true);
        try {
            const res = await fetch(`(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')/orders/${order.id}/track`);
            const data = await res.json();
            setTracking(data);
        } catch (error) {
            console.log('Tracking error:', error);
            setTracking(null);
        } finally {
            setTrackingLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchId.trim()) return;
        const found = orders.find(o => String(o.id) === searchId.trim());
        if (found) {
            handleSelectOrder(found);
            setSearchResult(null);
        } else {
            setSearchResult('not-found');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr || isNaN(new Date(dateStr))) return 'Recently Placed';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    return (
        <div className="tracking-page">
            <Navbar />
            <div className="tracking-container">

                {/* ── HEADER ── */}
                <div className="tracking-header">
                    <div>
                        <h1>📦 Order Tracking</h1>
                        <p>Track your orders in real-time</p>
                    </div>
                    {/* Search by Order ID */}
                    <form className="order-search-form" onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search by Order ID..."
                            value={searchId}
                            onChange={e => { setSearchId(e.target.value); setSearchResult(null); }}
                        />
                        <button type="submit">🔍 Track</button>
                    </form>
                </div>

                {searchResult === 'not-found' && (
                    <div className="search-not-found">
                        ❌ Order #{searchId} not found in your orders.
                    </div>
                )}

                {loading ? <TrackingSkeleton /> :

                orders.length === 0 ? (
                    <div className="no-orders">
                        <div className="no-orders-icon">📦</div>
                        <h3>No orders yet!</h3>
                        <p>Place an order to track it here.</p>
                        <button onClick={() => navigate('/')}>🛍️ Start Shopping</button>
                    </div>
                ) : (
                    <div className="tracking-layout">

                        {/* ── LEFT: ORDERS LIST ── */}
                        <div className="orders-list-panel">
                            <h3>Your Orders
                                <span className="orders-count">({orders.length})</span>
                            </h3>

                            {orders.map(order => {
                                const status = STATUS_CONFIG[order.status] || STATUS_CONFIG['Confirmed'];
                                return (
                                    <div key={order.id}
                                        className={`order-item-card ${selectedOrder?.id === order.id ? 'active' : ''}`}
                                        onClick={() => handleSelectOrder(order)}>
                                        <div className="order-item-header">
                                            <span className="order-id">#{order.id}</span>
                                            <span className="order-status-chip"
                                                style={{ color: status.color, background: status.bg }}>
                                                {status.icon} {order.status || 'Processing'}
                                            </span>
                                        </div>
                                        <p className="order-amount">
                                            ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                                        </p>
                                        <p className="order-date">🗓️ {formatDate(order.orderedAt)}</p>
                                        {selectedOrder?.id === order.id && (
                                            <div className="active-indicator">Currently Viewing</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── RIGHT: TRACKING DETAILS ── */}
                        <div className="tracking-details-panel">
                            {trackingLoading ? (
                                <div className="tracking-inner-loading">
                                    <div className="track-spinner" />
                                    <p>Loading tracking info...</p>
                                </div>
                            ) : tracking ? (
                                <>
                                    {/* Info Bar */}
                                    <div className="tracking-info-bar">
                                        <div className="info-bar-item">
                                            <span className="info-label">🔢 Tracking Number</span>
                                            <span className="info-value tracking-num">
                                                {tracking.trackingNumber || `TRK${selectedOrder?.id}${Date.now().toString().slice(-6)}`}
                                            </span>
                                        </div>
                                        <div className="info-bar-item">
                                            <span className="info-label">📅 Estimated Delivery</span>
                                            <span className="info-value green">
                                                {tracking.estimatedDelivery || '3–5 Business Days'}
                                            </span>
                                        </div>
                                        <div className="info-bar-item">
                                            <span className="info-label">📍 Current Status</span>
                                            <span className="info-value blue">
                                                {tracking.currentStatus || selectedOrder?.status || 'Processing'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Info */}
                                    <div className="order-detail-strip">
                                        <div className="detail-chip">
                                            <span>🏠</span>
                                            <span>{selectedOrder?.address}, {selectedOrder?.city} — {selectedOrder?.pincode}</span>
                                        </div>
                                        <div className="detail-chip">
                                            <span>💳</span>
                                            <span>{selectedOrder?.paymentMethod?.toUpperCase()}</span>
                                        </div>
                                        <div className="detail-chip">
                                            <span>💰</span>
                                            <span>₹{Number(selectedOrder?.totalAmount).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="timeline-title">Shipment Timeline</div>
                                    <div className="tracking-timeline">
                                        {tracking.stages?.map((stage, index) => (
                                            <div key={index}
                                                className={`timeline-step
                                                    ${stage.completed ? 'completed' : ''}
                                                    ${stage.current ? 'current' : ''}`}>
                                                <div className="step-left">
                                                    <div className="step-icon">{stage.icon}</div>
                                                    {index < tracking.stages.length - 1 && (
                                                        <div className={`step-line ${stage.completed ? 'filled' : ''}`} />
                                                    )}
                                                </div>
                                                <div className="step-content">
                                                    <p className="step-status">{stage.status}</p>
                                                    <p className="step-date">{stage.date}</p>
                                                    {stage.current && (
                                                        <span className="current-badge">
                                                            <span className="pulse-dot" /> Current Location
                                                        </span>
                                                    )}
                                                    {stage.description && (
                                                        <p className="step-desc">{stage.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="tracking-actions">
                                        <button className="action-btn primary"
                                            onClick={() => navigate('/orders')}>
                                            📋 {t.orders || 'My Orders'}
                                        </button>
                                        <button className="action-btn secondary"
                                            onClick={() => navigate('/')}>
                                            🛍️ Continue Shopping
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="select-order-msg">
                                    <div className="select-icon">👈</div>
                                    <p>Select an order from the left to track it</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default OrderTracking;





