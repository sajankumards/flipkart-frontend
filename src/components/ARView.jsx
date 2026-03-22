import React, { useState, useEffect } from 'react';
import './ARView.css';

const ARView = ({ productId }) => {
    const [modelUrl, setModelUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [arSupported, setArSupported] = useState(false);

    // Check AR support and fetch model
    useEffect(() => {
        // Check if AR is supported
        const checkARSupport = () => {
            if ('xr' in navigator) {
                navigator.xr.isSessionSupported('immersive-ar')
                    .then(supported => setArSupported(supported));
            }
        };

        const fetchModel = async () => {
            try {
                const response = await fetch(`/api/products/${productId}/3d-model`);
                const data = await response.json();
                setModelUrl(data.modelUrl);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching 3D model:', error);
                setLoading(false);
            }
        };

        checkARSupport();
        fetchModel();
    }, [productId]);

    // Launch AR view
    const launchAR = async () => {
        if (!arSupported) {
            alert('AR is not supported on your device');
            return;
        }

        try {
            // For iOS - USDZ format
            if (navigator.userAgent.includes('iPhone')) {
                const link = document.createElement('a');
                link.rel = 'ar';
                link.href = modelUrl.replace('.glb', '.usdz');
                link.click();
            } 
            // For Android - GLB format with Scene Viewer
            else {
                const intent = `intent://arvr.google.com/scene-viewer/1.0?file=${modelUrl}#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;end;`;
                window.location.href = intent;
            }
        } catch (error) {
            console.error('Error launching AR:', error);
        }
    };

    if (loading) return <div>Loading AR model...</div>;
    if (!modelUrl) return null;

    return (
        <div className="ar-view-container">
            <button 
                className="ar-button"
                onClick={launchAR}
                disabled={!arSupported}
            >
                <span className="ar-icon">🕶️</span>
                View in Your Room (AR)
            </button>
            
            {!arSupported && (
                <p className="ar-not-supported">
                    AR is not supported on your device
                </p>
            )}
            
            {/* 3D Preview using Three.js or Model Viewer */}
            <model-viewer
                src={modelUrl}
                alt="3D model"
                auto-rotate
                camera-controls
                ar
                ar-modes="webxr scene-viewer quick-look"
                style={{ width: '100%', height: '400px' }}
            />
        </div>
    );
};

export default ARView;


