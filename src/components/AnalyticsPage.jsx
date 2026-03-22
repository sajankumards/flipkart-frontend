import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './AnalyticsPage.css';

const ADMIN_TOKEN = 'admin123';
const headers = { 'Admin-Token': ADMIN_TOKEN };

const COLORS = ['#2874f0', '#ff9f00', '#388e3c', '#d32f2f', '#7b1fa2', '#0097a7'];

const AnalyticsPage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) { navigate('/admin'); return; }
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsRes, ordersRes, productsRes] = await Promise.all([
                fetch('process.env.REACT_APP_API_URL || '(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')'/admin/stats', { headers }),
                fetch('process.env.REACT_APP_API_URL || '(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')'/admin/orders', { headers }),
                fetch('process.env.REACT_APP_API_URL || '(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')'/admin/products', { headers }),
            ]);
            const [statsData, ordersData, productsData] = await Promise.all([
                statsRes.json(), ordersRes.json(), productsRes.json()
            ]);

            if (statsData.success) setStats(statsData.stats);
            if (ordersData.success) setOrders(ordersData.orders);
            if (productsData.success) setProducts(productsData.products);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    // Revenue by day (last 7 days)
    const getRevenueData = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayStr = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
            const dayOrders = orders.filter(o => {
                const orderDate = new Date(o.orderedAt);
                return orderDate.toDateString() === date.toDateString();
            });
            days.push({
                day: dayStr,
                revenue: Math.round(dayOrders.reduce((sum, o) => sum + o.totalAmount, 0)),
                orders: dayOrders.length
            });
        }
        return days;
    };

    // Category distribution
    const getCategoryData = () => {
        const catMap = {};
        products.forEach(p => {
            const cat = p.category || 'Other';
            catMap[cat] = (catMap[cat] || 0) + 1;
        });
        return Object.entries(catMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([name, value]) => ({ name, value }));
    };

    // Order status distribution
    const getStatusData = () => {
        const statusMap = {};
        orders.forEach(o => {
            const status = o.status || 'Unknown';
            statusMap[status] = (statusMap[status] || 0) + 1;
        });
        return Object.entries(statusMap).map(([name, value]) => ({ name, value }));
    };

    // Top products by price
    const getTopProducts = () => {
        return [...products].sort((a, b) => b.price - a.price).slice(0, 5).map(p => ({
            name: p.name?.substring(0, 20) + '...',
            price: p.price,
            rating: p.rating
        }));
    };

    // Payment method distribution
    const getPaymentData = () => {
        const payMap = {};
        orders.forEach(o => {
            const method = o.paymentMethod || 'Unknown';
            payMap[method] = (payMap[method] || 0) + 1;
        });
        return Object.entries(payMap).map(([name, value]) => ({ name, value }));
    };

    if (loading) return (
        <div className="analytics-loading">
            <div className="analytics-spinner"></div>
            <p>Loading Analytics... 📊</p>
        </div>
    );

    const revenueData = getRevenueData();
    const categoryData = getCategoryData();
    const statusData = getStatusData();
    const topProducts = getTopProducts();
    const paymentData = getPaymentData();

    return (
        <div className="analytics-page">
            {/* Header */}
            <div className="analytics-header">
                <div className="analytics-header-left">
                    <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
                        ← Back to Dashboard
                    </button>
                    <h1>📊 Analytics & Reports</h1>
                </div>
                <span className="last-updated">
                    Last updated: {new Date().toLocaleTimeString('en-IN')}
                </span>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                {[
                    { label: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString()}`, icon: '💰', change: '+12%', up: true },
                    { label: 'Total Orders', value: stats?.totalOrders, icon: '🛒', change: '+8%', up: true },
                    { label: 'Total Products', value: stats?.totalProducts, icon: '📦', change: '+5%', up: true },
                    { label: 'Total Users', value: stats?.totalUsers, icon: '👥', change: '+15%', up: true },
                    { label: 'Avg Order Value', value: `₹${orders.length ? Math.round(stats?.totalRevenue / stats?.totalOrders) : 0}`, icon: '📈', change: '+3%', up: true },
                    { label: 'Pending Orders', value: stats?.pendingOrders, icon: '⏳', change: '-2%', up: false },
                ].map(kpi => (
                    <div key={kpi.label} className="kpi-card">
                        <div className="kpi-icon">{kpi.icon}</div>
                        <div className="kpi-info">
                            <p className="kpi-value">{kpi.value}</p>
                            <p className="kpi-label">{kpi.label}</p>
                        </div>
                        <span className={`kpi-change ${kpi.up ? 'up' : 'down'}`}>
                            {kpi.up ? '↑' : '↓'} {kpi.change}
                        </span>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="charts-row">
                {/* Revenue Line Chart */}
                <div className="chart-card wide">
                    <h3>📈 Revenue (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(val) => [`₹${val}`, 'Revenue']} />
                            <Legend />
                            <Line type="monotone" dataKey="revenue"
                                stroke="#2874f0" strokeWidth={2}
                                dot={{ fill: '#2874f0', r: 4 }}
                                activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="orders"
                                stroke="#ff9f00" strokeWidth={2}
                                dot={{ fill: '#ff9f00', r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Order Status Pie */}
                <div className="chart-card">
                    <h3>🛒 Order Status</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={statusData} cx="50%" cy="50%"
                                outerRadius={80} dataKey="value"
                                label={({ name, percent }) =>
                                    `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}>
                                {statusData.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="charts-row">
                {/* Category Bar Chart */}
                <div className="chart-card wide">
                    <h3>📦 Products by Category</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={categoryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }}
                                angle={-20} textAnchor="end" height={50} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="value" radius={[4,4,0,0]}>
                                {categoryData.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Payment Pie */}
                <div className="chart-card">
                    <h3>💳 Payment Methods</h3>
                    {paymentData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={paymentData} cx="50%" cy="50%"
                                    innerRadius={50} outerRadius={80}
                                    dataKey="value" paddingAngle={3}>
                                    {paymentData.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="no-data">No orders yet</div>
                    )}
                </div>
            </div>

            {/* Top Products Table */}
            <div className="chart-card full">
                <h3>🏆 Top 5 Products by Price</h3>
                <table className="analytics-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Rating</th>
                            <th>Price Bar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topProducts.map((p, i) => (
                            <tr key={i}>
                                <td>
                                    <span className="rank-badge">
                                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                                    </span>
                                </td>
                                <td>{p.name}</td>
                                <td className="price-col">₹{p.price?.toLocaleString()}</td>
                                <td>⭐ {p.rating}</td>
                                <td>
                                    <div className="price-bar-wrap">
                                        <div className="price-bar"
                                            style={{ width: `${(p.price / topProducts[0].price) * 100}%` }}>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AnalyticsPage;


