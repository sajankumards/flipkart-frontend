import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './Toast';
import './AdminDashboard.css';

// ===== CONSTANTS & CONFIG =====
const API_BASE_URL = process.env.REACT_APP_API_URL || 'process.env.REACT_APP_API_URL || '$env:REACT_APP_API_URL'';
const ADMIN_TOKEN = 'admin123';

const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Admin-Token': ADMIN_TOKEN
};

const TABS = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', color: '#2874f0' },
    { id: 'products', icon: '📦', label: 'Products', color: '#388e3c' },
    { id: 'orders', icon: '🛒', label: 'Orders', color: '#f57c00' },
    { id: 'users', icon: '👥', label: 'Users', color: '#7b1fa2' },
];

const ORDER_STATUSES = [
    'Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'
];

const EMPTY_PRODUCT_FORM = {
    name: '',
    price: '',
    description: '',
    image: '',
    category: '',
    rating: '4.0',
    stock: '10'
};

// ===== MAIN COMPONENT =====
const AdminDashboard = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    // State Management
    const [state, setState] = useState({
        activeTab: 'dashboard',
        stats: null,
        products: [],
        orders: [],
        users: [],
        loading: false,
        error: null,
        searchQuery: '',
        showProductForm: false,
        editingProduct: null,
        productForm: EMPTY_PRODUCT_FORM,
        selectedOrder: null,
        dateRange: 'today'
    });

    // Destructure state
    const {
        activeTab,
        stats,
        products,
        orders,
        users,
        loading,
        error,
        searchQuery,
        showProductForm,
        editingProduct,
        productForm,
        selectedOrder,
        dateRange
    } = state;

    // ===== AUTH CHECK =====
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token || token !== ADMIN_TOKEN) {
            showToast('Please login first! 🔐', 'error');
            navigate('/admin');
            return;
        }
        loadDashboardData();
    }, []);

    // ===== TAB CHANGE EFFECT =====
    useEffect(() => {
        switch (activeTab) {
            case 'products':
                loadProducts();
                break;
            case 'orders':
                loadOrders();
                break;
            case 'users':
                loadUsers();
                break;
            default:
                loadDashboardData();
        }
    }, [activeTab, dateRange]);

    // ===== API HELPER =====
    const fetchAPI = useCallback(async (endpoint, options = {}) => {
        try {
            setState(prev => ({ ...prev, error: null }));
            
            const response = await fetch(`${API_BASE_URL}/admin${endpoint}`, {
                ...options,
                headers: { ...DEFAULT_HEADERS, ...options.headers }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Operation failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            setState(prev => ({ 
                ...prev, 
                error: error.message || 'Something went wrong' 
            }));
            showToast(error.message, 'error');
            throw error;
        }
    }, [showToast]);

    // ===== DATA LOADING FUNCTIONS =====
    const loadDashboardData = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const data = await fetchAPI('/stats');
            setState(prev => ({ 
                ...prev, 
                stats: data.stats,
                loading: false 
            }));
        } catch (error) {
            setState(prev => ({ ...prev, loading: false }));
        }
    }, [fetchAPI]);

    const loadProducts = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const data = await fetchAPI('/products');
            setState(prev => ({ 
                ...prev, 
                products: data.products || [],
                loading: false 
            }));
        } catch (error) {
            setState(prev => ({ ...prev, loading: false }));
        }
    }, [fetchAPI]);

    const loadOrders = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const data = await fetchAPI('/orders');
            setState(prev => ({ 
                ...prev, 
                orders: data.orders || [],
                loading: false 
            }));
        } catch (error) {
            setState(prev => ({ ...prev, loading: false }));
        }
    }, [fetchAPI]);

    const loadUsers = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const data = await fetchAPI('/users');
            setState(prev => ({ 
                ...prev, 
                users: data.users || [],
                loading: false 
            }));
        } catch (error) {
            setState(prev => ({ ...prev, loading: false }));
        }
    }, [fetchAPI]);

    // ===== PRODUCT HANDLERS =====
    const handleProductFormChange = useCallback((field, value) => {
        setState(prev => ({
            ...prev,
            productForm: { ...prev.productForm, [field]: value }
        }));
    }, []);

    const handleAddProduct = useCallback(() => {
        setState(prev => ({
            ...prev,
            editingProduct: null,
            productForm: EMPTY_PRODUCT_FORM,
            showProductForm: true
        }));
    }, []);

    const handleEditProduct = useCallback((product) => {
        setState(prev => ({
            ...prev,
            editingProduct: product,
            productForm: {
                name: product.name || '',
                price: product.price?.toString() || '',
                description: product.description || '',
                image: product.image || '',
                category: product.category || '',
                rating: product.rating?.toString() || '4.0',
                stock: product.stock?.toString() || '10'
            },
            showProductForm: true
        }));
    }, []);

    const handleSaveProduct = useCallback(async () => {
        // Validation
        if (!productForm.name.trim()) {
            showToast('Product name required!', 'error');
            return;
        }
        if (!productForm.price || parseFloat(productForm.price) <= 0) {
            showToast('Valid price required!', 'error');
            return;
        }

        try {
            const url = editingProduct ? `/products/${editingProduct.id}` : '/products';
            const method = editingProduct ? 'PUT' : 'POST';

            const data = await fetchAPI(url, {
                method,
                body: JSON.stringify({
                    ...productForm,
                    price: parseFloat(productForm.price),
                    rating: parseFloat(productForm.rating) || 4.0,
                    stock: parseInt(productForm.stock) || 10
                })
            });

            showToast(
                editingProduct ? 'Product updated! ✏️' : 'Product added! ✅',
                'success'
            );

            setState(prev => ({
                ...prev,
                showProductForm: false,
                editingProduct: null,
                productForm: EMPTY_PRODUCT_FORM
            }));

            loadProducts();

        } catch (error) {
            console.error('Save error:', error);
        }
    }, [productForm, editingProduct, fetchAPI, showToast, loadProducts]);

    const handleDeleteProduct = useCallback(async (id, productName) => {
        if (!window.confirm(`Delete "${productName}"? This cannot be undone!`)) {
            return;
        }

        try {
            await fetchAPI(`/products/${id}`, { method: 'DELETE' });
            showToast('Product deleted! 🗑️', 'success');
            loadProducts();
        } catch (error) {
            console.error('Delete error:', error);
        }
    }, [fetchAPI, showToast, loadProducts]);

    // ===== ORDER HANDLERS =====
    const handleOrderStatusChange = useCallback(async (orderId, newStatus) => {
        try {
            await fetchAPI(`/orders/${orderId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
            showToast('Order status updated! 📦', 'success');
            loadOrders();
        } catch (error) {
            console.error('Status update error:', error);
        }
    }, [fetchAPI, showToast, loadOrders]);

    const handleViewOrderDetails = useCallback((order) => {
        setState(prev => ({ ...prev, selectedOrder: order }));
    }, []);

    // ===== LOGOUT =====
    const handleLogout = useCallback(() => {
        localStorage.removeItem('adminToken');
        showToast('Logged out successfully! 👋', 'info');
        navigate('/admin');
    }, [navigate, showToast]);

    // ===== FILTERED DATA =====
    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return products;
        const query = searchQuery.toLowerCase();
        return products.filter(p =>
            p.name?.toLowerCase().includes(query) ||
            p.category?.toLowerCase().includes(query)
        );
    }, [products, searchQuery]);

    const pendingOrders = useMemo(() => 
        orders.filter(o => o.status === 'Pending' || o.status === 'Confirmed').length,
    [orders]);

    // ===== RENDER METHODS =====
    const renderStats = () => {
        if (!stats) return null;

        const statCards = [
            { label: 'Total Products', value: stats.totalProducts, icon: '📦', color: '#2874f0' },
            { label: 'Total Orders', value: stats.totalOrders, icon: '🛒', color: '#388e3c' },
            { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#f57c00' },
            { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: '#7b1fa2' },
            { label: 'Pending Orders', value: pendingOrders, icon: '⏳', color: '#d32f2f' },
        ];

        return (
            <div className="stats-grid">
                {statCards.map(stat => (
                    <div key={stat.label} className="stat-card">
                        <div className="stat-icon-wrapper" style={{ background: stat.color + '20' }}>
                            <span className="stat-icon" style={{ color: stat.color }}>{stat.icon}</span>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderProductForm = () => {
        if (!showProductForm) return null;

        return (
            <div className="modal-overlay" onClick={() => setState(prev => ({ ...prev, showProductForm: false }))}>
                <div className="modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>{editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
                        <button className="modal-close" onClick={() => setState(prev => ({ ...prev, showProductForm: false }))}>
                            ✕
                        </button>
                    </div>

                    <div className="modal-body">
                        <div className="form-grid">
                            {[
                                { key: 'name', label: 'Product Name', placeholder: 'Enter product name', required: true },
                                { key: 'price', label: 'Price (₹)', placeholder: '999.99', type: 'number', required: true },
                                { key: 'category', label: 'Category', placeholder: 'electronics', required: true },
                                { key: 'rating', label: 'Rating (1-5)', placeholder: '4.5', type: 'number', min: 1, max: 5 },
                                { key: 'stock', label: 'Stock Quantity', placeholder: '10', type: 'number', min: 0 },
                                { key: 'image', label: 'Image URL', placeholder: 'https://...', full: true },
                            ].map(field => (
                                <div key={field.key} className={`form-group ${field.full ? 'full' : ''}`}>
                                    <label>
                                        {field.label}
                                        {field.required && <span className="required">*</span>}
                                    </label>
                                    <input
                                        type={field.type || 'text'}
                                        placeholder={field.placeholder}
                                        value={productForm[field.key] || ''}
                                        onChange={(e) => handleProductFormChange(field.key, e.target.value)}
                                        min={field.min}
                                        max={field.max}
                                        required={field.required}
                                    />
                                </div>
                            ))}

                            <div className="form-group full">
                                <label>Description</label>
                                <textarea
                                    placeholder="Product description..."
                                    value={productForm.description}
                                    onChange={(e) => handleProductFormChange('description', e.target.value)}
                                    rows="4"
                                />
                            </div>
                        </div>

                        {productForm.image && (
                            <div className="image-preview">
                                <img 
                                    src={productForm.image} 
                                    alt="Preview" 
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/200?text=Invalid+Image'}
                                />
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button className="btn-primary" onClick={handleSaveProduct}>
                            {editingProduct ? '✏️ Update Product' : '✅ Save Product'}
                        </button>
                        <button className="btn-secondary" onClick={() => setState(prev => ({ ...prev, showProductForm: false }))}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderProducts = () => (
        <div className="tab-content">
            <div className="tab-toolbar">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search products by name or category..."
                        value={searchQuery}
                        onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                    />
                </div>
                <button className="btn-primary" onClick={handleAddProduct}>
                    ➕ Add Product
                </button>
            </div>

            {renderProductForm()}

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading products...</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Image</th>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Rating</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="empty-state">
                                        {searchQuery ? 'No products match your search' : 'No products found'}
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map(product => (
                                    <tr key={product.id}>
                                        <td>#{product.id}</td>
                                        <td>
                                            <img 
                                                src={product.image} 
                                                alt={product.name}
                                                className="table-product-img"
                                                onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                                            />
                                        </td>
                                        <td className="product-name-cell">{product.name}</td>
                                        <td>
                                            <span className="category-tag">{product.category}</span>
                                        </td>
                                        <td className="price-cell">₹{product.price?.toLocaleString()}</td>
                                        <td>
                                            <span className="rating-badge">⭐ {product.rating || 4.0}</span>
                                        </td>
                                        <td>
                                            <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                                {product.stock || 10}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    className="btn-icon edit" 
                                                    onClick={() => handleEditProduct(product)}
                                                    title="Edit product"
                                                >
                                                    ✏️
                                                </button>
                                                <button 
                                                    className="btn-icon delete" 
                                                    onClick={() => handleDeleteProduct(product.id, product.name)}
                                                    title="Delete product"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    
                    <div className="table-footer">
                        <span>Showing {filteredProducts.length} of {products.length} products</span>
                    </div>
                </div>
            )}
        </div>
    );

    const renderOrders = () => (
        <div className="tab-content">
            <div className="tab-toolbar">
                <h3>📋 Order Management</h3>
                <select 
                    value={dateRange}
                    onChange={(e) => setState(prev => ({ ...prev, dateRange: e.target.value }))}
                    className="date-filter"
                >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="all">All Orders</option>
                </select>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading orders...</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="empty-state">No orders found</td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>
                                        <td>
                                            <div className="customer-info">
                                                <span className="customer-name">{order.userName || `User #${order.userId}`}</span>
                                                <small>{order.email}</small>
                                            </div>
                                        </td>
                                        <td>{order.items || 1} items</td>
                                        <td className="price-cell">₹{order.totalAmount?.toLocaleString()}</td>
                                        <td>{order.paymentMethod || 'COD'}</td>
                                        <td>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                                                className={`status-select status-${order.status?.toLowerCase()}`}
                                            >
                                                {ORDER_STATUSES.map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button 
                                                className="btn-icon view"
                                                onClick={() => handleViewOrderDetails(order)}
                                                title="View details"
                                            >
                                                👁️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const renderUsers = () => (
        <div className="tab-content">
            <div className="tab-toolbar">
                <h3>👥 User Management</h3>
                <input
                    type="text"
                    placeholder="Search users..."
                    className="search-input"
                />
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading users...</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>User</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Orders</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-state">No users found</td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id}>
                                        <td>#{user.id}</td>
                                        <td>
                                            <div className="user-info">
                                                <span className="user-avatar">👤</span>
                                                <span>{user.name}</span>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>{user.phone || '—'}</td>
                                        <td>{user.orderCount || 0}</td>
                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    // ===== MAIN RENDER =====
    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="brand">
                        <span className="brand-icon">🛒</span>
                        <div className="brand-text">
                            <h2>Flipkart</h2>
                            <p>Admin Panel</p>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setState(prev => ({ ...prev, activeTab: tab.id }))}
                        >
                            <span className="nav-icon">{tab.icon}</span>
                            <span className="nav-label">{tab.label}</span>
                            {tab.id === 'orders' && pendingOrders > 0 && (
                                <span className="nav-badge">{pendingOrders}</span>
                            )}
                        </button>
                    ))}
                    
                    <button
                        className="nav-item"
                        onClick={() => navigate('/admin/analytics')}
                    >
                        <span className="nav-icon">📈</span>
                        <span className="nav-label">Analytics</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-item" onClick={() => navigate('/')}>
                        <span className="nav-icon">🏠</span>
                        <span className="nav-label">View Store</span>
                    </button>
                    <button className="nav-item logout" onClick={handleLogout}>
                        <span className="nav-icon">🚪</span>
                        <span className="nav-label">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {/* Top Bar */}
                <div className="top-bar">
                    <h1>
                        {TABS.find(t => t.id === activeTab)?.icon}{' '}
                        {TABS.find(t => t.id === activeTab)?.label}
                    </h1>
                    <div className="top-bar-actions">
                        <span className="admin-badge">
                            <span className="badge-dot"></span>
                            Admin
                        </span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="content-area">
                    {error && (
                        <div className="error-banner">
                            <span>⚠️</span>
                            <p>{error}</p>
                            <button onClick={() => setState(prev => ({ ...prev, error: null }))}>✕</button>
                        </div>
                    )}

                    {activeTab === 'dashboard' && (
                        <div className="dashboard-content">
                            {renderStats()}
                            
                            <div className="quick-actions">
                                <h3>Quick Actions</h3>
                                <div className="action-grid">
                                    <button onClick={() => setState(prev => ({ ...prev, activeTab: 'products' }))}>
                                        <span className="action-icon">📦</span>
                                        <span>Manage Products</span>
                                    </button>
                                    <button onClick={() => setState(prev => ({ ...prev, activeTab: 'orders' }))}>
                                        <span className="action-icon">🛒</span>
                                        <span>Manage Orders</span>
                                    </button>
                                    <button onClick={() => setState(prev => ({ ...prev, activeTab: 'users' }))}>
                                        <span className="action-icon">👥</span>
                                        <span>View Users</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && renderProducts()}
                    {activeTab === 'orders' && renderOrders()}
                    {activeTab === 'users' && renderUsers()}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;

