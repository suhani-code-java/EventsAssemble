'use client';

import { useState } from 'react';
import { Megaphone, Briefcase, MessageSquare, Copy, CheckCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { mockEvents } from '@/lib/mock-data';

export default function PromotePage() {
  const [selectedEvent, setSelectedEvent] = useState(mockEvents[0]._id);
  const [copied, setCopied] = useState<string | null>(null);

  const event = mockEvents.find(e => e._id === selectedEvent) || mockEvents[0];

  const templates = {
    linkedin: `🚀 Exciting News! 

We're hosting **${event.title}** — a ${event.category.toLowerCase()} that you don't want to miss!

📅 Date: ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
📍 Location: ${event.location}
🎯 Skills: ${event.skills.join(', ')}

Register now at EchoPod and secure your spot! Only ${event.capacity - event.registeredCount} seats remaining.

#${event.category} #TechEvents #EchoPod #RTU`,

    whatsapp: `🎉 *${event.title}* 🎉

Hey! Join us for an amazing ${event.category.toLowerCase()}!

📅 ${new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} | ⏰ ${event.time}
📍 ${event.location}

${event.description.slice(0, 150)}...

✅ ${event.registeredCount} already registered
⚡ Only ${event.capacity - event.registeredCount} spots left!

Register on EchoPod now! 🔥`,

    email: `Subject: You're Invited to ${event.title}!

Dear Student,

We are thrilled to invite you to ${event.title}, a ${event.category.toLowerCase()} organized at ${event.location}.

Event Details:
- Date: ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
- Time: ${event.time}
- Location: ${event.location}
- Skills: ${event.skills.join(', ')}

${event.description}

${event.registeredCount} participants have already registered. Secure your spot now!

Best regards,
${event.organizerName}
EchoPod Platform`,
  };

  const handleCopy = (platform: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(platform);
    toast.success(`${platform} template copied!`);
    setTimeout(() => setCopied(null), 2000);
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
        >
          {mockEvents.map(e => (
            <option key={e._id} value={e._id}>{e.title}</option>
          ))}
        </select>
      </div>

      {/* Templates */}
      <div className="space-y-6">
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
