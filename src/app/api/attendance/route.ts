import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RegistrationModel, seedRegistrationsIfEmpty } from '@/lib/registration-model';
import { EventModel, seedEventsIfEmpty } from '@/lib/event-model';
import {
  findRuntimeEventById,
  findRuntimeRegistration,
  listRuntimeRegistrations,
  updateRuntimeRegistration,
} from '@/lib/runtime-store';

// POST /api/attendance — marks a student as attended based on scanned QR payload
export async function POST(request: Request) {
  const body = await request.json();
  const { userId, eventId, name, rollNumber } = body;

  if (!userId || !eventId) {
    return NextResponse.json({ error: 'Invalid QR code: missing userId or eventId' }, { status: 400 });
  }

  try {
    await connectDB();
    await seedRegistrationsIfEmpty();
    await seedEventsIfEmpty();

    // Find the registration
    const registration = await RegistrationModel.findOne({ userId, eventId });
    if (!registration) {
      return NextResponse.json({ error: 'Student is not registered for this event' }, { status: 404 });
    }

    if (registration.attended) {
      // Already attended — still return success with info so organizer knows
      const event = await EventModel.findById(eventId).lean();
      return NextResponse.json({
        alreadyAttended: true,
        registration,
        student: { name: registration.userName || name, rollNumber: registration.rollNumber || rollNumber },
        event: event ? { title: (event as { title?: string }).title } : null,
      });
    }

    // Mark as attended
    registration.attended = true;
    registration.status = 'attended';
    await registration.save();

    const event = await EventModel.findById(eventId).lean();

    return NextResponse.json({
      success: true,
      registration,
      student: { name: registration.userName || name, rollNumber: registration.rollNumber || rollNumber },
      event: event ? { title: (event as { title?: string }).title } : null,
    });
  } catch {
    const registration = findRuntimeRegistration(userId, eventId);
    if (!registration) {
      return NextResponse.json({ error: 'Student is not registered for this event' }, { status: 404 });
    }

    if (registration.attended) {
      const event = findRuntimeEventById(eventId);
      return NextResponse.json({
        alreadyAttended: true,
        registration,
        student: { name: registration.userName || name, rollNumber: registration.rollNumber || rollNumber },
        event: event ? { title: event.title } : null,
        source: 'runtime-fallback',
      });
    }

    const updated = updateRuntimeRegistration(userId, eventId, { attended: true, status: 'attended' });
    const event = findRuntimeEventById(eventId);
    return NextResponse.json({
      success: true,
      registration: updated,
      student: { name: updated?.userName || name, rollNumber: updated?.rollNumber || rollNumber },
      event: event ? { title: event.title } : null,
      source: 'runtime-fallback',
    });
  }
}

// GET /api/attendance?eventId=xxx — get attendance list for an event
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  if (!eventId) {
    return NextResponse.json({ error: 'eventId required' }, { status: 400 });
  }

  try {
    await connectDB();
    await seedRegistrationsIfEmpty();

    const registrations = await RegistrationModel.find({ eventId }).sort({ registeredAt: -1 }).lean();
    const attended = registrations.filter(r => r.attended);
    return NextResponse.json({ registrations, attended, total: registrations.length, attendedCount: attended.length });
  } catch {
    const registrations = listRuntimeRegistrations({ eventId }).sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
    const attended = registrations.filter(r => r.attended);
    return NextResponse.json({ registrations, attended, total: registrations.length, attendedCount: attended.length, source: 'runtime-fallback' });
  }
}
