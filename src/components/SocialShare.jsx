import React, { useState } from 'react';
import { useToast } from './Toast';
import './SocialShare.css';

const SocialShare = ({ product }) => {
    const { showToast } = useToast();
    const [showMenu, setShowMenu] = useState(false);

    const productUrl = `${window.location.origin}/product/${product?.id}`;
    const text = `Check out this amazing product: ${product?.name} at just ₹${product?.price}!`;

    const shareOptions = [
        {
            name: 'WhatsApp',
            icon: '📱',
            color: '#25D366',
            url: `https://wa.me/?text=${encodeURIComponent(text + ' ' + productUrl)}`
        },
        {
            name: 'Facebook',
            icon: '👥',
            color: '#1877F2',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`
        },
        {
            name: 'Twitter',
            icon: '🐦',
            color: '#1DA1F2',
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(productUrl)}`
        },
        {
            name: 'Telegram',
            icon: '✈️',
            color: '#0088CC',
            url: `https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(text)}`
        },
        {
            name: 'Email',
            icon: '📧',
            color: '#EA4335',
            url: `mailto:?subject=${encodeURIComponent('Check this product!')}&body=${encodeURIComponent(text + '\n\n' + productUrl)}`
        }
    ];

    const handleShare = (option) => {
        window.open(option.url, '_blank', 'width=600,height=400');
        setShowMenu(false);
        showToast(`Sharing on ${option.name}! 📤`, 'success');
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(productUrl).then(() => {
            showToast('Link copied! 🔗', 'success');
            setShowMenu(false);
        });
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product?.name,
                    text: text,
                    url: productUrl
                });
                showToast('Shared successfully! 📤', 'success');
            } catch (err) {
                setShowMenu(!showMenu);
            }
        } else {
            setShowMenu(!showMenu);
        }
    };

    return (
        <div className="social-share">
            <button className="share-btn" onClick={handleNativeShare}>
                📤 Share
            </button>

            {showMenu && (
                <div className="share-menu">
                    <p className="share-title">Share this product</p>
                    <div className="share-options">
                        {shareOptions.map(option => (
                            <button
                                key={option.name}
                                className="share-option"
                                style={{ '--color': option.color }}
                                onClick={() => handleShare(option)}>
                                <span className="share-icon">{option.icon}</span>
                                <span>{option.name}</span>
                            </button>
                        ))}
                    </div>
                    <button className="copy-link-btn" onClick={handleCopyLink}>
                        🔗 Copy Link
                    </button>
                </div>
            )}

            {showMenu && (
                <div className="share-overlay" onClick={() => setShowMenu(false)} />
            )}
        </div>
    );
};

export default SocialShare;

