import React, { useState, useEffect } from 'react';
import './PWAInstall.css';

const PWAInstall = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showButton, setShowButton] = useState(false);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setInstalled(true);
            return;
        }

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowButton(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', () => {
            setInstalled(true);
            setShowButton(false);
        });

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setInstalled(true);
            setShowButton(false);
        }
        setDeferredPrompt(null);
    };

    if (installed || !showButton) return null;

    return (
        <div className="pwa-banner">
            <div className="pwa-content">
                <span className="pwa-icon">📱</span>
                <div className="pwa-text">
                    <p>Install Flipkart App</p>
                    <p>Fast & easy shopping!</p>
                </div>
                <button className="pwa-install-btn" onClick={handleInstall}>
                    Install
                </button>
                <button className="pwa-close-btn"
                    onClick={() => setShowButton(false)}>✕</button>
            </div>
        </div>
    );
};

export default PWAInstall;





