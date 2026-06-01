import { NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mock-data';
import { addRuntimeUser } from '@/lib/runtime-store';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, rollNumber } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const exists = mockUsers.find(u => u.email === email);
    if (exists) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const newUser = {
      _id: `u_${Date.now()}`,
      name,
      email,
      role: role === 'organizer' ? 'organizer' : 'student',
      password,
      skills: [],
      interests: [],
      points: 0,
      badges: ['Early Adopter'],
      rollNumber: role === 'student' ? (rollNumber || `RTU${Date.now().toString().slice(-6)}`) : undefined,
    } as any;

    // store in runtime store so routes can find the user across requests
    try {
      addRuntimeUser(newUser as any);
    } catch {
      // fallback to pushing into mockUsers for older runtimes
      mockUsers.push(newUser as any);
    }

    const token = signToken({ userId: newUser._id, email: newUser.email, role: newUser.role });

    const response = NextResponse.json({ user: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      skills: newUser.skills,
      interests: newUser.interests,
      points: newUser.points,
      badges: newUser.badges,
      rollNumber: newUser.rollNumber,
    }, token }, { status: 201 });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
