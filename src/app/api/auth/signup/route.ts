import { NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mock-data';
import { addRuntimeUser } from '@/lib/runtime-store';
import { signToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { UserModel } from '@/lib/user-model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, rollNumber } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    let storedUser = newUser;
    try {
      await connectDB();
      const exists = await UserModel.findOne({ email });
      if (exists) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
      }
      storedUser = (await UserModel.create(newUser)).toObject();
    } catch {
      const exists = mockUsers.find(u => u.email === email);
      if (exists) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
      }
      addRuntimeUser(newUser as any);
    }

    const token = signToken({ userId: storedUser._id, email: storedUser.email, role: storedUser.role });

    const response = NextResponse.json({ user: {
      _id: storedUser._id,
      name: storedUser.name,
      email: storedUser.email,
      role: storedUser.role,
      skills: storedUser.skills,
      interests: storedUser.interests,
      points: storedUser.points,
      badges: storedUser.badges,
      rollNumber: storedUser.rollNumber,
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
