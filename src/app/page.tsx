'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Users, Trophy, Zap, ArrowRight, Search, Star, ChevronRight, BarChart3, QrCode, Bell, Sparkles } from 'lucide-react';
import { mockEvents, mockLeaderboard } from '@/lib/mock-data';

const categories = ['All', 'Hackathon', 'Workshop', 'Bootcamp', 'Competition', 'Masterclass'];

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    activeEvents: 0,
    attendanceRate: 0,
  });

  useEffect(() => {
    setIsVisible(true);

    Promise.all([
      fetch('/api/dashboard').then((response) => response.json()),
      fetch('/api/analytics').then((response) => response.json()),
    ])
      .then(([dashboardData, analyticsData]) => {
        setStats({
          totalRegistrations: dashboardData.totalRegistrations ?? 0,
          activeEvents: dashboardData.activeEvents ?? 0,
          attendanceRate: analyticsData.stats?.attendanceRate ?? 0,
        });
      })
      .catch(() => {
        setStats({ totalRegistrations: 0, activeEvents: 0, attendanceRate: 0 });
      });
  }, []);

  const filteredEvents = mockEvents.filter(event => {
    const matchesCategory = activeCategory === 'All' || event.category === activeCategory;
    const matchesSearch = !searchQuery ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-50/90 backdrop-blur-md border-b border-cream-300/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-red rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-xl font-bold text-charcoal-800">EchoPod</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#events" className="nav-link">Events</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#leaderboard" className="nav-link">Leaderboard</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-outline text-sm px-4 py-2">
              Sign In
            </Link>
            <Link href="/login" className="btn-primary text-sm px-4 py-2">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`pt-32 pb-20 px-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-accent-red/10 text-accent-red px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Intelligent Event Platform
            </div>
            <h1 className="font-serif text-display text-charcoal-800 mb-6">
              Discover, Connect &<br />
              <span className="text-gradient">Excel Together</span>
            </h1>
            <p className="text-body-lg text-charcoal-400 mb-8 max-w-xl">
              Your all-in-one platform for event discovery, smart registration, QR attendance,
              and gamified engagement. Powered by intelligent recommendations.
            </p>
            <div className="flex items-center gap-4 mb-12">
              <Link href="/login" className="btn-primary flex items-center gap-2 text-base">
                Explore Events <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="btn-outline flex items-center gap-2 text-base">
                Organize an Event
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Total Registrations', value: stats.totalRegistrations, icon: Users },
              { label: 'Active Events', value: stats.activeEvents, icon: Calendar },
              { label: 'Avg. Attendance Rate', value: `${stats.attendanceRate}%`, icon: QrCode },
              { label: 'Badges Awarded', value: mockLeaderboard.reduce((total, member) => total + member.badges, 0), icon: Trophy },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-5 flex items-center gap-4" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-12 h-12 rounded-xl bg-cream-200 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-accent-red" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-charcoal-800 font-serif">{stat.value}</p>
                  <p className="text-xs text-charcoal-400">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* Events Section */}
      <section id="events" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <p className="text-accent-red text-sm font-medium uppercase tracking-wider mb-2">Discover</p>
              <h2 className="font-serif text-headline text-charcoal-800">Upcoming Events</h2>
            </div>
            {/* Search */}
            <div className="relative mt-4 md:mt-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-300" />
              <input
                type="text"
                placeholder="Search events or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-elegant pl-10 w-72 text-sm"
                id="event-search"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-charcoal-800 text-white'
                    : 'bg-cream-200 text-charcoal-500 hover:bg-cream-300'
                }`}
                id={`cat-tab-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Event Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger">
            {filteredEvents.map((event) => (
              <Link
                key={event._id}
                href="/login"
                className="glass-card overflow-hidden group"
                id={`event-card-${event._id}`}
              >
                {/* Event Header Gradient */}
                <div className={`h-40 relative flex items-end p-5 ${
                  event.category === 'Hackathon' ? 'bg-gradient-to-br from-accent-red/90 to-charcoal-800' :
                  event.category === 'Workshop' ? 'bg-gradient-to-br from-accent-gold/90 to-charcoal-700' :
                  event.category === 'Bootcamp' ? 'bg-gradient-to-br from-info to-charcoal-800' :
                  event.category === 'Competition' ? 'bg-gradient-to-br from-success to-charcoal-800' :
                  'bg-gradient-to-br from-charcoal-600 to-charcoal-800'
                }`}>
                  <div className="absolute top-4 right-4">
                    <span className="badge-elegant bg-white/20 text-white backdrop-blur-sm">
                      {event.category}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl text-white font-semibold leading-tight">
                    {event.title}
                  </h3>
                </div>

                {/* Event Body */}
                <div className="p-5">
                  <p className="text-sm text-charcoal-400 line-clamp-2 mb-4">
                    {event.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-charcoal-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {event.registeredCount}/{event.capacity}
                    </div>
                  </div>

                  {/* Skills Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {event.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="badge-elegant bg-cream-200 text-charcoal-600 text-[10px]">
                        {skill}
                      </span>
                    ))}
                    {event.skills.length > 3 && (
                      <span className="badge-elegant bg-cream-200 text-charcoal-400 text-[10px]">
                        +{event.skills.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] text-charcoal-400 mb-1">
                      <span>{event.registeredCount} registered</span>
                      <span>{Math.round((event.registeredCount / event.capacity) * 100)}% full</span>
                    </div>
                    <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-red rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((event.registeredCount / event.capacity) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-charcoal-400">by {event.organizerName}</span>
                    <span className="text-accent-red text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      View <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-accent-red text-sm font-medium uppercase tracking-wider mb-2">Platform</p>
            <h2 className="font-serif text-headline text-charcoal-800">Powerful Features</h2>
            <p className="text-charcoal-400 mt-3 max-w-lg mx-auto">
              Everything you need to manage events intelligently — from smart recommendations to real-time analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Sparkles, title: 'Smart Recommendations', desc: 'AI-powered event suggestions based on your skills and interests', color: 'from-accent-red/10 to-accent-red/5' },
              { icon: QrCode, title: 'QR Attendance', desc: 'Seamless check-in with QR code scanning — no paper, no hassle', color: 'from-info/10 to-info/5' },
              { icon: Trophy, title: 'Gamification', desc: 'Earn points, badges, and climb the leaderboard with every event', color: 'from-accent-gold/10 to-accent-gold/5' },
              { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Live dashboards with registration trends and engagement metrics', color: 'from-success/10 to-success/5' },
              { icon: Calendar, title: 'Calendar Sync', desc: 'Auto-sync events to Google Calendar with smart reminders', color: 'from-purple-500/10 to-purple-500/5' },
              { icon: Bell, title: 'Push Notifications', desc: 'Stay updated with event reminders and registration deadlines', color: 'from-warning/10 to-warning/5' },
              { icon: Star, title: 'Event Reviews', desc: 'Rate and review events to help others discover the best ones', color: 'from-accent-red/10 to-accent-red/5' },
              { icon: Users, title: 'Audience Retargeting', desc: 'Re-engage past attendees with personalized event recommendations', color: 'from-info/10 to-info/5' },
            ].map((feature, i) => (
              <div key={i} className="glass-card p-6 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-charcoal-700" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-charcoal-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-charcoal-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* Leaderboard Section */}
      <section id="leaderboard" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-accent-red text-sm font-medium uppercase tracking-wider mb-2">Leaderboard</p>
            <h2 className="font-serif text-headline text-charcoal-800">Top Performers</h2>
          </div>

          <div className="max-w-2xl mx-auto">
            {mockLeaderboard.map((entry, i) => (
              <div
                key={entry.userId}
                className={`glass-card mb-3 p-5 flex items-center gap-4 ${i === 0 ? 'border-accent-gold/30 bg-accent-gold-light/30' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-lg ${
                  i === 0 ? 'bg-accent-gold text-white' :
                  i === 1 ? 'bg-charcoal-300 text-white' :
                  i === 2 ? 'bg-accent-red/70 text-white' :
                  'bg-cream-300 text-charcoal-500'
                }`}>
                  {entry.rank}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-charcoal-800">{entry.name}</p>
                  <p className="text-xs text-charcoal-400">{entry.badges} badges earned</p>
                </div>
                <div className="text-right">
                  <p className="font-serif font-bold text-lg text-charcoal-800">{entry.points}</p>
                  <p className="text-[10px] text-charcoal-400 uppercase tracking-wider">Points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center glass-card p-12 bg-gradient-to-br from-charcoal-800 to-charcoal-900 border-none">
          <h2 className="font-serif text-headline text-white mb-4">Ready to Get Started?</h2>
          <p className="text-charcoal-300 mb-8 max-w-md mx-auto">
            Join thousands of students and organizers on the smartest event platform.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login" className="btn-primary text-base">
              Sign Up Free
            </Link>
            <Link href="/login" className="px-6 py-3 rounded-lg text-white border border-white/20 hover:bg-white/10 transition-all text-base font-medium">
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cream-300 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-accent-red rounded flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-bold text-charcoal-800">EchoPod</span>
          </div>
          <p className="text-xs text-charcoal-400">
            © 2026 EchoPod. Built with ♥ for hackathons.
          </p>
          <div className="flex items-center gap-4 text-xs text-charcoal-400">
            <span>Microservices Architecture</span>
            <span>•</span>
            <span>Demo Mode Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
