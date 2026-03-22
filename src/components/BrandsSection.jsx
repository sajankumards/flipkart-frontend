import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BrandsSection.css';

const BrandsSection = () => {
    const navigate = useNavigate();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch brands from API
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                setLoading(true);
                // API call to fetch brands
                const response = await fetch('/api/brands');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch brands');
                }
                
                const data = await response.json();
                setBrands(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching brands:', err);
                setError('Failed to load brands. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchBrands();
    }, []);

    // Handle brand click
    const handleBrandClick = (brand) => {
        // Navigate to brand products page
        navigate(`/brand/${brand.slug || brand.id}`, {
            state: { 
                brandId: brand.id,
                brandName: brand.name,
                brandCategory: brand.category 
            }
        });
        
        // Optional: Track brand click analytics
        trackBrandClick(brand);
    };

    // Track brand clicks for analytics
    const trackBrandClick = (brand) => {
        // Send to analytics
        if (window.gtag) {
            window.gtag('event', 'brand_click', {
                brand_name: brand.name,
                brand_id: brand.id,
                category: brand.category
            });
        }
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="brands-section">
                <div className="container">
                    <h2 className="section-title">Popular Brands</h2>
                    <div className="brands-grid skeleton">
                        {[...Array(10)].map((_, index) => (
                            <div key={index} className="brand-card skeleton">
                                <div className="brand-icon shimmer"></div>
                                <div className="brand-name shimmer"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="brands-section">
                <div className="container">
                    <h2 className="section-title">Popular Brands</h2>
                    <div className="error-state">
                        <p className="error-message">{error}</p>
                        <button 
                            className="retry-btn"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // No brands found
    if (!brands || brands.length === 0) {
        return (
            <div className="brands-section">
                <div className="container">
                    <h2 className="section-title">Popular Brands</h2>
                    <p className="no-brands">No brands available at the moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="brands-section">
            <div className="container">
                <h2 className="section-title">Popular Brands</h2>
                
                <div className="brands-grid">
                    {brands.map((brand) => (
                        <div
                            key={brand.id}
                            className="brand-card"
                            onClick={() => handleBrandClick(brand)}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleBrandClick(brand);
                                }
                            }}
                            style={{
                                backgroundColor: brand.bgColor || '#f5f5f5',
                                color: brand.textColor || '#333'
                            }}
                        >
                            {brand.logo ? (
                                <img 
                                    src={brand.logo} 
                                    alt={`${brand.name} logo`}
                                    className="brand-logo"
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                        e.target.parentNode.querySelector('.brand-fallback').style.display = 'flex';
                                    }}
                                />
                            ) : (
                                <div className="brand-fallback" style={{ display: 'flex' }}>
                                    <span className="brand-icon">{brand.icon || '🏷️'}</span>
                                </div>
                            )}
                            
                            <span className="brand-name">{brand.name}</span>
                            
                            {brand.productCount > 0 && (
                                <span className="product-count">
                                    {brand.productCount} products
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BrandsSection;

