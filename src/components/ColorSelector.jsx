import React from 'react';
import './ColorSelector.css';

const ColorSelector = ({ colors, selected, onChange }) => {
    return (
        <div className="color-selector">
            <label>Color:</label>
            <div className="color-options">
                {colors.map((color) => (
                    <button
                        key={color.id || color.name}
                        className={`color-btn ${selected === color.name ? 'active' : ''}`}
                        style={{ 
                            backgroundColor: color.code,
                            border: color.code === '#ffffff' ? '1px solid #ddd' : 'none'
                        }}
                        onClick={() => onChange(color.name)}
                        title={color.name}
                    >
                        {selected === color.name && <span className="check">✓</span>}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ColorSelector;


