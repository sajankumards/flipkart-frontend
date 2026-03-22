import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useToast } from './Toast';
import { ProductDetailSkeleton } from './SkeletonLoader';
import { useTranslation } from './LanguageSelector';
import ProductQA from './ProductQA';
import SocialShare from './SocialShare';
import PriceHistoryChart from './PriceHistoryChart';
import BackInStock from './BackInStock';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { t } = useTranslation();
    const imageRef = useRef(null);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [inWishlist, setInWishlist] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [pincode, setPincode] = useState('');
    const [pincodeMsg, setPincodeMsg] = useState('');
    const [pincodeChecked, setPincodeChecked] = useState(false);
    const [showEMI, setShowEMI] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [zoomStyle, setZoomStyle] = useState({});
    const [isZoomed, setIsZoomed] = useState(false);
    const [stockCount] = useState(Math.floor(Math.random() * 10) + 1);
    const [showStickyBar, setShowStickyBar] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchProduct();
        fetchReviews();
        if (user) checkWishlist();
    }, [id]);

    useEffect(() => {
        const handleScroll = () => setShowStickyBar(window.scrollY > 400);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`process.env.REACT_APP_API_URL || '(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')'/products/${id}`);
            if (!res.ok) throw new Error('Not found');
            const data = await res.json();
            setProduct(data);

            const allRes = await fetch('process.env.REACT_APP_API_URL || '(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')'/products');
            const allData = await allRes.json();
            const related = allData
                .filter(p => p.category === data.category && p.id !== data.id)
                .slice(0, 4);
            setRelatedProducts(related);

            const saved = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            const updated = [parseInt(id), ...saved.filter(pid => pid !== parseInt(id))].slice(0, 10);
            localStorage.setItem('recentlyViewed', JSON.stringify(updated));
        } catch (error) {
            showToast('Product load failed!', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await fetch(`process.env.REACT_APP_API_URL || '(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')'/reviews/product/${id}`);
            const data = await res.json();
            if (data.success) {
                setReviews(data.reviews);
                setAvgRating(data.avgRating);
            }
        } catch (e) { console.log(e); }
    };

    const checkWishlist = async () => {
        try {
            const res = await fetch(`process.env.REACT_APP_API_URL || '(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')'/wishlist/check?userId=${user.userId}&productId=${id}`);
            const data = await res.json();
            setInWishlist(data.inWishlist);
        } catch (e) { console.log(e); }
    };

    const handleAddToCart = async () => {
        setAddingToCart(true);
        try {
            const res = await fetch('process.env.REACT_APP_API_URL || '(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')'/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product.id, quantity })
            });
            const data = await res.json();
            if (data.success) showToast(`${t.added || 'Added to Cart!'} 🛒`, 'success');
            else showToast('Could not add to cart!', 'error');
        } catch (e) {
            showToast('Could not add to cart!', 'error');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        await handleAddToCart();
        navigate('/cart');
    };

    const toggleWishlist = async () => {
        if (!user) { showToast('Please login first!', 'warning'); navigate('/login'); return; }
        try {
            if (inWishlist) {
                await fetch(`process.env.REACT_APP_API_URL || '(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')'/wishlist/remove?userId=${user.userId}&productId=${product.id}`, { method: 'DELETE' });
                setInWishlist(false);
                showToast('Removed from Wishlist!', 'info');
            } else {
                await fetch('process.env.REACT_APP_API_URL || '(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')'/wishlist/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.userId, productId: product.id })
                });
                setInWishlist(true);
                showToast('Added to Wishlist! ❤️', 'success');
            }
        } catch (e) { showToast('Wishlist error!', 'error'); }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) { navigate('/login'); return; }
        if (!reviewForm.comment.trim()) { showToast('Please write a comment!', 'warning'); return; }
        try {
            const res = await fetch('process.env.REACT_APP_API_URL || '(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')'/reviews/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.userId, productId: parseInt(id),
                    userName: user.name, rating: reviewForm.rating,
                    comment: reviewForm.comment
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Review submitted! ⭐', 'success');
                setReviewForm({ rating: 5, comment: '' });
                fetchReviews();
            }
        } catch (e) { showToast('Could not submit review!', 'error'); }
    };

    const checkPincode = () => {
        if (pincode.length !== 6) { showToast('Enter valid 6-digit pincode!', 'warning'); return; }
        setPincodeChecked(true);
        const days = Math.floor(Math.random() * 3) + 2;
        const date = new Date();
        date.setDate(date.getDate() + days);
        setPincodeMsg(`✅ Delivery available! Expected by ${date.toDateString()}`);
    };

    const handleImageZoom = (e) => {
        const rect = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(2.2)' });
    };

    const getEMIOptions = (price) => [
        { months: 3, interest: 0, bank: 'No Cost EMI' },
        { months: 6, interest: 0, bank: 'No Cost EMI' },
        { months: 9, interest: 12, bank: 'Standard EMI' },
        { months: 12, interest: 14, bank: 'Standard EMI' },
    ].map(opt => ({
        ...opt,
        monthly: Math.round(price * (1 + opt.interest / 100) / opt.months)
    }));

    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const colors = ['#FF4444', '#4444FF', '#44AA44', '#FF9900', '#9944AA', '#000000'];

    const renderStars = (rating, size = 16) => [1, 2, 3, 4, 5].map(star => (
        <span key={star} style={{ color: star <= rating ? '#FFB800' : '#e0e0e0', fontSize: `${size}px` }}>★</span>
    ));

    const getRatingDistribution = () => {
        const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => dist[r.rating] = (dist[r.rating] || 0) + 1);
        return dist;
    };

    if (loading) return (
        <div className="product-detail-page">
            <Navbar />
            <ProductDetailSkeleton />
        </div>
    );

    if (!product) return (
        <div className="error-screen">
            <div className="error-emoji">😕</div>
            <h2>Product not found!</h2>
            <p>The product you're looking for doesn't exist or has been removed.</p>
            <button onClick={() => navigate('/')}>Go to Homepage</button>
        </div>
    );

    const discount = Math.floor(Math.random() * 30) + 10;
    const originalPrice = Math.round(product.price * (1 + discount / 100));
    const ratingDist = getRatingDistribution();

    return (
        <div className="product-detail-page">
            <Navbar />

            {/* ── BREADCRUMB ── */}
            <div className="pd-breadcrumb">
                <span onClick={() => navigate('/')}>🏠 {t.home || 'Home'}</span>
                <span className="bc-sep">›</span>
                <span onClick={() => navigate(`/category/${product.category}`)}>{product.category}</span>
                <span className="bc-sep">›</span>
                <span className="active">{product.name?.substring(0, 40)}...</span>
            </div>

            {/* ── MAIN PRODUCT SECTION ── */}
            <div className="pd-container">

                {/* Left — Image */}
                <div className="pd-image-section">

                    {/* Stock Badge */}
                    {stockCount <= 5 && (
                        <div className="stock-warning">
                            🔥 Only {stockCount} left in stock!
                        </div>
                    )}

                    <div className="pd-image-wrap"
                        ref={imageRef}
                        onMouseMove={handleImageZoom}
                        onMouseEnter={() => setIsZoomed(true)}
                        onMouseLeave={() => { setIsZoomed(false); setZoomStyle({}); }}>
                        <img
                            src={product.image}
                            alt={product.name}
                            style={isZoomed ? zoomStyle : {}}
                            className={isZoomed ? 'zoomed' : ''}
                            onError={e => e.target.src = 'https://via.placeholder.com/400'}
                        />
                        {!isZoomed && <div className="zoom-hint-idle">🔍 Hover to zoom</div>}
                    </div>

                    {/* Action Buttons */}
                    <div className="pd-image-actions">
                        <button
                            className={`pd-wishlist-btn ${inWishlist ? 'active' : ''}`}
                            onClick={toggleWishlist}>
                            {inWishlist ? '❤️ Wishlisted' : '🤍 Wishlist'}
                        </button>
                        <SocialShare product={product} />
                    </div>

                    {/* WhatsApp Share */}
                    <button className="whatsapp-share-btn"
                        onClick={() => {
                            const text = `Check out: ${product.name} at ₹${product.price}!\n${window.location.href}`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                        }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                            <path d="M11.998 1.999C6.477 1.999 2 6.476 2 11.997c0 1.992.577 3.913 1.645 5.55L2.045 22l4.553-1.594c1.578.966 3.403 1.52 5.4 1.52 5.521 0 9.998-4.477 9.998-9.998 0-5.522-4.477-9.929-9.998-9.929z"/>
                        </svg>
                        Share on WhatsApp
                    </button>

                    {/* Back in Stock */}
                    <BackInStock product={product} isOutOfStock={stockCount === 0} />
                </div>

                {/* Right — Info */}
                <div className="pd-info-section">
                    <div className="pd-category-chip">{product.category?.toUpperCase()}</div>
                    <h1 className="pd-title">{product.name}</h1>

                    {/* Rating Row */}
                    <div className="pd-rating-row">
                        <span className="pd-rating-badge">
                            ★ {avgRating > 0 ? avgRating.toFixed(1) : product.rating}
                        </span>
                        <span className="pd-rating-count">{reviews.length} ratings & reviews</span>
                        <span className="pd-verified">✅ Verified</span>
                    </div>

                    {/* Price */}
                    <div className="pd-price-block">
                        <span className="pd-current-price">₹{product.price?.toLocaleString()}</span>
                        <span className="pd-original-price">₹{originalPrice?.toLocaleString()}</span>
                        <span className="pd-discount-badge">{discount}% off</span>
                    </div>
                    <p className="pd-tax-note">Inclusive of all taxes • {t.freeDelivery || 'Free Delivery'}</p>

                    {/* Offers */}
                    <div className="pd-offers">
                        <h4>🏷️ Available Offers</h4>
                        <div className="offer-item">
                            <span className="offer-tag bank">Bank</span>
                            <span>10% off on HDFC Bank Cards, T&C apply</span>
                        </div>
                        <div className="offer-item">
                            <span className="offer-tag special">Special</span>
                            <span>Extra {discount}% off — use code SAVE{discount}</span>
                        </div>
                        <div className="offer-item">
                            <span className="offer-tag emi">EMI</span>
                            <span>No Cost EMI from ₹{Math.round(product.price / 6)}/month</span>
                        </div>
                    </div>

                    {/* Size Selector */}
                    {(product.category?.includes('clothing') || product.category?.includes('fashion')) && (
                        <div className="pd-option-group">
                            <h4>Select Size</h4>
                            <div className="size-options">
                                {sizes.map(size => (
                                    <button key={size}
                                        className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                                        onClick={() => setSelectedSize(size)}>
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Color Selector */}
                    <div className="pd-option-group">
                        <h4>Select Color</h4>
                        <div className="color-options">
                            {colors.map(color => (
                                <button key={color}
                                    className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                                    style={{ background: color }}
                                    onClick={() => setSelectedColor(color)}>
                                    {selectedColor === color && <span>✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="pd-option-group">
                        <h4>Quantity</h4>
                        <div className="qty-control">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(q => Math.min(stockCount, q + 1))}>+</button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pd-actions">
                        <button
                            className={`pd-cart-btn ${addingToCart ? 'loading' : ''}`}
                            onClick={handleAddToCart}
                            disabled={addingToCart}>
                            🛒 {addingToCart ? (t.adding || 'Adding...') : (t.addToCart || 'Add to Cart')}
                        </button>
                        <button className="pd-buy-btn" onClick={handleBuyNow}>
                            ⚡ {t.buyNow || 'Buy Now'}
                        </button>
                    </div>

                    {/* Delivery Info */}
                    <div className="pd-delivery">
                        <div className="delivery-item">
                            <span className="delivery-icon">🚚</span>
                            <div>
                                <p className="delivery-title">{t.freeDelivery || 'Free Delivery'}</p>
                                <p className="delivery-sub">On orders above ₹500</p>
                            </div>
                        </div>
                        <div className="delivery-item">
                            <span className="delivery-icon">↩️</span>
                            <div>
                                <p className="delivery-title">{t.returnPolicy || '7 Days Return'}</p>
                                <p className="delivery-sub">Easy hassle-free returns</p>
                            </div>
                        </div>
                        <div className="delivery-item">
                            <span className="delivery-icon">🛡️</span>
                            <div>
                                <p className="delivery-title">1 Year Warranty</p>
                                <p className="delivery-sub">Manufacturer warranty</p>
                            </div>
                        </div>
                        <div className="delivery-item">
                            <span className="delivery-icon">💳</span>
                            <div>
                                <p className="delivery-title">Secure Payment</p>
                                <p className="delivery-sub">100% secure transactions</p>
                            </div>
                        </div>
                    </div>

                    {/* Pincode Checker */}
                    <div className="pd-pincode">
                        <h4>📍 Check Delivery</h4>
                        <div className="pincode-input-row">
                            <input
                                type="text"
                                placeholder="Enter 6-digit pincode"
                                value={pincode}
                                onChange={(e) => {
                                    setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
                                    setPincodeChecked(false);
                                }}
                                maxLength={6}
                            />
                            <button onClick={checkPincode}>Check</button>
                        </div>
                        {pincodeChecked && (
                            <p className={`pincode-msg ${pincodeMsg.includes('✅') ? 'success' : 'error'}`}>
                                {pincodeMsg}
                            </p>
                        )}
                    </div>

                    {/* EMI */}
                    <div className="pd-emi">
                        <button className="emi-toggle" onClick={() => setShowEMI(!showEMI)}>
                            💳 View EMI Options <span>{showEMI ? '▲' : '▼'}</span>
                        </button>
                        {showEMI && (
                            <div className="emi-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Duration</th>
                                            <th>Monthly EMI</th>
                                            <th>Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getEMIOptions(product.price).map((opt, i) => (
                                            <tr key={i}>
                                                <td>{opt.months} months</td>
                                                <td>₹{opt.monthly}/mo</td>
                                                <td>
                                                    <span className={`emi-tag ${opt.interest === 0 ? 'free' : 'paid'}`}>
                                                        {opt.bank}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Price History */}
                    <PriceHistoryChart currentPrice={product.price} productName={product.name} />
                </div>
            </div>

            {/* ── TABS SECTION ── */}
            <div className="pd-tabs-section">
                <div className="pd-tabs">
                    {['description', 'specifications', 'reviews', 'qa'].map(tab => (
                        <button
                            key={tab}
                            className={`pd-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}>
                            {tab === 'description' && '📄 Description'}
                            {tab === 'specifications' && '📋 Specifications'}
                            {tab === 'reviews' && `⭐ Reviews (${reviews.length})`}
                            {tab === 'qa' && '❓ Q&A'}
                        </button>
                    ))}
                </div>

                <div className="pd-tab-content">
                    {/* Description Tab */}
                    {activeTab === 'description' && (
                        <div className="tab-description">
                            <p>{product.description || 'No description available for this product.'}</p>
                            <div className="pd-highlights">
                                <h4>Key Highlights</h4>
                                <ul>
                                    <li>✅ Premium quality product</li>
                                    <li>✅ {t.freeDelivery || 'Free Delivery'} available</li>
                                    <li>✅ {t.returnPolicy || '7 Days Return'} policy</li>
                                    <li>✅ 1 Year manufacturer warranty</li>
                                    <li>✅ 100% authentic product</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Specifications Tab */}
                    {activeTab === 'specifications' && (
                        <div className="tab-specs">
                            <table className="specs-table">
                                <tbody>
                                    <tr><td>Brand</td><td>{product.brand || 'N/A'}</td></tr>
                                    <tr><td>Category</td><td>{product.category}</td></tr>
                                    <tr><td>Price</td><td>₹{product.price?.toLocaleString()}</td></tr>
                                    <tr><td>Rating</td><td>★ {product.rating}</td></tr>
                                    <tr><td>Availability</td><td>{stockCount > 0 ? `In Stock (${stockCount} left)` : 'Out of Stock'}</td></tr>
                                    <tr><td>Delivery</td><td>{t.freeDelivery || 'Free Delivery'}</td></tr>
                                    <tr><td>Return</td><td>{t.returnPolicy || '7 Days Return'}</td></tr>
                                    <tr><td>Warranty</td><td>1 Year Manufacturer Warranty</td></tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === 'reviews' && (
                        <div className="tab-reviews">
                            {/* Rating Summary */}
                            <div className="rating-summary">
                                <div className="rating-big">
                                    <span className="big-rating">{avgRating > 0 ? avgRating.toFixed(1) : product.rating}</span>
                                    <div className="big-stars">{renderStars(Math.round(avgRating || product.rating), 20)}</div>
                                    <span className="total-ratings">{reviews.length} ratings</span>
                                </div>
                                <div className="rating-bars">
                                    {[5, 4, 3, 2, 1].map(star => (
                                        <div key={star} className="rating-bar-row">
                                            <span>{star} ★</span>
                                            <div className="rating-bar-track">
                                                <div className="rating-bar-fill"
                                                    style={{
                                                        width: reviews.length ? `${(ratingDist[star] / reviews.length) * 100}%` : '0%',
                                                        background: star >= 4 ? '#388e3c' : star === 3 ? '#ff9f00' : '#d32f2f'
                                                    }} />
                                            </div>
                                            <span>{ratingDist[star] || 0}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Write Review */}
                            {user ? (
                                <div className="write-review">
                                    <h3>✍️ Write a Review</h3>
                                    <form onSubmit={handleReviewSubmit}>
                                        <div className="star-select">
                                            <span>Your Rating:</span>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <span key={star}
                                                    className={`star-pick ${reviewForm.rating >= star ? 'active' : ''}`}
                                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}>★</span>
                                            ))}
                                            <span className="rating-label">
                                                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewForm.rating]}
                                            </span>
                                        </div>
                                        <textarea
                                            placeholder="Share your experience..."
                                            value={reviewForm.comment}
                                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                            rows={4}
                                        />
                                        <button type="submit">Submit Review ⭐</button>
                                    </form>
                                </div>
                            ) : (
                                <div className="login-review-prompt">
                                    <p>⭐ Please <span onClick={() => navigate('/login')}>login</span> to write a review</p>
                                </div>
                            )}

                            {/* Reviews List */}
                            <div className="reviews-list">
                                {reviews.length === 0 ? (
                                    <div className="no-reviews">
                                        <span>📝</span>
                                        <p>No reviews yet — be the first!</p>
                                    </div>
                                ) : (
                                    reviews.map(review => (
                                        <div key={review.id} className="review-card">
                                            <div className="review-top">
                                                <div className="reviewer-avatar">
                                                    {review.userName?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="reviewer-info">
                                                    <p className="reviewer-name">{review.userName}</p>
                                                    <p className="review-date">
                                                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                                            day: 'numeric', month: 'long', year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="review-stars">{renderStars(review.rating)}</div>
                                            </div>
                                            <p className="review-text">{review.comment}</p>
                                            <div className="review-helpful">
                                                <span>Helpful?</span>
                                                <button>👍 Yes</button>
                                                <button>👎 No</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Q&A Tab */}
                    {activeTab === 'qa' && (
                        <div className="tab-qa">
                            <ProductQA productId={parseInt(id)} />
                        </div>
                    )}
                </div>
            </div>

            {/* ── RELATED PRODUCTS ── */}
            {relatedProducts.length > 0 && (
                <div className="pd-related">
                    <h2>Similar Products</h2>
                    <div className="related-grid">
                        {relatedProducts.map(p => (
                            <div key={p.id} className="related-card"
                                onClick={() => { navigate(`/product/${p.id}`); window.scrollTo(0, 0); }}>
                                <img src={p.image} alt={p.name}
                                    onError={e => e.target.src = 'https://via.placeholder.com/150'} />
                                <p className="related-name">{p.name?.substring(0, 40)}...</p>
                                <p className="related-price">₹{p.price?.toLocaleString()}</p>
                                <span className="related-rating">★ {p.rating}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── STICKY BAR ── */}
            {showStickyBar && (
                <div className="pd-sticky-bar">
                    <div className="sticky-product">
                        <img src={product.image} alt={product.name} />
                        <div>
                            <p>{product.name?.substring(0, 35)}...</p>
                            <p className="sticky-price">₹{product.price?.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="sticky-actions">
                        <button className="sticky-cart" onClick={handleAddToCart}>
                            🛒 {t.addToCart || 'Add to Cart'}
                        </button>
                        <button className="sticky-buy" onClick={handleBuyNow}>
                            ⚡ {t.buyNow || 'Buy Now'}
                        </button>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default ProductDetail;


