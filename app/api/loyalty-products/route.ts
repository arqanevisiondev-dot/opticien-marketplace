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

    // Filter out products with no stock (only relevant if linked to a Product)
    const availableProducts = loyaltyProducts.filter(lp => 
      !lp.productId || (lp.product && lp.product.inStock)
    );

    return NextResponse.json(availableProducts);
  } catch (error) {
    console.error('Error fetching loyalty products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty products' },
      { status: 500 }
    );
  }
}
