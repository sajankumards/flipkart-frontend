import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecentlyViewed.css';

const RecentlyViewed = () => {
    const navigate = useNavigate();
    const [recentProducts, setRecentProducts] = useState([]);

    useEffect(() => {
        loadRecentlyViewed();
    }, []);

    const loadRecentlyViewed = async () => {
        try {
            const saved = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            if (saved.length === 0) return;

            const res = await fetch('http://localhost:8080/api/products');
            const allProducts = await res.json();

            const recent = saved
                .map(id => allProducts.find(p => p.id === id))
                .filter(Boolean)
                .slice(0, 8);

            setRecentProducts(recent);
        } catch (error) {
            console.log('Error:', error);
        }
    };

    const clearHistory = () => {
        localStorage.removeItem('recentlyViewed');
        setRecentProducts([]);
    };

    if (recentProducts.length === 0) return null;

    return (
        <div className="recently-viewed">
            <div className="rv-header">
                <h2>🕐 Recently Viewed</h2>
                <button onClick={clearHistory}>Clear History</button>
            </div>
            <div className="rv-grid">
                {recentProducts.map(product => (
                    <div key={product.id} className="rv-card"
                        onClick={() => navigate(`/product/${product.id}`)}>
                        <img src={product.image} alt={product.name} />
                        <div className="rv-info">
                            <p className="rv-name">{product.name}</p>
                            <p className="rv-price">₹{product.price}</p>
                            <p className="rv-rating">⭐ {product.rating}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentlyViewed;