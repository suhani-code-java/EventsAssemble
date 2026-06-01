'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Trophy, QrCode, ArrowRight, TrendingUp, Clock, Star, Sparkles } from 'lucide-react';
import { mockNotifications, mockUsers, type MockEvent } from '@/lib/mock-data';
import type { RegistrationRecord } from '@/lib/registration-model';

export default function StudentDashboard() {
  const [user, setUser] = useState<typeof mockUsers[0] | null>(null);
  const [greeting, setGreeting] = useState('');
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      const fullUser = mockUsers.find(u => u._id === parsed._id) || parsed;
      setUser(fullUser);

      Promise.all([
        fetch('/api/events').then(res => res.json()),
        fetch(`/api/registrations?userId=${parsed._id}`).then(res => res.json()),
      ])
        .then(([eventsData, registrationsData]) => {
          setEvents(eventsData.events || []);
          setRegistrations(registrationsData.registrations || []);
        })
        .catch(() => {
          setEvents([]);
          setRegistrations([]);
        });
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  if (!user) return null;

  const userRegistrations = registrations.filter(r => r.userId === user._id);
  const registeredEvents = userRegistrations.map(r => events.find(e => e._id === r.eventId)).filter(Boolean);
  const upcomingEvents = registeredEvents.filter(e => e && new Date(e.date) > new Date());
  const userNotifications = mockNotifications.filter(n => n.userId === user._id && !n.read);

  // Recommended events (content-based by skills)
  const recommendedEvents = events
    .filter(e => !userRegistrations.some(r => r.eventId === e._id))
    .map(event => {
      const overlap = event.skills.filter(s =>
        user.skills.some(us => us.toLowerCase() === s.toLowerCase())
      );
      return { ...event, matchScore: overlap.length };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  return (
    <div className="animate-fade-in">
      {/* Welcome Header */}
      <div className="mb-8">
        <p className="text-charcoal-400 text-sm">{greeting}</p>
        <h1 className="font-serif text-headline text-charcoal-800">{user.name} 👋</h1>
        <p className="text-charcoal-400 mt-1">Here&apos;s what&apos;s happening with your events.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Registered Events', value: userRegistrations.length, icon: Calendar, color: 'bg-accent-red/10 text-accent-red' },
          { label: 'Upcoming', value: upcomingEvents.length, icon: Clock, color: 'bg-info/10 text-info' },
          { label: 'Points Earned', value: user.points, icon: Trophy, color: 'bg-accent-gold/10 text-accent-gold' },
          { label: 'Badges', value: user.badges.length, icon: Star, color: 'bg-success/10 text-success' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <p className="font-serif text-2xl font-bold text-charcoal-800">{stat.value}</p>
            <p className="text-xs text-charcoal-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Smart Recommendations */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-red" />
              <h2 className="font-serif text-title text-charcoal-800">Recommended For You</h2>
            </div>
            <Link href="/student/events" className="text-sm text-accent-red font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recommendedEvents.map(event => (
              <Link key={event._id} href={`/student/events/${event._id}`} className="glass-card p-4 flex items-center gap-4 group">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                  event.category === 'Hackathon' ? 'bg-accent-red/10' :
                  event.category === 'Workshop' ? 'bg-accent-gold/10' :
                  'bg-info/10'
                }`}>
                  <Calendar className={`w-6 h-6 ${
                    event.category === 'Hackathon' ? 'text-accent-red' :
                    event.category === 'Workshop' ? 'text-accent-gold' :
                    'text-info'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-charcoal-800 truncate">{event.title}</h3>
                    {event.matchScore > 0 && (
                      <span className="badge-elegant bg-accent-red/10 text-accent-red text-[10px]">
                        {event.matchScore} skill match{event.matchScore > 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-charcoal-400">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {event.location}
                  </p>
                  <div className="flex gap-1.5 mt-1.5">
                    {event.skills.slice(0, 2).map(s => (
                      <span key={s} className="badge-elegant bg-cream-200 text-charcoal-500 text-[10px]">{s}</span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-charcoal-300 group-hover:text-accent-red group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div>
            <h2 className="font-serif text-title text-charcoal-800 mb-4">Upcoming Events</h2>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 3).map(event => event && (
                  <div key={event._id} className="glass-card p-4">
                    <p className="font-semibold text-sm text-charcoal-800">{event.title}</p>
                    <p className="text-xs text-charcoal-400 mt-1">
                      {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <QrCode className="w-3 h-3 text-accent-red" />
                      <span className="text-[10px] text-accent-red font-medium">QR Pass Ready</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-6 text-center">
                <Calendar className="w-8 h-8 text-charcoal-300 mx-auto mb-2" />
                <p className="text-sm text-charcoal-400">No upcoming events</p>
                <Link href="/student/events" className="text-xs text-accent-red font-medium mt-2 inline-block">
                  Browse Events →
                </Link>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-title text-charcoal-800">Notifications</h2>
              {userNotifications.length > 0 && (
                <span className="w-5 h-5 bg-accent-red rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                  {userNotifications.length}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {mockNotifications
                .filter(n => n.userId === user._id)
                .slice(0, 3)
                .map(notification => (
                  <div key={notification._id} className={`glass-card p-3 ${!notification.read ? 'border-l-2 border-l-accent-red' : ''}`}>
                    <p className="text-sm font-medium text-charcoal-800">{notification.title}</p>
                    <p className="text-xs text-charcoal-400 mt-0.5">{notification.message}</p>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Badges */}
          <div>
            <h2 className="font-serif text-title text-charcoal-800 mb-4">Your Badges</h2>
            <div className="flex flex-wrap gap-2">
              {user.badges.map((badge, i) => (
                <div key={i} className="glass-card px-4 py-2 flex items-center gap-2">
                  <span className="text-lg">
                    {badge === 'Early Adopter' ? '🌟' :
                     badge === 'Hackathon Hero' ? '🏆' :
                     badge === 'Tech Enthusiast' ? '💡' : '⭐'}
                  </span>
                  <span className="text-xs font-medium text-charcoal-700">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
