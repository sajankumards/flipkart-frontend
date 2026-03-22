import React from 'react';
import './LoadingSkeleton.css';

export const ProductCardSkeleton = () => (
    <div className="skeleton-card">
        <div className="skeleton-img shimmer"></div>
        <div className="skeleton-body">
            <div className="skeleton-line long shimmer"></div>
            <div className="skeleton-line medium shimmer"></div>
            <div className="skeleton-line short shimmer"></div>
        </div>
    </div>
);

export const ProductDetailSkeleton = () => (
    <div className="skeleton-detail">
        <div className="skeleton-detail-img shimmer"></div>
        <div className="skeleton-detail-info">
            <div className="skeleton-line short shimmer"></div>
            <div className="skeleton-line long shimmer"></div>
            <div className="skeleton-line medium shimmer"></div>
            <div className="skeleton-line short shimmer"></div>
            <div className="skeleton-btn shimmer"></div>
        </div>
    </div>
);

export const CartSkeleton = () => (
    <div className="skeleton-cart">
        {[1,2,3].map(i => (
            <div key={i} className="skeleton-cart-item">
                <div className="skeleton-cart-img shimmer"></div>
                <div className="skeleton-cart-info">
                    <div className="skeleton-line long shimmer"></div>
                    <div className="skeleton-line medium shimmer"></div>
                    <div className="skeleton-line short shimmer"></div>
                </div>
            </div>
        ))}
    </div>
);


