import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        if (password === 'admin123') {
            localStorage.setItem('adminToken', 'admin123');
            navigate('/admin/dashboard');
        } else {
            setError('❌ Wrong password!');
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-box">
                <div className="admin-login-logo">
                    <span>🔐</span>
                    <h1>Admin Panel</h1>
                    <p>Flipkart Clone</p>
                </div>
                <div className="admin-login-form">
                    <input
                        type="password"
                        placeholder="Enter Admin Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        autoFocus
                    />
                    {error && <p className="admin-error">{error}</p>}
                    <button onClick={handleLogin}>Login to Admin Panel</button>
                    <p className="admin-hint">Default password: admin123</p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;