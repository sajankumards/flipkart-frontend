import React, { useState, useEffect, useRef } from 'react';
import './LiveChat.css';

const LiveChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [agentName] = useState('SAJAN');
    const messagesEndRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('user'));

 const botResponses = {
  'order': [
    'To track your order, please visit the /track-order page! 📦',
    'For any order-related issues, please share your order ID.'
  ],
  'return': [
    'Return policy: You can return within 7 days! ↩️',
    'To initiate a return, go to the Orders page and click the Return button.'
  ],
  'payment': [
    'We accept UPI, Card, Net Banking, and COD! 💳',
    'Payment failed? Please confirm with your bank and try again.'
  ],
  'delivery': [
    'Free delivery is available on all orders! 🚚',
    'Delivery takes 2-5 business days.'
  ],
  'cancel': [
    'To cancel your order, go to the Orders page. ❌',
    'You can cancel within 24 hours before it is shipped.'
  ],
  'discount': [
    'SAVE10, SAVE20, SAVE30, and FLIPKART50 coupons are available! 🎟️',
    'Apply the coupon code on the Cart page.'
  ],
  'hello': [
    'Hello! I am Priya, how can I help you? 😊',
    'Welcome to Flipkart Customer Support! 🙏'
  ],
  'hi': [
    'Hi! I am Priya. How can I assist you today? 😊'
  ],
  'help': [
    'I can help you with:\n• Order tracking\n• Returns & refunds\n• Payment issues\n• Delivery queries\n• Discounts & offers\n\nWhat would you like to ask? 😊'
  ],
  'refund': [
    'Refunds are processed within 5-7 business days. 💰',
    'To check refund status, go to the Orders page.'
  ],
  'default': [
    'Got it! Let me check on that. Please wait a moment. 🔍',
    'I am listening! Could you provide more details? 😊',
    'I am escalating this issue to the senior team. You will receive a reply within 24 hours. 📧',
    'Sure! Let’s find a solution to your problem. 💪'
  ]
};

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            // Welcome message
            setTimeout(() => {
                addBotMessage(`Namaste ${user?.name?.split(' ')[0] || 'Guest'}! 👋 I'am ${agentName}, Flipkart Customer Support. How can I help you?`);
            }, 500);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addBotMessage = (text) => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            text,
            sender: 'bot',
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }]);
    };

    const getBotResponse = (userMessage) => {
        const lower = userMessage.toLowerCase();
        for (const [key, responses] of Object.entries(botResponses)) {
            if (lower.includes(key)) {
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }
        const defaults = botResponses['default'];
        return defaults[Math.floor(Math.random() * defaults.length)];
    };

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = {
            id: Date.now(),
            text: input,
            sender: 'user',
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Bot response delay
        setTimeout(() => {
            setIsTyping(false);
            addBotMessage(getBotResponse(input));
        }, 1000 + Math.random() * 1000);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickReplies = ['Track Order', 'Return Policy', 'Discount Codes', 'Payment Help', 'Delivery Info'];

    return (
        <div className="live-chat-wrapper">
            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    {/* Header */}
                    <div className="chat-header">
                        <div className="agent-info">
                            <div className="agent-avatar">{agentName[0]}</div>
                            <div>
                                <p className="agent-name">{agentName}</p>
                                <p className="agent-status">● Online</p>
                            </div>
                        </div>
                        <div className="chat-header-actions">
                            <span title="Minimize" onClick={() => setIsOpen(false)}>✕</span>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        {messages.map(msg => (
                            <div key={msg.id} className={`message ${msg.sender}`}>
                                {msg.sender === 'bot' && (
                                    <div className="bot-avatar">{agentName[0]}</div>
                                )}
                                <div className="message-bubble">
                                    <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                                    <span className="msg-time">{msg.time}</span>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="message bot">
                                <div className="bot-avatar">{agentName[0]}</div>
                                <div className="message-bubble typing">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Replies */}
                    <div className="quick-replies">
                        {quickReplies.map(reply => (
                            <button key={reply} onClick={() => {
                                setInput(reply);
                                setTimeout(() => handleSend(), 100);
                            }}>
                                {reply}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="chat-input">
                        <textarea
                            placeholder="Message likhein..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            rows={1}
                        />
                        <button onClick={handleSend} disabled={!input.trim()}>
                            ➤
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                className={`chat-toggle ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '✕' : '💬'}
                {!isOpen && <span className="chat-badge">1</span>}
            </button>
        </div>
    );
};

export default LiveChat;


