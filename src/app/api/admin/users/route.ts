import { NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mock-data';

export async function GET() {
  try {
    const users = mockUsers.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
  }
}
