'use client';

import { useState } from 'react';
import { Bell, Send, Users, Calendar, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { mockEvents } from '@/lib/mock-data';

export default function OrganizerNotificationsPage() {
  const [form, setForm] = useState({ title: '', message: '', targetEvent: 'all', type: 'system' });
  const [sentNotifs, setSentNotifs] = useState([
    { id: 1, title: '⏰ Event Reminder', message: 'Web Dev Bootcamp starts in 4 days!', target: 'All Attendees', time: '2 hours ago', recipients: 118 },
    { id: 2, title: '📢 New Event Alert', message: 'Cloud Computing Masterclass is open!', target: 'All Users', time: '1 day ago', recipients: 342 },
  ]);

  const handleSend = () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Please fill in title and message');
      return;
    }
    setSentNotifs(prev => [{
      id: Date.now(),
      title: form.title,
      message: form.message,
      target: form.targetEvent === 'all' ? 'All Users' : mockEvents.find(e => e._id === form.targetEvent)?.title || 'Unknown',
      time: 'Just now',
      recipients: form.targetEvent === 'all' ? 342 : Math.floor(Math.random() * 200) + 50,
    }, ...prev]);
    setForm({ title: '', message: '', targetEvent: 'all', type: 'system' });
    toast.success('Notification sent successfully! 🔔');
  };

  return (
    <div className="animate-fade-in">
      <h1 className="font-serif text-headline text-charcoal-800 mb-2">Push Notifications</h1>
      <p className="text-charcoal-400 mb-8">Send notifications to users about events, updates, and reminders</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Form */}
        <div className="glass-card p-6">
          <h2 className="font-serif text-lg text-charcoal-800 mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-accent-red" /> Send Notification
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-600 mb-1.5">Target Audience</label>
              <select
                value={form.targetEvent}
                onChange={e => setForm({ ...form, targetEvent: e.target.value })}
                className="input-elegant"
              >
                <option value="all">All Users</option>
                {mockEvents.map(e => (
                  <option key={e._id} value={e._id}>{e.title} Attendees</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-600 mb-1.5">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {['event', 'reminder', 'system'].map(type => (
                  <button
                    key={type}
                    onClick={() => setForm({ ...form, type })}
                    className={`py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                      form.type === type ? 'bg-accent-red text-white' : 'bg-cream-200 text-charcoal-500'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-600 mb-1.5">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="input-elegant"
                placeholder="e.g., ⏰ Event Reminder"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-600 mb-1.5">Message</label>
              <textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                className="input-elegant min-h-[100px] resize-y"
                placeholder="Write your notification message..."
              />
            </div>
            <button onClick={handleSend} className="btn-primary w-full flex items-center justify-center gap-2">
              <Bell className="w-4 h-4" /> Send Notification
            </button>
          </div>

          {/* Retargeting */}
          <div className="mt-6 p-4 bg-accent-gold/5 border border-accent-gold/10 rounded-xl">
            <h3 className="text-sm font-semibold text-charcoal-800 mb-1 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-accent-gold" /> Audience Retargeting
            </h3>
            <p className="text-xs text-charcoal-400 mb-3">Notify past attendees about similar upcoming events</p>
            <button className="btn-outline text-xs px-3 py-1.5 w-full">
              Send Retargeting Notification
            </button>
          </div>
        </div>

        {/* Sent History */}
        <div>
          <h2 className="font-serif text-lg text-charcoal-800 mb-4">Sent Notifications</h2>
          <div className="space-y-3">
            {sentNotifs.map(notif => (
              <div key={notif.id} className="glass-card p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm text-charcoal-800">{notif.title}</h3>
                  <span className="text-[10px] text-charcoal-400">{notif.time}</span>
                </div>
                <p className="text-sm text-charcoal-500 mb-2">{notif.message}</p>
                <div className="flex items-center gap-3 text-[10px] text-charcoal-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {notif.recipients} recipients
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {notif.target}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
