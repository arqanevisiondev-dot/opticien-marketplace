import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid product IDs' }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        name: true,
        reference: true,
        price: true,
        salePrice: true,
        firstOrderRemisePct: true,
        images: true,
        inStock: true,
      },
    });

    // Parse images
    const formattedProducts = products.map(p => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching bulk products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
