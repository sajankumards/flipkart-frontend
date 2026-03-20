import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Notifications.css';

const Notifications = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    useEffect(() => {
        if (user) fetchNotifications();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/notifications/${user.userId}`);
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.log('Error:', error);
        }
    };

    const markAllRead = async () => {
        try {
            await fetch(`http://localhost:8080/api/notifications/${user.userId}/read-all`, {
                method: 'PUT'
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.log('Error:', error);
        }
    };

    const markRead = async (index) => {
        try {
            await fetch(`http://localhost:8080/api/notifications/${user.userId}/read/${index}`, {
                method: 'PUT'
            });
            const updated = [...notifications];
            updated[index].read = true;
            setNotifications(updated);
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.log('Error:', error);
        }
    };

    const formatTime = (timeStr) => {
        const date = new Date(timeStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 60000);
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return `${Math.floor(diff / 1440)}d ago`;
    };

    if (!user) return null;

    return (
        <div className="notifications-wrapper" ref={dropdownRef}>
            <div className="notif-bell" onClick={() => { setOpen(!open); fetchNotifications(); }}>
                🔔
                {unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount}</span>
                )}
            </div>

            {open && (
                <div className="notif-dropdown">
                    <div className="notif-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead}>Mark all read</button>
                        )}
                    </div>

                    <div className="notif-list">
                        {notifications.length === 0 ? (
                            <div className="no-notif">No notifications yet!</div>
                        ) : (
                            notifications.map((notif, index) => (
                                <div
                                    key={index}
                                    className={`notif-item ${!notif.read ? 'unread' : ''}`}
                                    onClick={() => markRead(index)}
                                >
                                    <div className="notif-icon">{notif.icon}</div>
                                    <div className="notif-content">
                                        <p>{notif.message}</p>
                                        <span>{formatTime(notif.time)}</span>
                                    </div>
                                    {!notif.read && <div className="unread-dot" />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;