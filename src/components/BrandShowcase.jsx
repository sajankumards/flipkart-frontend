import React from 'react';
import './BrandShowcase.css';

const BrandShowcase = ({ title, brands }) => {
    return (
        <div className="brand-showcase">
            <h2 className="brand-title">{title}</h2>
            <div className="brand-grid">
                {brands.map((brand, index) => (
                    <div key={index} className="brand-card">
                        <div 
                            className="brand-logo"
                            style={{ backgroundColor: `${brand.color}15` }}
                        >
                            <span className="brand-emoji">{brand.logo}</span>
                        </div>
                        <span className="brand-name">{brand.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BrandShowcase;

