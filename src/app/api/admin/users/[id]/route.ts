import { NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mock-data';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const index = mockUsers.findIndex(u => u._id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Don't delete admin user
    if (mockUsers[index].role === 'admin' && mockUsers[index]._id === 'admin-1') {
      return NextResponse.json({ error: 'Cannot delete admin user' }, { status: 400 });
    }

    mockUsers.splice(index, 1);
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
