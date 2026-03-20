import React, { useState } from 'react';
import Slider from 'react-slick';
import './BannerSlider.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const BannerSlider = () => {
    const [imageErrors, setImageErrors] = useState({});

    const handleImageError = (bannerId) => {
        setImageErrors(prev => ({ ...prev, [bannerId]: true }));
    };

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
        pauseOnHover: true,
        adaptiveHeight: true,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    arrows: false,
                    dots: true
                }
            }
        ]
    };

    const banners = [
        {
            id: 1,
            title: "Big Billion Days Sale",
            description: "Up to 70% Off",
            bgColor: "#ff6161",
            image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            buttonText: "Shop Now"
        },
        {
            id: 2,
            title: "Mobile Mania",
            description: "New Launches from Top Brands",
            bgColor: "#2874f0",
            image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            buttonText: "Explore"
        },
        {
            id: 3,
            title: "Fashion Festival",
            description: "Latest Trends at Min 40% Off",
            bgColor: "#ff9f00",
            image: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            buttonText: "View Collection"
        },
        {
            id: 4,
            title: "Home & Kitchen",
            description: "Premium Products at Best Prices",
            bgColor: "#fb641b",
            image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            buttonText: "Shop Now"
        }
    ];

    const handleShopNow = (bannerTitle) => {
        console.log(`Navigating to ${bannerTitle} page`);
        // Add navigation logic here
    };

    return (
        <div className="banner-slider-container">
            <div className="banner-slider">
                <Slider {...settings} aria-label="Promotional banners">
                    {banners.map((banner) => (
                        <div key={banner.id} className="banner-slide">
                            <div 
                                className="banner-content"
                                style={{ backgroundColor: banner.bgColor }}
                                role="group"
                                aria-label={`Banner: ${banner.title}`}
                            >
                                <div className="banner-text">
                                    <h2>{banner.title}</h2>
                                    <p>{banner.description}</p>
                                    <button 
                                        className="shop-now-btn"
                                        onClick={() => handleShopNow(banner.title)}
                                        aria-label={`Shop ${banner.title}`}
                                    >
                                        {banner.buttonText}
                                    </button>
                                </div>
                                <div className="banner-image">
                                    {imageErrors[banner.id] ? (
                                        <div 
                                            className="fallback-image"
                                            style={{ backgroundColor: banner.bgColor }}
                                        >
                                            <span>{banner.title}</span>
                                        </div>
                                    ) : (
                                        <img 
                                            src={banner.image} 
                                            alt={banner.title}
                                            loading="lazy"
                                            onError={() => handleImageError(banner.id)}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
};

export default BannerSlider;