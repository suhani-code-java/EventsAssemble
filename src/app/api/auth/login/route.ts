import { NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const { findRuntimeUserByEmail } = await import('@/lib/runtime-store');
    const mod = await import('@/lib/mock-data');
    const mockUsers = (mod && (mod as any).mockUsers) || [];

    const runtimeUser = findRuntimeUserByEmail(email);
    const user = (runtimeUser && runtimeUser.password === password)
      ? runtimeUser
      : mockUsers.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ userId: user._id, email: user.email, role: user.role });

    const response = NextResponse.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        interests: user.interests,
        points: user.points,
        badges: user.badges,
        rollNumber: user.rollNumber,
      },
      token,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    try { console.error('Auth login error:', msg); } catch (err) { /* ignore */ }
    return NextResponse.json({ error: msg || 'Internal server error' }, { status: 500 });
  }
}
