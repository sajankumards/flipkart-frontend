import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useToast } from './Toast';
import './LoyaltyPage.css';

const LoyaltyPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loyalty, setLoyalty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [referralInput, setReferralInput] = useState('');
    const [redeemPoints, setRedeemPoints] = useState('');
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchLoyalty();
    }, []);

    const fetchLoyalty = async () => {
        try {
            const res = await fetch(`(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')/loyalty/${user.userId}`);
            const data = await res.json();
            if (data.success) setLoyalty(data.loyalty);
        } catch (error) {
            console.log('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async () => {
        const points = parseInt(redeemPoints);
        if (!points || points < 100) {
            showToast('Minimum 100 points required for redemption!', 'warning');
            return;
        }
        try {
            const res = await fetch(`(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')/loyalty/${user.userId}/redeem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ points })
            });
            const data = await res.json();
            if (data.success) {
                showToast(`₹${data.discount} You got discount! 🎉`, 'success');
                setRedeemPoints('');
                fetchLoyalty();
            } else {
                showToast(data.message, 'error');
            }
        } catch (error) {
            showToast('Error redeeming points!', 'error');
        }
    };

    const handleReferral = async () => {
        if (!referralInput.trim()) {
            showToast('Please enter a referral code!', 'warning');
            return;
        }
        try {
            const res = await fetch(${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/loyalty/referral/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: referralInput, userId: user.userId })
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message, 'success');
                setReferralInput('');
                fetchLoyalty();
            } else {
                showToast(data.message, 'error');
            }
        } catch (error) {
            showToast('Error applying referral!', 'error');
        }
    };

    const copyReferralCode = () => {
        navigator.clipboard.writeText(loyalty?.referralCode);
        showToast('Referral code copied! 🔗', 'success');
    };

    const tierColors = {
        'Silver': '#9e9e9e',
        'Platinum': '#2874f0',
        'Gold': '#ff9f00'
    };

    const tierIcons = {
        'Silver': '🥈',
        'Platinum': '💎',
        'Gold': '🥇'
    };

    if (loading) return (
        <div className="loyalty-page">
            <Navbar />
            <div style={{textAlign:'center', padding:'100px'}}>Loading... 🔄</div>
        </div>
    );

    return (
        <div className="loyalty-page">
            <Navbar />
            <div className="loyalty-container">
                <h1>🎁 Loyalty & Rewards</h1>

                {/* Points Card */}
                <div className="points-card"
                    style={{ background: `linear-gradient(135deg, ${tierColors[loyalty?.tier]}, ${tierColors[loyalty?.tier]}99)` }}>
                    <div className="points-card-left">
                        <p className="tier-label">{tierIcons[loyalty?.tier]} {loyalty?.tier} Member</p>
                        <h2 className="points-value">{loyalty?.points}</h2>
                        <p className="points-label">Available Points</p>
                        <p className="points-worth">Worth ₹{(loyalty?.points * 0.1).toFixed(2)}</p>
                    </div>
                    <div className="points-card-right">
                        <div className="stat-box">
                            <p className="stat-value">{loyalty?.totalEarned}</p>
                            <p className="stat-label">Total Earned</p>
                        </div>
                        <div className="stat-box">
                            <p className="stat-value">{loyalty?.referrals}</p>
                            <p className="stat-label">Referrals</p>
                        </div>
                    </div>
                </div>

                {/* Progress to next tier */}
                {loyalty?.pointsToNextTier > 0 && (
                    <div className="tier-progress">
                        <p>Next Tier: <strong>{loyalty?.nextTier}</strong> — {loyalty?.pointsToNextTier} points needed</p>
                        <div className="tier-bar">
                            <div className="tier-fill"
                                style={{ width: `${Math.min(100, ((loyalty?.points || 0) / (loyalty?.points + loyalty?.pointsToNextTier)) * 100)}%` }}>
                            </div>
                        </div>
                    </div>
                )}

                <div className="loyalty-grid">
                    {/* Redeem Points */}
                    <div className="loyalty-card">
                        <h3>💰 Redeem Points</h3>
                        <p className="card-desc">100 points = ₹10 discount</p>
                        <div className="redeem-input">
                            <input
                                type="number"
                                placeholder="Enter points (min 100)"
                                value={redeemPoints}
                                onChange={(e) => setRedeemPoints(e.target.value)}
                                min="100"
                                max={loyalty?.points}
                            />
                            <button onClick={handleRedeem}>Redeem</button>
                        </div>
                        {redeemPoints >= 100 && (
                            <p className="redeem-preview">
                                You'll get ₹{(redeemPoints * 0.1).toFixed(2)} discount!
                            </p>
                        )}
                    </div>

                    {/* Referral */}
                    <div className="loyalty-card">
                        <h3>👥 Refer & Earn</h3>
                        <p className="card-desc">Refer friend = 200 points for you + 100 for them!</p>
                        <div className="referral-code-box">
                            <span>Your Code:</span>
                            <strong>{loyalty?.referralCode}</strong>
                            <button onClick={copyReferralCode}>📋 Copy</button>
                        </div>
                        <p className="or-divider">— OR apply friend's code —</p>
                        <div className="redeem-input">
                            <input
                                type="text"
                                placeholder="Enter referral code"
                                value={referralInput}
                                onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                            />
                            <button onClick={handleReferral}>Apply</button>
                        </div>
                    </div>

                    {/* How to Earn */}
                    <div className="loyalty-card">
                        <h3>⭐ How to Earn Points</h3>
                        <div className="earn-list">
                            {[
                                { icon: '🛒', action: 'Purchase', points: '10% of order value' },
                                { icon: '⭐', action: 'Write Review', points: '50 points' },
                                { icon: '👥', action: 'Refer Friend', points: '200 points' },
                                { icon: '🎂', action: 'Birthday Bonus', points: '500 points' },
                                { icon: '🎉', action: 'Welcome Bonus', points: '100 points' },
                            ].map(item => (
                                <div key={item.action} className="earn-item">
                                    <span className="earn-icon">{item.icon}</span>
                                    <span className="earn-action">{item.action}</span>
                                    <span className="earn-points">+{item.points}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* History */}
                <div className="loyalty-history">
                    <h3>📋 Points History</h3>
                    <div className="history-list">
                        {loyalty?.history?.length === 0 ? (
                            <p className="no-history">No history available yet.</p>
                        ) : (
                            loyalty?.history?.slice(0, 10).map((item, index) => (
                                <div key={index} className="history-item">
                                    <div className="history-left">
                                        <span className={`history-icon ${item.type}`}>
                                            {item.type === 'earned' ? '⬆️' : '⬇️'}
                                        </span>
                                        <div>
                                            <p className="history-desc">{item.description}</p>
                                            <p className="history-date">{item.date?.substring(0, 24)}</p>
                                        </div>
                                    </div>
                                    <span className={`history-points ${item.type}`}>
                                        {item.type === 'earned' ? '+' : ''}{item.points} pts
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default LoyaltyPage;





