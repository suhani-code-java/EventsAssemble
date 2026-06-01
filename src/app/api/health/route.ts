import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ 
      status: 'ok', 
      message: 'MongoDB connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'MongoDB connection failed. Make sure MongoDB is running on localhost:27017',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
