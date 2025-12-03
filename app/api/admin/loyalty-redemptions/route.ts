import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all loyalty redemptions with summary
    const redemptions = await prisma.loyaltyRedemption.findMany({
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
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate summary statistics
    const summary = {
      totalRedemptions: redemptions.length,
      totalPoints: redemptions.reduce((sum, r) => sum + r.totalPoints, 0),
      pending: redemptions.filter(r => r.status === 'PENDING').length,
      approved: redemptions.filter(r => r.status === 'APPROVED').length,
      rejected: redemptions.filter(r => r.status === 'REJECTED').length,
      totalItems: redemptions.reduce((sum, r) => sum + r.items.length, 0),
    };

    // Format redemptions for display
    const formattedRedemptions = redemptions.map(redemption => ({
      id: redemption.id,
      status: redemption.status,
      totalPoints: redemption.totalPoints,
      createdAt: redemption.createdAt.toISOString(),
      approvedAt: redemption.approvedAt?.toISOString() || null,
      rejectedAt: redemption.rejectedAt?.toISOString() || null,
      optician: {
        id: redemption.opticianId,
        name: redemption.optician.businessName,
        city: redemption.optician.city,
        email: redemption.optician.user.email,
      },
      itemCount: redemption.items.length,
      items: redemption.items.map(item => ({
        id: item.id,
        productName: item.productName,
        quantity: item.quantity,
        pointsCost: item.pointsCost,
        totalPoints: item.totalPoints,
        imageUrl: item.imageUrl,
      })),
    }));

    return NextResponse.json({
      redemptions: formattedRedemptions,
      summary,
    });
  } catch (error) {
    console.error('Error fetching loyalty redemptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty redemptions' },
      { status: 500 }
    );
  }
}
