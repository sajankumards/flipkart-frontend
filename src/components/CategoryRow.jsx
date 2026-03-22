import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CategoryRow.css';

const categories = [
    { id: 1, name: 'Top Offers', icon: '🎁', color: '#ff6161', link: '/offers' },
    { id: 2, name: 'Mobiles', icon: '📱', color: '#2874f0', link: '/mobiles' },
    { id: 3, name: 'Electronics', icon: '💻', color: '#2a2a2a', link: '/electronics' },
    { id: 4, name: 'Fashion', icon: '👕', color: '#ff9f00', link: '/fashion' },
    { id: 5, name: 'Home', icon: '🏠', color: '#0d6b6b', link: '/home' },
    { id: 6, name: 'Appliances', icon: '🔌', color: '#fb641b', link: '/appliances' },
    { id: 7, name: 'Travel', icon: '✈️', color: '#4a90e2', link: '/travel' },
    { id: 8, name: 'Beauty', icon: '💄', color: '#e83e8c', link: '/beauty' },
    { id: 9, name: 'Grocery', icon: '🛒', color: '#28a745', link: '/grocery' },
    { id: 10, name: 'Toys', icon: '🧸', color: '#dc3545', link: '/toys' },
    { id: 11, name: 'Sports', icon: '⚽', color: '#fd7e14', link: '/sports' },
    { id: 12, name: 'Books', icon: '📚', color: '#6f42c1', link: '/books' }
];

const CategoryRow = () => {
    const navigate = useNavigate();
    const [scrollPosition, setScrollPosition] = useState(0);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const handleCategoryClick = (link) => {
        navigate(link);  // Navigation to category page
    };

    const scroll = (direction) => {
        const container = document.querySelector('.category-container');
        if (container) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            
            setTimeout(() => {
                setShowLeftArrow(container.scrollLeft > 0);
                setShowRightArrow(
                    container.scrollLeft < container.scrollWidth - container.clientWidth
                );
            }, 100);
        }
    };

    const handleScroll = (e) => {
        const container = e.target;
        setShowLeftArrow(container.scrollLeft > 0);
        setShowRightArrow(
            container.scrollLeft < container.scrollWidth - container.clientWidth
        );
    };

    return (
        <div className="category-row-wrapper">
            <div className="category-row">
                {showLeftArrow && (
                    <button 
                        className="scroll-arrow left"
                        onClick={() => scroll('left')}
                        aria-label="Scroll left"
                    >
                        ‹
                    </button>
                )}
                
                <div 
                    className="category-container"
                    onScroll={handleScroll}
                >
                    {categories.map((category) => (
                        <div 
                            key={category.id} 
                            className="category-item"
                            onClick={() => handleCategoryClick(category.link)}
                            role="button"
                            tabIndex={0}
                            aria-label={`Shop ${category.name}`}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleCategoryClick(category.link);
                                }
                            }}
                        >
                            <div 
                                className="category-icon"
                                style={{ backgroundColor: `${category.color}15` }}
                            >
                                <span className="icon">{category.icon}</span>
                            </div>
                            <span className="category-name">{category.name}</span>
                        </div>
                    ))}
                </div>

                {showRightArrow && (
                    <button 
                        className="scroll-arrow right"
                        onClick={() => scroll('right')}
                        aria-label="Scroll right"
                    >
                        ›
                    </button>
                )}
            </div>
        </div>
    );
};

export default CategoryRow;





