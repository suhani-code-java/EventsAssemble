'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Users, Calendar, QrCode, RefreshCw } from 'lucide-react';

const PIE_COLORS = ['#C41E3A', '#D4A853', '#3B82F6', '#22C55E', '#64748B'];

interface AnalyticsData {
  stats: {
    totalRegistrations: number;
    totalEvents: number;
    attendanceRate: number;
    activeUsers: number;
  };
  registrationTrend: { date: string; registrations: number }[];
  categoryDistribution: { name: string; value: number; count: number }[];
  eventPerformance: { name: string; registered: number; capacity: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastUpdated(new Date());
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(() => loadAnalytics(), 30000);
    return () => clearInterval(interval);
  }, [loadAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent-red/30 border-t-accent-red rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats ?? { totalRegistrations: 0, totalEvents: 0, attendanceRate: 0, activeUsers: 0 };
  const trendData = data?.registrationTrend ?? [];
  const categoryData = data?.categoryDistribution ?? [];
  const eventPerformance = data?.eventPerformance ?? [];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-headline text-charcoal-800">Real-Time Analytics</h1>
          <p className="text-charcoal-400 mt-1">
            Live data from database · Last updated {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadAnalytics(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-accent-red transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <span className="badge-elegant bg-success/10 text-success animate-pulse-soft">● Live</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Registrations', value: stats.totalRegistrations, icon: Users, color: 'from-accent-red to-accent-red/70' },
          { label: 'Events Created', value: stats.totalEvents, icon: Calendar, color: 'from-info to-info/70' },
          { label: 'Attendance Rate', value: stats.attendanceRate > 0 ? `${stats.attendanceRate}%` : 'N/A', icon: QrCode, color: 'from-success to-success/70' },
          { label: 'Unique Registrants', value: stats.activeUsers, icon: TrendingUp, color: 'from-accent-gold to-accent-gold/70' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-[40px]`} />
            <stat.icon className="w-6 h-6 text-charcoal-400 mb-3" />
            <p className="font-serif text-3xl font-bold text-charcoal-800">{stat.value}</p>
            <p className="text-xs text-charcoal-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Registration Trend */}
        <div className="glass-card p-6">
          <h2 className="font-serif text-title text-charcoal-800 mb-2">Registration Trend</h2>
          <p className="text-xs text-charcoal-400 mb-6">Actual daily registrations (last 14 days)</p>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9B8E84' }} tickLine={false} axisLine={false} interval={2} />
                <YAxis tick={{ fontSize: 10, fill: '#9B8E84' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #E8E0D8', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  labelStyle={{ color: '#1A1A1A', fontWeight: 600 }}
                  itemStyle={{ color: '#C41E3A' }}
                />
                <Line type="monotone" dataKey="registrations" name="Registrations" stroke="#C41E3A" strokeWidth={2.5}
                  dot={{ fill: '#C41E3A', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: '#C41E3A', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-charcoal-400 text-sm">
              No registration data yet
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="glass-card p-6">
          <h2 className="font-serif text-title text-charcoal-800 mb-2">Category Distribution</h2>
          <p className="text-xs text-charcoal-400 mb-6">Registrations by event category</p>
          {categoryData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'white', border: '1px solid #E8E0D8', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(v, name, props) => [`${v}% (${props.payload?.count ?? 0} regs)`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {categoryData.map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-xs text-charcoal-600 flex-1">{cat.name}</span>
                    <span className="text-xs font-semibold text-charcoal-700">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-charcoal-400 text-sm">
              No category data yet — register students for events
            </div>
          )}
        </div>
      </div>

      {/* Event Performance Bar Chart */}
      <div className="glass-card p-6">
        <h2 className="font-serif text-title text-charcoal-800 mb-2">Event Performance</h2>
        <p className="text-xs text-charcoal-400 mb-6">Registrations vs Capacity per event</p>
        {eventPerformance.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={eventPerformance} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9B8E84' }} tickLine={false} axisLine={false} angle={-10} dy={8} />
              <YAxis tick={{ fontSize: 10, fill: '#9B8E84' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid #E8E0D8', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                labelStyle={{ color: '#1A1A1A', fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="registered" name="Registered" fill="#C41E3A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="capacity" name="Capacity" fill="#E8E0D8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-charcoal-400 text-sm">
            No events yet — create events to see performance data
          </div>
        )}
      </div>
    </div>
  );
}
