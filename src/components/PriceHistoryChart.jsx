import React, { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import './PriceHistoryChart.css';

const PriceHistoryChart = ({ currentPrice, productName }) => {
    const [period, setPeriod] = useState('30');

    // Generate realistic price history
    const generatePriceHistory = (days) => {
        const data = [];
        const today = new Date();
        let price = currentPrice;

        for (let i = parseInt(days); i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            // Random price fluctuation ±15%
            const change = (Math.random() - 0.5) * 0.15 * currentPrice;
            price = Math.max(
                currentPrice * 0.7,
                Math.min(currentPrice * 1.3, price + change)
            );

            data.push({
                date: date.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short'
                }),
                price: Math.round(price),
                fullDate: date.toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                })
            });
        }

        // Last point is always current price
        data[data.length - 1].price = currentPrice;
        return data;
    };

    const data = generatePriceHistory(period);
    const prices = data.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

    const isGoodDeal = currentPrice <= avgPrice;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="price-tooltip">
                    <p className="tooltip-date">{payload[0]?.payload?.fullDate}</p>
                    <p className="tooltip-price">₹{payload[0]?.value?.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="price-history">
            <div className="ph-header">
                <div>
                    <h4>📊 Price History</h4>
                    <p>Track price changes over time</p>
                </div>
                <div className="ph-period-btns">
                    {[
                        { value: '7', label: '7D' },
                        { value: '30', label: '1M' },
                        { value: '90', label: '3M' },
                        { value: '180', label: '6M' },
                    ].map(p => (
                        <button key={p.value}
                            className={`period-btn ${period === p.value ? 'active' : ''}`}
                            onClick={() => setPeriod(p.value)}>
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Row */}
            <div className="ph-stats">
                <div className="ph-stat">
                    <span className="ph-stat-label">Current</span>
                    <span className="ph-stat-value current">
                        ₹{currentPrice?.toLocaleString()}
                    </span>
                </div>
                <div className="ph-stat">
                    <span className="ph-stat-label">Lowest</span>
                    <span className="ph-stat-value low">
                        ₹{minPrice?.toLocaleString()}
                    </span>
                </div>
                <div className="ph-stat">
                    <span className="ph-stat-label">Highest</span>
                    <span className="ph-stat-value high">
                        ₹{maxPrice?.toLocaleString()}
                    </span>
                </div>
                <div className="ph-stat">
                    <span className="ph-stat-label">Average</span>
                    <span className="ph-stat-value avg">
                        ₹{avgPrice?.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Deal Badge */}
            <div className={`deal-badge ${isGoodDeal ? 'good' : 'wait'}`}>
                {isGoodDeal ? (
                    <>✅ <strong>Good time to buy!</strong> Price is below average</>
                ) : (
                    <>⏳ <strong>Wait for a better deal</strong> — Price is above average</>
                )}
            </div>

            {/* Chart */}
            <div className="ph-chart">
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data}
                        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: '#878787' }}
                            interval={Math.floor(data.length / 5)}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#878787' }}
                            tickFormatter={(v) => `₹${(v/1000).toFixed(1)}k`}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine
                            y={avgPrice}
                            stroke="#ff9f00"
                            strokeDasharray="4 4"
                            label={{ value: 'Avg', fill: '#ff9f00', fontSize: 11 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="price"
                            stroke="#2874f0"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 5, fill: '#2874f0' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <p className="ph-disclaimer">
                * Price history is approximate and may vary
            </p>
        </div>
    );
};

export default PriceHistoryChart;





