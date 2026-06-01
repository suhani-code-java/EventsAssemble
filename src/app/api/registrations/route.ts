import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RegistrationModel, seedRegistrationsIfEmpty } from '@/lib/registration-model';
import { listRuntimeRegistrations } from '@/lib/runtime-store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const eventId = searchParams.get('eventId');

  const filter: { userId?: string; eventId?: string } = {};
  if (userId) filter.userId = userId;
  if (eventId) filter.eventId = eventId;

  try {
    await connectDB();
    await seedRegistrationsIfEmpty();

    const registrations = await RegistrationModel.find(filter).sort({ registeredAt: -1 }).lean();
    return NextResponse.json({ registrations });
  } catch {
    const registrations = listRuntimeRegistrations(filter).sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
    return NextResponse.json({ registrations, source: 'runtime-fallback' });
  }
}