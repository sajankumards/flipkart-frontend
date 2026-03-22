import React from 'react';
import './RecommendedProducts.css';

const RecommendedProducts = ({ products, onProductClick }) => {
    return (
        <div className="recommended-section">
            <h2>Recommended For You</h2>
            <div className="recommended-grid">
                {products.map((product) => (
                    <div 
                        key={product.id} 
                        className="recommended-card"
                        onClick={() => onProductClick(product)}
                    >
                        <div className="card-image">
                            <img src={product.image} alt={product.name} />
                        </div>
                        <div className="card-info">
                            <h3>{product.name}</h3>
                            <div className="card-price">
                                <span className="price">₹{product.price}</span>
                                <span className="original">₹{product.originalPrice}</span>
                            </div>
                            <div className="card-rating">
                                ⭐ {product.rating} | {product.reviews}+ reviews
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecommendedProducts;


