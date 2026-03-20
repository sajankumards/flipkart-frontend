import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from './LanguageSelector';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    if (!product) return null;

    const { id, name, price, image, rating } = product;
    const discount = Math.floor(Math.random() * 30) + 10;
    const originalPrice = Math.round(price * (1 + discount / 100));

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const button = e.target;
        button.disabled = true;
        button.innerHTML = t.adding || 'Adding...';
        try {
            const res = await fetch('http://localhost:8080/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: id, quantity: 1 })
            });
            const result = await res.json();
            if (result.success) {
                button.innerHTML = '✅ ' + (t.added || 'Added!');
                button.style.background = '#28a745';
            }
        } catch (error) {
            button.innerHTML = '❌ ' + (t.failed || 'Failed');
            button.style.background = '#dc3545';
        } finally {
            setTimeout(() => {
                button.innerHTML = t.addToCart;
                button.style.background = '';
                button.disabled = false;
            }, 2000);
        }
    };

    return (
        <div className="product-card"
            onClick={() => navigate(`/product/${id}`)}>
            <div className="product-image">
                <img src={image} alt={name}
                    onError={(e) => e.target.src = 'https://via.placeholder.com/200'} />
                <div className="discount-badge">{discount}% off</div>
            </div>
            <div className="product-info">
                <h3 className="product-name">{name}</h3>
                <div className="product-rating">
                    <span className="rating-value">★ {rating}</span>
                </div>
                <div className="product-price">
                    <span className="current-price">₹{price?.toLocaleString()}</span>
                    <span className="original-price">₹{originalPrice?.toLocaleString()}</span>
                    <span className="discount-text">{discount}% off</span>
                </div>
                <div className="product-features">
                    <p>🚚 {t.freeDelivery}</p>
                    <p>↩️ {t.returnPolicy}</p>
                </div>
                <button className="add-to-cart-btn"
                    onClick={handleAddToCart}>
                    {t.addToCart}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;