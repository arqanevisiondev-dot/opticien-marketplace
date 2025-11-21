import { NextRequest, NextResponse } from 'next/server';
import { OrderSource, OrderStatus } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface OrderItemPayload {
  productId: string;
  quantity: number;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const [opticians, products] = await Promise.all([
      prisma.optician.findMany({
        where: { status: 'APPROVED' },
        select: { id: true, businessName: true },
        orderBy: { businessName: 'asc' },
      }),
      prisma.product.findMany({
        select: {
          id: true,
          name: true,
          reference: true,
          stockQty: true,
          price: true,
          salePrice: true,
          inStock: true,
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    return NextResponse.json({ opticians, products });
  } catch (error) {
    console.error('Error loading order form data:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des données de commande.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { opticianId, items, note } = body as {
      opticianId?: string;
      items?: OrderItemPayload[];
      note?: string;
    };

    if (!opticianId) {
      return NextResponse.json({ error: 'Opticien requis' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Ajoutez au moins un produit.' }, { status: 400 });
    }

    const sanitizedItems = items.map((item) => ({
      productId: String(item.productId || '').trim(),
      quantity: Number(item.quantity),
    }));

    if (sanitizedItems.some((item) => !item.productId || !Number.isFinite(item.quantity) || item.quantity <= 0)) {
      return NextResponse.json({ error: 'Chaque produit doit avoir une quantité valide.' }, { status: 400 });
    }

    const optician = await prisma.optician.findUnique({ where: { id: opticianId } });
    if (!optician || optician.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Opticien introuvable ou non approuvé.' }, { status: 400 });
    }

    const productIds = [...new Set(sanitizedItems.map((item) => item.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'Certains produits sont introuvables.' }, { status: 400 });
    }

    const productMap = new Map(products.map((product) => [product.id, product]));

    const result = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          opticianId,
          status: OrderStatus.APPROVED,
          source: OrderSource.MANUAL,
          totalAmount: 0,
          currency: 'EUR',
          validatedAt: new Date(),
          whatsappFrom: null,
          whatsappMessageId: note ? note.slice(0, 190) : null,
        },
      });

      let runningTotal = 0;

      for (const item of sanitizedItems) {
        const product = productMap.get(item.productId)!;
        if (product.stockQty < item.quantity) {
          throw new Error(`Stock insuffisant pour ${product.reference} (${product.name}).`);
        }

        const unitPrice = product.salePrice ?? product.price;
        const lineTotal = unitPrice * item.quantity;
        runningTotal += lineTotal;

        const newStock = product.stockQty - item.quantity;
        await tx.product.update({
          where: { id: product.id },
          data: {
            stockQty: newStock,
            inStock: newStock > 0,
          },
        });

        await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            productId: product.id,
            productName: product.name,
            productReference: product.reference,
            quantity: item.quantity,
            unitPrice,
            salePrice: product.salePrice,
            remisePct: product.firstOrderRemisePct,
            totalLine: lineTotal,
          },
        });
      }

      await tx.order.update({
        where: { id: createdOrder.id },
        data: { totalAmount: runningTotal },
      });

      return createdOrder.id;
    });

    return NextResponse.json({ id: result }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    const message =
      error instanceof Error && error.message ? error.message : 'Erreur lors de la création de la commande.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
