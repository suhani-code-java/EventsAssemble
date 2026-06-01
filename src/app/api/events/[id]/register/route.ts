import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { EventModel, seedEventsIfEmpty } from '@/lib/event-model';
import { RegistrationModel, seedRegistrationsIfEmpty } from '@/lib/registration-model';
import { addRuntimeNotification, addRuntimeRegistration, findRuntimeEventById } from '@/lib/runtime-store';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    await seedEventsIfEmpty();
    await seedRegistrationsIfEmpty();

    const body = await request.json();
    const { userId, userName, userEmail, rollNumber } = body;

    // Check if already registered
    const existing = await RegistrationModel.findOne({ userId, eventId: params.id });
    if (existing) {
      return NextResponse.json({ error: 'Already registered' }, { status: 400 });
    }

    const registration = {
      _id: `reg${Date.now()}`,
      userId,
      userName,
      userEmail,
      rollNumber,
      eventId: params.id,
      status: 'registered' as const,
      registeredAt: new Date().toISOString(),
      attended: false,
    };
    await RegistrationModel.create(registration);

    const event = await EventModel.findById(params.id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    event.registeredCount = (event.registeredCount || 0) + 1;
    await event.save();

    // Create notification
    addRuntimeNotification({
      _id: `n${Date.now()}`,
      userId,
      eventId: params.id,
      title: '🎉 Registration Confirmed',
      message: `You are registered for ${event.title}!`,
      type: 'event',
      read: false,
      createdAt: new Date().toISOString(),
      source: 'registration',
    });

    return NextResponse.json({ registration }, { status: 201 });
  } catch {
    try {
      // Runtime fallback: create registration in-memory
      const body = await request.json();
      const { userId, userName, userEmail, rollNumber } = body;
      const registration = {
        _id: `reg${Date.now()}`,
        userId,
        userName,
        userEmail,
        rollNumber,
        eventId: params.id,
        status: 'registered' as const,
        registeredAt: new Date().toISOString(),
        attended: false,
      };
      addRuntimeRegistration(registration as any);

      // push notification for demo users
      addRuntimeNotification({
        _id: `n${Date.now()}`,
        userId,
        eventId: params.id,
        title: '🎉 Registration Confirmed',
        message: `You are registered for ${params.id}!`,
        type: 'event',
        read: false,
        createdAt: new Date().toISOString(),
        source: 'registration',
      });

      // ensure event exists in runtime store and report
      const ev = findRuntimeEventById(params.id);
      if (ev) {
        return NextResponse.json({ registration, source: 'runtime-fallback' }, { status: 201 });
      }
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    } catch (e) {
      return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
  }
}
