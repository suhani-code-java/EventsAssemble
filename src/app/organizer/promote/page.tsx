'use client';

import { useState } from 'react';
import { Megaphone, Briefcase, MessageSquare, Copy, CheckCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { mockEvents } from '@/lib/mock-data';
import { useEffect } from 'react';

export default function PromotePage() {
  const [selectedEvent, setSelectedEvent] = useState(mockEvents.length > 0 ? mockEvents[0]._id : '');
  const [copied, setCopied] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [selectedSocials, setSelectedSocials] = useState<{ linkedin: boolean; instagram: boolean }>({ linkedin: true, instagram: false });
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);

  const event = mockEvents.find(e => e._id === selectedEvent) || mockEvents[0] || {
    _id: '',
    title: 'Untitled Event',
    description: '',
    category: 'Event',
    date: new Date().toISOString(),
    time: '',
    location: 'TBA',
    capacity: 0,
    registeredCount: 0,
    organizer: '',
    organizerName: '',
    skills: [],
    status: 'upcoming',
    qna: [],
    reviews: [],
    winners: [],
  };

  const templates = {
    linkedin: `🚀 Exciting News!\n\nWe're hosting **${event.title}** — a ${event.category.toLowerCase()} you won't want to miss!\n\n📅 ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • 📍 ${event.location}\n\n${event.description.slice(0, 180)}\n\nSecure your spot: only ${Math.max(0, event.capacity - event.registeredCount)} seats left! #${event.category} #EchoPod`,
    instagram: `Join us at ${event.title}! ${event.category} • ${new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ${event.location}\n\n${event.description.slice(0, 120)}\n\nTap link in bio to register — limited seats!`,
    email: `Subject: You're Invited to ${event.title}!\n\nHi there,\n\nWe'd love to invite you to ${event.title} (${event.category}) at ${event.location} on ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} (${event.time}).\n\n${event.description}\n\n${event.registeredCount} people have registered already — book your spot now!\n\nBest,\n${event.organizerName}`,
  };

  useEffect(() => {
    // initialize editable message with the LinkedIn template
    setMessage(templates.linkedin);
  }, [selectedEvent]);

  useEffect(() => {
    let cancelled = false;
    setRecipientCount(null);
    fetch(`/api/registrations?eventId=${selectedEvent}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        setRecipientCount(Array.isArray(data.registrations) ? data.registrations.length : 0);
      })
      .catch(() => {
        if (cancelled) return;
        setRecipientCount(0);
      });
    return () => { cancelled = true; };
  }, [selectedEvent]);

  const handleCopy = (platform: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(platform);
    toast.success(`${platform} template copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleSocial = (key: 'linkedin' | 'instagram') => {
    setSelectedSocials(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSendPromote = async () => {
    const socials = [] as string[];
    if (selectedSocials.linkedin) socials.push('linkedin');
    if (selectedSocials.instagram) socials.push('instagram');

    if (socials.length === 0) {
      toast.error('Select at least one social to post');
      return;
    }

    // Ask permission (simple confirm for demo)
    const confirmMsg = `Allow EchoPod to post this message to: ${socials.join(', ')}?`;
    if (!confirm(confirmMsg)) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: selectedEvent, message, socials }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || `Promote failed (${res.status})`;
        toast.error(msg);
        setLastResult(`Error: ${msg}`);
        return;
      }

      const posted = Array.isArray(data.postedTo) ? data.postedTo.join(', ') : (data.postedTo || 'none');
      setLastResult(`Posted to: ${posted} — notified ${data.recipients ?? 0} registrants`);
      toast.success('Promotion posted (demo)');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to promote';
      toast.error(msg);
      setLastResult(`Error: ${msg}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="font-serif text-headline text-charcoal-800 mb-2">Event Promotion</h1>
      <p className="text-charcoal-400 mb-8">Auto-generate promotional templates for your events</p>

      {/* Event Selector */}
      <div className="glass-card p-5 mb-6">
        <label className="block text-sm font-medium text-charcoal-600 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-red" /> Select Event to Promote
        </label>
        <select
          value={selectedEvent}
          onChange={e => setSelectedEvent(e.target.value)}
          className="input-elegant"
          disabled={mockEvents.length === 0}
        >
          {mockEvents.length === 0 ? (
            <option value="">(No events available)</option>
          ) : (
            mockEvents.map(e => (
              <option key={e._id} value={e._id}>{e.title}</option>
            ))
          )}
        </select>
      </div>

      {/* Templates */}
      <div className="space-y-6">
        {/* Composer */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-red/10 rounded-xl flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-accent-red" />
              </div>
              <h2 className="font-serif text-lg text-charcoal-800">Customize & Post</h2>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-charcoal-600 mr-2">LinkedIn</label>
              <input type="checkbox" checked={selectedSocials.linkedin} onChange={() => toggleSocial('linkedin')} />
              <label className="text-sm text-charcoal-600 ml-4 mr-2">Instagram</label>
              <input type="checkbox" checked={selectedSocials.instagram} onChange={() => toggleSocial('instagram')} />
            </div>
          </div>

          <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="input-elegant w-full min-h-[120px] mb-4" />

          <div className="flex items-center gap-3">
            <button onClick={handleSendPromote} disabled={isSending || (recipientCount === 0)} className="btn-primary" title={recipientCount === 0 ? 'No registrants to notify' : ''}>
              {isSending ? 'Sending…' : 'Post to Selected Socials'}
            </button>
            <button onClick={() => { navigator.clipboard.writeText(message); toast.success('Message copied'); }} className="btn-outline">
              Copy Message
            </button>
            {recipientCount !== null && (
              <span className="text-sm text-charcoal-500">Will notify: <strong className="text-charcoal-700">{recipientCount}</strong> registrant{recipientCount === 1 ? '' : 's'}</span>
            )}
            {lastResult && <span className="text-sm text-charcoal-500 ml-3">{lastResult}</span>}
          </div>
        </div>

        {/* LinkedIn */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0077B5]/10 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-[#0077B5]" />
              </div>
              <h2 className="font-serif text-lg text-charcoal-800">LinkedIn Post</h2>
            </div>
            <button
              onClick={() => handleCopy('LinkedIn', templates.linkedin)}
              className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1"
            >
              {copied === 'LinkedIn' ? <CheckCircle className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
              {copied === 'LinkedIn' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="text-sm text-charcoal-600 bg-cream-100 rounded-xl p-4 whitespace-pre-wrap font-sans leading-relaxed">
            {templates.linkedin}
          </pre>
        </div>

        {/* WhatsApp */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#25D366]/10 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#25D366]" />
              </div>
              <h2 className="font-serif text-lg text-charcoal-800">WhatsApp Message</h2>
            </div>
            <button
              onClick={() => handleCopy('WhatsApp', templates.whatsapp)}
              className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1"
            >
              {copied === 'WhatsApp' ? <CheckCircle className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
              {copied === 'WhatsApp' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="text-sm text-charcoal-600 bg-cream-100 rounded-xl p-4 whitespace-pre-wrap font-sans leading-relaxed">
            {templates.whatsapp}
          </pre>
        </div>

        {/* Email */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-red/10 rounded-xl flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-accent-red" />
              </div>
              <h2 className="font-serif text-lg text-charcoal-800">Email Template</h2>
            </div>
            <button
              onClick={() => handleCopy('Email', templates.email)}
              className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1"
            >
              {copied === 'Email' ? <CheckCircle className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
              {copied === 'Email' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="text-sm text-charcoal-600 bg-cream-100 rounded-xl p-4 whitespace-pre-wrap font-sans leading-relaxed">
            {templates.email}
          </pre>
        </div>
      </div>
    </div>
  );
}
