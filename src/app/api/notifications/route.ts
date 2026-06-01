import { NextResponse } from 'next/server';
import { mockNotifications } from '@/lib/mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const notifications = mockNotifications
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ notifications });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, title, message, type } = body;

    const notification = {
      _id: `n${Date.now()}`,
      userId,
      title,
      message,
      type: type || 'system',
      read: false,
      createdAt: new Date().toISOString(),
    };

    mockNotifications.push(notification);
    return NextResponse.json({ notification }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
