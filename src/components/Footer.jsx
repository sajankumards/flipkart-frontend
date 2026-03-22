import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from './LanguageSelector';
import './Footer.css';

const Footer = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleNavigation = (path) => {
        navigate(path);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setEmail('');
            setTimeout(() => setSubscribed(false), 3000);
        }
    };

    return (
        <footer className="footer">

            {/* ── NEWSLETTER STRIP ── */}
            <div className="footer-newsletter-strip">
                <div className="newsletter-inner">
                    <div className="newsletter-text">
                        <span className="newsletter-icon">📬</span>
                        <div>
                            <h4>Stay in the loop!</h4>
                            <p>Get exclusive deals, offers & updates directly in your inbox.</p>
                        </div>
                    </div>
                    <form className="newsletter-form" onSubmit={handleSubscribe}>
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit">
                            {subscribed ? '✅ Subscribed!' : 'Subscribe'}
                        </button>
                    </form>
                </div>
            </div>

            {/* ── MAIN FOOTER ── */}
            <div className="footer-main">
                <div className="footer-container">

                    {/* Brand Column */}
                    <div className="footer-brand-col">
                        <div className="footer-logo" onClick={() => handleNavigation('/')}>
                            <span className="footer-logo-text">Flipkart</span>
                            <span className="footer-logo-sub">Explore Plus ✦</span>
                        </div>
                        <p className="footer-brand-desc">
                            India's leading e-commerce platform offering millions of products across categories with the best prices and fastest delivery.
                        </p>

                        {/* Social Icons */}
                        <div className="social-icons">
                            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon facebook" aria-label="Facebook">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-icon twitter" aria-label="Twitter">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon instagram" aria-label="Instagram">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-icon youtube" aria-label="YouTube">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-icon linkedin" aria-label="LinkedIn">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                            </a>
                        </div>

                        {/* App Download */}
                        <div className="app-download">
                            <p className="app-download-title">Download App</p>
                            <div className="app-btns">
                                <button className="app-btn" onClick={() => handleNavigation('/download-app')}>
                                    <span>🍎</span> App Store
                                </button>
                                <button className="app-btn" onClick={() => handleNavigation('/download-app')}>
                                    <span>▶️</span> Play Store
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Company */}
                    <div className="footer-section">
                        <h3>Company</h3>
                        <ul>
                            <li onClick={() => handleNavigation('/about')}>About Us</li>
                            <li onClick={() => handleNavigation('/careers')}>Careers</li>
                            <li onClick={() => handleNavigation('/press')}>Press</li>
                            <li onClick={() => handleNavigation('/corporate')}>Corporate Info</li>
                            <li onClick={() => handleNavigation('/advertise')}>Advertise</li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="footer-section">
                        <h3>Support</h3>
                        <ul>
                            <li onClick={() => handleNavigation('/help')}>Help Center</li>
                            <li onClick={() => handleNavigation('/payments')}>Payments</li>
                            <li onClick={() => handleNavigation('/shipping')}>Shipping</li>
                            <li onClick={() => handleNavigation('/returns')}>Returns & Refunds</li>
                            <li onClick={() => handleNavigation('/faq')}>FAQ</li>
                            <li onClick={() => handleNavigation('/contact')}>Contact Us</li>
                        </ul>
                    </div>

                    {/* Policies */}
                    <div className="footer-section">
                        <h3>Policies</h3>
                        <ul>
                            <li onClick={() => handleNavigation('/terms')}>Terms of Use</li>
                            <li onClick={() => handleNavigation('/privacy')}>Privacy Policy</li>
                            <li onClick={() => handleNavigation('/security')}>Security</li>
                            <li onClick={() => handleNavigation('/sitemap')}>Sitemap</li>
                            <li onClick={() => handleNavigation('/grievance')}>Grievance</li>
                        </ul>
                    </div>

                    {/* My Account */}
                    <div className="footer-section">
                        <h3>My Account</h3>
                        <ul>
                            <li onClick={() => handleNavigation('/profile')}>My Profile</li>
                            <li onClick={() => handleNavigation('/orders')}>{t.orders || 'My Orders'}</li>
                            <li onClick={() => handleNavigation('/wishlist')}>{t.wishlist || 'Wishlist'}</li>
                            <li onClick={() => handleNavigation('/addresses')}>My Addresses</li>
                            <li onClick={() => handleNavigation('/loyalty')}>Loyalty Points</li>
                            <li onClick={() => handleNavigation('/gift-cards')}>Gift Cards</li>
                        </ul>
                    </div>

                </div>
            </div>

            {/* ── PAYMENT SECTION ── */}
            <div className="footer-payment">
                <div className="payment-inner">
                    <span className="payment-label">🔒 Safe & Secure Payments</span>
                    <div className="payment-icons">
                        <div className="pay-icon visa">VISA</div>
                        <div className="pay-icon mastercard">
                            <span className="mc-left">●</span>
                            <span className="mc-right">●</span>
                        </div>
                        <div className="pay-icon upi">UPI</div>
                        <div className="pay-icon netbanking">Net Banking</div>
                        <div className="pay-icon cod">COD</div>
                        <div className="pay-icon emi">EMI</div>
                        <div className="pay-icon paytm">Paytm</div>
                        <div className="pay-icon gpay">GPay</div>
                    </div>
                </div>
            </div>

            {/* ── FOOTER BOTTOM ── */}
            <div className="footer-bottom">
                <div className="footer-bottom-container">
                    <div className="bottom-left">
                        <span onClick={() => handleNavigation('/seller')}>Become a Seller</span>
                        <span onClick={() => handleNavigation('/advertise')}>Advertise</span>
                        <span onClick={() => handleNavigation('/gift-cards')}>Gift Cards</span>
                        <span onClick={() => handleNavigation('/help')}>Help Center</span>
                        <span onClick={() => handleNavigation('/download-app')}>Download App</span>
                    </div>
                    <div className="bottom-right">
                        <span>© {currentYear} Flipkart Clone. All Rights Reserved.</span>
                        <span className="made-in">🇮🇳 Made in India</span>
                    </div>
                </div>
            </div>

        </footer>
    );
};

export default Footer;





