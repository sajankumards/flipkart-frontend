import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import InvoiceGenerator from './InvoiceGenerator';
import { useTranslation } from './LanguageSelector';
import './OrderHistory.css';

// ── SKELETON ──
const OrderSkeleton = () => (
    <div className="orders-skeleton">
        {[1, 2, 3].map(i => (
            <div key={i} className="order-skel-card">
                <div className="order-skel-header">
                    <div className="skel skel-line w40" />
                    <div className="skel skel-badge" />
                </div>
                <div className="order-skel-body">
                    <div className="skel skel-line w70" />
                    <div className="skel skel-line w50" />
                    <div className="skel skel-line w60" />
                </div>
                <div className="order-skel-footer">
                    <div className="skel skel-line w30" />
                    <div className="skel skel-btn" />
                </div>
            </div>
        ))}
    </div>
);

// ── STATUS CONFIG ──
const STATUS_CONFIG = {
    'Confirmed': { color: '#2874f0', bg: '#e8f0ff', icon: '✅' },
    'Processing': { color: '#ff9f00', bg: '#fff8e6', icon: '⏳' },
    'Shipped':   { color: '#7b1fa2', bg: '#f3e5f5', icon: '🚚' },
    'Delivered': { color: '#388e3c', bg: '#e8f5e9', icon: '📦' },
    'Cancelled': { color: '#d32f2f', bg: '#ffebee', icon: '❌' },
};

