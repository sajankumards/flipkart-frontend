import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useToast } from './Toast';
import { useTranslation } from './LanguageSelector';
import './CartPage.css';

// ── CART SKELETON ──
const CartSkeleton = () => (
    <div className="cart-skeleton">
        {[1, 2, 3].map(i => (
            <div key={i} className="cart-skeleton-item">
                <div className="skel skel-img" />
                <div className="cart-skeleton-info">
                    <div className="skel skel-line w80" />
                    <div className="skel skel-line w50" />
                    <div className="skel skel-line w60" />
                    <div className="skel skel-btn" />
                </div>
            </div>
        ))}
    </div>
);

const CartPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { t } = useTranslation();

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [finalAmount, setFinalAmount] = useState(0);
    const [couponApplied, setCouponApplied] = useState(false);
    const [removingId, setRemovingId] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => { fetchCartAndProducts(); }, []);

    const fetchCartAndProducts = async () => {
        try {
            const [cartRes, productsRes] = await Promise.all([
                fetch('process.env.REACT_APP_API_URL || '$env:REACT_APP_API_URL'/cart'),
                fetch('process.env.REACT_APP_API_URL || '$env:REACT_APP_API_URL'/products')
            ]);
            const cartData = await cartRes.json();
            const productsData = await productsRes.json();
            const enrichedItems = cartData.items.map(item => {
                const product = productsData.find(p => p.id === item.productId);
                return { ...item, product };
            }).filter(item => item.product);
            setCartItems(enrichedItems);
            const sum = parseFloat(enrichedItems.reduce((acc, item) =>
                acc + (item.product.price * item.quantity), 0).toFixed(2));
            setTotal(sum);
            setFinalAmount(sum);
        } catch (error) {
            showToast('Failed to load cart!', 'error');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = (items) => {
        const sum = parseFloat(items.reduce((acc, item) =>
            acc + (item.product.price * item.quantity), 0).toFixed(2));
        setTotal(sum);
        setFinalAmount(couponApplied ? sum - discount : sum);
    };

    const updateQuantity = async (productId, newQty) => {
        if (newQty < 1) return;
        setUpdatingId(productId);
        try {
            await fetch(`process.env.REACT_APP_API_URL || '$env:REACT_APP_API_URL'/cart/${productId}?quantity=${newQty}`, { method: 'PUT' });
            const updated = cartItems.map(item =>
                item.productId === productId ? { ...item, quantity: newQty } : item);
            setCartItems(updated);
            calculateTotal(updated);
        } catch (error) {
            showToast('Failed to update quantity!', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const removeItem = async (productId) => {
        setRemovingId(productId);
        try {
            await fetch(`process.env.REACT_APP_API_URL || '$env:REACT_APP_API_URL'/cart/${productId}`, { method: 'DELETE' });
            const updated = cartItems.filter(item => item.productId !== productId);
            setCartItems(updated);
            calculateTotal(updated);
            showToast('Item removed! 🗑️', 'success');
        } catch (error) {
            showToast('Failed to remove item!', 'error');
        } finally {
            setRemovingId(null);
        }
    };

    const clearCart = async () => {
        if (!window.confirm('Cart clear karna hai?')) return;
        try {
            await fetch('process.env.REACT_APP_API_URL || '$env:REACT_APP_API_URL'/cart/clear', { method: 'DELETE' });
            setCartItems([]);
            setTotal(0); setFinalAmount(0); setDiscount(0); setCouponApplied(false);
            showToast('Cart cleared! 🗑️', 'success');
        } catch (error) {
            showToast('Failed to clear cart!', 'error');
        }
    };

    const applyCoupon = async () => {
        if (!couponCode.trim()) { showToast('Coupon code daalo!', 'warning'); return; }
        try {
            const res = await fetch('process.env.REACT_APP_API_URL || '$env:REACT_APP_API_URL'/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode, orderAmount: total })
            });
            const data = await res.json();
            if (data.success) {
                setDiscount(data.discount);
                setFinalAmount(data.finalAmount);
                setCouponApplied(true);
                showToast(data.message, 'success');
            } else {
                showToast(data.message, 'error');
            }
        } catch (error) {
            showToast('Error applying coupon!', 'error');
        }
    };

    const removeCoupon = () => {
        setDiscount(0); setFinalAmount(total);
        setCouponApplied(false); setCouponCode('');
        showToast('Coupon removed!', 'info');
    };

    const deliveryCharge = total > 500 ? 0 : 40;
    const grandTotal = (finalAmount + deliveryCharge).toFixed(2);
    const progressPercent = Math.min((total / 500) * 100, 100);

    return (
        <div className="cart-page">
            <Navbar cartCount={cartItems.length} />

            <div className="cart-container">

                {/* ── BREADCRUMB ── */}
                <div className="cart-breadcrumb">
                    <span onClick={() => navigate('/')}>🏠 {t.home || 'Home'}</span>
                    <span className="bc-sep"> › </span>
                    <span className="active">{t.cart || 'My Cart'}</span>
                </div>

                {/* ── HEADER ── */}
                <div className="cart-header-row">
                    <h2>🛒 {t.cart || 'My Cart'}
                        <span className="item-count">({cartItems.length} items)</span>
                    </h2>
                    {cartItems.length > 0 && (
                        <button className="clear-cart-btn" onClick={clearCart}>
                            🗑️ Clear Cart
                        </button>
                    )}
                </div>

                {/* ── LOADING ── */}
                {loading ? (
                    <CartSkeleton />
                ) : cartItems.length === 0 ? (

                    /* ── EMPTY CART ── */
                    <div className="empty-cart">
                        <div className="empty-cart-icon">🛒</div>
                        <h3>Your cart is empty!</h3>
                        <p>Add your favourite products and enjoy great deals</p>
                        <button onClick={() => navigate('/')}>
                            🛍️ Start Shopping
                        </button>
                        <div className="empty-cart-links">
                            <span onClick={() => navigate('/wishlist')}>❤️ {t.wishlist || 'Wishlist'}</span>
                            <span onClick={() => navigate('/orders')}>📦 {t.orders || 'My Orders'}</span>
                        </div>
                    </div>

                ) : (
                    <div className="cart-layout">

                        {/* ── LEFT: CART ITEMS ── */}
                        <div className="cart-items-section">

                            {/* Free Delivery Progress */}
                            <div className={`delivery-banner ${deliveryCharge === 0 ? 'success' : 'info'}`}>
                                {deliveryCharge === 0 ? (
                                    <span>🎉 {t.freeDelivery || 'Free Delivery'} unlocked on this order!</span>
                                ) : (
                                    <div className="delivery-progress-wrap">
                                        <span>🚚 Add ₹{(500 - total).toFixed(0)} more for {t.freeDelivery || 'Free Delivery'}</span>
                                        <div className="delivery-progress-bar">
                                            <div className="delivery-progress-fill"
                                                style={{ width: `${progressPercent}%` }} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Cart Items */}
                            {cartItems.map(item => (
                                <div key={item.productId}
                                    className={`cart-item ${removingId === item.productId ? 'removing' : ''}`}>

                                    {/* Image */}
                                    <div className="cart-item-img"
                                        onClick={() => navigate(`/product/${item.productId}`)}>
                                        <img src={item.product.image} alt={item.product.name}
                                            onError={e => e.target.src = 'https://via.placeholder.com/120'} />
                                    </div>

                                    {/* Details */}
                                    <div className="cart-item-details">
                                        <h4 onClick={() => navigate(`/product/${item.productId}`)}>
                                            {item.product.name}
                                        </h4>

                                        <span className="cart-item-category">{item.product.category}</span>

                                        <div className="cart-item-rating">
                                            ⭐ {item.product.rating}
                                            <span className="rating-sep">•</span>
                                            <span className="rating-label">Verified Product</span>
                                        </div>

                                        {/* Offers */}
                                        <div className="cart-item-offers">
                                            <span>✅ {t.freeDelivery || 'Free Delivery'}</span>
                                            <span>↩️ {t.returnPolicy || '7 Day Return'}</span>
                                            <span>🛡️ 1 Year Warranty</span>
                                        </div>

                                        {/* Bottom Row */}
                                        <div className="cart-item-bottom">
                                            <div className="qty-price-row">
                                                {/* Quantity */}
                                                <div className={`quantity-control ${updatingId === item.productId ? 'updating' : ''}`}>
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                        disabled={item.quantity <= 1 || updatingId === item.productId}>
                                                        −
                                                    </button>
                                                    <span>{updatingId === item.productId ? '...' : item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                        disabled={updatingId === item.productId}>
                                                        +
                                                    </button>
                                                </div>

                                                {/* Price */}
                                                <div className="item-pricing">
                                                    <span className="item-unit-price">
                                                        ₹{item.product.price?.toLocaleString()} × {item.quantity}
                                                    </span>
                                                    <span className="item-total-price">
                                                        ₹{(item.product.price * item.quantity).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="cart-item-actions">
                                                <button className="save-later-btn"
                                                    onClick={() => navigate(`/product/${item.productId}`)}>
                                                    💾 Save for Later
                                                </button>
                                                <button
                                                    className={`remove-item-btn ${removingId === item.productId ? 'loading' : ''}`}
                                                    onClick={() => removeItem(item.productId)}
                                                    disabled={removingId === item.productId}>
                                                    {removingId === item.productId ? '⏳ Removing...' : '🗑️ Remove'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── RIGHT: PRICE SUMMARY ── */}
                        <div className="price-summary">

                            {/* Coupon Card */}
                            <div className="coupon-card">
                                <h4>🎟️ Apply Coupon</h4>
                                <div className="coupon-chips">
                                    {['SAVE10', 'SAVE20', 'SAVE30', 'FLIPKART50'].map(code => (
                                        <span key={code}
                                            className={`coupon-chip ${couponApplied && couponCode === code ? 'applied' : ''}`}
                                            onClick={() => !couponApplied && setCouponCode(code)}>
                                            {code}
                                        </span>
                                    ))}
                                </div>
                                {!couponApplied ? (
                                    <div className="coupon-input-row">
                                        <input
                                            type="text"
                                            placeholder="Enter coupon code"
                                            value={couponCode}
                                            onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                            onKeyPress={e => e.key === 'Enter' && applyCoupon()}
                                        />
                                        <button onClick={applyCoupon}>Apply</button>
                                    </div>
                                ) : (
                                    <div className="coupon-applied-row">
                                        <div className="coupon-success">
                                            <span>✅ {couponCode}</span>
                                            <span className="coupon-saved">₹{discount} saved!</span>
                                        </div>
                                        <button onClick={removeCoupon}>✕ Remove</button>
                                    </div>
                                )}
                            </div>

                            {/* Price Card */}
                            <div className="price-card">
                                <h3>PRICE DETAILS</h3>

                                <div className="price-row">
                                    <span>Price ({cartItems.length} items)</span>
                                    <span>₹{total.toLocaleString()}</span>
                                </div>

                                {discount > 0 && (
                                    <div className="price-row green">
                                        <span>Coupon Discount</span>
                                        <span>− ₹{discount}</span>
                                    </div>
                                )}

                                <div className="price-row green">
                                    <span>Delivery Charges</span>
                                    <span>{deliveryCharge === 0
                                        ? <span className="free-tag">🎉 FREE</span>
                                        : `₹${deliveryCharge}`}
                                    </span>
                                </div>

                                <div className="price-divider" />

                                <div className="price-row total-row">
                                    <span>Total Amount</span>
                                    <span>₹{grandTotal}</span>
                                </div>

                                {discount > 0 && (
                                    <div className="savings-banner">
                                        🎉 You save ₹{discount} on this order!
                                    </div>
                                )}

                                <button className="place-order-btn"
                                    onClick={() => navigate('/payment', {
                                        state: { total: parseFloat(grandTotal), discount }
                                    })}>
                                    ⚡ {t.buyNow || 'Place Order'}
                                </button>

                                <div className="secure-badge">
                                    🔒 Safe and Secure Payments
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="trust-badges">
                                {[
                                    { icon: '🛡️', text: '100% Secure' },
                                    { icon: '↩️', text: t.returnPolicy || 'Easy Returns' },
                                    { icon: '🚚', text: t.freeDelivery || 'Fast Delivery' },
                                ].map(b => (
                                    <div key={b.text} className="trust-badge">
                                        <span>{b.icon}</span>
                                        <span>{b.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default CartPage;

