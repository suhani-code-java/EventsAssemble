import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { EventModel, seedEventsIfEmpty } from '@/lib/event-model';
import { RegistrationModel, seedRegistrationsIfEmpty } from '@/lib/registration-model';
import { mockUsers } from '@/lib/mock-data';

export async function GET() {
  try {
    await connectDB();
    await seedEventsIfEmpty();
    await seedRegistrationsIfEmpty();

    const [totalUsers, totalEvents, totalRegistrations] = await Promise.all([
      Promise.resolve(mockUsers.length),
      EventModel.countDocuments(),
      RegistrationModel.countDocuments(),
    ]);

    const usersByRole = [
      { role: 'admin', count: mockUsers.filter(u => u.role === 'admin').length },
      { role: 'organizer', count: mockUsers.filter(u => u.role === 'organizer').length },
      { role: 'student', count: mockUsers.filter(u => u.role === 'student').length },
    ];

    return NextResponse.json({
      totalUsers,
      totalEvents,
      totalRegistrations,
      usersByRole,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
