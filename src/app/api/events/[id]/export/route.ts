import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { EventModel } from '@/lib/event-model';
import { RegistrationModel } from '@/lib/registration-model';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const event = await EventModel.findById(params.id).lean();
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const registrations = await RegistrationModel.find({ eventId: params.id }).sort({ registeredAt: 1 }).lean();

    const rows = [
      ['#', 'Name', 'Email', 'Roll Number', 'Registered At', 'Status'],
      ...registrations.map((r, i) => [
        String(i + 1),
        r.userName || '',
        r.userEmail || '',
        r.rollNumber || r.userId,
        new Date(r.registeredAt).toLocaleString('en-IN'),
        r.attended ? 'Attended' : 'Registered',
      ]),
    ];

    const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${event.title.replace(/[^a-z0-9]/gi, '_')}_registrations.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
