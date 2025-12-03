import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch pending loyalty redemptions with items
    const redemptions = await prisma.loyaltyRedemption.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        optician: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        items: {
          include: {
            loyaltyProduct: {
              select: {
                isActive: true,
                product: {
                  select: {
                    inStock: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(redemptions);
  } catch (error) {
    console.error('Error fetching pending loyalty redemptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending redemptions' },
      { status: 500 }
    );
  }
}
