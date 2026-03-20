import React, { useState, useEffect, useRef } from 'react';
import './Product360View.css';

const Product360View = ({ productId }) => {
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const startXRef = useRef(0);
    const containerRef = useRef(null);

    // Fetch 360 images from API
    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await fetch(`/api/products/${productId}/360-images`);
                const data = await response.json();
                setImages(data.images);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching 360 images:', error);
                setLoading(false);
            }
        };
        
        fetchImages();
    }, [productId]);

    // Handle mouse/touch drag for rotation
    const handleMouseDown = (e) => {
        setIsDragging(true);
        startXRef.current = e.clientX;
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startXRef.current;
        if (Math.abs(deltaX) > 50) {
            const direction = deltaX > 0 ? -1 : 1;
            setCurrentIndex(prev => {
                let newIndex = prev + direction;
                if (newIndex < 0) newIndex = images.length - 1;
                if (newIndex >= images.length) newIndex = 0;
                return newIndex;
            });
            startXRef.current = e.clientX;
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    if (loading) return <div>Loading 360 view...</div>;
    if (images.length === 0) return null;

    return (
        <div 
            className="product-360-view"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <img 
                src={images[currentIndex]} 
                alt={`Product view ${currentIndex + 1}`}
                draggable="false"
            />
            
            <div className="rotation-indicator">
                Drag to rotate 360°
            </div>
            
            <div className="thumbnail-strip">
                {images.map((img, index) => (
                    <button
                        key={index}
                        className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                    >
                        <img src={img} alt={`Thumbnail ${index + 1}`} />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Product360View;