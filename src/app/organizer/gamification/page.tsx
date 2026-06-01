'use client';

import { useState } from 'react';
import { Trophy, Star, Gift, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { mockBadges, mockUsers } from '@/lib/mock-data';

export default function OrganizerGamificationPage() {
  const [selectedUser, setSelectedUser] = useState('');
  const [pointsToAdd, setPointsToAdd] = useState(50);
  const [badgeToAward, setBadgeToAward] = useState('');

  const students = mockUsers.filter(u => u.role === 'student');

  const handleAwardPoints = () => {
    if (!selectedUser) { toast.error('Select a user'); return; }
    toast.success(`Awarded ${pointsToAdd} points!`);
  };

  const handleAwardBadge = () => {
    if (!selectedUser || !badgeToAward) { toast.error('Select user and badge'); return; }
    toast.success(`Badge "${badgeToAward}" awarded!`);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="font-serif text-headline text-charcoal-800 mb-2">Gamification Management</h1>
      <p className="text-charcoal-400 mb-8">Assign badges, points, and manage participant achievements</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Award Points */}
        <div className="glass-card p-6">
          <h2 className="font-serif text-lg text-charcoal-800 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-accent-gold" /> Award Points
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-600 mb-1.5">Select Participant</label>
              <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="input-elegant">
                <option value="">Choose a student...</option>
                {students.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.points} pts)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-600 mb-1.5">Points</label>
              <div className="flex gap-2">
                {[25, 50, 100, 200].map(p => (
                  <button
                    key={p}
                    onClick={() => setPointsToAdd(p)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      pointsToAdd === p ? 'bg-accent-gold text-white' : 'bg-cream-200 text-charcoal-500'
                    }`}
                  >
                    +{p}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleAwardPoints} className="btn-primary w-full flex items-center justify-center gap-2">
              <Gift className="w-4 h-4" /> Award Points
            </button>
          </div>
        </div>

        {/* Award Badge */}
        <div className="glass-card p-6">
          <h2 className="font-serif text-lg text-charcoal-800 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent-red" /> Award Badge
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-600 mb-1.5">Select Participant</label>
              <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="input-elegant">
                <option value="">Choose a student...</option>
                {students.map(u => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-600 mb-1.5">Badge</label>
              <div className="grid grid-cols-3 gap-2">
                {mockBadges.slice(0, 6).map(b => (
                  <button
                    key={b.id}
                    onClick={() => setBadgeToAward(b.name)}
                    className={`p-3 rounded-xl text-center transition-all ${
                      badgeToAward === b.name ? 'bg-accent-red/10 border border-accent-red/20' : 'bg-cream-100 hover:bg-cream-200'
                    }`}
                  >
                    <span className="text-2xl">{b.icon}</span>
                    <p className="text-[10px] text-charcoal-600 mt-1 font-medium">{b.name}</p>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleAwardBadge} className="btn-primary w-full flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Award Badge
            </button>
          </div>
        </div>

        {/* Student Overview */}
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="font-serif text-lg text-charcoal-800 mb-4">Participant Overview</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-200">
                  <th className="text-left text-xs font-medium text-charcoal-400 uppercase px-4 py-3">Student</th>
                  <th className="text-left text-xs font-medium text-charcoal-400 uppercase px-4 py-3">Points</th>
                  <th className="text-left text-xs font-medium text-charcoal-400 uppercase px-4 py-3">Badges</th>
                  <th className="text-left text-xs font-medium text-charcoal-400 uppercase px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {students.map(u => (
                  <tr key={u._id} className="hover:bg-cream-100/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-charcoal-800">{u.name}</p>
                      <p className="text-[10px] text-charcoal-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-serif font-bold text-charcoal-800">{u.points}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {u.badges.slice(0, 3).map((b, i) => (
                          <span key={i} className="badge-elegant bg-cream-200 text-charcoal-600 text-[10px]">{b}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge-elegant bg-success/10 text-success text-[10px]">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
