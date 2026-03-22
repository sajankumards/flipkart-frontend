import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
    fullScreen = false,
    size = 'md',
    variant = 'primary',
    message = 'Loading...',
    subMessage = '',
    type = 'spinner', // spinner, dots, pulse, skeleton, logo
    logo = null,
    progress = false,
    progressValue = 0,
    overlay = false,
    className = '',
    theme = 'light'
}) => {
    
    const sizeClass = size === 'sm' ? 'spinner-sm' : 
                     size === 'lg' ? 'spinner-lg' : 
                     size === 'xl' ? 'spinner-xl' : '';
    
    const variantClass = variant === 'secondary' ? 'spinner-secondary' :
                        variant === 'success' ? 'spinner-success' :
                        variant === 'warning' ? 'spinner-warning' :
                        variant === 'danger' ? 'spinner-danger' : 'spinner-primary';

    // Render different loader types
    const renderLoader = () => {
        switch(type) {
            case 'dots':
                return (
                    <div className="dots-loader">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                    </div>
                );
            
            case 'pulse':
                return <div className="pulse-loader"></div>;
            
            case 'skeleton':
                return (
                    <div className="skeleton-loader">
                        <div className="skeleton-circle"></div>
                        <div className="skeleton-line short"></div>
                        <div className="skeleton-line medium"></div>
                        <div className="skeleton-line long"></div>
                        <div className="skeleton-image"></div>
                    </div>
                );
            
            case 'logo':
                return (
                    <div className="logo-loader">
                        <div className="logo-spin">{logo || '🔄'}</div>
                    </div>
                );
            
            case 'progress':
                return (
                    <div className="progress-loader">
                        <div 
                            className="progress-bar" 
                            style={{ width: `${progressValue}%` }}
                        ></div>
                    </div>
                );
            
            default:
                return (
                    <div className={`spinner ${sizeClass} ${variantClass}`}></div>
                );
        }
    };

    if (overlay) {
        return (
            <div className="loading-overlay">
                <div className={`loading-container theme-${theme}`}>
                    {renderLoader()}
                    {message && <p className="loading-message">{message}</p>}
                    {subMessage && <p className="loading-submessage">{subMessage}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className={`loading-spinner ${fullScreen ? 'full-screen' : ''} ${className}`}>
            {renderLoader()}
            {message && <p className="loading-message">{message}</p>}
            {subMessage && <p className="loading-submessage">{subMessage}</p>}
            
            {type === 'progress' && progress && (
                <p className="loading-submessage">{progressValue}% Complete</p>
            )}
        </div>
    );
};

export default LoadingSpinner;





