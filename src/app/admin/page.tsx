'use client';

import { useState, useEffect } from 'react';
import { LogOut, Users, Calendar, BarChart3, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalRegistrations: number;
  usersByRole: { role: string; count: number }[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminEvent {
  _id: string;
  title: string;
  date: string;
  organizer: string;
  registeredCount: number;
  capacity: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'events'>('overview');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      // Only allow admins
      if (parsedUser.role !== 'admin' && parsedUser.role !== 'organizer') {
        window.location.href = '/login';
        return;
      }
      setUser(parsedUser);
    } else {
      window.location.href = '/login';
      return;
    }

    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, usersRes, eventsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/events'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users);
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== userId));
        toast.success('User deleted successfully');
      } else {
        toast.error('Failed to delete user');
      }
    } catch {
      toast.error('Error deleting user');
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const res = await fetch(`/api/admin/events/${eventId}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents(events.filter(e => e._id !== eventId));
        toast.success('Event deleted successfully');
      } else {
        toast.error('Failed to delete event');
      }
    } catch {
      toast.error('Error deleting event');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent-red/30 border-t-accent-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-50 via-white to-charcoal-50">
      {/* Header */}
      <header className="border-b border-charcoal-200/30 bg-white/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-headline text-charcoal-800">Admin Dashboard</h1>
            <p className="text-sm text-charcoal-400">Manage users and events</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-accent-red transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-charcoal-200/30">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'events', label: 'Events', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'users' | 'events')}
                className={`flex items-center gap-2 px-4 py-2 -mb-0.5 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-accent-red text-accent-red'
                    : 'border-transparent text-charcoal-600 hover:text-charcoal-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-accent-red' },
                { label: 'Total Events', value: stats.totalEvents, icon: Calendar, color: 'text-info' },
                { label: 'Total Registrations', value: stats.totalRegistrations, icon: BarChart3, color: 'text-accent-gold' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="glass-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-charcoal-400 text-sm">{stat.label}</p>
                        <p className={`font-serif text-2xl font-bold ${stat.color} mt-2`}>{stat.value}</p>
                      </div>
                      <Icon className={`w-12 h-12 opacity-20 ${stat.color}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Users by Role */}
            <div className="glass-card p-6">
              <h2 className="font-serif text-lg text-charcoal-800 mb-4">Users by Role</h2>
              <div className="space-y-3">
                {stats.usersByRole.map((role) => (
                  <div key={role.role} className="flex items-center justify-between p-3 bg-charcoal-50/50 rounded-lg">
                    <span className="text-charcoal-600 capitalize">{role.role}</span>
                    <span className="font-semibold text-charcoal-800">{role.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-charcoal-200/30 bg-charcoal-50/50">
                    <th className="px-6 py-3 text-left text-sm font-medium text-charcoal-600">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-charcoal-600">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-charcoal-600">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-charcoal-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user._id} className="border-b border-charcoal-200/30 hover:bg-charcoal-50/50 transition-colors">
                        <td className="px-6 py-3 text-charcoal-800">{user.name}</td>
                        <td className="px-6 py-3 text-charcoal-600">{user.email}</td>
                        <td className="px-6 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            user.role === 'admin'
                              ? 'bg-accent-red/10 text-accent-red'
                              : user.role === 'organizer'
                                ? 'bg-info/10 text-info'
                                : 'bg-charcoal-200/30 text-charcoal-600'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-3 flex gap-2">
                          <button
                            onClick={() => deleteUser(user._id)}
                            className="p-1.5 text-charcoal-400 hover:text-accent-red hover:bg-accent-red/10 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-charcoal-400">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-charcoal-200/30 bg-charcoal-50/50">
                    <th className="px-6 py-3 text-left text-sm font-medium text-charcoal-600">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-charcoal-600">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-charcoal-600">Organizer</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-charcoal-600">Registrations</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-charcoal-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.length > 0 ? (
                    events.map((event) => (
                      <tr key={event._id} className="border-b border-charcoal-200/30 hover:bg-charcoal-50/50 transition-colors">
                        <td className="px-6 py-3 text-charcoal-800 font-medium">{event.title}</td>
                        <td className="px-6 py-3 text-charcoal-600">{new Date(event.date).toLocaleDateString()}</td>
                        <td className="px-6 py-3 text-charcoal-600">{event.organizer}</td>
                        <td className="px-6 py-3 text-charcoal-600">
                          {event.registeredCount}/{event.capacity}
                        </td>
                        <td className="px-6 py-3 flex gap-2">
                          <button
                            onClick={() => deleteEvent(event._id)}
                            className="p-1.5 text-charcoal-400 hover:text-accent-red hover:bg-accent-red/10 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-charcoal-400">
                        No events found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
