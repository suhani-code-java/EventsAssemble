'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Medal, Target, TrendingUp } from 'lucide-react';
import { mockLeaderboard, mockBadges, mockUsers } from '@/lib/mock-data';

export default function GamificationPage() {
  const [user, setUser] = useState<typeof mockUsers[0] | null>(null);
  const [activeTab, setActiveTab] = useState<'badges' | 'leaderboard'>('badges');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      const fullUser = mockUsers.find(u => u._id === parsed._id) || parsed;
      setUser(fullUser);
    }
  }, []);

  if (!user) return null;

  const nextBadge = mockBadges.find(b =>
    b.pointsRequired > user.points && !user.badges.includes(b.name)
  );
  const progressToNext = nextBadge
    ? Math.round((user.points / nextBadge.pointsRequired) * 100)
    : 100;

  return (
    <div className="animate-fade-in">
      <h1 className="font-serif text-headline text-charcoal-800 mb-2">Gamification</h1>
      <p className="text-charcoal-400 mb-8">Track your achievements and climb the leaderboard</p>

      {/* Points Overview */}
      <div className="glass-card p-6 mb-6 bg-gradient-to-r from-accent-gold/5 to-accent-red/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-charcoal-400">Total Points</p>
            <p className="font-serif text-4xl font-bold text-charcoal-800">{user.points}</p>
          </div>
          <div className="w-16 h-16 bg-accent-gold/10 rounded-2xl flex items-center justify-center">
            <Trophy className="w-8 h-8 text-accent-gold" />
          </div>
        </div>
        {nextBadge && (
          <div>
            <div className="flex justify-between text-xs text-charcoal-400 mb-1">
              <span>Progress to &quot;{nextBadge.name}&quot;</span>
              <span>{user.points}/{nextBadge.pointsRequired} pts</span>
            </div>
            <div className="h-2 bg-cream-300 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent-gold to-accent-red rounded-full transition-all duration-1000" style={{ width: `${progressToNext}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Point Sources */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Registration', points: '+50', icon: Target },
          { label: 'Attendance', points: '+100', icon: Star },
          { label: 'Review', points: '+25', icon: Medal },
          { label: 'Win', points: '+200', icon: Trophy },
        ].map((source, i) => (
          <div key={i} className="glass-card p-4 text-center">
            <source.icon className="w-6 h-6 mx-auto text-accent-red mb-2" />
            <p className="text-xs text-charcoal-400">{source.label}</p>
            <p className="text-sm font-bold text-success">{source.points}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-cream-200 rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveTab('badges')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'badges' ? 'bg-white text-charcoal-800 shadow-sm' : 'text-charcoal-400'}`}
        >
          My Badges ({user.badges.length})
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'leaderboard' ? 'bg-white text-charcoal-800 shadow-sm' : 'text-charcoal-400'}`}
        >
          Leaderboard
        </button>
      </div>

      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockBadges.map(badge => {
            const earned = user.badges.includes(badge.name);
            return (
              <div key={badge.id} className={`glass-card p-5 ${earned ? 'border-accent-gold/30' : 'opacity-50'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{badge.icon}</span>
                  <div>
                    <h3 className="font-semibold text-charcoal-800">{badge.name}</h3>
                    <p className="text-xs text-charcoal-400">{badge.description}</p>
                  </div>
                </div>
                {earned ? (
                  <div className="mt-3 flex items-center gap-1 text-xs text-success font-medium">
                    <Star className="w-3 h-3 fill-success" /> Earned
                  </div>
                ) : (
                  <div className="mt-3">
                    <p className="text-[10px] text-charcoal-400">{badge.pointsRequired} pts required</p>
                    <div className="h-1 bg-cream-200 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-charcoal-300 rounded-full" style={{ width: `${Math.min((user.points / badge.pointsRequired) * 100, 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="space-y-3">
          {mockLeaderboard.map((entry, i) => {
            const isMe = entry.userId === user._id;
            return (
              <div key={entry.userId} className={`glass-card p-4 flex items-center gap-4 ${isMe ? 'border-accent-red/30 bg-accent-red/5' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-lg ${
                  i === 0 ? 'bg-accent-gold text-white' :
                  i === 1 ? 'bg-charcoal-300 text-white' :
                  i === 2 ? 'bg-accent-red/70 text-white' :
                  'bg-cream-300 text-charcoal-500'
                }`}>
                  {entry.rank}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-charcoal-800">
                    {entry.name} {isMe && <span className="text-accent-red text-xs font-normal">(you)</span>}
                  </p>
                  <p className="text-xs text-charcoal-400">{entry.badges} badges</p>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <p className="font-serif font-bold text-lg text-charcoal-800">{entry.points}</p>
                  <p className="text-[10px] text-charcoal-400">pts</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
