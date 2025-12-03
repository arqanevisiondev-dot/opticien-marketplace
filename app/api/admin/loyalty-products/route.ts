import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - List all loyalty products
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const loyaltyProducts = await prisma.loyaltyProduct.findMany({
      include: {
        product: {
          select: {
            inStock: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(loyaltyProducts);
  } catch (error) {
    console.error('Error fetching loyalty products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty products' },
      { status: 500 }
    );
  }
}

// POST - Create new loyalty product
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, name, description, imageUrl, pointsCost, isActive } = body;

    if (!name || !pointsCost) {
      return NextResponse.json(
        { error: 'Name and points cost are required' },
        { status: 400 }
      );
    }

    const loyaltyProduct = await prisma.loyaltyProduct.create({
      data: {
        productId: productId || null,
        name,
        description,
        imageUrl,
        pointsCost: parseInt(pointsCost),
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(loyaltyProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating loyalty product:', error);
    return NextResponse.json(
      { error: 'Failed to create loyalty product' },
      { status: 500 }
    );
  }
}
