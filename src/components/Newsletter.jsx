import React, { useState } from 'react';
import './Newsletter.css';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail('');
            setTimeout(() => setSubscribed(false), 3000);
        }
    };

    return (
        <div className="newsletter">
            <div className="newsletter-content">
                <h2>Stay in the Loop!</h2>
                <p>Subscribe to get updates on new arrivals and special offers</p>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="email" 
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit">Subscribe</button>
                </form>
                {subscribed && (
                    <div className="success-message">
                        ✅ Thanks for subscribing!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Newsletter;

