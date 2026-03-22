import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useToast } from './Toast';
import { useTranslation } from './LanguageSelector';
import './WishlistPage.css';

// ── SKELETON ──
const WishlistSkeleton = () => (
    <div className="wishlist-grid">
        {[1,2,3,4].map(i => (
            <div key={i} className="wish-skel-card">
                <div className="skel skel-img" />
                <div className="wish-skel-info">
                    <div className="skel skel-line w80" />
                    <div className="skel skel-line w50" />
                    <div className="skel skel-line w40" />
                    <div className="skel skel-btn" />
                </div>
            </div>
        ))}
    </div>
);

const WishlistPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { t } = useTranslation();

    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);
    const [addingId, setAddingId] = useState(null);
    const [sortBy, setSortBy] = useState('default');

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const [wishlistRes, productsRes] = await Promise.all([
                fetch(`(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')/wishlist/${user.userId}`),
                fetch(${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/products')
            ]);
            const wishlistData = await wishlistRes.json();
            const productsData = await productsRes.json();
            const enrichedItems = wishlistData.items.map(item => {
                const product = productsData.find(p => p.id === item.productId);
                return { ...item, product };
            }).filter(item => item.product);
            setWishlistItems(enrichedItems);
        } catch (error) {
            console.log('Error:', error);
            showToast('Failed to load wishlist!', 'error');
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId) => {
        setRemovingId(productId);
        try {
            await fetch(`(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')/wishlist/remove?userId=${user.userId}&productId=${productId}`, {
                method: 'DELETE'
            });
            setWishlistItems(prev => prev.filter(item => item.productId !== productId));
            showToast('Removed from Wishlist!', 'info');
        } catch (error) {
            showToast('Could not remove!', 'error');
        } finally {
            setRemovingId(null);
        }
    };

    const addToCart = async (productId) => {
        setAddingId(productId);
        try {
            const res = await fetch(${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity: 1 })
            });
            const data = await res.json();
            if (data.success) showToast(`${t.added || 'Added to Cart!'} 🛒`, 'success');
        } catch (error) {
            showToast('Could not add to cart!', 'error');
        } finally {
            setAddingId(null);
        }
    };

    const moveToCart = async (productId) => {
        await addToCart(productId);
        await removeFromWishlist(productId);
    };

    const clearWishlist = async () => {
        if (!window.confirm('Clear entire wishlist?')) return;
        try {
            await Promise.all(
                wishlistItems.map(item =>
                    fetch(`(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')/wishlist/remove?userId=${user.userId}&productId=${item.productId}`, {
                        method: 'DELETE'
                    })
                )
            );
            setWishlistItems([]);
            showToast('Wishlist cleared!', 'info');
        } catch (e) {
            showToast('Could not clear wishlist!', 'error');
        }
    };

    const getSortedItems = () => {
        const items = [...wishlistItems];
        if (sortBy === 'price-low')  return items.sort((a, b) => a.product.price - b.product.price);
        if (sortBy === 'price-high') return items.sort((a, b) => b.product.price - a.product.price);
        if (sortBy === 'rating')     return items.sort((a, b) => b.product.rating - a.product.rating);
        return items;
    };

    const getDiscount = () => Math.floor(Math.random() * 30) + 10;

    return (
        <div className="wishlist-page">
            <Navbar />
            <div className="wishlist-container">

                {/* ── HEADER ── */}
                <div className="wishlist-header">
                    <div>
                        <h2>❤️ {t.wishlist || 'My Wishlist'}
                            <span className="wish-count">({wishlistItems.length})</span>
                        </h2>
                        <p className="wish-subtitle">Products you love, saved for later</p>
                    </div>
                    {wishlistItems.length > 0 && (
                        <div className="wish-header-actions">
                            {/* Sort */}
                            <select className="wish-sort"
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}>
                                <option value="default">Sort: Default</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="rating">Best Rated</option>
                            </select>
                            <button className="clear-wish-btn" onClick={clearWishlist}>
                                🗑️ Clear All
                            </button>
                        </div>
                    )}
                </div>

                {/* ── LOADING ── */}
                {loading ? <WishlistSkeleton /> :

                /* ── EMPTY ── */
                wishlistItems.length === 0 ? (
                    <div className="empty-wishlist">
                        <div className="empty-wish-icon">💔</div>
                        <h3>Your wishlist is empty!</h3>
                        <p>Save products you love and buy them later</p>
                        <button onClick={() => navigate('/')}>
                            🛍️ Start Shopping
                        </button>
                        <div className="empty-wish-links">
                            <span onClick={() => navigate('/cart')}>🛒 {t.cart || 'Cart'}</span>
                            <span onClick={() => navigate('/orders')}>📦 {t.orders || 'My Orders'}</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Move All to Cart */}
                        <div className="wish-bulk-bar">
                            <span>{wishlistItems.length} item{wishlistItems.length > 1 ? 's' : ''} in wishlist</span>
                            <button className="move-all-btn"
                                onClick={() => wishlistItems.forEach(item => moveToCart(item.productId))}>
                                🛒 Move All to Cart
                            </button>
                        </div>

                        {/* ── GRID ── */}
                        <div className="wishlist-grid">
                            {getSortedItems().map(item => {
                                const disc = getDiscount();
                                const origPrice = Math.round(item.product.price * (1 + disc / 100));
                                const isRemoving = removingId === item.productId;
                                const isAdding = addingId === item.productId;

                                return (
                                    <div key={item.productId}
                                        className={`wishlist-card ${isRemoving ? 'removing' : ''}`}>

                                        {/* Remove Button */}
                                        <button className="remove-wish"
                                            onClick={() => removeFromWishlist(item.productId)}
                                            title="Remove from Wishlist"
                                            disabled={isRemoving}>
                                            {isRemoving ? '⏳' : '✕'}
                                        </button>

                                        {/* Discount Badge */}
                                        <span className="wish-discount-badge">{disc}% off</span>

                                        {/* Image */}
                                        <div className="wish-img-wrap"
                                            onClick={() => navigate(`/product/${item.productId}`)}>
                                            <img
                                                src={item.product.image}
                                                alt={item.product.name}
                                                onError={e => e.target.src = 'https://via.placeholder.com/200'}
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="wish-info">
                                            <span className="wish-category-tag">{item.product.category}</span>
                                            <h4 onClick={() => navigate(`/product/${item.productId}`)}>
                                                {item.product.name}
                                            </h4>

                                            <div className="wish-rating-row">
                                                <span className="wish-rating-badge">★ {item.product.rating}</span>
                                            </div>

                                            <div className="wish-price-row">
                                                <span className="wish-price">
                                                    ₹{item.product.price?.toLocaleString()}
                                                </span>
                                                <span className="wish-orig-price">
                                                    ₹{origPrice?.toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="wish-offers">
                                                <span>🚚 {t.freeDelivery || 'Free Delivery'}</span>
                                                <span>↩️ {t.returnPolicy || '7 Days Return'}</span>
                                            </div>

                                            {/* Buttons */}
                                            <div className="wish-btns">
                                                <button
                                                    className={`add-cart-btn ${isAdding ? 'loading' : ''}`}
                                                    onClick={() => addToCart(item.productId)}
                                                    disabled={isAdding}>
                                                    {isAdding
                                                        ? `⏳ ${t.adding || 'Adding...'}`
                                                        : `🛒 ${t.addToCart || 'Add to Cart'}`}
                                                </button>
                                                <button className="move-cart-btn"
                                                    onClick={() => moveToCart(item.productId)}>
                                                    Move to Cart
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default WishlistPage;





