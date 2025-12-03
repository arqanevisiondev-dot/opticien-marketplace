import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - Get current optician's loyalty points
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const optician = await prisma.optician.findUnique({
      where: { userId: session.user.id },
      select: { loyaltyPoints: true },
    });

    if (!optician) {
      return NextResponse.json({ error: 'Optician not found' }, { status: 404 });
    }

    return NextResponse.json({ loyaltyPoints: optician.loyaltyPoints });
  } catch (error) {
    console.error('Error fetching loyalty points:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty points' },
      { status: 500 }
    );
  }
}
