import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import CategoryRow from './CategoryRow';
import Footer from './Footer';
import { ProductCardSkeleton } from './LoadingSkeleton';
import { useToast } from './Toast';
import './CategoryPage.css';

const CategoryPage = ({ category: propCategory }) => {
    const { categoryName } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const category = propCategory || categoryName || location.pathname.replace('/', '') || 'all';

    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('default');

    useEffect(() => {
        fetchProducts();
    }, [category]);

    useEffect(() => {
        applySort();
    }, [products, sortBy]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8080/api/products');
            if (!res.ok) throw new Error('Products could not be added');
            const all = await res.json();

            const categoryMap = {
                'mobiles': ['smartphones', 'mobile-accessories'],
                'electronics': ['electronics', 'laptops', 'smartphones', 'mobile-accessories'],
                'fashion': ["Women's clothing", "men's clothing", "womens-dresses",
                    "mens-shirts", "tops", "womens-shoes", "mens-shoes",
                    "womens-bags", "sunglasses"],
                'home': ['furniture', 'home-decoration', 'kitchen-accessories', 'lighting'],
                'appliances': ['appliances'],
                'beauty': ['beauty', 'fragrances', 'skincare', 'skin-care'],
                'grocery': ['groceries'],
                'sports': ['sports-accessories'],
                'toys': ['motorcycle', 'automotive'],
                'books': [],
                'travel': [],
                'offers': all.map(p => p.category),
            };

            const cats = categoryMap[category];
            let result;

            if (!cats || cats.length === 0) {
                result = all;
            } else {
                result = all.filter(p => cats.includes(p.category));
            }

            if (result.length === 0) result = all;
            setProducts(result);

        } catch (error) {
            showToast('The Products Could not be loaded!', 'error');
        } finally {
            setLoading(false);
        }
    };

    const applySort = () => {
        let result = [...products];
        if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
        else if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
        else if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
        else if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
        setFiltered(result);
    };

    const addToCart = async (e, productId) => {
        e.stopPropagation();
        try {
            const res = await fetch('http://localhost:8080/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity: 1 })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Added to Cart! 🛒', 'success');
            } else {
                showToast('Could not add to card!', 'error');
            }
        } catch (error) {
            showToast('Could not add to card!', 'error');
        }
    };

    const getCategoryTitle = () => {
        const titles = {
            'mobiles': '📱 Mobiles',
            'fashion': '👗 Fashion',
            'electronics': '💻 Electronics',
            'home': '🏠 Home & Furniture',
            'appliances': '🔌 Appliances',
            'beauty': '💄 Beauty',
            'grocery': '🛒 Grocery',
            'sports': '⚽ Sports',
            'toys': '🧸 Toys',
            'books': '📚 Books',
            'travel': '✈️ Travel',
            'offers': '🔥 Top Offers',
        };
        return titles[category] || '🛍️ All Products';
    };

    return (
        <div className="category-page">
            <Navbar />
            <CategoryRow />

            <div className="category-content">
                <div className="category-header">
                    <div>
                        <h1>{getCategoryTitle()}</h1>
                        <p>{loading ? 'Loading...' : `${filtered.length} products found`}</p>
                    </div>
                    <div className="sort-bar">
                        <span>Sort by:</span>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="default">Relevance</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Highest Rated</option>
                            <option value="name">Name A-Z</option>
                        </select>
                    </div>
                </div>

                {/* Skeleton Loading */}
                {loading ? (
                    <div className="category-grid">
                        {[1,2,3,4,5,6,7,8].map(i => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="empty-category">
                        <h3>😕 No any Product found!</h3>
                        <button onClick={() => navigate('/')}>Go To HomePage</button>
                    </div>
                ) : (
                    <div className="category-grid">
                        {filtered.map(product => (
                            <div key={product.id} className="cat-product-card"
                                onClick={() => navigate(`/product/${product.id}`)}>
                                <img src={product.image} alt={product.name}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/200';
                                    }}
                                />
                                <div className="cat-product-info">
                                    <h4>{product.name}</h4>
                                    <p className="cat-category">{product.category}</p>
                                    <div className="cat-rating">⭐ {product.rating}</div>
                                    <p className="cat-price">₹{product.price}</p>
                                    <button className="cat-cart-btn"
                                        onClick={(e) => addToCart(e, product.id)}>
                                        🛒 Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default CategoryPage;