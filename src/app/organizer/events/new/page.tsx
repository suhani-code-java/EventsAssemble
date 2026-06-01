'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Users, Tag, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function NewEventPage() {
  const router = useRouter(); // Used in redirect after event creation
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Hackathon',
    date: '',
    time: '',
    location: '',
    capacity: 100,
    skills: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form before submission
      if (!form.title.trim()) {
        toast.error('Please enter an event title');
        setLoading(false);
        return;
      }
      if (!form.description.trim()) {
        toast.error('Please enter a description');
        setLoading(false);
        return;
      }
      if (!form.date) {
        toast.error('Please select a date');
        setLoading(false);
        return;
      }
      if (!form.time) {
        toast.error('Please select a time');
        setLoading(false);
        return;
      }
      if (!form.location.trim()) {
        toast.error('Please enter a location');
        setLoading(false);
        return;
      }

      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      if (!user?._id) {
        toast.error('You must be logged in to create an event');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          date: form.date,
          time: form.time,
          location: form.location.trim(),
          capacity: parseInt(form.capacity.toString()) || 100,
          skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
          organizer: user._id,
          organizerName: user.name || 'Organizer',
        }),
      });

      const responseData = await res.json();
        // console.log('API Response:', { status: res.status, data: responseData });

      if (res.ok) {
        toast.success('Event created successfully! 🎉');
        setForm({
          title: '',
          description: '',
          category: 'Hackathon',
          date: '',
          time: '',
          location: '',
          capacity: 100,
          skills: '',
        });
        router.push('/organizer/events?refresh=' + Date.now());
        router.refresh();
      } else {
        const errorMessage = responseData.error || 'Failed to create event';
        console.error('Event creation failed:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-charcoal-400 hover:text-charcoal-800 transition-colors mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="font-serif text-headline text-charcoal-800 mb-2">Create New Event</h1>
      <p className="text-charcoal-400 mb-8">Fill in the details to create your event</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-serif text-lg text-charcoal-800">Basic Info</h2>

          <div>
            <label className="block text-sm font-medium text-charcoal-600 mb-1.5">Event Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="input-elegant"
              placeholder="e.g., HackSphere 2026"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-600 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="input-elegant min-h-[120px] resize-y"
              placeholder="Describe your event..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-600 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="input-elegant"
            >
              {['Hackathon', 'Workshop', 'Bootcamp', 'Competition', 'Masterclass'].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h2 className="font-serif text-lg text-charcoal-800">Schedule & Venue</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-charcoal-600 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="input-elegant"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-600 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Time
              </label>
              <input
                type="time"
                value={form.time}
                onChange={e => setForm({ ...form, time: e.target.value })}
                className="input-elegant"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-600 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Location
            </label>
            <input
              type="text"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              className="input-elegant"
              placeholder="e.g., Main Auditorium, RTU Kota"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-600 mb-1.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Capacity
            </label>
            <input
              type="number"
              value={form.capacity}
              onChange={e => setForm({ ...form, capacity: e.target.value ? parseInt(e.target.value) : 100 })}
              className="input-elegant"
              min="1"
              max="5000"
              required
            />
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h2 className="font-serif text-lg text-charcoal-800">Tags</h2>
          <div>
            <label className="block text-sm font-medium text-charcoal-600 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Skills / Tags
            </label>
            <input
              type="text"
              value={form.skills}
              onChange={e => setForm({ ...form, skills: e.target.value })}
              className="input-elegant"
              placeholder="JavaScript, React, Python (comma-separated)"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-base flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Create Event'
          )}
        </button>
      </form>
    </div>
  );
}
