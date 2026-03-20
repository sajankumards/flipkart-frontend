import React, { useState, useRef, useEffect } from 'react';
import { useToast } from './Toast';
import './SpinWheel.css';

const SEGMENTS = [
    { label: 'SAVE10', color: '#FF6B6B', text: '10% OFF', points: 0 },
    { label: 'SAVE20', color: '#4ECDC4', text: '20% OFF', points: 0 },
    { label: '50 Points', color: '#45B7D1', text: '50 PTS', points: 50 },
    { label: 'SAVE30', color: '#96CEB4', text: '30% OFF', points: 0 },
    { label: '100 Points', color: '#FFEAA7', text: '100 PTS', points: 100 },
    { label: 'FLIPKART50', color: '#DDA0DD', text: '₹50 OFF', points: 0 },
    { label: '200 Points', color: '#98D8C8', text: '200 PTS', points: 200 },
    { label: 'SAVE5', color: '#F7DC6F', text: '5% OFF', points: 0 },
];

const SpinWheel = ({ onClose }) => {
    const { showToast } = useToast();
    const canvasRef = useRef(null);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState(null);
    const [rotation, setRotation] = useState(0);
    const [spinsLeft] = useState(() => {
        const lastSpin = localStorage.getItem('lastSpinDate');
        const today = new Date().toDateString();
        if (lastSpin === today) return 0;
        return 1;
    });
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        drawWheel(rotation);
    }, []);

    const drawWheel = (rot) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = canvas.width / 2 - 10;
        const segmentAngle = (2 * Math.PI) / SEGMENTS.length;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        SEGMENTS.forEach((seg, i) => {
            const startAngle = rot + i * segmentAngle;
            const endAngle = startAngle + segmentAngle;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = seg.color;
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + segmentAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#212121';
            ctx.font = 'bold 13px sans-serif';
            ctx.fillText(seg.text, radius - 15, 5);
            ctx.restore();
        });

        ctx.beginPath();
        ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#2874f0';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#2874f0';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SPIN', centerX, centerY + 4);
    };

    const spin = () => {
        if (spinning || spinsLeft <= 0) return;
        setSpinning(true);
        setResult(null);

        const extraSpins = Math.floor(Math.random() * 5) + 5;
        const randomSegment = Math.floor(Math.random() * SEGMENTS.length);
        const segmentAngle = (2 * Math.PI) / SEGMENTS.length;
        const targetAngle = extraSpins * 2 * Math.PI +
            (2 * Math.PI - randomSegment * segmentAngle - segmentAngle / 2);

        const duration = 4000;
        const startTime = Date.now();
        let currentRot = rotation;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            currentRot = rotation + targetAngle * eased;
            drawWheel(currentRot);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setSpinning(false);
                setResult(SEGMENTS[randomSegment]);
                localStorage.setItem('lastSpinDate', new Date().toDateString());

                if (SEGMENTS[randomSegment].points > 0 && user) {
                    fetch(`http://localhost:8080/api/loyalty/${user.userId}/add`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            points: SEGMENTS[randomSegment].points,
                            description: `Spin & Win: ${SEGMENTS[randomSegment].text} 🎮`
                        })
                    }).catch(console.log);
                }
                showToast(`🎉 You won: ${SEGMENTS[randomSegment].text}!`, 'success');
            }
        };
        requestAnimationFrame(animate);
    };

    const copyCode = () => {
        if (result?.label) {
            navigator.clipboard.writeText(result.label);
            showToast('Coupon copied! 🎟️', 'success');
        }
    };

    return (
        <div className="spin-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="spin-modal">
                <button className="spin-close" onClick={onClose}>✕</button>
                <div className="spin-header">
                    <h2>🎮 Spin & Win!</h2>
                    <p>Win amazing discounts & points!</p>
                    {spinsLeft === 0 && (
                        <span className="spins-left-badge">Come back tomorrow!</span>
                    )}
                </div>
                <div className="wheel-wrapper">
                    <div className="wheel-pointer">▼</div>
                    <canvas ref={canvasRef} width={300} height={300}
                        className="wheel-canvas" onClick={spin} />
                </div>
                {!result ? (
                    <button className={`spin-btn ${spinning || spinsLeft === 0 ? 'disabled' : ''}`}
                        onClick={spin} disabled={spinning || spinsLeft === 0}>
                        {spinning ? '🌀 Spinning...' :
                            spinsLeft === 0 ? '😔 No Spins Left Today' : '🎯 SPIN NOW!'}
                    </button>
                ) : (
                    <div className="spin-result">
                        <div className="result-emoji">🎉</div>
                        <h3>You Won!</h3>
                        <div className="result-reward" style={{ background: result.color }}>
                            {result.text}
                        </div>
                        {result.points === 0 ? (
                            <>
                                <p>Use code at checkout:</p>
                                <div className="result-code">
                                    <strong>{result.label}</strong>
                                    <button onClick={copyCode}>📋 Copy</button>
                                </div>
                            </>
                        ) : (
                            <p className="points-msg">🎁 {result.points} points added!</p>
                        )}
                        <button className="spin-shop-btn" onClick={onClose}>
                            🛍️ Shop Now
                        </button>
                    </div>
                )}
                <div className="spin-prizes">
                    <p>🏆 Available Prizes:</p>
                    <div className="prizes-grid">
                        {SEGMENTS.map((seg, i) => (
                            <div key={i} className="prize-chip"
                                style={{ borderColor: seg.color, color: seg.color }}>
                                {seg.text}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpinWheel;