import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from './LanguageSelector';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (message) setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (!isLogin && formData.password !== formData.confirmPassword) {
            setMessage('error:Passwords do not match!');
            setLoading(false);
            return;
        }

        if (!isLogin && formData.password.length < 6) {
            setMessage('error:Password must be at least 6 characters!');
            setLoading(false);
            return;
        }

        try {
            const url = isLogin
                ? 'http://localhost:8080/api/auth/login'
                : 'http://localhost:8080/api/auth/signup';

            const body = isLogin
                ? { email: formData.email, password: formData.password }
                : { name: formData.name, email: formData.email, password: formData.password, confirmPassword: formData.confirmPassword };

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (data.success) {
                localStorage.setItem('user', JSON.stringify({
                    userId: data.userId,
                    name: data.name,
                    email: data.email
                }));
                setMessage('success:' + data.message);
                setTimeout(() => navigate('/'), 1200);
            } else {
                setMessage('error:' + data.message);
            }
        } catch (error) {
            setMessage('error:Server se connect nahi ho pa raha!');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setIsLogin(!isLogin);
        setMessage('');
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    };

    const getPasswordStrength = (pass) => {
        if (!pass) return null;
        if (pass.length >= 10 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) return 'strong';
        if (pass.length >= 6) return 'medium';
        return 'weak';
    };

    const strength = getPasswordStrength(formData.password);
    const strengthLabel = { strong: '💪 Strong', medium: '👍 Medium', weak: '⚠️ Weak' };
    const strengthBars = { strong: 4, medium: 2, weak: 1 };

    const msgType = message.split(':')[0];
    const msgText = message.split(':').slice(1).join(':');

    return (
        <div className="login-page">
            {/* Animated background */}
            <div className="bg-shapes">
                <div className="bg-shape s1" />
                <div className="bg-shape s2" />
                <div className="bg-shape s3" />
                <div className="bg-shape s4" />
            </div>

            <div className="login-container">

                {/* ── LEFT PANEL ── */}
                <div className="login-left">
                    <div className="login-brand" onClick={() => navigate('/')}>
                        <div className="brand-logo-box">F</div>
                        <div>
                            <h1>Flipkart</h1>
                            <span className="brand-sub">Explore Plus ✦</span>
                        </div>
                    </div>

                    <div className="login-left-content">
                        <h2>India's Own Marketplace</h2>
                        <p>Millions of products at the best prices, delivered fast</p>

                        <div className="feature-list">
                            {[
                                { icon: '📦', title: t.orders || 'Track Orders', sub: 'Real-time order tracking' },
                                { icon: '❤️', title: t.wishlist || 'Wishlist', sub: 'Save products for later' },
                                { icon: '⚡', title: 'Flash Sales', sub: 'Best deals every day' },
                                { icon: '🎁', title: 'Loyalty Points', sub: 'Earn & redeem rewards' },
                            ].map(f => (
                                <div key={f.title} className="feature-item">
                                    <span className="feature-icon">{f.icon}</span>
                                    <div>
                                        <p className="feature-title">{f.title}</p>
                                        <p className="feature-sub">{f.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="left-footer">
                        <div className="trust-row">
                            <span>⭐ 4.8 Rated</span>
                            <span>•</span>
                            <span>50Cr+ Users</span>
                            <span>•</span>
                            <span>🇮🇳 Made in India</span>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="login-right">

                    {/* Tabs */}
                    <div className="auth-tabs">
                        <button
                            className={`auth-tab ${isLogin ? 'active' : ''}`}
                            onClick={() => { setIsLogin(true); setMessage(''); }}>
                            {t.login || 'Login'}
                        </button>
                        <button
                            className={`auth-tab ${!isLogin ? 'active' : ''}`}
                            onClick={() => { setIsLogin(false); setMessage(''); }}>
                            Sign Up
                        </button>
                    </div>

                    <div className="auth-form-wrap">
                        <div className="form-heading">
                            <h2>{isLogin ? `Welcome Back! 👋` : 'Create Account 🚀'}</h2>
                            <p className="auth-subtitle">
                                {isLogin
                                    ? 'Login and enjoy exclusive deals!'
                                    : 'Join millions of happy shoppers'}
                            </p>
                        </div>

                        {/* Message */}
                        {msgText && (
                            <div className={`auth-message ${msgType}`}>
                                <span>{msgType === 'success' ? '✅' : '❌'}</span>
                                <span>{msgText}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">

                            {/* Name */}
                            {!isLogin && (
                                <div className="input-group">
                                    <span className="input-icon">👤</span>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        autoComplete="name"
                                    />
                                </div>
                            )}

                            {/* Email */}
                            <div className="input-group">
                                <span className="input-icon">📧</span>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            {/* Password */}
                            <div className="input-group">
                                <span className="input-icon">🔒</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder={isLogin ? 'Password' : 'Password (min 6 characters)'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                                />
                                <button type="button" className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>

                            {/* Password Strength */}
                            {!isLogin && formData.password && (
                                <div className="password-strength">
                                    <div className="strength-bars">
                                        {[1,2,3,4].map(i => (
                                            <div key={i}
                                                className={`strength-bar ${i <= (strengthBars[strength] || 0) ? strength : ''}`} />
                                        ))}
                                    </div>
                                    <span className={`strength-text ${strength}`}>
                                        {strengthLabel[strength]}
                                    </span>
                                </div>
                            )}

                            {/* Confirm Password */}
                            {!isLogin && (
                                <div className="input-group">
                                    <span className="input-icon">🔐</span>
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button type="button" className="toggle-password"
                                        onClick={() => setShowConfirm(!showConfirm)}>
                                        {showConfirm ? '🙈' : '👁️'}
                                    </button>
                                    {/* Match indicator */}
                                    {formData.confirmPassword && (
                                        <span className={`match-indicator ${formData.password === formData.confirmPassword ? 'match' : 'no-match'}`}>
                                            {formData.password === formData.confirmPassword ? '✓' : '✗'}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Forgot Password */}
                            {isLogin && (
                                <div className="forgot-row">
                                    <span className="forgot-password">Forgot Password?</span>
                                </div>
                            )}

                            {/* Terms */}
                            {!isLogin && (
                                <p className="terms-text">
                                    By creating an account, you agree to our{' '}
                                    <span>Terms of Service</span> and{' '}
                                    <span>Privacy Policy</span>
                                </p>
                            )}

                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? (
                                    <span className="btn-loading">
                                        <span className="spinner" />
                                        Please wait...
                                    </span>
                                ) : (
                                    isLogin ? `🚀 ${t.login || 'Login'}` : '✨ Create Account'
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="auth-divider">
                            <span /><p>or continue with</p><span />
                        </div>

                        {/* Social Buttons */}
                        <div className="social-login">
                            <button className="social-btn google">
                                <span className="google-icon">G</span>
                                Google
                            </button>
                            <button className="social-btn phone">
                                <span>📱</span>
                                Mobile OTP
                            </button>
                        </div>

                        <p className="switch-mode">
                            {isLogin ? "New to Flipkart? " : "Already have an account? "}
                            <span onClick={switchMode}>
                                {isLogin ? 'Create Account →' : '← Login'}
                            </span>
                        </p>

                        <button className="guest-btn" onClick={() => navigate('/')}>
                            Continue as Guest →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;