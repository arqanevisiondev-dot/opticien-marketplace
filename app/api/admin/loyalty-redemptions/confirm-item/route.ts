import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, action } = await request.json();

    if (!itemId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Get the redemption item
    const item = await prisma.loyaltyRedemptionItem.findUnique({
      where: { id: itemId },
      include: {
        redemption: {
          include: {
            optician: true,
          },
        },
        loyaltyProduct: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (action === 'approve') {
      // Check stock availability
      const isInStock = item.loyaltyProduct.productId && item.loyaltyProduct.product
        ? item.loyaltyProduct.product.inStock
        : true;

      if (!isInStock) {
        return NextResponse.json(
          { error: 'Stock insuffisant pour approuver cet article' },
          { status: 400 }
        );
      }

      // Deduct points from optician
      await prisma.optician.update({
        where: { id: item.redemption.opticianId },
        data: {
          loyaltyPoints: {
            decrement: item.totalPoints,
          },
        },
      });

      // Update redemption status to APPROVED
      await prisma.loyaltyRedemption.update({
        where: { id: item.redemptionId },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: session.user.email!,
        },
      });

      return NextResponse.json({ success: true, message: 'Article approuvé' });
    } else {
      // Reject the entire redemption
      await prisma.loyaltyRedemption.update({
        where: { id: item.redemptionId },
        data: {
          status: 'REJECTED',
          rejectedAt: new Date(),
          rejectedBy: session.user.email!,
          rejectionReason: 'Rejeté par l\'administrateur',
        },
      });

      return NextResponse.json({ success: true, message: 'Commande rejetée' });
    }
  } catch (error) {
    console.error('Error processing redemption item:', error);
    return NextResponse.json(
      { error: 'Failed to process redemption item' },
      { status: 500 }
    );
  }
}
