import React, { useState, useEffect } from 'react';
import './DarkMode.css';

const DarkMode = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('darkMode') === 'true';
        setIsDark(saved);
        if (saved) document.body.classList.add('dark-mode');
    }, []);

    const toggleDark = () => {
        const newMode = !isDark;
        setIsDark(newMode);
        localStorage.setItem('darkMode', newMode);
        if (newMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    };

    return (
        <button className="dark-toggle" onClick={toggleDark} title="Toggle Dark Mode">
            {isDark ? '☀️' : '🌙'}
        </button>
    );
};

export default DarkMode;

