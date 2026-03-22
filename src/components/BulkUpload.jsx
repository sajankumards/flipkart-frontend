import React, { useState } from 'react';
import { uploadProducts } from '../services/uploadService';
import './BulkUpload.css';

const BulkUpload = ({ onUploadComplete }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [preview, setPreview] = useState([]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        
        // Preview first 5 rows
        const reader = new FileReader();
        reader.onload = (event) => {
            const lines = event.target.result.split('\n').slice(0, 6);
            setPreview(lines);
        };
        reader.readAsText(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return;
        
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await uploadProducts(formData, (progress) => {
                setProgress(progress);
            });
            
            alert(`✅ ${result.count} products uploaded!`);
            onUploadComplete?.();
            setFile(null);
            setPreview([]);
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className="bulk-upload-container">
            <h2>📦 Bulk Product Upload</h2>
            
            <div className="upload-area">
                <input 
                    type="file" 
                    accept=".csv"
                    onChange={handleFileChange}
                    id="csvInput"
                />
                <label htmlFor="csvInput" className="file-label">
                    {file ? file.name : 'Choose CSV File'}
                </label>
                
                {file && (
                    <div className="file-preview">
                        <h4>Preview:</h4>
                        <pre>{preview.join('\n')}</pre>
                    </div>
                )}
                
                {uploading && (
                    <div className="progress-bar">
                        <div className="progress-fill" style={{width: `${progress}%`}}>
                            {progress}%
                        </div>
                    </div>
                )}
                
                <button 
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="upload-btn"
                >
                    {uploading ? 'Uploading...' : '🚀 Upload Products'}
                </button>
            </div>
            
            <div className="sample-section">
                <h4>📋 Sample CSV Format:</h4>
                <pre>
                    name,price,description,image,category,rating,stock
                    iPhone 14,79999,Latest iPhone,url.jpg,Electronics,4.5,50
                </pre>
                <a href="/sample-products.csv" download className="sample-link">
                    ⬇️ Download Sample CSV
                </a>
            </div>
        </div>
    );
};

export default BulkUpload;





