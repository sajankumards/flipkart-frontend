import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';
import './PushNotifications.css';

const PushNotifications = () => {
    const { showToast } = useToast();
    const [permission, setPermission] = useState(Notification.permission);
    const [enabled, setEnabled] = useState(false);

    // Scheduled notification messages
    const notifications = [
        { title: '⚡ Flash Sale Live!', body: 'Up to 40% off on Electronics! Limited time only.', delay: 10000 },
        { title: '🛒 Items in your Cart!', body: 'Complete your purchase before they sell out!', delay: 30000 },
        { title: '🎁 Loyalty Points!', body: 'You have points waiting to be redeemed!', delay: 60000 },
        { title: '📦 New Arrivals!', body: 'Check out the latest products just added!', delay: 120000 },
    ];

    useEffect(() => {
        const savedEnabled = localStorage.getItem('pushEnabled') === 'true';
        setEnabled(savedEnabled);
        if (savedEnabled && Notification.permission === 'granted') {
            scheduleNotifications();
        }
    }, []);

    const requestPermission = async () => {
        if (!('Notification' in window)) {
            showToast('Aapka browser notifications support nahi karta!', 'error');
            return;
        }

        const result = await Notification.requestPermission();
        setPermission(result);

        if (result === 'granted') {
            setEnabled(true);
            localStorage.setItem('pushEnabled', 'true');
            showToast('Push Notifications enabled! 🔔', 'success');

            // Welcome notification
            new Notification('🎉 Flipkart Notifications Enabled!', {
                body: 'Aapko ab offers, deals aur order updates milenge!',
                icon: '/favicon.ico',
                badge: '/favicon.ico',
            });

            scheduleNotifications();
        } else {
            showToast('Notification permission denied!', 'warning');
        }
    };

    const scheduleNotifications = () => {
        notifications.forEach(notif => {
            setTimeout(() => {
                if (Notification.permission === 'granted') {
                    new Notification(notif.title, {
                        body: notif.body,
                        icon: '/favicon.ico',
                    });
                }
            }, notif.delay);
        });
    };

    const disableNotifications = () => {
        setEnabled(false);
        localStorage.setItem('pushEnabled', 'false');
        showToast('Push Notifications disabled!', 'info');
    };

    const sendTestNotification = () => {
        if (Notification.permission === 'granted') {
            new Notification('🔔 Test Notification', {
                body: 'Yeh ek test notification hai! Sab kaam kar raha hai! ✅',
                icon: '/favicon.ico',
            });
            showToast('Test notification sent! 🔔', 'success');
        } else {
            showToast('Pehle notifications enable karo!', 'warning');
        }
    };

    return (
        <div className="push-notif-wrapper">
            {!enabled || permission !== 'granted' ? (
                <button className="enable-notif-btn" onClick={requestPermission}>
                    🔔 Enable Notifications
                </button>
            ) : (
                <div className="notif-controls">
                    <button className="test-notif-btn" onClick={sendTestNotification}
                        title="Test Notification">
                        🔔
                    </button>
                </div>
            )}
        </div>
    );
};

export default PushNotifications;