import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FlashSale.css';

const FlashSale = ({ products = [] }) => {
    const navigate = useNavigate();

    // Flash sale 6 ghante ke liye
    const getSaleEndTime = () => {
        const saved = localStorage.getItem('flashSaleEnd');
        if (saved && new Date(saved) > new Date()) return new Date(saved);
        const end = new Date();
        end.setHours(end.getHours() + 6);
        localStorage.setItem('flashSaleEnd', end.toISOString());
        return end;
    };

    const [endTime] = useState(getSaleEndTime);
    const [timeLeft, setTimeLeft] = useState({});
    const [saleProducts, setSaleProducts] = useState([]);

    useEffect(() => {
        // Random 6 products select karo with discount
        if (products.length > 0) {
            const shuffled = [...products].sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, 6).map(p => ({
                ...p,
                salePrice: Math.round(p.price * 0.6 * 100) / 100, // 40% off
                discount: 40,
                sold: Math.floor(Math.random() * 80) + 10, // 10-90% sold
            }));
            setSaleProducts(selected);
        }
    }, [products]);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const diff = endTime - now;

            if (diff <= 0) {
                clearInterval(timer);
                localStorage.removeItem('flashSaleEnd');
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            setTimeLeft({
                hours: Math.floor(diff / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    const pad = (n) => String(n).padStart(2, '0');

    if (saleProducts.length === 0) return null;

    return (
        <div className="flash-sale">
            {/* Header */}
            <div className="flash-header">
                <div className="flash-title">
                    <span className="flash-icon">⚡</span>
                    <h2>Flash Sale</h2>
                    <span className="flash-badge">UP TO 40% OFF</span>
                </div>
                <div className="flash-timer">
                    <span className="timer-label">Ends in:</span>
                    <div className="timer-boxes">
                        <div className="timer-box">
                            <span>{pad(timeLeft.hours || 0)}</span>
                            <small>Hours</small>
                        </div>
                        <span className="timer-colon">:</span>
                        <div className="timer-box">
                            <span>{pad(timeLeft.minutes || 0)}</span>
                            <small>Mins</small>
                        </div>
                        <span className="timer-colon">:</span>
                        <div className="timer-box">
                            <span>{pad(timeLeft.seconds || 0)}</span>
                            <small>Secs</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products */}
            <div className="flash-products">
                {saleProducts.map(product => (
                    <div key={product.id} className="flash-card"
                        onClick={() => navigate(`/product/${product.id}`)}>

                        <div className="flash-discount-badge">⚡ {product.discount}% OFF</div>

                        <div className="flash-img">
                            <img src={product.image} alt={product.name}
                                onError={(e) => e.target.src = 'https://via.placeholder.com/150'} />
                        </div>

                        <div className="flash-info">
                            <p className="flash-name">{product.name}</p>

                            <div className="flash-prices">
                                <span className="flash-sale-price">₹{product.salePrice}</span>
                                <span className="flash-original-price">₹{product.price}</span>
                            </div>

                            {/* Progress bar — kitna sold hua */}
                            <div className="flash-progress">
                                <div className="progress-bar">
                                    <div className="progress-fill"
                                        style={{ width: `${product.sold}%` }}>
                                    </div>
                                </div>
                                <p className="progress-text">{product.sold}% sold</p>
                            </div>

                            <button className="flash-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    fetch('http://localhost:8080/api/cart/add', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ productId: product.id, quantity: 1 })
                                    }).then(() => alert('✅ Added to Cart!'));
                                }}>
                                🛒 Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FlashSale;