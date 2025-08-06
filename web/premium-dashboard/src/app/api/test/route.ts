import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'OK', 
    message: 'Dashboard API is working!',
    timestamp: Date.now() 
  });
}