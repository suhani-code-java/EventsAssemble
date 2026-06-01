import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RegistrationModel, seedRegistrationsIfEmpty } from '@/lib/registration-model';
import { addRuntimeNotification, listRuntimeNotifications, listRuntimeRegistrations, updateRuntimeNotification } from '@/lib/runtime-store';
import { type MockNotification } from '@/lib/mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const eventId = searchParams.get('eventId');

  const notifications = listRuntimeNotifications({
    userId: userId || undefined,
    eventId: eventId || undefined,
  })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ notifications });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, eventId, title, message, type, source = 'organizer' } = body;

    const targetUserIds = new Set<string>();
    if (typeof userId === 'string' && userId.trim()) {
      targetUserIds.add(userId.trim());
    } else {
      const normalizedEventId = typeof eventId === 'string' ? eventId.trim() : '';

      try {
        await connectDB();
        await seedRegistrationsIfEmpty();
        const registrations = normalizedEventId
          ? await RegistrationModel.find({ eventId: normalizedEventId }).select('userId').lean()
          : await RegistrationModel.find({}).select('userId').lean();
        registrations.forEach((registration) => {
          if (registration.userId) targetUserIds.add(registration.userId);
        });
      } catch {
        const registrations = normalizedEventId
          ? listRuntimeRegistrations({ eventId: normalizedEventId })
          : listRuntimeRegistrations();

        registrations.forEach((registration) => {
          if (registration.userId) targetUserIds.add(registration.userId);
        });

        if (targetUserIds.size === 0) {
          return NextResponse.json({ error: normalizedEventId ? 'No registered students found for this event' : 'Unable to resolve notification recipients' }, { status: 404 });
        }
      }
    }

    if (targetUserIds.size === 0) {
      return NextResponse.json({ error: 'No registered students found' }, { status: 404 });
    }

    const createdAt = new Date().toISOString();
    const notifications: MockNotification[] = [];
    Array.from(targetUserIds).forEach((targetUserId, index) => {
      const notification = {
        _id: `n${Date.now()}-${index}`,
        userId: targetUserId,
        eventId: typeof eventId === 'string' ? eventId.trim() : undefined,
        title,
        message,
        type: type || 'system',
        read: false,
        createdAt,
        source,
      } satisfies MockNotification;

      addRuntimeNotification(notification);
      notifications.push(notification);
    });

    return NextResponse.json({ notifications, recipientCount: notifications.length }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, notificationId, read = true } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    if (notificationId) {
      const updated = updateRuntimeNotification(notificationId, { read });
      return NextResponse.json({ updated });
    }

    const notifications = listRuntimeNotifications({ userId });
    const updated = notifications.reduce((count, notification) => {
      if (!notification.read) {
        updateRuntimeNotification(notification._id, { read });
        return count + 1;
      }
      return count;
    }, 0);

    return NextResponse.json({ updated, read });
  } catch {
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
