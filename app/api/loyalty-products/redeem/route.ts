import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Only opticians can redeem loyalty products
    if (session.user.role !== 'OPTICIAN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { items, totalPoints } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Articles requis' },
        { status: 400 }
      );
    }

    // Get the user and their optician record
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { optician: true },
    });

    if (!user?.optician) {
      return NextResponse.json(
        { error: 'Compte opticien introuvable' },
        { status: 404 }
      );
    }

    // Check if optician has enough points
    if (user.optician.loyaltyPoints < totalPoints) {
      return NextResponse.json(
        { error: 'Points insuffisants pour cet échange' },
        { status: 400 }
      );
    }

    // Validate all products
    const productIds = items.map((item: any) => item.productId);
    const loyaltyProducts = await prisma.loyaltyProduct.findMany({
      where: { id: { in: productIds } },
      include: {
        product: {
          select: {
            id: true,
            inStock: true,
          },
        },
      },
    });

    if (loyaltyProducts.length !== items.length) {
      return NextResponse.json(
        { error: 'Certains produits sont introuvables' },
        { status: 404 }
      );
    }

    // Check stock and validate points
    for (const item of items) {
      const loyaltyProduct = loyaltyProducts.find(p => p.id === item.productId);
      if (!loyaltyProduct) continue;

      if (!loyaltyProduct.isActive) {
        return NextResponse.json(
          { error: `Le produit ${loyaltyProduct.name} n'est plus disponible` },
          { status: 400 }
        );
      }

      const isInStock = loyaltyProduct.productId && loyaltyProduct.product 
        ? loyaltyProduct.product.inStock 
        : true;

      if (!isInStock) {
        return NextResponse.json(
          { error: `Stock insuffisant pour ${loyaltyProduct.name}` },
          { status: 400 }
        );
      }
    }

    // Create pending redemption order
    const redemption = await prisma.loyaltyRedemption.create({
      data: {
        opticianId: user.optician.id,
        totalPoints,
        status: 'PENDING',
        items: {
          create: items.map((item: any) => {
            const product = loyaltyProducts.find(p => p.id === item.productId)!;
            return {
              loyaltyProductId: item.productId,
              productName: product.name,
              quantity: item.quantity,
              pointsCost: product.pointsCost,
              totalPoints: product.pointsCost * item.quantity,
              imageUrl: product.imageUrl,
            };
          }),
        },
      },
      include: {
        items: {
          include: {
            loyaltyProduct: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      redemptionId: redemption.id,
      message: 'Votre commande de fidélité a été envoyée et est en attente d\'approbation par l\'admin.',
    });
  } catch (error) {
    console.error('Error creating loyalty redemption:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la commande' },
      { status: 500 }
    );
  }
}
