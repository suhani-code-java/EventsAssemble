'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCircle, Calendar, Trophy, Info, Check } from 'lucide-react';
import type { MockNotification } from '@/lib/mock-data';

const typeIcons = {
  event: Calendar,
  reminder: Bell,
  badge: Trophy,
  system: Info,
};

const typeColors = {
  event: 'bg-accent-red/10 text-accent-red',
  reminder: 'bg-warning/10 text-warning',
  badge: 'bg-accent-gold/10 text-accent-gold',
  system: 'bg-info/10 text-info',
};

export default function NotificationsPage() {
  const [user, setUser] = useState<{ _id: string } | null>(null);
  const [notifications, setNotifications] = useState<MockNotification[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      fetch(`/api/notifications?userId=${parsedUser._id}`)
        .then((response) => response.json())
        .then((data) => setNotifications(data.notifications || []))
        .catch(() => setNotifications([]));
    }
  }, []);

  if (!user) return null;

  const userNotifs = notifications
    .filter(n => n.userId === user._id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = userNotifs.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user._id, notificationId: id, read: true }),
    }).catch(() => undefined);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => n.userId === user._id ? { ...n, read: true } : n));
    fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user._id, read: true }),
    }).catch(() => undefined);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-headline text-charcoal-800">Notifications</h1>
          <p className="text-charcoal-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-outline text-sm px-4 py-2 flex items-center gap-2">
            <Check className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      <div className="space-y-3 max-w-2xl">
        {userNotifs.map(notification => {
          const Icon = typeIcons[notification.type as keyof typeof typeIcons] || Bell;
          const color = typeColors[notification.type as keyof typeof typeColors] || typeColors.system;

          return (
            <div
              key={notification._id}
              className={`glass-card p-4 flex items-start gap-4 ${!notification.read ? 'border-l-3 border-l-accent-red bg-accent-red/[0.02]' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-charcoal-800">{notification.title}</h3>
                <p className="text-sm text-charcoal-400 mt-0.5">{notification.message}</p>
                <p className="text-[10px] text-charcoal-300 mt-2">
                  {new Date(notification.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                  })}
                </p>
              </div>
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification._id)}
                  className="text-charcoal-300 hover:text-success transition-colors shrink-0"
                  title="Mark as read"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          );
        })}

        {userNotifs.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Bell className="w-12 h-12 text-charcoal-200 mx-auto mb-4" />
            <h3 className="font-serif text-xl text-charcoal-800 mb-2">No notifications</h3>
            <p className="text-charcoal-400 text-sm">You&apos;re all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
