import React from 'react';
import './SkeletonLoader.css';

// ── BASE SKELETON BLOCK ──
const Skeleton = ({ width, height, borderRadius, className = '' }) => (
    <div
        className={`skeleton-block ${className}`}
        style={{
            width: width || '100%',
            height: height || '16px',
            borderRadius: borderRadius || '6px',
        }}
    />
);

// ── PRODUCT CARD SKELETON ──
export const ProductCardSkeleton = () => (
    <div className="skeleton-product-card">
        <div className="skeleton-product-image">
            <Skeleton height="200px" borderRadius="8px 8px 0 0" />
        </div>
        <div className="skeleton-product-info">
            <Skeleton height="14px" width="90%" />
            <Skeleton height="14px" width="70%" />
            <Skeleton height="12px" width="40%" className="mt-8" />
            <div className="skeleton-price-row">
                <Skeleton height="18px" width="60px" />
                <Skeleton height="14px" width="50px" />
            </div>
            <Skeleton height="36px" width="100%" borderRadius="6px" className="mt-8" />
        </div>
    </div>
);

// ── PRODUCT ROW SKELETON ──
export const ProductRowSkeleton = ({ count = 5 }) => (
    <div className="skeleton-product-row">
        {/* Row Header */}
        <div className="skeleton-row-header">
            <Skeleton height="24px" width="220px" />
            <Skeleton height="16px" width="80px" />
        </div>
        {/* Cards */}
        <div className="skeleton-cards-grid">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    </div>
);

// ── BANNER SKELETON ──
export const BannerSkeleton = () => (
    <div className="skeleton-banner">
        <Skeleton height="100%" borderRadius="12px" />
    </div>
);

// ── CATEGORY ROW SKELETON ──
export const CategoryRowSkeleton = ({ count = 10 }) => (
    <div className="skeleton-category-row">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="skeleton-category-item">
                <Skeleton width="56px" height="56px" borderRadius="50%" />
                <Skeleton height="12px" width="50px" className="mt-8" />
            </div>
        ))}
    </div>
);

// ── HOMEPAGE SKELETON ──
export const HomepageSkeleton = () => (
    <div className="skeleton-homepage">
        {/* Category Row */}
        <div className="skeleton-section">
            <CategoryRowSkeleton count={10} />
        </div>

        {/* Banner */}
        <div className="skeleton-section">
            <BannerSkeleton />
        </div>

        {/* Spin Banner */}
        <div className="skeleton-spin-banner">
            <Skeleton height="72px" borderRadius="12px" />
        </div>

        {/* Product Rows */}
        <div className="skeleton-section">
            <ProductRowSkeleton count={5} />
        </div>
        <div className="skeleton-section">
            <ProductRowSkeleton count={5} />
        </div>
        <div className="skeleton-section">
            <ProductRowSkeleton count={5} />
        </div>
    </div>
);

// ── PRODUCT DETAIL SKELETON ──
export const ProductDetailSkeleton = () => (
    <div className="skeleton-product-detail">

        {/* Breadcrumb */}
        <div className="skeleton-breadcrumb">
            <Skeleton height="13px" width="300px" />
        </div>

        <div className="skeleton-detail-grid">

            {/* Left — Images */}
            <div className="skeleton-detail-images">
                {/* Main Image */}
                <div className="skeleton-main-image">
                    <Skeleton height="100%" borderRadius="12px" />
                </div>
                {/* Thumbnails */}
                <div className="skeleton-thumbnails">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} width="64px" height="64px" borderRadius="8px" />
                    ))}
                </div>
            </div>

            {/* Right — Info */}
            <div className="skeleton-detail-info">
                {/* Title */}
                <Skeleton height="20px" width="85%" />
                <Skeleton height="20px" width="65%" className="mt-8" />

                {/* Rating */}
                <div className="skeleton-rating-row">
                    <Skeleton height="28px" width="80px" borderRadius="6px" />
                    <Skeleton height="14px" width="120px" />
                </div>

                {/* Price */}
                <div className="skeleton-price-block">
                    <Skeleton height="32px" width="100px" />
                    <Skeleton height="20px" width="80px" />
                    <Skeleton height="18px" width="60px" borderRadius="4px" />
                </div>

                {/* Offers */}
                <div className="skeleton-offers">
                    <Skeleton height="14px" width="80px" className="mb-8" />
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton-offer-row">
                            <Skeleton width="20px" height="20px" borderRadius="4px" />
                            <Skeleton height="13px" width="260px" />
                        </div>
                    ))}
                </div>

                {/* Delivery */}
                <div className="skeleton-delivery">
                    <Skeleton height="14px" width="80px" />
                    <div className="skeleton-delivery-row">
                        <Skeleton height="36px" width="180px" borderRadius="8px" />
                        <Skeleton height="14px" width="200px" />
                    </div>
                </div>

                {/* Quantity */}
                <div className="skeleton-qty-row">
                    <Skeleton height="14px" width="70px" />
                    <Skeleton height="36px" width="120px" borderRadius="8px" />
                </div>

                {/* Action Buttons */}
                <div className="skeleton-action-btns">
                    <Skeleton height="48px" width="100%" borderRadius="8px" />
                    <Skeleton height="48px" width="100%" borderRadius="8px" />
                </div>

                {/* Highlights */}
                <div className="skeleton-highlights">
                    <Skeleton height="14px" width="100px" className="mb-8" />
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="skeleton-highlight-row">
                            <Skeleton width="8px" height="8px" borderRadius="50%" />
                            <Skeleton height="13px" width={`${60 + Math.random() * 30}%`} />
                        </div>
                    ))}
                </div>

                {/* Seller */}
                <div className="skeleton-seller-row">
                    <Skeleton height="14px" width="60px" />
                    <Skeleton height="14px" width="140px" />
                </div>
            </div>
        </div>

        {/* Description / Specs Section */}
        <div className="skeleton-description">
            <Skeleton height="20px" width="200px" className="mb-16" />
            <Skeleton height="14px" width="100%" />
            <Skeleton height="14px" width="95%" className="mt-8" />
            <Skeleton height="14px" width="88%" className="mt-8" />
            <Skeleton height="14px" width="92%" className="mt-8" />
            <Skeleton height="14px" width="75%" className="mt-8" />
        </div>

        {/* Related Products */}
        <div className="skeleton-section mt-24">
            <ProductRowSkeleton count={5} />
        </div>
    </div>
);

export default {
    HomepageSkeleton,
    ProductDetailSkeleton,
    ProductRowSkeleton,
    ProductCardSkeleton,
    BannerSkeleton,
    CategoryRowSkeleton,
};





