import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { EventModel, seedEventsIfEmpty } from '@/lib/event-model';

export async function GET() {
  try {
    await connectDB();
    await seedEventsIfEmpty();

    const events = await EventModel.find({}).sort({ date: -1 }).lean();

    return NextResponse.json({
      events: events.map(e => ({
        _id: e._id,
        title: e.title,
        date: e.date,
        organizer: e.organizerName,
        registeredCount: e.registeredCount,
        capacity: e.capacity,
      })),
    });
  } catch (error) {
    console.error('Admin events error:', error);
    return NextResponse.json({ error: 'Failed to load events' }, { status: 500 });
  }
}
