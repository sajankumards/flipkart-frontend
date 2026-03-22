import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useTranslation } from './LanguageSelector';
import './PaymentPage.css';

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(location.state?.total || 0);
    const [discount] = useState(location.state?.discount || 0);
    const [loading, setLoading] = useState(true);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [placing, setPlacing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [selectedBank, setSelectedBank] = useState('');
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        upiId: '', cardNumber: '', cardName: '', expiry: '', cvv: '',
        address: '', city: '', pincode: '', phone: '', state: ''
    });

    useEffect(() => { fetchCart(); }, []);

    const fetchCart = async () => {
        try {
            const [cartRes, productsRes] = await Promise.all([
                fetch('process.env.REACT_APP_API_URL || '(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')'/cart'),
                fetch('process.env.REACT_APP_API_URL || '(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')'/products')
            ]);
            const cartData = await cartRes.json();
            const productsData = await productsRes.json();
            const enrichedItems = cartData.items.map(item => {
                const product = productsData.find(p => p.id === item.productId);
                return { ...item, product };
            }).filter(item => item.product);
            setCartItems(enrichedItems);
            if (!location.state?.total) {
                const sum = enrichedItems.reduce((acc, item) =>
                    acc + (item.product.price * item.quantity), 0);
                setTotal(parseFloat(sum.toFixed(2)));
            }
        } catch (error) {
            console.log('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        let val = e.target.value;
        if (e.target.name === 'cardNumber') val = val.replace(/\D/g, '').slice(0, 16);
        if (e.target.name === 'cvv') val = val.replace(/\D/g, '').slice(0, 3);
        if (e.target.name === 'expiry') {
            val = val.replace(/\D/g, '');
            if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
        }
        if (e.target.name === 'pincode') val = val.replace(/\D/g, '').slice(0, 6);
        if (e.target.name === 'phone') val = val.replace(/\D/g, '').slice(0, 10);
        setFormData({ ...formData, [e.target.name]: val });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    };

    const validateStep = (s) => {
        const newErrors = {};
        if (s === 1) {
            if (!formData.address) newErrors.address = 'Address required';
            if (!formData.city) newErrors.city = 'City required';
            if (formData.pincode.length !== 6) newErrors.pincode = 'Enter valid 6-digit pincode';
            if (formData.phone.length !== 10) newErrors.phone = 'Enter valid 10-digit phone';
        }
        if (s === 2) {
            if (paymentMethod === 'upi' && !formData.upiId.includes('@'))
                newErrors.upiId = 'Enter valid UPI ID (e.g. name@upi)';
            if (paymentMethod === 'card') {
                if (formData.cardNumber.length < 16) newErrors.cardNumber = 'Enter valid 16-digit card number';
                if (!formData.cardName) newErrors.cardName = 'Enter cardholder name';
                if (formData.expiry.length < 5) newErrors.expiry = 'Enter valid expiry (MM/YY)';
                if (formData.cvv.length < 3) newErrors.cvv = 'Enter valid 3-digit CVV';
            }
            if (paymentMethod === 'netbanking' && !selectedBank)
                newErrors.bank = 'Please select a bank';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePlaceOrder = async () => {
        setPlacing(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                await fetch('process.env.REACT_APP_API_URL || '(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')'/orders/place', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.userId, totalAmount: total,
                        address: formData.address, city: formData.city,
                        pincode: formData.pincode, phone: formData.phone,
                        paymentMethod
                    })
                });
                await fetch('process.env.REACT_APP_API_URL || '(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')'/notifications/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.userId,
                        message: `✅ Order placed! Total: ₹${total}`,
                        type: 'order', icon: '📦'
                    })
                });
                await fetch(`process.env.REACT_APP_API_URL || '(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')'/loyalty/${user.userId}/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        points: Math.floor(total * 0.1),
                        description: `Order ₹${total} pe points earned! 🛒`
                    })
                });
            }
            await fetch('process.env.REACT_APP_API_URL || '(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')'/cart/clear', { method: 'DELETE' });
            setOrderPlaced(true);
        } catch (error) {
            console.log('Error:', error);
        } finally {
            setPlacing(false);
        }
    };

    const formatCard = (num) => {
        return num.match(/.{1,4}/g)?.join(' ') || num;
    };

    // ── LOADING ──
    if (loading) return (
        <div className="payment-page">
            <Navbar />
            <div className="pay-loading">
                <div className="pay-spinner" />
                <p>Loading your order...</p>
            </div>
        </div>
    );

    // ── SUCCESS ──
    if (orderPlaced) return (
        <div className="payment-page">
            <Navbar />
            <div className="success-page">
                <div className="success-card">
                    <div className="success-lottie">
                        <div className="success-ring" />
                        <div className="success-circle">✓</div>
                    </div>
                    <h2>Order Placed! 🎉</h2>
                    <p className="success-sub">Thank you for shopping with Flipkart!</p>

                    <div className="success-details">
                        {[
                            { icon: '📦', label: 'Delivery', value: '3–5 Business Days' },
                            { icon: '💰', label: 'Amount Paid', value: `₹${Number(total).toLocaleString('en-IN')}` },
                            { icon: '💳', label: 'Payment', value: paymentMethod.toUpperCase() },
                            { icon: '⭐', label: 'Points Earned', value: `+${Math.floor(total * 0.1)} pts`, green: true },
                        ].map(row => (
                            <div key={row.label} className="success-detail-row">
                                <span>{row.icon} {row.label}</span>
                                <span className={row.green ? 'points-earned' : ''}>{row.value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="success-btns">
                        <button className="track-btn" onClick={() => navigate('/track-order')}>
                            📦 Track Order
                        </button>
                        <button className="continue-btn" onClick={() => navigate('/')}>
                            🛍️ Continue Shopping
                        </button>
                    </div>

                    <button className="orders-link" onClick={() => navigate('/orders')}>
                        View All Orders →
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );

    const steps = ['Delivery Address', 'Payment Method', 'Review & Pay'];

    return (
        <div className="payment-page">
            <Navbar />
            <div className="payment-container">

                {/* Breadcrumb */}
                <div className="pay-breadcrumb">
                    <span onClick={() => navigate('/')}>🏠 {t.home || 'Home'}</span>
                    <span className="bc-sep">›</span>
                    <span onClick={() => navigate('/cart')}>{t.cart || 'Cart'}</span>
                    <span className="bc-sep">›</span>
                    <span className="active">Checkout</span>
                </div>

                {/* Step Indicator */}
                <div className="step-indicator">
                    {steps.map((s, i) => (
                        <React.Fragment key={i}>
                            <div className={`step-item ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
                                <div className="step-circle">
                                    {step > i + 1 ? '✓' : i + 1}
                                </div>
                                <span className="step-label">{s}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`step-line ${step > i + 1 ? 'done' : ''}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div className="payment-layout">
                    <div className="payment-left">

                        {/* ── STEP 1: ADDRESS ── */}
                        {step === 1 && (
                            <div className="form-card">
                                <div className="card-header">
                                    <span className="card-icon">📍</span>
                                    <div>
                                        <h3>Delivery Address</h3>
                                        <p>Where should we deliver your order?</p>
                                    </div>
                                </div>

                                <div className="address-form">
                                    <div className="input-row full">
                                        <div className={`input-field ${errors.address ? 'error' : ''}`}>
                                            <label>Full Address *</label>
                                            <input type="text" name="address"
                                                placeholder="House no., Street, Area, Landmark..."
                                                value={formData.address} onChange={handleChange} />
                                            {errors.address && <span className="err-msg">{errors.address}</span>}
                                        </div>
                                    </div>
                                    <div className="input-row">
                                        <div className={`input-field ${errors.city ? 'error' : ''}`}>
                                            <label>City *</label>
                                            <input type="text" name="city"
                                                placeholder="City" value={formData.city} onChange={handleChange} />
                                            {errors.city && <span className="err-msg">{errors.city}</span>}
                                        </div>
                                        <div className="input-field">
                                            <label>State</label>
                                            <input type="text" name="state"
                                                placeholder="State" value={formData.state} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="input-row">
                                        <div className={`input-field ${errors.pincode ? 'error' : ''}`}>
                                            <label>Pincode *</label>
                                            <input type="text" name="pincode"
                                                placeholder="6-digit pincode"
                                                value={formData.pincode} onChange={handleChange} />
                                            {errors.pincode && <span className="err-msg">{errors.pincode}</span>}
                                        </div>
                                        <div className={`input-field ${errors.phone ? 'error' : ''}`}>
                                            <label>Phone Number *</label>
                                            <input type="text" name="phone"
                                                placeholder="10-digit mobile"
                                                value={formData.phone} onChange={handleChange} />
                                            {errors.phone && <span className="err-msg">{errors.phone}</span>}
                                        </div>
                                    </div>
                                </div>

                                <button className="next-btn"
                                    onClick={() => validateStep(1) && setStep(2)}>
                                    Continue to Payment →
                                </button>
                            </div>
                        )}

                        {/* ── STEP 2: PAYMENT ── */}
                        {step === 2 && (
                            <div className="form-card">
                                <div className="card-header">
                                    <span className="card-icon">💳</span>
                                    <div>
                                        <h3>Payment Method</h3>
                                        <p>All transactions are 100% secure & encrypted</p>
                                    </div>
                                </div>

                                <div className="payment-methods">
                                    {[
                                        { id: 'upi', icon: '📱', label: 'UPI', sub: 'GPay, PhonePe, Paytm, BHIM' },
                                        { id: 'card', icon: '💳', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay' },
                                        { id: 'netbanking', icon: '🏦', label: 'Net Banking', sub: 'All major banks supported' },
                                        { id: 'cod', icon: '💵', label: 'Cash on Delivery', sub: 'Pay when delivered' },
                                    ].map(m => (
                                        <div key={m.id}
                                            className={`method-card ${paymentMethod === m.id ? 'active' : ''}`}
                                            onClick={() => setPaymentMethod(m.id)}>
                                            <div className="method-radio">
                                                <div className={`radio-dot ${paymentMethod === m.id ? 'checked' : ''}`} />
                                            </div>
                                            <span className="method-icon">{m.icon}</span>
                                            <div className="method-info">
                                                <p className="method-label">{m.label}</p>
                                                <p className="method-sub">{m.sub}</p>
                                            </div>
                                            {m.id === 'upi' && <span className="method-badge">Recommended</span>}
                                        </div>
                                    ))}
                                </div>

                                {/* UPI */}
                                {paymentMethod === 'upi' && (
                                    <div className="payment-details-box">
                                        <div className="upi-logos">
                                            {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                                                <span key={app} className="upi-app">{app}</span>
                                            ))}
                                        </div>
                                        <div className={`input-field ${errors.upiId ? 'error' : ''}`}>
                                            <label>UPI ID</label>
                                            <input type="text" name="upiId"
                                                placeholder="yourname@upi or yourname@okaxis"
                                                value={formData.upiId} onChange={handleChange} />
                                            {errors.upiId && <span className="err-msg">{errors.upiId}</span>}
                                        </div>
                                    </div>
                                )}

                                {/* Card */}
                                {paymentMethod === 'card' && (
                                    <div className="payment-details-box">
                                        <div className="card-preview">
                                            <div className="card-chip">💳</div>
                                            <p className="card-num-preview">
                                                {formData.cardNumber
                                                    ? formatCard(formData.cardNumber)
                                                    : '•••• •••• •••• ••••'}
                                            </p>
                                            <div className="card-preview-bottom">
                                                <span>{formData.cardName || 'CARD HOLDER'}</span>
                                                <span>{formData.expiry || 'MM/YY'}</span>
                                            </div>
                                        </div>
                                        <div className={`input-field ${errors.cardNumber ? 'error' : ''}`}>
                                            <label>Card Number</label>
                                            <input type="text" name="cardNumber"
                                                placeholder="1234 5678 9012 3456"
                                                value={formData.cardNumber} onChange={handleChange} />
                                            {errors.cardNumber && <span className="err-msg">{errors.cardNumber}</span>}
                                        </div>
                                        <div className={`input-field ${errors.cardName ? 'error' : ''}`}>
                                            <label>Name on Card</label>
                                            <input type="text" name="cardName"
                                                placeholder="Your Name"
                                                value={formData.cardName} onChange={handleChange} />
                                            {errors.cardName && <span className="err-msg">{errors.cardName}</span>}
                                        </div>
                                        <div className="input-row">
                                            <div className={`input-field ${errors.expiry ? 'error' : ''}`}>
                                                <label>Expiry (MM/YY)</label>
                                                <input type="text" name="expiry"
                                                    placeholder="MM/YY"
                                                    value={formData.expiry} onChange={handleChange} />
                                                {errors.expiry && <span className="err-msg">{errors.expiry}</span>}
                                            </div>
                                            <div className={`input-field ${errors.cvv ? 'error' : ''}`}>
                                                <label>CVV</label>
                                                <input type="password" name="cvv"
                                                    placeholder="•••"
                                                    value={formData.cvv} onChange={handleChange} />
                                                {errors.cvv && <span className="err-msg">{errors.cvv}</span>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Net Banking */}
                                {paymentMethod === 'netbanking' && (
                                    <div className="payment-details-box">
                                        <p className="nb-label">Select your Bank:</p>
                                        <div className="bank-grid">
                                            {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB', 'BOB', 'Canara'].map(bank => (
                                                <div key={bank}
                                                    className={`bank-option ${selectedBank === bank ? 'active' : ''}`}
                                                    onClick={() => setSelectedBank(bank)}>
                                                    {bank}
                                                </div>
                                            ))}
                                        </div>
                                        {errors.bank && <span className="err-msg">{errors.bank}</span>}
                                    </div>
                                )}

                                {/* COD */}
                                {paymentMethod === 'cod' && (
                                    <div className="cod-box">
                                        <span className="cod-icon">💵</span>
                                        <div>
                                            <p className="cod-title">Pay at Delivery</p>
                                            <p className="cod-sub">Keep exact change ready for a smooth delivery</p>
                                        </div>
                                    </div>
                                )}

                                <div className="step-btns">
                                    <button className="back-btn" onClick={() => setStep(1)}>← Back</button>
                                    <button className="next-btn flex-1"
                                        onClick={() => validateStep(2) && setStep(3)}>
                                        Review Order →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 3: REVIEW ── */}
                        {step === 3 && (
                            <div className="form-card">
                                <div className="card-header">
                                    <span className="card-icon">📋</span>
                                    <div>
                                        <h3>Review Your Order</h3>
                                        <p>Please verify all details before placing order</p>
                                    </div>
                                </div>

                                <div className="review-section">
                                    <div className="review-block">
                                        <div className="review-block-header">
                                            <span>📍 Delivery Address</span>
                                            <button onClick={() => setStep(1)}>✏️ Edit</button>
                                        </div>
                                        <p className="review-val">
                                            {formData.address}, {formData.city}
                                            {formData.state ? `, ${formData.state}` : ''} — {formData.pincode}
                                        </p>
                                        <p className="review-val">📱 +91 {formData.phone}</p>
                                    </div>

                                    <div className="review-block">
                                        <div className="review-block-header">
                                            <span>💳 Payment Method</span>
                                            <button onClick={() => setStep(2)}>✏️ Edit</button>
                                        </div>
                                        <p className="review-val">
                                            {paymentMethod === 'upi' && `📱 UPI: ${formData.upiId}`}
                                            {paymentMethod === 'card' && `💳 Card ending ****${formData.cardNumber.slice(-4)}`}
                                            {paymentMethod === 'netbanking' && `🏦 Net Banking: ${selectedBank}`}
                                            {paymentMethod === 'cod' && '💵 Cash on Delivery'}
                                        </p>
                                    </div>

                                    <div className="review-items-card">
                                        <p className="review-items-title">
                                            🛒 Order Items ({cartItems.length})
                                        </p>
                                        {cartItems.map(item => (
                                            <div key={item.productId} className="review-item">
                                                <img src={item.product.image} alt={item.product.name}
                                                    onError={e => e.target.src = 'https://via.placeholder.com/50'} />
                                                <div className="review-item-info">
                                                    <p>{item.product.name?.substring(0, 45)}...</p>
                                                    <p className="review-item-qty">
                                                        Qty: {item.quantity} × ₹{item.product.price?.toLocaleString()}
                                                    </p>
                                                </div>
                                                <span className="review-item-price">
                                                    ₹{(item.product.price * item.quantity).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="step-btns">
                                    <button className="back-btn" onClick={() => setStep(2)}>← Back</button>
                                    <button className="place-order-final"
                                        onClick={handlePlaceOrder} disabled={placing}>
                                        {placing
                                            ? <span className="placing-load"><span className="mini-spin" /> Processing...</span>
                                            : <span>🔒 Place Order — ₹{Number(total).toLocaleString('en-IN')}</span>}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── ORDER SUMMARY ── */}
                    <div className="order-summary">
                        <h3>ORDER SUMMARY</h3>

                        <div className="summary-items">
                            {cartItems.map(item => (
                                <div key={item.productId} className="summary-item">
                                    <div className="summary-img">
                                        <img src={item.product.image} alt={item.product.name}
                                            onError={e => e.target.src = 'https://via.placeholder.com/50'} />
                                        <span className="summary-qty">{item.quantity}</span>
                                    </div>
                                    <div className="summary-item-info">
                                        <p>{item.product.name?.substring(0, 28)}...</p>
                                        <p className="summary-price">
                                            ₹{(item.product.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="summary-totals">
                            <div className="summary-row">
                                <span>Subtotal ({cartItems.length} items)</span>
                                <span>₹{Number(total).toLocaleString('en-IN')}</span>
                            </div>
                            {discount > 0 && (
                                <div className="summary-row green">
                                    <span>Discount</span>
                                    <span>− ₹{discount}</span>
                                </div>
                            )}
                            <div className="summary-row green">
                                <span>{t.freeDelivery || 'Delivery'}</span>
                                <span>🎉 FREE</span>
                            </div>
                            <div className="summary-divider" />
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>₹{Number(total).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="summary-row points">
                                <span>⭐ Points you'll earn</span>
                                <span>+{Math.floor(total * 0.1)} pts</span>
                            </div>
                        </div>

                        <div className="summary-secure">
                            <span>🔒</span>
                            <span>100% Safe & Secure Payments</span>
                        </div>

                        <div className="summary-badges">
                            <div className="sum-badge">🛡️ Secure</div>
                            <div className="sum-badge">↩️ {t.returnPolicy || 'Returns'}</div>
                            <div className="sum-badge">🚚 Fast</div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PaymentPage;


