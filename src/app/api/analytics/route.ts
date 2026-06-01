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

    // Real counts from DB
    const totalRegistrations = await RegistrationModel.countDocuments();
    const totalEvents = await EventModel.countDocuments();
    const attendedCount = await RegistrationModel.countDocuments({ attended: true });
    const attendanceRate = totalRegistrations > 0
      ? Math.round((attendedCount / totalRegistrations) * 100)
      : 0;

    // Registration trend: last 14 days bucketed by day
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const recentRegs = await RegistrationModel.find({
      registeredAt: { $gte: fourteenDaysAgo.toISOString() },
    }).lean();

    // Build a date-bucketed trend
    const trendMap: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trendMap[key] = 0;
    }
    for (const reg of recentRegs) {
      const key = new Date(reg.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (key in trendMap) trendMap[key]++;
    }
    const registrationTrend = Object.entries(trendMap).map(([date, registrations]) => ({ date, registrations }));

    // Category distribution from actual events + registrations
    const events = await EventModel.find({}).lean();
    const registrations = await RegistrationModel.find({}).lean();

    const categoryCount: Record<string, number> = {};
    for (const reg of registrations) {
      const event = events.find(e => e._id === reg.eventId);
      if (event) {
        categoryCount[event.category] = (categoryCount[event.category] || 0) + 1;
      }
    }

    const total = Object.values(categoryCount).reduce((a, b) => a + b, 0) || 1;
    const categoryDistribution = Object.entries(categoryCount).map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100),
      count,
    }));

    // Event performance
    const eventPerformance = events.map(e => ({
      name: e.title.split(' ').slice(0, 2).join(' '),
      registered: e.registeredCount,
      capacity: e.capacity,
    }));

    return NextResponse.json({
      stats: {
        totalRegistrations,
        totalEvents,
        attendanceRate,
        activeUsers: totalRegistrations, // unique registrants as proxy
      },
      registrationTrend,
      categoryDistribution,
      eventPerformance,
    });
  } catch (err) {
    console.error('Analytics error:', err);

    const events = listRuntimeEvents();
    const registrations = listRuntimeRegistrations();

    const totalRegistrations = registrations.length;
    const totalEvents = events.length;
    const attendedCount = registrations.filter(r => r.attended).length;
    const attendanceRate = totalRegistrations > 0
      ? Math.round((attendedCount / totalRegistrations) * 100)
      : 0;

    const trendMap: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trendMap[key] = 0;
    }
    for (const reg of registrations) {
      const key = new Date(reg.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (key in trendMap) trendMap[key]++;
    }
    const registrationTrend = Object.entries(trendMap).map(([date, registrationsCount]) => ({ date, registrations: registrationsCount }));

    const categoryCount: Record<string, number> = {};
    for (const reg of registrations) {
      const event = events.find(e => e._id === reg.eventId);
      if (event) {
        categoryCount[event.category] = (categoryCount[event.category] || 0) + 1;
      }
    }
    const total = Object.values(categoryCount).reduce((a, b) => a + b, 0) || 1;
    const categoryDistribution = Object.entries(categoryCount).map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100),
      count,
    }));

    const eventPerformance = events.map(e => ({
      name: e.title.split(' ').slice(0, 2).join(' '),
      registered: e.registeredCount,
      capacity: e.capacity,
    }));

    return NextResponse.json({
      stats: {
        totalRegistrations,
        totalEvents,
        attendanceRate,
        activeUsers: totalRegistrations,
      },
      registrationTrend,
      categoryDistribution,
      eventPerformance,
      source: 'runtime-fallback',
    });
  }
}
