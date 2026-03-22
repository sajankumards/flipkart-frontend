import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useToast } from './Toast';
import { useTranslation } from './LanguageSelector';
import './SearchPage.css';

// ── SKELETON ──
const SearchSkeleton = ({ count = 6 }) => (
    <div className="results-grid">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="search-skel-card">
                <div className="skel skel-img" />
                <div className="search-skel-info">
                    <div className="skel skel-line w60" />
                    <div className="skel skel-line w90" />
                    <div className="skel skel-line w90" />
                    <div className="skel skel-line w40" />
                    <div className="skel skel-btn" />
                </div>
            </div>
        ))}
    </div>
);

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const rawQuery = searchParams.get('q') || '';

    // ✅ CLEAN QUERY (GLOBAL FIX)
    const query = rawQuery
        .trim()
        .replace(/[.,!?।]/g, '')
        .replace(/\s+/g, ' ')
        .toLowerCase();

    const navigate = useNavigate();
    const { showToast } = useToast();
    const { t } = useTranslation();

    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [wishlist, setWishlist] = useState([]);
    const [addingToCart, setAddingToCart] = useState(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Filters
    const [sortBy, setSortBy] = useState('default');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minRating, setMinRating] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => { fetchProducts(); }, [query]);

    useEffect(() => {
        applyFilters();
    }, [products, sortBy, minPrice, maxPrice, minRating, selectedCategory]);

    // ✅ FIXED FETCH WITH CLEAN QUERY
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')/products/search?keyword=${encodeURIComponent(query)}`
            );
            const data = await res.json();

            setProducts(data);

            const cats = [...new Set(data.map(p => p.category).filter(Boolean))];
            setCategories(cats);

            if (data.length > 0) {
                const prices = data.map(p => p.price);
                setPriceRange({
                    min: Math.min(...prices),
                    max: Math.max(...prices)
                });
            }
        } catch (error) {
            console.log('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...products];

        if (selectedCategory)
            result = result.filter(p => p.category === selectedCategory);

        if (minPrice)
            result = result.filter(p => p.price >= parseFloat(minPrice));

        if (maxPrice)
            result = result.filter(p => p.price <= parseFloat(maxPrice));

        if (minRating > 0)
            result = result.filter(p => p.rating >= minRating);

        if (sortBy === 'price-low')
            result.sort((a, b) => a.price - b.price);
        else if (sortBy === 'price-high')
            result.sort((a, b) => b.price - a.price);
        else if (sortBy === 'rating')
            result.sort((a, b) => b.rating - a.rating);
        else if (sortBy === 'name')
            result.sort((a, b) => a.name.localeCompare(b.name));

        setFiltered(result);
    };

    const clearFilters = () => {
        setSortBy('default');
        setMinPrice('');
        setMaxPrice('');
        setMinRating(0);
        setSelectedCategory('');
    };

    const handleAddToCart = async (e, productId) => {
        e.stopPropagation();
        setAddingToCart(productId);
        try {
            const res = await fetch(${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity: 1 })
            });
            const data = await res.json();
            if (data.success)
                showToast(`${t.added || 'Added to Cart!'} 🛒`, 'success');
        } catch {
            showToast('Could not add to cart!', 'error');
        } finally {
            setAddingToCart(null);
        }
    };

    const toggleWishlist = (e, productId) => {
        e.stopPropagation();
        if (!user) {
            showToast('Please login first!', 'warning');
            return;
        }
        const isInWishlist = wishlist.includes(productId);
        setWishlist(prev =>
            isInWishlist
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );

        showToast(
            isInWishlist ? 'Removed from Wishlist!' : 'Added to Wishlist! ❤️',
            isInWishlist ? 'info' : 'success'
        );
    };

    const getDiscount = (price) => {
        const disc = Math.floor(Math.random() * 30) + 10;
        return {
            origPrice: Math.round(price * (1 + disc / 100)),
            disc
        };
    };

    const activeFiltersCount = [
        selectedCategory,
        minPrice,
        maxPrice,
        minRating > 0
    ].filter(Boolean).length;

    // ── FILTER SIDEBAR ──
    const FilterSidebar = () => (
        <div className="filter-sidebar">
            <h3>🔧 Filters</h3>
            <button onClick={clearFilters}>Clear All</button>

            {categories.map(cat => (
                <div key={cat} onClick={() => setSelectedCategory(cat)}>
                    {cat}
                </div>
            ))}
        </div>
    );

    return (
        <div className="search-page">
            <Navbar />

            <div className="search-header">
                <h2>
                    {query
                        ? <>Results for <span>"{query}"</span></>
                        : 'All Products'}
                </h2>
                <p>{loading ? 'Searching...' : `${filtered.length} results found`}</p>
            </div>

            <div className="search-container">
                <FilterSidebar />

                {loading ? (
                    <SearchSkeleton />
                ) : filtered.length === 0 ? (
                    <div>No results for "{query}"</div>
                ) : (
                    <div className="results-grid">
                        {filtered.map(product => {
                            const { origPrice, disc } = getDiscount(product.price);
                            return (
                                <div key={product.id}
                                    className="result-card"
                                    onClick={() => navigate(`/product/${product.id}`)}>

                                    <img src={product.image} alt={product.name} />

                                    <h4>{product.name}</h4>

                                    <p>₹{product.price}</p>

                                    <button
                                        onClick={(e) => handleAddToCart(e, product.id)}>
                                        Add to Cart
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default SearchPage;





