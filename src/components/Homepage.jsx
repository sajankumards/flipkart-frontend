import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import Navbar from './Navbar';
import CategoryRow from './CategoryRow';
import BannerSlider from './BannerSlider';
import Footer from './Footer';
import ErrorBoundary from './ErrorBoundary';
import { useTranslation } from './LanguageSelector';
import './Homepage.css';

// Lazy load components for better performance
const FlashSale = lazy(() => import('./FlashSale'));
const ProductRow = lazy(() => import('./ProductRow'));
const RecentlyViewed = lazy(() => import('./RecentlyViewed'));
const SpinWheel = lazy(() => import('./SpinWheel'));

// API Configuration
const API_CONFIG = {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
};

// Loading component for Suspense
const LoadingSection = () => (
    <div className="section-loading">
        <div className="loading-spinner-small"></div>
    </div>
);

const Homepage = () => {
    const { t } = useTranslation();

    // State management
    const [state, setState] = useState({
        products: [],
        categories: [],
        cartCount: 0,
        loading: true,
        error: null,
        showSpin: false,
        recentlyViewed: []
    });

    const { products, categories, cartCount, loading, error, showSpin, recentlyViewed } = state;

    // Load homepage data
    useEffect(() => {
        loadHomepageData();
        loadRecentlyViewed();
    }, []);

    // Load recently viewed from localStorage
    const loadRecentlyViewed = useCallback(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            setState(prev => ({ ...prev, recentlyViewed: saved }));
        } catch (e) {
            console.error('Error loading recently viewed:', e);
        }
    }, []);

    // Fetch with timeout
    const fetchWithTimeout = useCallback(async (url, options = {}) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    ...API_CONFIG.headers,
                    ...options.headers
                }
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }, []);

    // Load homepage data
    const loadHomepageData = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const [productsData, cartData] = await Promise.all([
                fetchWithTimeout(`${API_CONFIG.baseURL}/products`),
                fetchWithTimeout(`${API_CONFIG.baseURL}/cart`).catch(() => ({ items: [] }))
            ]);

            const productList = Array.isArray(productsData) ? productsData :
                productsData?.products || [];

            const uniqueCategories = [...new Set(
                productList
                    .map(p => p.category || p.categoryName)
                    .filter(Boolean)
            )];

            const formattedCategories = uniqueCategories.map((cat, index) => ({
                id: index + 1,
                name: cat.charAt(0).toUpperCase() + cat.slice(1),
                slug: cat.toLowerCase().replace(/\s+/g, '-'),
                icon: getCategoryIcon(cat)
            }));

            setState(prev => ({
                ...prev,
                products: productList,
                categories: formattedCategories,
                cartCount: cartData?.items?.length || cartData?.totalItems || 0,
                loading: false
            }));

        } catch (error) {
            console.error('Error loading homepage:', error);
            setState(prev => ({
                ...prev,
                error: error.name === 'AbortError'
                    ? 'Request timeout. Please check your connection.'
                    : 'Failed to load content. Please refresh the page.',
                loading: false
            }));
        }
    }, [fetchWithTimeout]);

    // Get category icon
    const getCategoryIcon = (category) => {
        const icons = {
            'electronics': '💻',
            'clothing': '👕',
            'fashion': '👗',
            'home': '🏠',
            'beauty': '💄',
            'jewelry': '💍',
            'jewellery': '💍',
            'sports': '⚽',
            'books': '📚',
            'toys': '🧸',
            'groceries': '🛒',
            'food': '🍔'
        };

        const key = category?.toLowerCase() || '';
        return icons[key] || '📦';
    };

    // Handle product click
    const handleProductClick = useCallback((product) => {
        try {
            const saved = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            const updated = [product.id, ...saved.filter(id => id !== product.id)].slice(0, 10);
            localStorage.setItem('recentlyViewed', JSON.stringify(updated));
            setState(prev => ({ ...prev, recentlyViewed: updated }));
        } catch (e) {
            console.error('Error updating recently viewed:', e);
        }
    }, []);

    // Handle add to cart
    const handleAddToCart = useCallback(async (productId) => {
        try {
            const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/cart/add`, {
                method: 'POST',
                body: JSON.stringify({ productId, quantity: 1 })
            });

            if (response.success || response) {
                setState(prev => ({ ...prev, cartCount: prev.cartCount + 1 }));
                return { success: true, message: t.added };
            }
        } catch (error) {
            console.error('Cart error:', error);
            setState(prev => ({ ...prev, cartCount: prev.cartCount + 1 }));
            return {
                success: false,
                message: 'Added to local cart (offline mode)'
            };
        }
    }, [fetchWithTimeout, t]);

    // Memoized product filters
    const getProductsByCategory = useCallback((categoryName) => {
        if (!products.length) return [];

        return products
            .filter(p => {
                const productCategory = (p.category || p.categoryName || '').toLowerCase();
                return productCategory.includes(categoryName.toLowerCase());
            })
            .slice(0, 6);
    }, [products]);

    // Memoized category products
    const categoryProducts = useMemo(() => ({
        electronics: getProductsByCategory('electronics'),
        fashion: getProductsByCategory('clothing'),
        fashion2: getProductsByCategory('fashion'),
        home: getProductsByCategory('home'),
        beauty: getProductsByCategory('beauty'),
        jewelry: getProductsByCategory('jewelry'),
        sports: getProductsByCategory('sports'),
        books: getProductsByCategory('books')
    }), [getProductsByCategory]);

    // Merge fashion products
    const fashionProducts = useMemo(() => {
        const allFashion = [...categoryProducts.fashion, ...categoryProducts.fashion2];
        return [...new Map(allFashion.map(item => [item.id, item])).values()].slice(0, 6);
    }, [categoryProducts]);

    const handleRetry = useCallback(() => {
        loadHomepageData();
    }, [loadHomepageData]);

    const toggleSpinWheel = useCallback(() => {
        setState(prev => ({ ...prev, showSpin: !prev.showSpin }));
    }, []);

    // Loading UI
    if (loading) {
        return (
            <div className="homepage">
                <Navbar cartCount={cartCount} />
                <div className="homepage-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading amazing products... 🛍️</p>
                    <p className="loading-subtitle">Just a moment, we're setting up the best deals for you!</p>
                </div>
            </div>
        );
    }

    // Error UI
    if (error) {
        return (
            <div className="homepage">
                <Navbar cartCount={cartCount} />
                <div className="error-container">
                    <div className="error-icon">😕</div>
                    <h2>Oops! Something went wrong</h2>
                    <p>{error}</p>
                    <div className="error-actions">
                        <button onClick={handleRetry} className="retry-btn">
                            🔄 Try Again
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="refresh-btn"
                        >
                            🔁 Refresh Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main UI
    return (
        <div className="homepage">
            <ErrorBoundary>
                <Navbar
                    cartCount={cartCount}
                    onSearch={(query) => console.log('Search:', query)}
                />

                <main className="main-content">
                    {/* Categories */}
                    <CategoryRow
                        categories={categories}
                        onCategoryClick={(cat) => console.log('Category:', cat)}
                    />

                    {/* Banners */}
                    <BannerSlider
                        autoPlay={true}
                        interval={5000}
                    />

                    {/* Spin & Win Banner */}
                    {!showSpin && (
                        <div className="spin-banner" onClick={toggleSpinWheel}>
                            <span className="spin-icon">🎮</span>
                            <div className="spin-text">
                                <p className="spin-title">{t.spinTitle || 'Spin & Win!'}</p>
                                <p className="spin-subtitle">{t.spinSubtitle || 'Win coupons & loyalty points daily!'}</p>
                            </div>
                            <button className="spin-btn">
                                {t.spinNow || 'Spin Now →'}
                            </button>
                        </div>
                    )}

                    {/* Spin Wheel Modal */}
                    {showSpin && (
                        <Suspense fallback={<LoadingSection />}>
                            <SpinWheel
                                onClose={toggleSpinWheel}
                                onWin={(prize) => console.log('Won:', prize)}
                            />
                        </Suspense>
                    )}

                    {/* Flash Sale Section */}
                    {products.length > 0 && (
                        <div className="section-wrapper">
                            <Suspense fallback={<LoadingSection />}>
                                <FlashSale
                                    products={products.slice(0, 10)}
                                    onProductClick={handleProductClick}
                                    onAddToCart={handleAddToCart}
                                />
                            </Suspense>
                        </div>
                    )}

                    {/* Dynamic Product Sections */}
                    {categoryProducts.electronics.length > 0 && (
                        <div className="section-wrapper">
                            <Suspense fallback={<LoadingSection />}>
                                <ProductRow
                                    title={`${t.electronics || 'Electronics & Gadgets'} 💻`}
                                    products={categoryProducts.electronics}
                                    onProductClick={handleProductClick}
                                    onAddToCart={handleAddToCart}
                                    viewAllLink="/category/electronics"
                                />
                            </Suspense>
                        </div>
                    )}

                    {fashionProducts.length > 0 && (
                        <div className="section-wrapper">
                            <Suspense fallback={<LoadingSection />}>
                                <ProductRow
                                    title={`${t.fashion || 'Trending in Fashion'} 👕`}
                                    products={fashionProducts}
                                    onProductClick={handleProductClick}
                                    onAddToCart={handleAddToCart}
                                    viewAllLink="/category/fashion"
                                />
                            </Suspense>
                        </div>
                    )}

                    {categoryProducts.home.length > 0 && (
                        <div className="section-wrapper">
                            <Suspense fallback={<LoadingSection />}>
                                <ProductRow
                                    title={`${t.homeKitchen || 'Home & Kitchen'} 🏠`}
                                    products={categoryProducts.home}
                                    onProductClick={handleProductClick}
                                    onAddToCart={handleAddToCart}
                                    viewAllLink="/category/home"
                                />
                            </Suspense>
                        </div>
                    )}

                    {categoryProducts.beauty.length > 0 && (
                        <div className="section-wrapper">
                            <Suspense fallback={<LoadingSection />}>
                                <ProductRow
                                    title={`${t.beauty || 'Beauty & Skincare'} 💄`}
                                    products={categoryProducts.beauty}
                                    onProductClick={handleProductClick}
                                    onAddToCart={handleAddToCart}
                                    viewAllLink="/category/beauty"
                                />
                            </Suspense>
                        </div>
                    )}

                    {categoryProducts.jewelry.length > 0 && (
                        <div className="section-wrapper">
                            <Suspense fallback={<LoadingSection />}>
                                <ProductRow
                                    title={`${t.jewellery || 'Jewellery & Accessories'} 💍`}
                                    products={categoryProducts.jewelry}
                                    onProductClick={handleProductClick}
                                    onAddToCart={handleAddToCart}
                                    viewAllLink="/category/jewelry"
                                />
                            </Suspense>
                        </div>
                    )}

                    {categoryProducts.sports.length > 0 && (
                        <div className="section-wrapper">
                            <Suspense fallback={<LoadingSection />}>
                                <ProductRow
                                    title={`${t.sports || 'Sports & Fitness'} ⚽`}
                                    products={categoryProducts.sports}
                                    onProductClick={handleProductClick}
                                    onAddToCart={handleAddToCart}
                                    viewAllLink="/category/sports"
                                />
                            </Suspense>
                        </div>
                    )}

                    {categoryProducts.books.length > 0 && (
                        <div className="section-wrapper">
                            <Suspense fallback={<LoadingSection />}>
                                <ProductRow
                                    title={`${t.books || 'Books & Stationery'} 📚`}
                                    products={categoryProducts.books}
                                    onProductClick={handleProductClick}
                                    onAddToCart={handleAddToCart}
                                    viewAllLink="/category/books"
                                />
                            </Suspense>
                        </div>
                    )}

                    {/* All Products Section */}
                    {products.length > 0 && (
                        <div className="section-wrapper">
                            <Suspense fallback={<LoadingSection />}>
                                <ProductRow
                                    title={`${t.allProducts || 'All Products'} 🛍️`}
                                    products={products.slice(0, 6)}
                                    onProductClick={handleProductClick}
                                    onAddToCart={handleAddToCart}
                                    viewAllLink="/products"
                                />
                            </Suspense>
                        </div>
                    )}

                    {/* Recently Viewed */}
                    {recentlyViewed.length > 0 && (
                        <div className="section-wrapper">
                            <Suspense fallback={<LoadingSection />}>
                                <RecentlyViewed
                                    productIds={recentlyViewed}
                                    onProductClick={handleProductClick}
                                />
                            </Suspense>
                        </div>
                    )}
                </main>

                <Footer />
            </ErrorBoundary>
        </div>
    );
};

export default Homepage;