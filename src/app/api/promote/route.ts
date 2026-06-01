import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RegistrationModel, seedRegistrationsIfEmpty } from '@/lib/registration-model';
import { EventModel } from '@/lib/event-model';
import { listRuntimeRegistrations, addRuntimeNotification, listRuntimeEvents } from '@/lib/runtime-store';
import { type MockNotification } from '@/lib/mock-data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, message, socials = [] } = body;

    if (!eventId) return NextResponse.json({ error: 'eventId required' }, { status: 400 });

    // Resolve registrants: prefer DB, fallback to runtime store
    let registrations: { userId: string }[] = [] as any;
    try {
      await connectDB();
      await seedRegistrationsIfEmpty();
      registrations = await RegistrationModel.find({ eventId }).select('userId').lean();
    } catch {
      registrations = listRuntimeRegistrations({ eventId }).map(r => ({ userId: r.userId }));
    }

    const recipientIds = Array.from(new Set(registrations.map(r => r.userId)));

    // Validate event exists (DB or runtime)
    const eventExists = Boolean((await (async () => {
      try { return await EventModel.findById(eventId).lean(); } catch { return null; }
    })()) || listRuntimeEvents().find(e => e._id === eventId));

    if (!eventExists) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Create in-app notifications for registrants about the promotion
    const createdAt = new Date().toISOString();
    recipientIds.forEach((userId, i) => {
      const notification: MockNotification = {
        _id: `promo-${Date.now()}-${i}`,
        userId,
        eventId,
        title: 'Event Promotion',
        message: message || 'Check out this event!',
        type: 'reminder',
        read: false,
        createdAt,
      };
      addRuntimeNotification(notification);
    });

    // Simulate posting to socials by returning the socials list and counts
    // (No external API calls in demo mode)
    const event = (await (async () => {
      try { return await EventModel.findById(eventId).lean(); } catch { return null; }
    })()) || listRuntimeEvents().find(e => e._id === eventId) || null;

    return NextResponse.json({
      success: true,
      postedTo: socials,
      recipients: recipientIds.length,
      event: event ? { _id: event._id, title: event.title } : null,
    });
  } catch (err) {
    console.error('Promote error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Failed to promote: ${msg}` }, { status: 500 });
  }
}
