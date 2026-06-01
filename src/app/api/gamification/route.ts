import { NextResponse } from 'next/server';
import { mockLeaderboard, mockBadges } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json({
    leaderboard: mockLeaderboard,
    badges: mockBadges,
  });
}
