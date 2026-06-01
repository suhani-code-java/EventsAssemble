"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Calendar, Users, ChevronRight, Filter } from 'lucide-react';
import type { EventRecord } from '@/lib/event-model';

const categories = ['All', 'Hackathon', 'Workshop', 'Bootcamp', 'Competition', 'Masterclass'];

export default function BrowseEventsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events?t=' + Date.now(), { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load events');
        const data = await response.json();
        if (!cancelled) {
          setEvents(data.events || []);
          setError('');
        }
      } catch {
        if (!cancelled) setError('Unable to load events');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesCategory = activeCategory === 'All' || event.category === activeCategory;
    const matchesSearch = !searchQuery ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <h1 className="font-serif text-headline text-charcoal-800">Browse Events</h1>
          <p className="text-charcoal-400 mt-1">Discover events that match your interests</p>
        </div>
        <div className="relative mt-4 md:mt-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-300" />
          <input
            type="text"
            placeholder="Search events, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-elegant pl-10 w-72 text-sm"
            id="browse-search"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-charcoal-400 shrink-0" />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-charcoal-800 text-white'
                : 'bg-cream-200 text-charcoal-500 hover:bg-cream-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full text-center py-16 text-charcoal-400">Loading events...</div>
        ) : error ? (
          <div className="col-span-full text-center py-16 text-charcoal-400">{error}</div>
        ) : filteredEvents.map(event => {
          const fillPercent = Math.round((event.registeredCount / event.capacity) * 100);

          return (
            <Link
              key={event._id}
              href={`/student/events/${event._id}`}
              className="glass-card overflow-hidden group"
            >
              <div className={`h-36 relative flex items-end p-4 ${
                event.category === 'Hackathon' ? 'bg-gradient-to-br from-accent-red/90 to-charcoal-800' :
                event.category === 'Workshop' ? 'bg-gradient-to-br from-accent-gold/90 to-charcoal-700' :
                event.category === 'Bootcamp' ? 'bg-gradient-to-br from-info to-charcoal-800' :
                event.category === 'Competition' ? 'bg-gradient-to-br from-success to-charcoal-800' :
                'bg-gradient-to-br from-charcoal-600 to-charcoal-800'
              }`}>
                <div className="absolute top-3 right-3">
                  <span className="badge-elegant bg-white/20 text-white backdrop-blur-sm text-[11px]">
                    {event.category}
                  </span>
                </div>
                <h3 className="font-serif text-lg text-white font-semibold leading-tight">{event.title}</h3>
              </div>

              <div className="p-4">
                <p className="text-sm text-charcoal-400 line-clamp-2 mb-3">{event.description}</p>

                <div className="flex items-center gap-3 text-xs text-charcoal-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {event.registeredCount}/{event.capacity}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {event.skills.slice(0, 3).map(s => (
                    <span key={s} className="badge-elegant bg-cream-200 text-charcoal-600 text-[10px]">{s}</span>
                  ))}
                </div>

                <div className="mb-2">
                  <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-red rounded-full transition-all"
                      style={{ width: `${Math.min(fillPercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-charcoal-400 mt-1">{fillPercent}% filled</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-cream-200">
                  <span className="text-xs text-charcoal-400">by {event.organizerName}</span>
                  <span className="text-accent-red text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Details <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {!loading && !error && filteredEvents.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-charcoal-200 mx-auto mb-4" />
          <h3 className="font-serif text-xl text-charcoal-800 mb-2">No events found</h3>
          <p className="text-charcoal-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
