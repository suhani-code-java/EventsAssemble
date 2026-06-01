import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { EventModel, seedEventsIfEmpty } from '@/lib/event-model';
import { addRuntimeEvent, listRuntimeEvents } from '@/lib/runtime-store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const skill = searchParams.get('skill');

  const applyFilters = <T extends { category: string; title: string; description: string; skills: string[] }>(items: T[]) => {
    let filtered = [...items];

    if (category && category !== 'all') {
      filtered = filtered.filter(e => e.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.skills.some(s => s.toLowerCase().includes(query))
      );
    }

    if (skill) {
      filtered = filtered.filter(e => e.skills.some(s => s.toLowerCase() === skill.toLowerCase()));
    }

    return filtered;
  };

  try {
    await connectDB();
    await seedEventsIfEmpty();

    const events = await EventModel.find({}).sort({ date: 1, time: 1 }).lean();
    return NextResponse.json({ events: applyFilters(events) });
  } catch {
    const events = listRuntimeEvents().sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    return NextResponse.json({ events: applyFilters(events), source: 'runtime-fallback' });
  }
}

export async function POST(request: Request) {
  try {
    console.log('=== Event Creation Request ===');
    let mongoAvailable = true;
    try {
      await connectDB();
    } catch {
      mongoAvailable = false;
    }
    console.log('Connected to DB');

    const body = await request.json();
    console.log('Request body:', body);

    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'date', 'time', 'location', 'capacity', 'organizer', 'organizerName'];
    for (const field of requiredFields) {
      if (!body[field] || (typeof body[field] === 'string' && !body[field].trim())) {
        const errorMsg = `Missing required field: ${field}`;
        console.error('Validation error:', errorMsg);
        return NextResponse.json({ error: errorMsg }, { status: 400 });
      }
    }

    // Validate data types and values
    const capacity = parseInt(body.capacity);
    if (isNaN(capacity) || capacity < 1) {
      const errorMsg = 'Capacity must be a positive number';
      console.error('Validation error:', errorMsg);
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // Parse skills
    const skills = Array.isArray(body.skills)
      ? body.skills
      : typeof body.skills === 'string'
        ? body.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];

    const newEvent = {
      _id: `e${Date.now()}`,
      title: body.title.trim(),
      description: body.description.trim(),
      category: body.category,
      date: body.date,
      time: body.time,
      location: body.location.trim(),
      capacity: capacity,
      registeredCount: 0,
      organizer: body.organizer,
      organizerName: body.organizerName,
      skills: skills,
      status: 'upcoming' as const,
      image: body.image || undefined,
      qna: [],
      reviews: [],
      winners: [],
    };

    if (mongoAvailable) {
      console.log('Creating event:', newEvent);
      const createdEvent = await EventModel.create(newEvent);
      console.log('Event created successfully:', createdEvent._id);
      return NextResponse.json({ event: createdEvent.toObject() }, { status: 201 });
    }

    addRuntimeEvent(newEvent);
    return NextResponse.json({ event: newEvent, source: 'runtime-fallback' }, { status: 201 });
  } catch (error) {
    console.error('=== Event creation error ===', error);
    const message = error instanceof Error ? error.message : 'Failed to create event';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
