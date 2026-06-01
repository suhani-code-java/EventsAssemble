'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle, Clock, Calendar, Download, RefreshCw } from 'lucide-react';
import { type MockEvent } from '@/lib/mock-data';
import type { RegistrationRecord } from '@/lib/registration-model';

export default function AttendancePage() {
  const [user, setUser] = useState<{ _id: string; name: string; rollNumber?: string; email?: string } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

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
  }, [refreshKey]);

  if (!user) return null;

  const myRegistrations = registrations.filter(r => r.userId === user._id);
  const myEvents = myRegistrations
    .map(r => {
      const event = events.find(e => e._id === r.eventId);
      return event ? { ...event, registration: r } : null;
    })
    .filter((e): e is MockEvent & { registration: RegistrationRecord } => e !== null);

  const active = selectedEvent || myEvents[0]?._id;
  const activeEvent = myEvents.find(e => e._id === active);

  // QR payload — matches exactly what the organizer scanner expects
  // Format: { userId, name, rollNumber, eventId, eventName, timestamp }
  const qrPayload = JSON.stringify({
    userId: user._id,
    name: user.name,
    rollNumber: user.rollNumber || user.email || user._id,
    eventId: active || 'none',
    eventName: activeEvent?.title || '',
    timestamp: new Date().toISOString(),
  });

  const downloadQR = () => {
    const svg = document.getElementById('qr-svg-element');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-pass-${active}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-serif text-headline text-charcoal-800">QR Attendance</h1>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          className="flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-accent-red transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>
      <p className="text-charcoal-400 mb-8">Show your QR code at the event for seamless check-in</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Code Display */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 text-center">
            <h3 className="font-serif text-lg text-charcoal-800 mb-1">Your QR Pass</h3>
            {activeEvent && (
              <p className="text-xs text-charcoal-400 mb-4 truncate">{activeEvent.title}</p>
            )}

            {active && active !== 'none' ? (
              <>
                {/* Real QR Code using qrcode.react */}
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-white border-2 border-charcoal-800 rounded-xl shadow-inner">
                    <QRCodeSVG
                      id="qr-svg-element"
                      value={qrPayload}
                      size={176}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                </div>

                {/* Student Info */}
                <div className="bg-cream-100 rounded-xl p-3 mb-3 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-charcoal-400 uppercase tracking-wider">Student</span>
                    <span className="badge-elegant bg-success/10 text-success text-[10px]">Active</span>
                  </div>
                  <p className="text-sm font-semibold text-charcoal-800">{user.name}</p>
                  <p className="text-xs text-charcoal-400 font-mono">
                    {user.rollNumber || user._id.toUpperCase()}
                  </p>
                </div>

                {/* Event identifier */}
                <p className="text-[10px] text-charcoal-400 mb-1">Event QR for</p>
                <p className="text-xs font-mono text-charcoal-600 bg-cream-200 rounded px-2 py-1 inline-block mb-4 break-all">
                  {activeEvent?.title || active}
                </p>

                <button
                  onClick={downloadQR}
                  className="w-full flex items-center justify-center gap-2 text-sm text-charcoal-500 border border-cream-300 rounded-lg py-2 hover:bg-cream-100 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download QR
                </button>
              </>
            ) : (
              <div className="py-8 text-center">
                <div className="w-16 h-16 mx-auto bg-cream-200 rounded-2xl flex items-center justify-center mb-3">
                  <Calendar className="w-8 h-8 text-charcoal-300" />
                </div>
                <p className="text-sm text-charcoal-400">Register for an event to get your QR pass</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-cream-200">
              <p className="text-[10px] text-charcoal-400 leading-relaxed">
                The organizer scans this QR code to mark your attendance. Each event generates a unique QR.
              </p>
            </div>
          </div>
        </div>

        {/* Event Selector & Attendance History */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-charcoal-800 mb-3">
              Select Event
              <span className="ml-2 text-xs font-normal text-charcoal-400">({myEvents.length} registered)</span>
            </h3>

            {myEvents.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-charcoal-400">No registered events yet.</p>
                <a href="/student/events" className="text-accent-red text-sm font-medium mt-1 inline-block">Browse Events →</a>
              </div>
            ) : (
              <div className="space-y-2">
                {myEvents.map(event => (
                  <button
                    key={event._id}
                    onClick={() => setSelectedEvent(event._id)}
                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
                      event._id === active
                        ? 'bg-accent-red/10 border border-accent-red/20'
                        : 'bg-cream-100 hover:bg-cream-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-serif font-bold text-sm ${
                      event._id === active ? 'bg-accent-red text-white' : 'bg-cream-300 text-charcoal-500'
                    }`}>
                      {new Date(event.date).getDate()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal-800 truncate">{event.title}</p>
                      <p className="text-xs text-charcoal-400">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' • '}{event.location}
                      </p>
                    </div>
                    {event.registration.attended ? (
                      <CheckCircle className="w-5 h-5 text-success shrink-0" />
                    ) : (
                      <Clock className="w-5 h-5 text-charcoal-300 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {activeEvent && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-charcoal-800 mb-3">Attendance Status</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-cream-100 rounded-xl p-4">
                  <p className="text-xs text-charcoal-400 mb-1">Status</p>
                  <p className={`text-sm font-semibold ${activeEvent.registration.attended ? 'text-success' : 'text-warning'}`}>
                    {activeEvent.registration.attended ? '✓ Attended' : '⏳ Pending Scan'}
                  </p>
                </div>
                <div className="bg-cream-100 rounded-xl p-4">
                  <p className="text-xs text-charcoal-400 mb-1">Registered</p>
                  <p className="text-sm font-semibold text-charcoal-800">
                    {new Date(activeEvent.registration.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="bg-cream-100 rounded-xl p-4">
                  <p className="text-xs text-charcoal-400 mb-1">Event Date</p>
                  <p className="text-sm font-semibold text-charcoal-800">
                    {new Date(activeEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' '}{activeEvent.time}
                  </p>
                </div>
                <div className="bg-cream-100 rounded-xl p-4">
                  <p className="text-xs text-charcoal-400 mb-1">Location</p>
                  <p className="text-sm font-semibold text-charcoal-800 truncate">{activeEvent.location}</p>
                </div>
              </div>

              <div className="p-3 bg-info/5 border border-info/10 rounded-xl">
                <p className="text-xs text-info">
                  <strong>How it works:</strong> Show your QR code to the organizer. They scan it using the Scanner page and your attendance is marked automatically.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
