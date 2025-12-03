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

    if (!itemId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the order item with product info
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: itemId },
      include: {
        product: true,
        order: {
          include: {
            optician: true,
          },
        },
      },
    });

    if (!orderItem) {
      return NextResponse.json({ error: 'Order item not found' }, { status: 404 });
    }

    if (orderItem.status !== 'PENDING') {
      return NextResponse.json({ error: 'Order item already processed' }, { status: 400 });
    }

    if (action === 'confirm') {
      // Check stock availability
      if (!orderItem.product.inStock) {
        return NextResponse.json(
          { error: `Produit non disponible en stock` },
          { status: 400 }
        );
      }

      // Calculate loyalty points to award
      const pointsToAward = (orderItem.product.loyaltyPointsReward || 0) * orderItem.quantity;

      // Update order item status, decrease stock, award loyalty points, and update order status
      await prisma.$transaction([
        prisma.orderItem.update({
          where: { id: itemId },
          data: {
            status: 'CONFIRMED',
            confirmedAt: new Date(),
            confirmedBy: session.user.email!,
          },
        }),
        prisma.product.update({
          where: { id: orderItem.productId },
          data: {
          },
        }),
        // Update parent order status to APPROVED
        prisma.order.update({
          where: { id: orderItem.orderId },
          data: {
            status: 'APPROVED',
            validatedAt: new Date(),
          },
        }),
        // Award loyalty points to optician if product has points reward
        ...(pointsToAward > 0 ? [
          prisma.optician.update({
            where: { id: orderItem.order.opticianId },
            data: {
              loyaltyPoints: {
                increment: pointsToAward,
              },
            },
          })
        ] : []),
      ]);

      return NextResponse.json({ 
        success: true, 
        action: 'confirmed',
        pointsAwarded: pointsToAward 
      });
    } else if (action === 'cancel') {
      await prisma.orderItem.update({
        where: { id: itemId },
        data: {
          status: 'CANCELLED',
          confirmedAt: new Date(),
          confirmedBy: session.user.email!,
        },
      });

      return NextResponse.json({ success: true, action: 'cancelled' });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error confirming order item:', error);
    return NextResponse.json(
      { error: 'Failed to confirm order item' },
      { status: 500 }
    );
  }
}
