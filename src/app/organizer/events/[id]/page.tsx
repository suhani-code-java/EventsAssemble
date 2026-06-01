'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Clock, QrCode, Download, Mail, Users, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { MockEvent, MockRegistration } from '@/lib/mock-data';

export default function OrganizerEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const [event, setEvent] = useState<MockEvent | null>(null);
  const [registrations, setRegistrations] = useState<MockRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEvent = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      setLoading(!isRefresh);
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) throw new Error('Event not found');
      const data = await response.json();
      setEvent(data.event);
      setRegistrations(data.registrations || []);
    } catch {
      setEvent(null);
      setRegistrations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) throw new Error('Event not found');
        const data = await response.json();
        if (!cancelled) {
          setEvent(data.event);
          setRegistrations(data.registrations || []);
        }
      } catch {
        if (!cancelled) { setEvent(null); setRegistrations([]); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [eventId]);

  const handleExportCSV = () => {
    window.open(`/api/events/${eventId}/export`, '_blank');
  };

  const handleNotifyAll = async () => {
    toast.info('Email notification feature coming soon!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent-red/30 border-t-accent-red rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <h2 className="font-serif text-xl text-charcoal-800 mb-2">Event not found</h2>
        <Link href="/organizer/events" className="text-accent-red mt-4 inline-block">← Back to Events</Link>
      </div>
    );
  }

  const registeredUsers = registrations.map(r => ({
    _id: r.userId,
    name: r.userName || 'Student',
    email: r.userEmail || '—',
    rollNumber: r.rollNumber || r.userId,
    registration: r,
  }));

  const fill = Math.round((event.registeredCount / event.capacity) * 100);
  const attendedCount = registrations.filter(r => r.attended).length;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-charcoal-400 hover:text-charcoal-800 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </button>
        <button
          onClick={() => loadEvent(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-accent-red transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Event Header */}
      <div className="glass-card p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className={`badge-elegant text-[10px] mb-2 inline-block ${
              event.category === 'Hackathon' ? 'bg-accent-red/10 text-accent-red' :
              event.category === 'Workshop' ? 'bg-accent-gold/10 text-accent-gold' :
              'bg-info/10 text-info'
            }`}>{event.category}</span>
            <h1 className="font-serif text-2xl text-charcoal-800">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-charcoal-400 mt-2">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {event.time}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {event.location}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/organizer/scanner" className="btn-primary text-sm flex items-center gap-2">
              <QrCode className="w-4 h-4" /> Scan QR
            </Link>
            <button onClick={handleNotifyAll} className="btn-outline text-sm flex items-center gap-2">
              <Mail className="w-4 h-4" /> Notify All
            </button>
          </div>
        </div>
        {event.description && (
          <p className="text-sm text-charcoal-500 mt-4 leading-relaxed">{event.description}</p>
        )}
        {event.skills && event.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {event.skills.map(s => (
              <span key={s} className="badge-elegant bg-cream-200 text-charcoal-600 text-[10px]">{s}</span>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-accent-red" />
            <p className="text-xs text-charcoal-400">Registered</p>
          </div>
          <p className="font-serif text-2xl font-bold text-charcoal-800">{event.registeredCount}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-charcoal-400 mb-1">Capacity</p>
          <p className="font-serif text-2xl font-bold text-charcoal-800">{event.capacity}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-charcoal-400 mb-1">Fill Rate</p>
          <p className="font-serif text-2xl font-bold text-accent-red">{fill}%</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-charcoal-400 mb-1">Attended</p>
          <p className="font-serif text-2xl font-bold text-success">{attendedCount}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass-card p-5 mb-6">
        <div className="flex justify-between text-xs text-charcoal-400 mb-2">
          <span>{event.registeredCount} registered</span>
          <span>{event.capacity - event.registeredCount} spots left</span>
        </div>
        <div className="h-3 bg-cream-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${fill >= 90 ? 'bg-warning' : 'bg-accent-red'}`}
            style={{ width: `${Math.min(fill, 100)}%` }}
          />
        </div>
      </div>

      {/* Registrations Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-cream-200 flex items-center justify-between">
          <h2 className="font-serif text-lg text-charcoal-800">
            Registered Participants
            <span className="text-sm font-normal text-charcoal-400 ml-2">({registeredUsers.length})</span>
          </h2>
          <button
            onClick={handleExportCSV}
            className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1"
          >
            <Download className="w-3 h-3" /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cream-200">
                <th className="text-left text-xs font-medium text-charcoal-400 uppercase tracking-wider px-5 py-3">#</th>
                <th className="text-left text-xs font-medium text-charcoal-400 uppercase tracking-wider px-5 py-3">Name</th>
                <th className="text-left text-xs font-medium text-charcoal-400 uppercase tracking-wider px-5 py-3">Email</th>
                <th className="text-left text-xs font-medium text-charcoal-400 uppercase tracking-wider px-5 py-3">Roll No.</th>
                <th className="text-left text-xs font-medium text-charcoal-400 uppercase tracking-wider px-5 py-3">Registered</th>
                <th className="text-left text-xs font-medium text-charcoal-400 uppercase tracking-wider px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {registeredUsers.map((u, i) => (
                <tr key={`${u._id}-${i}`} className="hover:bg-cream-100/50 transition-colors">
                  <td className="px-5 py-3 text-sm text-charcoal-400">{i + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-accent-red/10 text-accent-red flex items-center justify-center text-xs font-bold shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <p className="text-sm font-medium text-charcoal-800">{u.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-charcoal-600">{u.email}</td>
                  <td className="px-5 py-3 text-xs font-mono text-charcoal-500">{u.rollNumber}</td>
                  <td className="px-5 py-3 text-sm text-charcoal-400">
                    {new Date(u.registration.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge-elegant text-[10px] ${
                      u.registration.attended ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    }`}>
                      {u.registration.attended ? '✓ Attended' : 'Registered'}
                    </span>
                  </td>
                </tr>
              ))}
              {registeredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-charcoal-400">
                    <Users className="w-8 h-8 text-charcoal-200 mx-auto mb-2" />
                    No registrations yet for this event
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