const OrderHistory = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [expandedId, setExpandedId] = useState(null);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')/orders/user/${user.userId}`);
            const data = await res.json();
            if (data.success) setOrders(data.orders);
        } catch (error) {
            console.log('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Recently Placed';
        const date = new Date(dateStr);
        if (isNaN(date)) return 'Recently Placed';
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const filters = ['All', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

    const filteredOrders = filter === 'All'
        ? orders
        : orders.filter(o => o.status === filter);

    return (
        <div className="order-history-page">
            <Navbar />

            <div className="order-history-container">

                {/* ── HEADER ── */}
                <div className="oh-header">
                    <div>
                        <h2>📦 {t.orders || 'My Orders'}
                            <span className="oh-count">({orders.length})</span>
                        </h2>
                        <p className="oh-subtitle">Track, manage and review your orders</p>
                    </div>
                    <button className="oh-shop-btn" onClick={() => navigate('/')}>
                        🛍️ Continue Shopping
                    </button>
                </div>

                {/* ── FILTER TABS ── */}
                {!loading && orders.length > 0 && (
                    <div className="oh-filters">
                        {filters.map(f => (
                            <button
                                key={f}
                                className={`oh-filter-btn ${filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f)}>
                                {f === 'All' ? `All (${orders.length})` : (
                                    <>
                                        {STATUS_CONFIG[f]?.icon} {f}
                                        <span className="filter-count">
                                            ({orders.filter(o => o.status === f).length})
                                        </span>
                                    </>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── LOADING ── */}
                {loading ? <OrderSkeleton /> :

                /* ── EMPTY ── */
                orders.length === 0 ? (
                    <div className="empty-orders">
                        <div className="empty-orders-icon">📦</div>
                        <h3>No orders yet!</h3>
                        <p>Start shopping to see your orders here.</p>
                        <button onClick={() => navigate('/')}>
                            🛍️ Start Shopping
                        </button>
                        <div className="empty-orders-links">
                            <span onClick={() => navigate('/wishlist')}>❤️ {t.wishlist || 'Wishlist'}</span>
                            <span onClick={() => navigate('/cart')}>🛒 {t.cart || 'Cart'}</span>
                        </div>
                    </div>

                ) : filteredOrders.length === 0 ? (
                    <div className="empty-filter">
                        <p>No {filter} orders found.</p>
                        <button onClick={() => setFilter('All')}>View All Orders</button>
                    </div>

                ) : (
                    /* ── ORDERS LIST ── */
                    <div className="orders-list">
                        {filteredOrders.map(order => {
                            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG['Confirmed'];
                            const isExpanded = expandedId === order.id;

                            return (
                                <div key={order.id} className="order-card">

                                    {/* ── ORDER HEADER ── */}
                                    <div className="order-header"
                                        onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                                        <div className="order-header-left">
                                            <div className="order-id-row">
                                                <span className="order-num">Order #{order.id}</span>
                                                <span className="order-date">🗓️ {formatDate(order.orderedAt)}</span>
                                            </div>
                                            <div className="order-payment-method">
                                                💳 {order.paymentMethod?.toUpperCase() || 'ONLINE'}
                                            </div>
                                        </div>

                                        <div className="order-header-right">
                                            <span className="order-status-badge"
                                                style={{ color: status.color, background: status.bg }}>
                                                {status.icon} {order.status}
                                            </span>
                                            <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
                                        </div>
                                    </div>

                                    {/* ── ORDER BODY ── */}
                                    <div className="order-body">
                                        <div className="order-info-grid">
                                            <div className="order-info-item">
                                                <span className="info-label">📍 Shipping Address</span>
                                                <span className="info-value">
                                                    {order.address}, {order.city} - {order.pincode}
                                                </span>
                                            </div>
                                            <div className="order-info-item">
                                                <span className="info-label">📞 Phone</span>
                                                <span className="info-value">{order.phone || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="order-amount-block">
                                            <span className="amount-label">Total Amount</span>
                                            <span className="amount-value">
                                                ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* ── PROGRESS TRACKER ── */}
                                    <div className="order-progress">
                                        {['Confirmed', 'Processing', 'Shipped', 'Delivered'].map((step, idx) => {
                                            const steps = ['Confirmed', 'Processing', 'Shipped', 'Delivered'];
                                            const currentIdx = steps.indexOf(order.status);
                                            const isDone = idx <= currentIdx;
                                            const isCancelled = order.status === 'Cancelled';

                                            return (
                                                <React.Fragment key={step}>
                                                    <div className={`progress-step ${isDone && !isCancelled ? 'done' : ''} ${isCancelled ? 'cancelled' : ''}`}>
                                                        <div className="progress-dot">
                                                            {isDone && !isCancelled ? '✓' : idx + 1}
                                                        </div>
                                                        <span>{step}</span>
                                                    </div>
                                                    {idx < 3 && (
                                                        <div className={`progress-line ${idx < currentIdx && !isCancelled ? 'done' : ''}`} />
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>

                                    {/* ── EXPANDED DETAILS ── */}
                                    {isExpanded && (
                                        <div className="order-expanded">
                                            <div className="expanded-grid">
                                                <div className="expanded-item">
                                                    <span className="exp-label">Transaction ID</span>
                                                    <span className="exp-value mono">
                                                        TXN{order.id}{Date.now().toString().slice(-6)}
                                                    </span>
                                                </div>
                                                <div className="expanded-item">
                                                    <span className="exp-label">Order Placed</span>
                                                    <span className="exp-value">{formatDate(order.orderedAt)}</span>
                                                </div>
                                                <div className="expanded-item">
                                                    <span className="exp-label">Payment Status</span>
                                                    <span className="exp-value green">✅ Paid</span>
                                                </div>
                                                <div className="expanded-item">
                                                    <span className="exp-label">Est. Delivery</span>
                                                    <span className="exp-value">3–5 Business Days</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── ORDER FOOTER ── */}
                                    <div className="order-footer">
                                        <span className="delivery-est">
                                            🚚 {t.freeDelivery || 'Free Delivery'} • Est. 3–5 Business Days
                                        </span>
                                        <div className="order-actions">
                                            <button className="track-btn"
                                                onClick={() => navigate('/track-order')}>
                                                📍 Track Order
                                            </button>
                                            <InvoiceGenerator order={order} user={user} />
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default OrderHistory;





