import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { EventModel } from '@/lib/event-model';
import { RegistrationModel } from '@/lib/registration-model';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;

    const event = await EventModel.findById(id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Delete the event and all associated registrations
    await Promise.all([
      EventModel.deleteOne({ _id: id }),
      RegistrationModel.deleteMany({ eventId: id }),
    ]);

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
