import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import QuickView from './QuickView';
import './ProductList.css';

const ProductList = ({ categoryId, searchQuery }) => {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showQuickView, setShowQuickView] = useState(false);
    
    const observer = useRef();
    const navigate = useNavigate();

    // Fetch products from API
    const fetchProducts = async () => {
        if (loading || !hasMore) return;
        
        setLoading(true);
        try {
            // API call - no hardcoded data
            const params = new URLSearchParams({
                page,
                limit: 20,
                ...(categoryId && { category: categoryId }),
                ...(searchQuery && { search: searchQuery })
            });
            
            const response = await fetch(`/api/products?${params}`);
            const data = await response.json();
            
            if (data.products.length === 0) {
                setHasMore(false);
            } else {
                setProducts(prev => [...prev, ...data.products]);
                setPage(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    // Intersection Observer for infinite scroll
    const lastProductRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchProducts();
            }
        });
        
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // Handle quick view
    const handleQuickView = (product) => {
        setSelectedProduct(product);
        setShowQuickView(true);
    };

    return (
        <div className="product-list-container">
            <div className="products-grid">
                {products.map((product, index) => (
                    <div
                        key={product.id}
                        className="product-card"
                        ref={index === products.length - 1 ? lastProductRef : null}
                    >
                        <img 
                            src={product.images[0]} 
                            alt={product.name}
                            loading="lazy"
                            onClick={() => navigate(`/product/${product.slug}`)}
                        />
                        
                        <h3>{product.name}</h3>
                        <p className="price">₹{product.price}</p>
                        
                        <button 
                            className="quick-view-btn"
                            onClick={() => handleQuickView(product)}
                        >
                            Quick View
                        </button>
                    </div>
                ))}
            </div>
            
            {loading && <div className="loading-spinner">Loading...</div>}
            
            {/* Quick View Modal */}
            {showQuickView && (
                <QuickView 
                    product={selectedProduct}
                    onClose={() => setShowQuickView(false)}
                />
            )}
        </div>
    );
};

export default ProductList;

