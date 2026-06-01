'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Users, Calendar, TrendingUp, QrCode, ArrowRight, ArrowUpRight, Clock, Plus, RefreshCw } from 'lucide-react';
import type { EventRecord } from '@/lib/event-model';

interface DashboardData {
  totalRegistrations: number;
  totalEvents: number;
  activeEvents: number;
  upcomingEvents: EventRecord[];
  recentActivity: { name: string; event: string; registeredAt: string }[];
  registrationTrend: { date: string; registrations: number }[];
}

export default function OrganizerDashboard() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        console.error('Dashboard API error:', res.status);
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    loadDashboard();
    // No auto-refresh to prevent slowness
  }, []);

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent-red/30 border-t-accent-red rounded-full animate-spin" />
      </div>
    );
  }

  const totalRegistrations = data?.totalRegistrations ?? 0;
  const totalEvents = data?.totalEvents ?? 0;
  const activeEvents = data?.activeEvents ?? 0;
  const upcomingEvents = data?.upcomingEvents ?? [];
  const recentActivity = data?.recentActivity ?? [];
  const trendData = data?.registrationTrend ?? [];

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="animate-fade-in">
      {/* Welcome */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-headline text-charcoal-800">Welcome, {user.name} 👋</h1>
          <p className="text-charcoal-400 mt-1">Here&apos;s your live event overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-accent-red transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link href="/organizer/events/new" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> New Event
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Registrations', value: totalRegistrations, icon: Users, color: 'bg-accent-red/10 text-accent-red' },
          { label: 'Active Events', value: activeEvents, icon: Calendar, color: 'bg-info/10 text-info' },
          { label: 'Total Events', value: totalEvents, icon: TrendingUp, color: 'bg-accent-gold/10 text-accent-gold' },
          { label: 'Live Tracking', value: '✓', icon: QrCode, color: 'bg-success/10 text-success' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="flex items-center gap-0.5 text-xs text-success font-medium">
                <ArrowUpRight className="w-3 h-3" /> Live
              </span>
            </div>
            <p className="font-serif text-2xl font-bold text-charcoal-800">{stat.value}</p>
            <p className="text-xs text-charcoal-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Registration Trend — real data from DB */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-title text-charcoal-800">Registration Trend</h2>
              <p className="text-xs text-charcoal-400 mt-0.5">Last 14 days — actual registrations</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-success font-medium">Real-time</span>
              <Link href="/organizer/analytics" className="text-sm text-accent-red font-medium flex items-center gap-1 ml-2">
                Full Analytics <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#9B8E84' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9B8E84' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #E8E0D8',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  labelStyle={{ color: '#1A1A1A', fontWeight: 600 }}
                  itemStyle={{ color: '#C41E3A' }}
                />
                <Line
                  type="monotone"
                  dataKey="registrations"
                  stroke="#C41E3A"
                  strokeWidth={2.5}
                  dot={{ fill: '#C41E3A', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: '#C41E3A', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-charcoal-400 text-sm">
              No registrations yet — create events and students will register!
            </div>
          )}
        </div>

        {/* Recent Activity — real registrations */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-title text-charcoal-800">Recent Activity</h2>
            <span className="badge-elegant bg-success/10 text-success text-[10px]">● Live</span>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-charcoal-400 text-center py-8">No registrations yet</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((reg, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-cream-100 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-accent-red/10 text-accent-red flex items-center justify-center text-xs font-bold shrink-0">
                    {reg.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal-800 truncate">{reg.name}</p>
                    <p className="text-[10px] text-charcoal-400 truncate">{reg.event}</p>
                  </div>
                  <span className="text-[10px] text-charcoal-400 shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatTime(reg.registeredAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-title text-charcoal-800">Upcoming Events</h2>
          <Link href="/organizer/events" className="text-sm text-accent-red font-medium flex items-center gap-1">
            Manage All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <Calendar className="w-12 h-12 text-charcoal-200 mx-auto mb-4" />
            <h3 className="font-serif text-xl text-charcoal-800 mb-2">No upcoming events</h3>
            <p className="text-charcoal-400 mb-4">Create your first event to get started</p>
            <Link href="/organizer/events/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map(event => {
              const fill = Math.round((event.registeredCount / event.capacity) * 100);
              return (
                <Link key={event._id} href={`/organizer/events/${event._id}`} className="glass-card p-5 group">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`badge-elegant text-[10px] ${
                      event.category === 'Hackathon' ? 'bg-accent-red/10 text-accent-red' :
                      event.category === 'Workshop' ? 'bg-accent-gold/10 text-accent-gold' :
                      'bg-info/10 text-info'
                    }`}>{event.category}</span>
                    <span className={`badge-elegant text-[10px] ${
                      event.status === 'upcoming' ? 'bg-success/10 text-success' :
                      event.status === 'ongoing' ? 'bg-warning/10 text-warning' :
                      'bg-charcoal-100 text-charcoal-400'
                    }`}>{event.status}</span>
                  </div>
                  <h3 className="font-semibold text-charcoal-800 mb-1">{event.title}</h3>
                  <p className="text-xs text-charcoal-400 mb-3">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {event.registeredCount} registered
                  </p>
                  <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-red rounded-full transition-all duration-700" style={{ width: `${Math.min(fill, 100)}%` }} />
                  </div>
                  <p className="text-[10px] text-charcoal-400 mt-1">{Math.min(fill, 100)}% capacity</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
