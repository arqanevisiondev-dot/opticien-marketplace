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
      if (orderItem.product.stockQty < orderItem.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant. Disponible: ${orderItem.product.stockQty}, Demandé: ${orderItem.quantity}` },
          { status: 400 }
        );
      }

      // Update order item status and decrease stock
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
            stockQty: {
              decrement: orderItem.quantity,
            },
          },
        }),
      ]);

      return NextResponse.json({ success: true, action: 'confirmed' });
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
