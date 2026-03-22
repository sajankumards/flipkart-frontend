import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductRow.css';

const ProductRow = ({ 
    title, 
    products = [], 
    viewAllLink = '/',
    onAddToCart,
    onProductClick,
    maxDiscount = 30,
    minDiscount = 10,
    deliveryText = '🚚 Free Delivery',
    buttonText = 'Add to Cart',
    showRating = true,
    showDelivery = true,
    showDiscount = true,
    loadingComponent = null,
    emptyComponent = null,
    columns = 5,
    cardClassName = '',
    apiConfig = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }
}) => {
    const navigate = useNavigate();
    const [loadingStates, setLoadingStates] = useState({});

    if (!products || products.length === 0) {
        return emptyComponent || null;
    }

    const calculateDiscount = (product) => {
        if (product.discount) return product.discount;
        return Math.floor(Math.random() * (maxDiscount - minDiscount + 1)) + minDiscount;
    };

    const calculateOriginalPrice = (product, discount) => {
        if (product.originalPrice) return product.originalPrice;
        if (product.price && discount) {
            return Math.round(product.price * (1 + discount / 100));
        }
        return product.price;
    };

    const handleAddToCart = async (e, product) => {
        e.stopPropagation();
        
        // Set loading state for this product
        setLoadingStates(prev => ({ ...prev, [product.id]: true }));

        try {
            if (onAddToCart) {
                // Custom callback provided
                await onAddToCart(product);
            } else {
                // Default API call using config
                const response = await fetch(
                    apiConfig.url || ${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/cart/add',
                    {
                        method: apiConfig.method,
                        headers: apiConfig.headers,
                        body: JSON.stringify({ 
                            productId: product.id, 
                            quantity: 1,
                            ...apiConfig.extraBody 
                        })
                    }
                );

                if (!response.ok) throw new Error('Failed to add to cart');
                
                const data = await response.json();
                
                // Show success
                const button = e.target;
                button.innerHTML = '✅ Added!';
                button.style.background = '#388e3c';
                
                // Optional callback after success
                if (apiConfig.onSuccess) apiConfig.onSuccess(data);
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            
            // Show error
            const button = e.target;
            button.innerHTML = '❌ Failed';
            button.style.background = '#dc3545';
            
            // Optional error callback
            if (apiConfig.onError) apiConfig.onError(error);
        } finally {
            // Reset button after timeout
            setTimeout(() => {
                const button = e.target;
                button.innerHTML = buttonText;
                button.style.background = '';
                setLoadingStates(prev => ({ ...prev, [product.id]: false }));
            }, 2000);
        }
    };

    const handleProductClick = (product) => {
        if (onProductClick) {
            onProductClick(product);
        } else {
            navigate(`/product/${product.id}`);
        }
    };

    const getProductImage = (product) => {
        if (product.image) return product.image;
        if (product.images && product.images.length > 0) return product.images[0];
        return 'https://via.placeholder.com/200';
    };

    const getProductRating = (product) => {
        if (product.rating) return product.rating;
        if (product.reviews && product.reviews.length > 0) {
            const avgRating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
            return avgRating.toFixed(1);
        }
        return '4.0';
    };

    return (
        <div className={`product-row ${cardClassName}`}>
            <div className="row-header">
                <h2 className="row-title">{title}</h2>
                <span 
                    className="view-all"
                    onClick={() => navigate(viewAllLink)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && navigate(viewAllLink)}
                >
                    View All →
                </span>
            </div>
            
            <div 
                className="products-container" 
                style={{ 
                    gridTemplateColumns: `repeat(${columns}, 1fr)`
                }}
            >
                {products.map((product) => {
                    if (!product || !product.id) return null;
                    
                    const discount = calculateDiscount(product);
                    const originalPrice = calculateOriginalPrice(product, discount);
                    const isLoading = loadingStates[product.id];
                    
                    return (
                        <div 
                            key={product.id}
                            className={`inline-product-card ${isLoading ? 'loading' : ''}`}
                            onClick={() => handleProductClick(product)}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => e.key === 'Enter' && handleProductClick(product)}
                        >
                            <div className="ipc-img">
                                <img 
                                    src={getProductImage(product)} 
                                    alt={product.name || product.title || 'Product'}
                                    onError={e => e.target.src = 'https://via.placeholder.com/200'}
                                    loading="lazy"
                                />
                                {showDiscount && discount > 0 && (
                                    <span className="ipc-badge">{discount}% off</span>
                                )}
                                {isLoading && (
                                    <div className="loading-spinner">⏳</div>
                                )}
                            </div>
                            
                            <div className="ipc-info">
                                <p className="ipc-name">
                                    {product.name || product.title || 'Product Name'}
                                </p>
                                
                                {showRating && (
                                    <span className="ipc-rating">
                                        ★ {getProductRating(product)}
                                    </span>
                                )}
                                
                                <div className="ipc-prices">
                                    <span className="ipc-price">
                                        ₹{(product.price || 0)?.toLocaleString()}
                                    </span>
                                    {originalPrice > product.price && (
                                        <span className="ipc-orig">
                                            ₹{originalPrice?.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                
                                {showDelivery && (
                                    <p className="ipc-free">{deliveryText}</p>
                                )}
                                
                                <button 
                                    className="ipc-cart"
                                    onClick={(e) => handleAddToCart(e, product)}
                                    disabled={isLoading}
                                    aria-label={`Add ${product.name || 'product'} to cart`}
                                >
                                    {isLoading ? '⏳' : buttonText}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Default props
ProductRow.defaultProps = {
    viewAllLink: '/',
    maxDiscount: 30,
    minDiscount: 10,
    deliveryText: '🚚 Free Delivery',
    buttonText: 'Add to Cart',
    showRating: true,
    showDelivery: true,
    showDiscount: true,
    columns: 5,
    apiConfig: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        url: ${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/cart/add',
        extraBody: {}
    }
};

export default ProductRow;





