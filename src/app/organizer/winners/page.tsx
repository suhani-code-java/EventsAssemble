'use client';

import { Trophy, Medal, Award } from 'lucide-react';
import { mockEvents } from '@/lib/mock-data';

export default function WinnersPage() {
  const eventsWithWinners = mockEvents.filter(e => e.winners.length > 0);

  return (
    <div className="animate-fade-in">
      <h1 className="font-serif text-headline text-charcoal-800 mb-2">Past Winners</h1>
      <p className="text-charcoal-400 mb-8">Showcase previous event winners for credibility and inspiration</p>

      {eventsWithWinners.length > 0 ? (
        <div className="space-y-6">
          {eventsWithWinners.map(event => (
            <div key={event._id} className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent-gold/10 rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-accent-gold" />
                </div>
                <div>
                  <h2 className="font-serif text-lg text-charcoal-800">{event.title}</h2>
                  <p className="text-xs text-charcoal-400">{event.category} • {new Date(event.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {event.winners.map(w => {
                  const icons = [Trophy, Medal, Award];
                  const colors = ['bg-accent-gold', 'bg-charcoal-300', 'bg-accent-red/60'];
                  const bgColors = ['bg-accent-gold/5', 'bg-charcoal-100', 'bg-accent-red/5'];
                  const Icon = icons[w.position - 1] || Award;

                  return (
                    <div key={w.position} className={`${bgColors[w.position - 1]} rounded-xl p-5 text-center`}>
                      <div className={`w-12 h-12 ${colors[w.position - 1]} rounded-full flex items-center justify-center mx-auto mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-xs text-charcoal-400 mb-1">
                        {w.position === 1 ? '🥇 1st Place' : w.position === 2 ? '🥈 2nd Place' : '🥉 3rd Place'}
                      </p>
                      <p className="font-serif text-lg font-bold text-charcoal-800">{w.userName}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <Trophy className="w-12 h-12 text-charcoal-200 mx-auto mb-4" />
          <h3 className="font-serif text-xl text-charcoal-800 mb-2">No Winners Yet</h3>
          <p className="text-charcoal-400 text-sm">Winners will appear here after your events conclude</p>
        </div>
      )}
    </div>
  );
}
