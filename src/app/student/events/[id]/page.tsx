'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Users, MapPin, Clock, ArrowLeft, CheckCircle, Star, MessageSquare, Trophy, Sparkles, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { mockUsers, type MockEvent } from '@/lib/mock-data';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [user, setUser] = useState<typeof mockUsers[0] | null>(null);
  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [event, setEvent] = useState<MockEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) throw new Error('Failed to load event');
        const data = await response.json();
        if (!cancelled) setEvent(data.event || null);
      } catch {
        if (!cancelled) setEvent(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadEvent();
    return () => { cancelled = true; };
  }, [eventId]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      const fullUser = mockUsers.find(u => u._id === parsed._id) || parsed;
      setUser(fullUser as typeof mockUsers[0]);

      fetch(`/api/registrations?userId=${parsed._id}&eventId=${eventId}`)
        .then(res => res.json())
        .then(data => setRegistered((data.registrations || []).length > 0))
        .catch(() => setRegistered(false));
    }
  }, [eventId]);

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
        <h2 className="font-serif text-2xl text-charcoal-800 mb-3">Event not found</h2>
        <Link href="/student/events" className="text-accent-red font-medium">← Back to Events</Link>
      </div>
    );
  }

  const fillPercent = Math.round((event.registeredCount / event.capacity) * 100);
  const userSkills = (user as typeof mockUsers[0])?.skills || [];
  const skillMatch = event.skills.filter(s =>
    userSkills.some(us => us.toLowerCase() === s.toLowerCase())
  );

  const qrPayload = JSON.stringify({
    userId: user?._id,
    name: user?.name,
    rollNumber: (user as typeof mockUsers[0])?.rollNumber || user?.email || user?._id,
    eventId: event._id,
    eventName: event.title,
    timestamp: new Date().toISOString(),
  });

  const handleRegister = async () => {
    if (!user) { router.push('/login'); return; }
    if (registered) return;
    setRegistering(true);
    try {
      const response = await fetch(`/api/events/${event._id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          rollNumber: (user as typeof mockUsers[0])?.rollNumber,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Registration failed');
      }

      setRegistered(true);
      setShowQR(true);
      toast.success(`🎉 Registered for ${event.title}!`, {
        description: 'Your QR pass is ready below.',
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not register';
      toast.error(msg);
    } finally {
      setRegistering(false);
    }
  };

  const categoryGradient =
    event.category === 'Hackathon' ? 'from-accent-red/90 to-charcoal-800' :
    event.category === 'Workshop' ? 'from-accent-gold/90 to-charcoal-700' :
    event.category === 'Bootcamp' ? 'from-blue-600 to-charcoal-800' :
    event.category === 'Competition' ? 'from-green-600 to-charcoal-800' :
    'from-charcoal-600 to-charcoal-800';

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <Link href="/student/events" className="flex items-center gap-1.5 text-sm text-charcoal-400 hover:text-accent-red transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />Back to Events
      </Link>

      {/* Hero */}
      <div className={`rounded-2xl bg-gradient-to-br ${categoryGradient} p-8 mb-6 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <span className="badge-elegant bg-white/20 text-white backdrop-blur-sm mb-4 inline-block">{event.category}</span>
          <h1 className="font-serif text-3xl text-white font-bold mb-2">{event.title}</h1>
          <p className="text-white/70 text-sm">by {event.organizerName}</p>
          {skillMatch.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <Sparkles className="w-4 h-4 text-accent-gold" />
              <span className="text-accent-gold text-sm font-medium">{skillMatch.length} skill match{skillMatch.length > 1 ? 'es' : ''} — recommended for you!</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Event Info */}
          <div className="glass-card p-6">
            <h2 className="font-serif text-xl text-charcoal-800 mb-4">About this Event</h2>
            <p className="text-charcoal-500 leading-relaxed mb-5">{event.description}</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Calendar, label: 'Date', value: new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' }) },
                { icon: Clock, label: 'Time', value: event.time },
                { icon: MapPin, label: 'Location', value: event.location },
                { icon: Users, label: 'Capacity', value: `${event.registeredCount}/${event.capacity}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cream-200 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-charcoal-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-charcoal-400 uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-medium text-charcoal-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-cream-200">
              <p className="text-xs text-charcoal-400 uppercase tracking-wider mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {event.skills.map(s => (
                  <span key={s} className={`badge-elegant text-xs ${skillMatch.includes(s) ? 'bg-accent-red/10 text-accent-red' : 'bg-cream-200 text-charcoal-600'}`}>
                    {skillMatch.includes(s) && '✓ '}{s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Q&A */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-accent-red" />
              <h2 className="font-serif text-xl text-charcoal-800">Q&amp;A</h2>
            </div>
            {event.qna.length === 0 && <p className="text-sm text-charcoal-400">No questions yet. Be the first to ask!</p>}
            {event.qna.map(q => (
              <div key={q.id} className="border-b border-cream-200 pb-4 mb-4 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-charcoal-800 flex items-center justify-center text-white text-[10px] font-bold">{q.author.charAt(0)}</div>
                  <span className="text-sm font-medium text-charcoal-800">{q.author}</span>
                  <span className="text-[10px] text-charcoal-400 ml-auto">{q.date}</span>
                </div>
                <p className="text-sm text-charcoal-700 ml-8 mb-1"><strong>Q:</strong> {q.question}</p>
                {q.answer && <p className="text-sm text-success ml-8 bg-success/5 rounded-lg p-2"><strong>A:</strong> {q.answer}</p>}
              </div>
            ))}
            {registered && (
              <div className="bg-cream-100 rounded-xl p-4 mt-3">
                <p className="text-xs font-medium text-charcoal-500 mb-2">Ask a question</p>
                <textarea value={newQuestion} onChange={e => setNewQuestion(e.target.value)} placeholder="Your question..." rows={2} className="input-elegant text-sm resize-none mb-2" />
                <button onClick={() => { toast.success('Question submitted!'); setNewQuestion(''); }} disabled={!newQuestion.trim()} className="btn-primary text-sm px-4 py-2 disabled:opacity-40">
                  Submit
                </button>
              </div>
            )}
          </div>

          {/* Reviews */}
          {event.reviews.length > 0 && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-accent-gold" />
                <h2 className="font-serif text-xl text-charcoal-800">Reviews</h2>
              </div>
              {event.reviews.map(r => (
                <div key={r.id} className="border-b border-cream-200 pb-4 mb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-accent-gold/20 flex items-center justify-center text-[10px] font-bold text-accent-gold">{r.userName.charAt(0)}</div>
                    <span className="text-sm font-medium text-charcoal-800">{r.userName}</span>
                    <div className="flex gap-0.5 ml-auto">
                      {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-accent-gold fill-accent-gold' : 'text-charcoal-200'}`} />)}
                    </div>
                  </div>
                  <p className="text-sm text-charcoal-500 ml-8">{r.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Winners */}
          {event.winners.length > 0 && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-accent-gold" />
                <h2 className="font-serif text-xl text-charcoal-800">Past Winners</h2>
              </div>
              {event.winners.map(w => (
                <div key={w.position} className="flex items-center gap-3 p-3 rounded-xl bg-cream-100 mb-2">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-lg">{w.position === 1 ? '🥇' : w.position === 2 ? '🥈' : '🥉'}</span>
                  <span className="font-medium text-charcoal-800">{w.userName}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="glass-card p-5 sticky top-6">
            <div className="mb-4">
              <div className="flex justify-between text-xs text-charcoal-400 mb-1.5">
                <span>{event.registeredCount} registered</span><span>{fillPercent}% full</span>
              </div>
              <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${fillPercent >= 90 ? 'bg-warning' : 'bg-accent-red'}`} style={{ width: `${Math.min(fillPercent, 100)}%` }} />
              </div>
              <p className="text-[10px] text-charcoal-400 mt-1">{event.capacity - event.registeredCount} spots left</p>
            </div>

            {registered ? (
              <div className="text-center">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <p className="font-semibold text-charcoal-800 mb-1">You&apos;re Registered!</p>
                <p className="text-xs text-charcoal-400 mb-4">Show this QR code at the event for check-in.</p>

                {/* QR Code inline */}
                {(showQR || registered) && user && (
                  <div className="mb-4">
                    <div className="flex justify-center">
                      <div className="p-3 bg-white border-2 border-charcoal-800 rounded-xl shadow-inner inline-block">
                        <QRCodeSVG
                          value={qrPayload}
                          size={140}
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-charcoal-400 mt-2">Scan at event entry</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowQR(v => !v)}
                    className="btn-outline flex-1 text-xs flex items-center justify-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    {showQR ? 'Hide QR' : 'Show QR'}
                  </button>
                  <Link href="/student/attendance" className="btn-outline flex-1 text-xs text-center">
                    My Passes
                  </Link>
                </div>
              </div>
            ) : (
              <button onClick={handleRegister} disabled={registering || !user} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                {registering ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Registering...</> : 'Register Now'}
              </button>
            )}
            {!user && <p className="text-center text-xs text-charcoal-400 mt-2"><Link href="/login" className="text-accent-red font-medium">Sign in</Link> to register</p>}
          </div>

          {/* AI Match Score */}
          <div className="glass-card p-4 border border-dashed border-accent-red/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-accent-red" />
              <span className="text-xs font-semibold text-accent-red uppercase tracking-wider">Skill Match</span>
            </div>
            <p className="text-xs text-charcoal-400 mb-2">Your skill overlap: <strong className="text-charcoal-700">{skillMatch.length}/{event.skills.length}</strong></p>
            <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent-red to-accent-gold rounded-full" style={{ width: `${(skillMatch.length / Math.max(event.skills.length, 1)) * 100}%` }} />
            </div>
            {skillMatch.length > 0 && (
              <p className="text-[10px] text-success mt-1.5">✓ Matches: {skillMatch.join(', ')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
