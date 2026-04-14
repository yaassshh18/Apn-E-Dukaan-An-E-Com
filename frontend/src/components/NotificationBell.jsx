import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import api from '../api/axios';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get('notifications/');
                setNotifications(res.data?.results || res.data || []);
            } catch {
                console.error("Failed to fetch notifications");
            }
        };
        fetchNotifications();
    }, []);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const markAsRead = async (id) => {
        try {
            await api.patch(`notifications/${id}/`, { is_read: true });
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch {
            console.error("Failed to mark as read");
        }
    };

    const markAllRead = async () => {
        try {
            await api.post('notifications/mark_all_read/');
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch {
            console.error("Failed to mark all as read");
        }
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-gray-800 hover:text-primary transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl overflow-hidden z-50 border border-gray-100">
                    <div className="p-3 bg-gray-50 border-b border-gray-100 font-semibold text-gray-800">
                        <div className="flex items-center justify-between">
                            <span>Notifications</span>
                            {notifications.length > 0 && (
                                <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
                            )}
                        </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">No new notifications</div>
                        ) : (
                            notifications.map(notif => (
                                <div 
                                    key={notif.id} 
                                    onClick={() => markAsRead(notif.id)}
                                    className={`p-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${notif.is_read ? 'opacity-60' : 'bg-blue-50/30'}`}
                                >
                                    <p className="text-sm text-gray-800">{notif.message}</p>
                                    <p className="text-[11px] text-gray-500 mt-1 uppercase">{notif.notification_type || 'Update'}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
