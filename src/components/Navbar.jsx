import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Notifications from './Notifications';
import DarkMode from './DarkMode';
import PushNotifications from './PushNotifications';
import LanguageSelector, { useTranslation } from './LanguageSelector';
import VoiceSearch from './VoiceSearch';

import './Navbar.css';

const Navbar = ({ cartCount = 0 }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showMoreDropdown, setShowMoreDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef(null);
    const moreDropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target))
                setShowDropdown(false);
            if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target))
                setShowMoreDropdown(false);
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target))
                setShowMobileMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        document.body.style.overflow = showMobileMenu ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [showMobileMenu]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setShowMobileMenu(false);
        navigate('/');
        window.location.reload();
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setShowMobileMenu(false);
        }
    };

    // ✅ VoiceSearch result handle karo
 // ✅ VoiceSearch result handle karo (FIXED - clean text)
const handleVoiceResult = (data) => {
    const clean = (str) =>
        str
            ?.trim()
            .replace(/[.,!?।]/g, '')   // punctuation remove
            .replace(/\s+/g, ' ')      // extra spaces remove
            .toLowerCase();            // lowercase

    if (typeof data === 'string') {
        const cleaned = clean(data);
        setSearchQuery(cleaned);
        navigate(`/search?q=${encodeURIComponent(cleaned)}`);
    } else if (data?.query) {
        const cleaned = clean(data.query);
        setSearchQuery(cleaned);
        navigate(`/search?q=${encodeURIComponent(cleaned)}`);
    } else if (data?.path) {
        navigate(data.path);
    }
};
    return (
        <>
            <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
                <div className="top-bar">
                    <div className="container">

                        {/* ── MOBILE HAMBURGER ── */}
                        <button
                            className="hamburger-btn"
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            aria-label="Menu">
                            <span className={`ham-line ${showMobileMenu ? 'open' : ''}`}></span>
                            <span className={`ham-line ${showMobileMenu ? 'open' : ''}`}></span>
                            <span className={`ham-line ${showMobileMenu ? 'open' : ''}`}></span>
                        </button>

                        {/* ── LOGO ── */}
                        <div className="logo" onClick={() => navigate('/')}>
                            <span className="brand-name">Flipkart</span>
                            <span className="brand-tagline">
                                Explore <span className="plus">Plus ✦</span>
                            </span>
                        </div>

                        {/* ── SEARCH BAR ── */}
                        <form className="search-bar" onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder={t.search}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Search products"
                            />

                            {/* ✅ VoiceSearch — sahi tarike se */}
                            <VoiceSearch onResult={handleVoiceResult} />

                            <button type="submit" className="search-btn" aria-label="Search">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </button>
                        </form>

                        {/* ── RIGHT MENU ── */}
                        <div className="right-menu">

                            {user ? (
                                <div className="user-dropdown" ref={dropdownRef}>
                                    <button
                                        className="user-menu-btn"
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        aria-expanded={showDropdown}>
                                        <span className="user-avatar">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </span>
                                        <span className="user-name">{user.name?.split(' ')[0]}</span>
                                        <svg className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}
                                            width="12" height="12" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </button>

                                    {showDropdown && (
                                        <div className="dropdown-menu">
                                            <div className="dropdown-header">
                                                <span className="welcome-text">Welcome</span>
                                                <span className="user-fullname">{user.name}</span>
                                                <span className="user-email">{user.email}</span>
                                            </div>
                                            <div className="dropdown-body">
                                                <Link to="/profile" onClick={() => setShowDropdown(false)}>
                                                    <span className="menu-icon">👤</span> My Profile
                                                </Link>
                                                <Link to="/orders" onClick={() => setShowDropdown(false)}>
                                                    <span className="menu-icon">📦</span> {t.orders}
                                                </Link>
                                                <Link to="/track-order" onClick={() => setShowDropdown(false)}>
                                                    <span className="menu-icon">🗺️</span> Track Order
                                                </Link>
                                                <Link to="/wishlist" onClick={() => setShowDropdown(false)}>
                                                    <span className="menu-icon">❤️</span> {t.wishlist}
                                                </Link>
                                                <Link to="/compare" onClick={() => setShowDropdown(false)}>
                                                    <span className="menu-icon">⚖️</span> Compare Products
                                                </Link>
                                                <Link to="/addresses" onClick={() => setShowDropdown(false)}>
                                                    <span className="menu-icon">📍</span> My Addresses
                                                </Link>
                                                <Link to="/loyalty" onClick={() => setShowDropdown(false)}>
                                                    <span className="menu-icon">🎁</span> Loyalty Points
                                                </Link>
                                                <Link to="/cart" onClick={() => setShowDropdown(false)}>
                                                    <span className="menu-icon">🛒</span> {t.cart}
                                                    {cartCount > 0 && <span className="menu-badge">{cartCount}</span>}
                                                </Link>
                                                <div className="dropdown-divider"></div>
                                                <button onClick={handleLogout} className="logout-btn">
                                                    <span className="menu-icon">🚪</span> Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="auth-buttons">
                                    <button className="login-btn" onClick={() => navigate('/login')}>{t.login}</button>
                                    <button className="signup-btn" onClick={() => navigate('/login')}>Sign Up</button>
                                </div>
                            )}

                            <Notifications />
                            <DarkMode />
                            <PushNotifications />
                            <LanguageSelector />

                            <button className="seller-btn" onClick={() => navigate('/')}>
                                <span className="menu-icon">🏪</span>
                                <span className="seller-text">Become a Seller</span>
                            </button>

                            <div className="more-dropdown" ref={moreDropdownRef}>
                                <button
                                    className="more-btn"
                                    onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                                    aria-expanded={showMoreDropdown}>
                                    More
                                    <svg className={`dropdown-arrow ${showMoreDropdown ? 'open' : ''}`}
                                        width="12" height="12" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </button>

                                {showMoreDropdown && (
                                    <div className="more-dropdown-menu">
                                        <Link to="/offers" onClick={() => setShowMoreDropdown(false)}>
                                            <span className="menu-icon">🏷️</span> Offers & Deals
                                        </Link>
                                        <Link to="/loyalty" onClick={() => setShowMoreDropdown(false)}>
                                            <span className="menu-icon">🎁</span> Loyalty Points
                                        </Link>
                                        <Link to="/track-order" onClick={() => setShowMoreDropdown(false)}>
                                            <span className="menu-icon">📦</span> Track Order
                                        </Link>
                                        <Link to="/compare" onClick={() => setShowMoreDropdown(false)}>
                                            <span className="menu-icon">⚖️</span> Compare Products
                                        </Link>
                                        <div className="more-divider"></div>
                                        <Link to="/help" onClick={() => setShowMoreDropdown(false)}>
                                            <span className="menu-icon">🤝</span> Help & Support
                                        </Link>
                                        <Link to="/gift-cards" onClick={() => setShowMoreDropdown(false)}>
                                            <span className="menu-icon">🎴</span> Gift Cards
                                        </Link>
                                        <Link to="/download-app" onClick={() => setShowMoreDropdown(false)}>
                                            <span className="menu-icon">📱</span> Download App
                                        </Link>
                                        <div className="more-divider"></div>
                                        <Link to="/admin" onClick={() => setShowMoreDropdown(false)}>
                                            <span className="menu-icon">🔐</span> Admin Panel
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <button className="cart-btn" onClick={() => navigate('/cart')} aria-label="Cart">
                                <span className="cart-icon">🛒</span>
                                <span className="cart-text">{t.cart}</span>
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── MOBILE OVERLAY ── */}
            {showMobileMenu && (
                <div className="mobile-overlay" onClick={() => setShowMobileMenu(false)} />
            )}

            {/* ── MOBILE MENU ── */}
            <div className={`mobile-menu ${showMobileMenu ? 'open' : ''}`} ref={mobileMenuRef}>
                <div className="mobile-menu-header">
                    {user ? (
                        <div className="mobile-user-info">
                            <div className="mobile-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                            <div>
                                <div className="mobile-username">{user.name}</div>
                                <div className="mobile-email">{user.email}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="mobile-auth">
                            <p className="mobile-guest">Hello, Guest 👋</p>
                            <div className="mobile-auth-btns">
                                <button onClick={() => { navigate('/login'); setShowMobileMenu(false); }}
                                    className="mob-login-btn">{t.login}</button>
                                <button onClick={() => { navigate('/login'); setShowMobileMenu(false); }}
                                    className="mob-signup-btn">Sign Up</button>
                            </div>
                        </div>
                    )}
                    <button className="mobile-close" onClick={() => setShowMobileMenu(false)}>✕</button>
                </div>

                <div className="mobile-search-wrap">
                    <form onSubmit={handleSearch} className="mobile-search">
                        <input
                            type="text"
                            placeholder={t.search}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit">🔍</button>
                    </form>
                </div>

                <div className="mobile-nav-links">
                    <div className="mobile-section-title">Shop</div>
                    <Link to="/" onClick={() => setShowMobileMenu(false)}><span>🏠</span> {t.home || 'Home'}</Link>
                    <Link to="/offers" onClick={() => setShowMobileMenu(false)}><span>🏷️</span> Offers & Deals</Link>
                    <Link to="/cart" onClick={() => setShowMobileMenu(false)}>
                        <span>🛒</span> {t.cart}
                        {cartCount > 0 && <span className="mob-badge">{cartCount}</span>}
                    </Link>
                    <Link to="/wishlist" onClick={() => setShowMobileMenu(false)}><span>❤️</span> {t.wishlist}</Link>

                    {user && (
                        <>
                            <div className="mobile-section-title">Account</div>
                            <Link to="/profile" onClick={() => setShowMobileMenu(false)}><span>👤</span> My Profile</Link>
                            <Link to="/orders" onClick={() => setShowMobileMenu(false)}><span>📦</span> {t.orders}</Link>
                            <Link to="/track-order" onClick={() => setShowMobileMenu(false)}><span>🗺️</span> Track Order</Link>
                            <Link to="/addresses" onClick={() => setShowMobileMenu(false)}><span>📍</span> My Addresses</Link>
                            <Link to="/loyalty" onClick={() => setShowMobileMenu(false)}><span>🎁</span> Loyalty Points</Link>
                            <Link to="/compare" onClick={() => setShowMobileMenu(false)}><span>⚖️</span> Compare Products</Link>
                        </>
                    )}

                    <div className="mobile-section-title">More</div>
                    <Link to="/help" onClick={() => setShowMobileMenu(false)}><span>🤝</span> Help & Support</Link>
                    <Link to="/gift-cards" onClick={() => setShowMobileMenu(false)}><span>🎴</span> Gift Cards</Link>
                    <Link to="/download-app" onClick={() => setShowMobileMenu(false)}><span>📱</span> Download App</Link>
                    <Link to="/admin" onClick={() => setShowMobileMenu(false)}><span>🔐</span> Admin Panel</Link>

                    <div className="mobile-section-title">Language</div>
                    <div className="mobile-lang-wrap">
                        <LanguageSelector />
                    </div>

                    {user && (
                        <>
                            <div className="mobile-section-title"></div>
                            <button onClick={handleLogout} className="mob-logout-btn">
                                <span>🚪</span> Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Navbar;


