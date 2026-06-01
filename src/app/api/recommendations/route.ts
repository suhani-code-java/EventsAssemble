import { NextResponse } from 'next/server';
import { mockEvents } from '@/lib/mock-data';

// ML Recommendation Placeholder
// In production, this would call an ML model for content-based or collaborative filtering
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skills = searchParams.get('skills')?.split(',') || [];

  // Simple content-based filtering: match events by skill overlap
  let recommended = mockEvents.map(event => {
    const overlap = event.skills.filter(s =>
      skills.some(us => us.toLowerCase().trim() === s.toLowerCase())
    );
    return { ...event, matchScore: overlap.length };
  });

  recommended.sort((a, b) => b.matchScore - a.matchScore);
  recommended = recommended.slice(0, 5);

  return NextResponse.json({
    recommendations: recommended,
    algorithm: 'content-based-filtering-placeholder',
    note: 'ML model integration point — replace with trained model for production',
  });
}
