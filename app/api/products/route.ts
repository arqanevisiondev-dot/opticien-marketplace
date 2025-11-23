import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
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
    type ProductRecord = (typeof products)[number];
    const productsWithImages = products.map((product: ProductRecord) => {
      let images: string[] = [];
      try {
        const raw = (product as unknown as { images: unknown }).images;
        if (Array.isArray(raw)) {
          images = raw as string[];
        } else if (typeof raw === 'string' && raw.length > 0) {
          images = JSON.parse(raw) as string[];
        }
      } catch {
        images = [];
      }
      return { ...product, images };
    });

    return NextResponse.json(productsWithImages);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    );
  }
}

