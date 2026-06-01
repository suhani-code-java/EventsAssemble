import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { EventModel, seedEventsIfEmpty } from '@/lib/event-model';
import { RegistrationModel, seedRegistrationsIfEmpty } from '@/lib/registration-model';
import { listRuntimeEvents, listRuntimeRegistrations } from '@/lib/runtime-store';

export async function GET() {
  try {
    await connectDB();
    await seedEventsIfEmpty();
    await seedRegistrationsIfEmpty();

    // Execute all queries in parallel for faster performance
    const [totalRegistrations, totalEvents, events, recentRegs] = await Promise.all([
      RegistrationModel.countDocuments(),
      EventModel.countDocuments(),
      EventModel.find({}).sort({ date: 1 }).select('_id title date status').lean(),
      RegistrationModel.find({}).sort({ registeredAt: -1 }).limit(6).select('eventId userName registeredAt').lean(),
    ]);

    const now = new Date();
    const activeEvents = events.filter(e => e.status === 'upcoming').length;

    // Get only next 5 upcoming events
    const upcomingEvents = events
      .filter(e => new Date(e.date) >= now)
      .slice(0, 5)
      .map(e => EventModel.findById(e._id));

    const upcomingEventsData = await Promise.all(upcomingEvents);

    // Get recent registrations info
    const recentActivity = recentRegs.map((r) => {
      const event = events.find(e => e._id === r.eventId);
      return {
        name: r.userName || 'Student',
        event: event?.title || 'Unknown Event',
        registeredAt: r.registeredAt,
      };
    });

    // Optimized 14-day registration trend
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);

    const trendRegs = await RegistrationModel.find({
      registeredAt: { $gte: fourteenDaysAgo.toISOString() },
    }).select('registeredAt').lean();

    const trendMap: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trendMap[key] = 0;
    }

    for (const reg of trendRegs) {
      const key = new Date(reg.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (key in trendMap) trendMap[key]++;
    }

    const registrationTrend = Object.entries(trendMap).map(([date, registrations]) => ({ date, registrations }));

    return NextResponse.json({
      totalRegistrations,
      totalEvents,
      activeEvents,
      upcomingEvents: upcomingEventsData.filter(Boolean),
      recentActivity,
      registrationTrend,
    }, {
      headers: {
        'Cache-Control': 'private, max-age=60', // Cache for 60 seconds
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);

    const events = listRuntimeEvents();
    const regs = listRuntimeRegistrations();
    const now = new Date();

    const totalRegistrations = regs.length;
    const totalEvents = events.length;
    const activeEvents = events.filter(e => e.status === 'upcoming').length;

    const upcomingEvents = events
      .filter(e => new Date(e.date) >= now)
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
      .slice(0, 5);

    const recentActivity = regs
      .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))
      .slice(0, 6)
      .map((r) => {
        const event = events.find(e => e._id === r.eventId);
        return {
          name: r.userName || 'Student',
          event: event?.title || 'Unknown Event',
          registeredAt: r.registeredAt,
        };
      });

    const trendMap: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trendMap[key] = 0;
    }
    for (const reg of regs) {
      const key = new Date(reg.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (key in trendMap) trendMap[key]++;
    }
    const registrationTrend = Object.entries(trendMap).map(([date, registrations]) => ({ date, registrations }));

    return NextResponse.json({
      totalRegistrations,
      totalEvents,
      activeEvents,
      upcomingEvents,
      recentActivity,
      registrationTrend,
      source: 'runtime-fallback',
    });
  }
}
