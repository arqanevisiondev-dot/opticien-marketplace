import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    
    const slides = await prisma.slide.findMany({
      where: {
        isActive: true,
        OR: [
          {
            AND: [
              { startDate: { lte: now } },
              { endDate: { gte: now } },
            ],
          },
          {
            AND: [
              { startDate: null },
              { endDate: null },
            ],
          },
        ],
      },
      orderBy: {
        order: 'asc',
      },
    });

    // Filter out slides without imageUrl
    const validSlides = slides.filter(slide => slide.imageUrl);

    return NextResponse.json(validSlides, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching slides:', error);
    return NextResponse.json({ error: 'Failed to fetch slides' }, { status: 500 });
  }
}
