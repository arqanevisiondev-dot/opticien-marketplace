import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - List active loyalty products for opticians
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const loyaltyProducts = await prisma.loyaltyProduct.findMany({
      where: {
        isActive: true,
      },
      include: {
        product: {
          select: {
            inStock: true,
          },
        },
      },
      orderBy: { pointsCost: 'asc' },
    });

    // Transform the data to flatten inStock status
    const transformedProducts = loyaltyProducts.map(lp => ({
      id: lp.id,
      productId: lp.productId,
      name: lp.name,
      description: lp.description,
      imageUrl: lp.imageUrl,
      pointsCost: lp.pointsCost,
      isActive: lp.isActive,
      inStock: lp.productId ? (lp.product?.inStock ?? true) : true, // If linked to product, use its stock, otherwise assume in stock
      createdAt: lp.createdAt,
      updatedAt: lp.updatedAt,
    }));

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching loyalty products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty products' },
      { status: 500 }
    );
  }
}
