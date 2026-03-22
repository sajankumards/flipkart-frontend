import React, { useState, useEffect } from 'react';
import ColorSelector from './ColorSelector';
import './QuickView.css';

const QuickView = ({ product, onClose }) => {
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);

    // Fetch product variants
    useEffect(() => {
        const fetchVariants = async () => {
            try {
                const response = await fetch(`/api/products/${product.id}/variants`);
                const data = await response.json();
                setSelectedVariant(data[0]);
            } catch (error) {
                console.error('Error fetching variants:', error);
            }
        };
        
        fetchVariants();
    }, [product.id]);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Add to cart
    const addToCart = async () => {
        setLoading(true);
        try {
            await fetch('/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    variantId: selectedVariant?.id,
                    quantity
                })
            });
            alert('Added to cart!');
        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="quick-view-overlay" onClick={onClose}>
            <div className="quick-view-modal" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>
                
                <div className="quick-view-content">
                    <div className="product-images">
                        <img 
                            src={selectedVariant?.image || product.images[0]} 
                            alt={product.name}
                        />
                    </div>
                    
                    <div className="product-details">
                        <h2>{product.name}</h2>
                        <p className="brand">{product.brand}</p>
                        
                        <div className="rating">
                            ★ {product.rating} ({product.reviews} reviews)
                        </div>
                        
                        <p className="price">
                            ₹{selectedVariant?.price || product.price}
                            {product.originalPrice && (
                                <span className="original-price">
                                    ₹{product.originalPrice}
                                </span>
                            )}
                        </p>
                        
                        {/* Color Selector - Dynamic from API */}
                        {product.colors && (
                            <ColorSelector 
                                colors={product.colors}
                                selected={selectedVariant?.color}
                                onChange={(color) => {
                                    const variant = product.variants.find(v => v.color === color);
                                    setSelectedVariant(variant);
                                }}
                            />
                        )}
                        
                        {/* Size Selector - Dynamic */}
                        {product.sizes && (
                            <div className="size-selector">
                                <label>Size:</label>
                                <select 
                                    value={selectedVariant?.size}
                                    onChange={(e) => {
                                        const variant = product.variants.find(
                                            v => v.size === e.target.value
                                        );
                                        setSelectedVariant(variant);
                                    }}
                                >
                                    {product.sizes.map(size => (
                                        <option key={size} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        
                        {/* Quantity */}
                        <div className="quantity-selector">
                            <label>Quantity:</label>
                            <input 
                                type="number"
                                min="1"
                                max={selectedVariant?.stock || 10}
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                            />
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <button 
                                className="add-to-cart"
                                onClick={addToCart}
                                disabled={loading}
                            >
                                {loading ? 'Adding...' : 'Add to Cart'}
                            </button>
                            <button 
                                className="buy-now"
                                onClick={() => window.location.href = `/checkout?product=${product.id}`}
                            >
                                Buy Now
                            </button>
                        </div>
                        
                        {/* Product Highlights */}
                        <div className="highlights">
                            <h4>Highlights:</h4>
                            <ul>
                                {product.highlights?.map((highlight, i) => (
                                    <li key={i}>{highlight}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickView;


