import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { EventModel, seedEventsIfEmpty } from '@/lib/event-model';
import { RegistrationModel, seedRegistrationsIfEmpty } from '@/lib/registration-model';
import {
  deleteRuntimeEvent,
  findRuntimeEventById,
  listRuntimeRegistrations,
  updateRuntimeEvent,
} from '@/lib/runtime-store';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    await seedEventsIfEmpty();
    await seedRegistrationsIfEmpty();

    const event = await EventModel.findById(params.id).lean();
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const registrations = await RegistrationModel.find({ eventId: params.id }).sort({ registeredAt: -1 }).lean();
    return NextResponse.json({ event, registrations });
  } catch {
    const event = findRuntimeEventById(params.id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    const registrations = listRuntimeRegistrations({ eventId: params.id }).sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
    return NextResponse.json({ event, registrations, source: 'runtime-fallback' });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const skills = Array.isArray(body.skills)
    ? body.skills
    : typeof body.skills === 'string'
      ? body.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

  try {
    await connectDB();

    const updated = await EventModel.findByIdAndUpdate(
      params.id,
      { ...body, skills },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json({ event: updated });
  } catch {
    const updated = updateRuntimeEvent(params.id, { ...body, skills });
    if (!updated) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json({ event: updated, source: 'runtime-fallback' });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const deleted = await EventModel.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    // Also delete registrations for this event
    await RegistrationModel.deleteMany({ eventId: params.id });
    return NextResponse.json({ success: true });
  } catch {
    const deleted = deleteRuntimeEvent(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, source: 'runtime-fallback' });
  }
}
