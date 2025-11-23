import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ORDER_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;

const ORDER_SOURCE = {
  WHATSAPP: 'WHATSAPP',
  MANUAL: 'MANUAL',
} as const;

interface OrderItemPayload {
  productId: string;
  quantity: number;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const mode = request.nextUrl.searchParams.get('mode');

    if (mode === 'form') {
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
    }

    const takeParam = request.nextUrl.searchParams.get('take');
    const take = takeParam ? Math.min(Math.max(Number(takeParam), 1), 200) : 200;

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        optician: {
          select: {
            id: true,
            businessName: true,
            city: true,
          },
        },
        items: {
          select: {
            quantity: true,
          },
        },
      },
    });

    type OrderRecord = (typeof orders)[number];
    type FormattedOrder = {
      id: string;
      status: string;
      source: string;
      totalAmount: number;
      currency: string;
      createdAt: Date;
      validatedAt: Date | null;
      optician: { id: string; name: string; city: string | null };
      itemCount: number;
    };

    const formatted: FormattedOrder[] = orders.map((order: OrderRecord) => {
      const itemCount = order.items.reduce(
        (sum: number, item: OrderRecord['items'][number]) => sum + item.quantity,
        0
      );
      return {
        id: order.id,
        status: order.status,
        source: order.source,
        totalAmount: order.totalAmount,
        currency: order.currency,
        createdAt: order.createdAt,
        validatedAt: order.validatedAt,
        optician: {
          id: order.opticianId,
          name: order.optician?.businessName ?? '—',
          city: order.optician?.city ?? null,
        },
        itemCount,
      };
    });

    type Summary = {
      totalOrders: number;
      pending: number;
      approved: number;
      cancelled: number;
      totalValue: number;
    };

    const summary = formatted.reduce<Summary>(
      (acc, order) => {
        acc.totalOrders += 1;
        acc.totalValue += order.totalAmount;
        if (order.status === ORDER_STATUS.PENDING) {
          acc.pending += 1;
        }
        if (order.status === ORDER_STATUS.APPROVED) {
          acc.approved += 1;
        }
        if (order.status === ORDER_STATUS.CANCELLED) {
          acc.cancelled += 1;
        }
        return acc;
      },
      { totalOrders: 0, pending: 0, approved: 0, cancelled: 0, totalValue: 0 }
    );

    return NextResponse.json({ orders: formatted, summary });
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

    const sanitizedItems: OrderItemPayload[] = items.map((item): OrderItemPayload => ({
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

    type ProductRecord = (typeof products)[number];
    const productMap = new Map<string, ProductRecord>(
      products.map((product: ProductRecord) => [product.id, product])
    );

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdOrder = await tx.order.create({
        data: {
          opticianId,
          status: ORDER_STATUS.APPROVED,
          source: ORDER_SOURCE.MANUAL,
          totalAmount: 0,
          currency: 'EUR',
          validatedAt: new Date(),
          whatsappFrom: null,
          whatsappMessageId: null,
        },
      });

      let runningTotal = 0;

      for (const item of sanitizedItems) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new Error('Produit introuvable ou incompatible.');
        }
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
        data: { totalAmount: runningTotal, whatsappMessageId: note ? note.slice(0, 190) : null },
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
