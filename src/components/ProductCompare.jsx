import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './ProductCompare.css';

const ProductCompare = () => {
    const navigate = useNavigate();
    const [allProducts, setAllProducts] = useState([]);
    const [compareList, setCompareList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
        // LocalStorage se compare list load karo
        const saved = JSON.parse(localStorage.getItem('compareList') || '[]');
        setCompareList(saved);
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/products');
            const data = await res.json();
            setAllProducts(data);
        } catch (error) {
            console.log('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim()) {
            const results = allProducts.filter(p =>
                p.name.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const addToCompare = (product) => {
        if (compareList.length >= 3) {
            alert('Maximum 3 products compare kar sakte hain!');
            return;
        }
        if (compareList.find(p => p.id === product.id)) {
            alert('Product already added!');
            return;
        }
        const updated = [...compareList, product];
        setCompareList(updated);
        localStorage.setItem('compareList', JSON.stringify(updated));
        setSearchQuery('');
        setSearchResults([]);
    };

    const removeFromCompare = (productId) => {
        const updated = compareList.filter(p => p.id !== productId);
        setCompareList(updated);
        localStorage.setItem('compareList', JSON.stringify(updated));
    };

    const clearCompare = () => {
        setCompareList([]);
        localStorage.removeItem('compareList');
    };

    const addToCart = async (productId) => {
        try {
            await fetch('http://localhost:8080/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity: 1 })
            });
            alert('✅ Added to Cart!');
        } catch (error) {
            console.log('Error:', error);
        }
    };

    const getStars = (rating) => '⭐'.repeat(Math.round(rating));

    if (loading) return <div className="loading">Loading... 🔄</div>;

    return (
        <div className="compare-page">
            <Navbar />
            <div className="compare-container">
                <div className="compare-header">
                    <h2>⚖️ Product Compare</h2>
                    {compareList.length > 0 && (
                        <button className="clear-btn" onClick={clearCompare}>Clear All</button>
                    )}
                </div>

                {/* Search Box */}
                <div className="compare-search">
                    <div className="search-wrapper">
                        <input
                            type="text"
                            placeholder="🔍 Search product to compare..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            disabled={compareList.length >= 3}
                        />
                        {searchResults.length > 0 && (
                            <div className="search-dropdown">
                                {searchResults.map(product => (
                                    <div key={product.id} className="search-result-item"
                                        onClick={() => addToCompare(product)}>
                                        <img src={product.image} alt={product.name} />
                                        <div>
                                            <p>{product.name}</p>
                                            <p className="result-price">₹{product.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <p className="compare-hint">
                        {compareList.length}/3 products added
                        {compareList.length < 2 && ' — Add at least 2 to compare'}
                    </p>
                </div>

                {/* Compare Table */}
                {compareList.length === 0 ? (
                    <div className="empty-compare">
                        <h3>⚖️ No products to compare!</h3>
                        <p>Search and add products above to compare them</p>
                    </div>
                ) : (
                    <div className="compare-table-wrapper">
                        <table className="compare-table">
                            <thead>
                                <tr>
                                    <th className="feature-col">Feature</th>
                                    {compareList.map(product => (
                                        <th key={product.id}>
                                            <button className="remove-compare"
                                                onClick={() => removeFromCompare(product.id)}>✕</button>
                                            <img src={product.image} alt={product.name} />
                                            <p>{product.name}</p>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="feature-label">💰 Price</td>
                                    {compareList.map(product => (
                                        <td key={product.id} className="price-cell">
                                            ₹{product.price}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="feature-label">⭐ Rating</td>
                                    {compareList.map(product => (
                                        <td key={product.id}>
                                            <span>{getStars(product.rating)}</span>
                                            <span className="rating-num"> {product.rating}</span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="feature-label">🏷️ Category</td>
                                    {compareList.map(product => (
                                        <td key={product.id}>{product.category}</td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="feature-label">📝 Description</td>
                                    {compareList.map(product => (
                                        <td key={product.id} className="desc-cell">
                                            {product.description?.slice(0, 100)}...
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="feature-label">🚚 Delivery</td>
                                    {compareList.map(product => (
                                        <td key={product.id} className="free-text">FREE</td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="feature-label">Actions</td>
                                    {compareList.map(product => (
                                        <td key={product.id}>
                                            <button className="cart-btn"
                                                onClick={() => addToCart(product.id)}>
                                                🛒 Add to Cart
                                            </button>
                                            <button className="view-btn"
                                                onClick={() => navigate(`/product/${product.id}`)}>
                                                👁️ View
                                            </button>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default ProductCompare;