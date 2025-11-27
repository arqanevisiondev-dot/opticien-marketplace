import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Essayer de trouver par slug d'abord, sinon par ID
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: id },
          { id: id }
        ]
      },
      include: {
        user: {
          select: {
            businessName: true,
            phone: true,
            whatsapp: true,
            address: true,
            city: true,
            postalCode: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Parse images JSON
    let images: string[] = [];
    try {
      images = Array.isArray((product as unknown as { images: unknown }).images)
        ? ((product as unknown as { images: string[] }).images)
        : JSON.parse(product.images || '[]');
    } catch {
      images = [];
    }
    const formattedProduct = {
      ...product,
      images,
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du produit' },
      { status: 500 }
    );
  }
}
