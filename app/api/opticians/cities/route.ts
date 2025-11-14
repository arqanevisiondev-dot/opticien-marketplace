import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all unique cities from approved opticians
    const opticians = await prisma.optician.findMany({
      where: {
        status: 'APPROVED',
        city: {
          not: null,
        },
      },
      select: {
        city: true,
      },
      distinct: ['city'],
      orderBy: {
        city: 'asc',
      },
    });

    // Extract and filter out null values
    const cities = opticians
      .map((o: { city: string | null }) => o.city)
      .filter((city): city is string => city !== null)
      .sort();

    return NextResponse.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { error: 'Error fetching cities' },
      { status: 500 }
    );
  }
}
