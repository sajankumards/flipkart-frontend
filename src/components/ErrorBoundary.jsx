// components/ErrorBoundary.jsx - Update karo

import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false, 
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-container">
                    <div className="error-card">
                        <div className="error-icon">😕</div>
                        
                        <h1 className="error-title">
                            Oops! Something went wrong
                        </h1>
                        
                        <p className="error-message">
                            {this.state.error?.message || 'Failed to load content. Please refresh the page.'}
                        </p>
                        
                        <div className="error-actions">
                            <button 
                                onClick={this.handleRetry}
                                className="retry-btn"
                            >
                                Try Again <span className="arrow">↻</span>
                            </button>
                            
                            <button 
                                onClick={() => window.location.href = '/'}
                                className="home-btn"
                            >
                                Go to Homepage 🏠
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && (
                            <details className="error-details">
                                <summary>Error Details</summary>
                                <pre>{this.state.error?.stack}</pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;


