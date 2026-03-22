import React, { useState } from 'react';
import { useToast } from './Toast';
import './BackInStock.css';

const BackInStock = ({ product, isOutOfStock = false }) => {
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));

    const handleSubscribe = async () => {
        const emailToUse = email || user?.email;
        if (!emailToUse) {
            showToast('Please enter your email!', 'warning');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(emailToUse)) {
            showToast('Please enter a valid email!', 'warning');
            return;
        }

        setLoading(true);
        // Save to localStorage
        const alerts = JSON.parse(localStorage.getItem('stockAlerts') || '[]');
        const existing = alerts.find(a => a.productId === product.id);

        if (existing) {
            showToast('Already subscribed for this product!', 'info');
            setLoading(false);
            setSubscribed(true);
            return;
        }

        alerts.push({
            productId: product.id,
            productName: product.name,
            productImage: product.image,
            email: emailToUse,
            price: product.price,
            subscribedAt: new Date().toISOString()
        });

        localStorage.setItem('stockAlerts', JSON.stringify(alerts));

        setTimeout(() => {
            setLoading(false);
            setSubscribed(true);
            showToast('Alert set! We\'ll notify you when back in stock! 🔔', 'success');
        }, 800);
    };

    const handleUnsubscribe = () => {
        const alerts = JSON.parse(localStorage.getItem('stockAlerts') || '[]');
        const updated = alerts.filter(a => a.productId !== product.id);
        localStorage.setItem('stockAlerts', JSON.stringify(updated));
        setSubscribed(false);
        showToast('Alert removed!', 'info');
    };

    if (!isOutOfStock) {
        // Show as optional alert even when in stock
        return (
            <div className="bis-optional">
                <div className="bis-optional-content">
                    <span>🔔</span>
                    <div>
                        <p>Get Price Drop Alert</p>
                        <p>We'll notify you when price drops!</p>
                    </div>
                    {!subscribed ? (
                        <button onClick={handleSubscribe}
                            className="bis-opt-btn">
                            Notify Me
                        </button>
                    ) : (
                        <button onClick={handleUnsubscribe}
                            className="bis-opt-btn subscribed">
                            ✅ Subscribed
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bis-container">
            <div className="bis-out-badge">
                <span>⚠️</span>
                <span>Currently Out of Stock</span>
            </div>

            {!subscribed ? (
                <div className="bis-form">
                    <p className="bis-title">🔔 Get notified when available!</p>
                    <p className="bis-desc">
                        Enter your email and we'll alert you the moment this product is back.
                    </p>

                    {user?.email && (
                        <p className="bis-user-email">
                            Notify on: <strong>{user.email}</strong>
                        </p>
                    )}

                    {!user && (
                        <div className="bis-input-row">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
                            />
                        </div>
                    )}

                    <button
                        className="bis-subscribe-btn"
                        onClick={handleSubscribe}
                        disabled={loading}>
                        {loading ? '⏳ Setting Alert...' : '🔔 Notify Me When Available'}
                    </button>

                    <div className="bis-features">
                        <span>✅ Free Alert</span>
                        <span>✅ No Spam</span>
                        <span>✅ Unsubscribe Anytime</span>
                    </div>
                </div>
            ) : (
                <div className="bis-success">
                    <div className="bis-success-icon">🎉</div>
                    <h4>You're on the list!</h4>
                    <p>We'll email <strong>{email || user?.email}</strong> when this product is back in stock.</p>
                    <button onClick={handleUnsubscribe} className="bis-unsub-btn">
                        Remove Alert
                    </button>
                </div>
            )}
        </div>
    );
};

export default BackInStock;

