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
        supplier: {
          select: {
            name: true,
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
    const formattedProduct = {
      ...product,
      images: JSON.parse(product.images),
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
