import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      include: {
        supplier: {
          select: {
            name: true,
            phone: true,
            whatsapp: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Parse images JSON string to array
    const productsWithImages = products.map((product) => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
    }));

    return NextResponse.json(productsWithImages);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    );
  }
}
