import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './Toast';
import './ProductQA.css';

const ProductQA = ({ productId }) => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchQA();
    }, [productId]);

    const fetchQA = async () => {
        try {
            const res = await fetch(`process.env.REACT_APP_API_URL || '(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')'/qa/product/${productId}`);
            const data = await res.json();
            if (data.success) setQuestions(data.questions);
        } catch (error) {
            console.log('QA load error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAsk = async () => {
        if (!user) {
            showToast('Pehle login karo!', 'warning');
            navigate('/login');
            return;
        }
        if (!newQuestion.trim()) {
            showToast('Question likhna zaroori hai!', 'warning');
            return;
        }
        try {
            const res = await fetch('process.env.REACT_APP_API_URL || '(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')'/qa/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    question: newQuestion,
                    userName: user.name
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Question submitted successfully! ❓', 'success');
                setNewQuestion('');
                setShowForm(false);
                fetchQA();
            }
        } catch (error) {
            showToast('Question could not be submitted!', 'error');
        }
    };

    const handleVote = async (qaId) => {
        try {
            await fetch(`process.env.REACT_APP_API_URL || '(process.env.REACT_APP_API_URL || 'http://localhost:8080/api')'/qa/${qaId}/vote`, { method: 'PUT' });
            fetchQA();
        } catch (error) {
            console.log('Vote error:', error);
        }
    };

    return (
        <div className="product-qa">
            <div className="qa-header">
                <h2>❓ Questions & Answers ({questions.length})</h2>
                <button className="ask-btn" onClick={() => setShowForm(!showForm)}>
                    + Ask a Question
                </button>
            </div>

            {/* Ask Form */}
            {showForm && (
                <div className="qa-form">
                    <textarea
                        placeholder="Your question..."
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        rows={3}
                    />
                    <div className="qa-form-actions">
                        <button className="submit-qa-btn" onClick={handleAsk}>Submit Question</button>
                        <button className="cancel-qa-btn" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Questions List */}
            <div className="qa-list">
                {loading ? (
                    <p className="qa-loading">Loading... 🔄</p>
                ) : questions.length === 0 ? (
                    <div className="no-qa">
                        <p>😕 No questions yet</p>
                        <p>Be the first to ask a question!</p>
                    </div>
                ) : (
                    questions.map(qa => (
                        <div key={qa.id} className="qa-item">
                            <div className="qa-question">
                                <span className="q-icon">Q</span>
                                <div className="qa-content">
                                    <p className="qa-text">{qa.question}</p>
                                    <div className="qa-meta">
                                        <span>👤 {qa.userName}</span>
                                        <button
                                            className="vote-btn"
                                            onClick={() => handleVote(qa.id)}>
                                            👍 {qa.votes} Helpful
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {qa.answer ? (
                                <div className="qa-answer">
                                    <span className="a-icon">A</span>
                                    <div className="qa-content">
                                        <p className="qa-text">{qa.answer}</p>
                                        <span className="qa-meta">✅ {qa.answeredBy}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="qa-no-answer">
                                    <span className="a-icon pending">A</span>
                                    <p>Answer pending... 🕐</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProductQA;


