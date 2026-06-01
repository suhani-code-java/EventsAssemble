'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Calendar, Users, Trash2, Search, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'sonner';
import type { EventRecord } from '@/lib/event-model';

export default function OrganizerEventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      // Get only events created by this organizer
      const response = await fetch('/api/events?' + new URLSearchParams({ t: Date.now().toString() }), { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load events');
      const data = await response.json();
      
      // Filter events for this organizer
      const organizerEvents = (data.events || []).filter((e: EventRecord) => e.organizer === user?._id);
      setEvents(organizerEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Unable to load events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleDelete = async (eventId: string, title: string) => {
    if (!confirm(`Delete "${title}"? This will also remove all registrations.`)) return;
    setDeleting(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Event deleted');
        setEvents(prev => prev.filter(e => e._id !== eventId));
      } else {
        toast.error('Failed to delete event');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Something went wrong');
    } finally {
      setDeleting(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
  };

  const filtered = events.filter(e =>
    !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-headline text-charcoal-800">Manage Events</h1>
          <p className="text-charcoal-400 mt-1">{events.length} event{events.length !== 1 ? 's' : ''} created</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-cream-200 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-charcoal-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-300" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-elegant pl-10 w-60 text-sm"
            />
          </div>
          <Link href="/organizer/events/new" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> New Event
          </Link>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cream-200">
                <th className="text-left text-xs font-medium text-charcoal-400 uppercase tracking-wider px-5 py-4">Event</th>
                <th className="text-left text-xs font-medium text-charcoal-400 uppercase tracking-wider px-5 py-4">Date</th>
                <th className="text-left text-xs font-medium text-charcoal-400 uppercase tracking-wider px-5 py-4">Category</th>
                <th className="text-left text-xs font-medium text-charcoal-400 uppercase tracking-wider px-5 py-4">Registrations</th>
                <th className="text-left text-xs font-medium text-charcoal-400 uppercase tracking-wider px-5 py-4">Status</th>
                <th className="text-right text-xs font-medium text-charcoal-400 uppercase tracking-wider px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-charcoal-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-accent-red/30 border-t-accent-red rounded-full animate-spin" />
                      Loading events...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <p className="text-charcoal-400 mb-3">No events found</p>
                    <Link href="/organizer/events/new" className="btn-primary text-sm inline-flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Create your first event
                    </Link>
                  </td>
                </tr>
              ) : filtered.map(event => {
                const fill = Math.round((event.registeredCount / event.capacity) * 100);
                return (
                  <tr key={event._id} className="hover:bg-cream-100/50 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-charcoal-800 text-sm">{event.title}</p>
                        <p className="text-xs text-charcoal-400">{event.location}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-charcoal-600">
                        <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge-elegant text-[10px] ${
                        event.category === 'Hackathon' ? 'bg-accent-red/10 text-accent-red' :
                        event.category === 'Workshop' ? 'bg-accent-gold/10 text-accent-gold' :
                        event.category === 'Bootcamp' ? 'bg-info/10 text-info' :
                        event.category === 'Competition' ? 'bg-success/10 text-success' :
                        'bg-charcoal-100 text-charcoal-500'
                      }`}>
                        {event.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-charcoal-400" />
                        <span className="text-sm text-charcoal-800 font-medium">{event.registeredCount}</span>
                        <span className="text-xs text-charcoal-400">/ {event.capacity}</span>
                      </div>
                      <div className="h-1 bg-cream-200 rounded-full mt-1 w-24">
                        <div className="h-full bg-accent-red rounded-full" style={{ width: `${Math.min(fill, 100)}%` }} />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge-elegant text-[10px] ${
                        event.status === 'upcoming' ? 'bg-success/10 text-success' :
                        event.status === 'ongoing' ? 'bg-warning/10 text-warning' :
                        'bg-charcoal-100 text-charcoal-400'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/organizer/events/${event._id}`} className="p-2 rounded-lg hover:bg-cream-200 transition-colors" title="View">
                          <Eye className="w-4 h-4 text-charcoal-400" />
                        </Link>
                        <button
                          onClick={() => handleDelete(event._id, event.title)}
                          disabled={deleting === event._id}
                          className="p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === event._id ? (
                            <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-charcoal-400 hover:text-accent-red" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
