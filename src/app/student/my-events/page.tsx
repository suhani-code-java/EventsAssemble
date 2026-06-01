'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, QrCode } from 'lucide-react';
import { type MockEvent } from '@/lib/mock-data';
import type { RegistrationRecord } from '@/lib/registration-model';

export default function MyEventsPage() {
  const [user, setUser] = useState<{ _id: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [events, setEvents] = useState<MockEvent[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);

      Promise.all([
        fetch(`/api/registrations?userId=${parsed._id}`).then(res => res.json()),
        fetch('/api/events').then(res => res.json()),
      ])
        .then(([registrationsData, eventsData]) => {
          setRegistrations(registrationsData.registrations || []);
          setEvents(eventsData.events || []);
        })
        .catch(() => {
          setRegistrations([]);
          setEvents([]);
        });
    }
  }, []);

  if (!user) return null;

  const myRegistrations = registrations.filter(r => r.userId === user._id);
  const myEvents = myRegistrations
    .map(r => {
      const event = events.find(e => e._id === r.eventId);
      return event ? { ...event, registration: r } : null;
    })
    .filter((e): e is MockEvent & { registration: RegistrationRecord } => e !== null);

  const now = new Date();
  const upcoming = myEvents.filter(e => new Date(e.date) >= now);
  const past = myEvents.filter(e => new Date(e.date) < now);
  const displayEvents = activeTab === 'upcoming' ? upcoming : past;

  // Calendar view helper
  const getCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return { days, month, year };
  };

  const { days, month, year } = getCalendarDays();
  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const eventDates = myEvents.map(e => new Date(e.date).getDate());

  return (
    <div className="animate-fade-in">
      <h1 className="font-serif text-headline text-charcoal-800 mb-2">My Events</h1>
      <p className="text-charcoal-400 mb-8">Track your registered and past events</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events List */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-1 bg-cream-200 rounded-xl p-1 mb-6">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'upcoming' ? 'bg-white text-charcoal-800 shadow-sm' : 'text-charcoal-400'}`}
            >
              Upcoming ({upcoming.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'past' ? 'bg-white text-charcoal-800 shadow-sm' : 'text-charcoal-400'}`}
            >
              Past ({past.length})
            </button>
          </div>

          <div className="space-y-3">
            {displayEvents.map(event => (
              <Link key={event._id} href={`/student/events/${event._id}`} className="glass-card p-4 flex items-center gap-4 group">
                <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                  event.category === 'Hackathon' ? 'bg-accent-red/10' :
                  event.category === 'Workshop' ? 'bg-accent-gold/10' :
                  'bg-info/10'
                }`}>
                  <span className="text-[10px] text-charcoal-400 uppercase">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-lg font-bold text-charcoal-800 font-serif">
                    {new Date(event.date).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-charcoal-800 truncate">{event.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-charcoal-400 mt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {event.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {event.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`badge-elegant text-[10px] ${
                    event.registration.status === 'registered' ? 'bg-success/10 text-success' :
                    event.registration.status === 'attended' ? 'bg-info/10 text-info' :
                    'bg-charcoal-100 text-charcoal-400'
                  }`}>
                    {event.registration.status}
                  </span>
                  <QrCode className="w-5 h-5 text-charcoal-300 group-hover:text-accent-red transition-colors" />
                </div>
              </Link>
            ))}
            {displayEvents.length === 0 && (
              <div className="glass-card p-8 text-center">
                <Calendar className="w-10 h-10 text-charcoal-200 mx-auto mb-3" />
                <p className="text-charcoal-400 text-sm">No {activeTab} events</p>
                <Link href="/student/events" className="text-accent-red text-sm font-medium mt-2 inline-block">Browse Events →</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mini Calendar */}
        <div className="glass-card p-5 h-fit">
          <h3 className="font-serif text-lg text-charcoal-800 mb-4">{monthName}</h3>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <span key={i} className="text-[10px] text-charcoal-400 font-medium py-1">{d}</span>
            ))}
            {days.map((day, i) => (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center rounded-lg text-xs relative ${
                  day === new Date().getDate() ? 'bg-accent-red text-white font-bold' :
                  day && eventDates.includes(day) ? 'bg-accent-red/10 text-accent-red font-semibold' :
                  day ? 'text-charcoal-600 hover:bg-cream-200' : ''
                }`}
              >
                {day}
                {day && eventDates.includes(day) && day !== new Date().getDate() && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-accent-red" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-cream-200">
            <p className="text-xs text-charcoal-400 mb-2">Legend:</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-accent-red" />
                <span className="text-[10px] text-charcoal-500">Today</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-accent-red/10 border border-accent-red/30" />
                <span className="text-[10px] text-charcoal-500">Event Day</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
