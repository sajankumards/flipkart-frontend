import React from 'react';
import './DealOfTheDay.css';

const DealOfTheDay = ({ product, onProductClick }) => {
    const timeLeft = {
        hours: 23,
        minutes: 59,
        seconds: 59
    };

    return (
        <div className="deal-of-the-day">
            <div className="deal-header">
                <h2>Deal of the Day</h2>
                <div className="deal-timer">
                    <span>Ends in: </span>
                    <div className="timer">
                        <span>{timeLeft.hours}h</span>
                        <span>{timeLeft.minutes}m</span>
                        <span>{timeLeft.seconds}s</span>
                    </div>
                </div>
            </div>
            <div className="deal-content" onClick={() => onProductClick(product)}>
                <div className="deal-image">
                    <img src={product.image} alt={product.name} />
                    <span className="deal-discount">-{product.discount}%</span>
                </div>
                <div className="deal-info">
                    <h3>{product.name}</h3>
                    <div className="deal-price">
                        <span className="current-price">₹{product.price}</span>
                        <span className="original-price">₹{product.originalPrice}</span>
                        <span className="discount">{product.discount}% off</span>
                    </div>
                    <div className="deal-progress">
                        <div className="progress-bar">
                            <div className="progress" style={{width: '75%'}}></div>
                        </div>
                        <span className="sold-count">Sold: 3.2k+</span>
                    </div>
                    <button className="deal-btn">Grab Now →</button>
                </div>
            </div>
        </div>
    );
};

export default DealOfTheDay;





