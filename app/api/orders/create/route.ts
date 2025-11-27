import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface OrderItem {
  productId: string;
  productName: string;
  productReference: string;
  quantity: number;
  unitPrice: number;
  salePrice: number;
  remisePct: number;
  totalLine: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'OPTICIAN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, totalAmount }: { items: OrderItem[]; totalAmount: number } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    // Get optician data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { optician: true },
    });

    if (!user || !user.optician) {
      return NextResponse.json({ error: 'Optician not found' }, { status: 404 });
    }

    // Get admin user for WhatsApp
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { whatsapp: true },
    });

    // Create order
    const order = await prisma.order.create({
      data: {
        opticianId: user.optician.id,
        totalAmount,
        status: 'PENDING',
        source: 'MANUAL',
        items: {
          create: items.map((item) => ({
            product: {
              connect: { id: item.productId },
            },
            productName: item.productName,
            productReference: item.productReference,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            salePrice: item.salePrice,
            remisePct: item.remisePct,
            totalLine: item.totalLine,
            status: 'PENDING',
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        optician: {
          include: {
            user: true,
          },
        },
      },
    });

    // Prepare WhatsApp message
    let whatsappUrl = null;
    if (admin?.whatsapp) {
      const message = `🛒 *Nouvelle Commande*\n\n` +
        `👤 Client: ${user.optician.businessName}\n` +
        `📧 Email: ${user.email}\n` +
        `📱 Téléphone: ${user.optician.phone || 'N/A'}\n\n` +
        `📦 *Produits:*\n` +
        order.items.map((item, index) => 
          `${index + 1}. ${item.productName}\n` +
          `   Réf: ${item.productReference}\n` +
          `   Qté: ${item.quantity}\n` +
          `   Prix: ${item.totalLine.toFixed(2)} DH`
        ).join('\n\n') +
        `\n\n💰 *Total: ${totalAmount.toFixed(2)} DH*\n\n` +
        `🆔 Commande #${order.id.slice(0, 8)}`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappPhone = admin.whatsapp.replace(/\D/g, '');
      whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`;
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      whatsappUrl,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
