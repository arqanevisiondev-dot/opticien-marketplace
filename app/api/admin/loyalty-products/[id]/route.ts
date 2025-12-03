import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - Get single loyalty product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const loyaltyProduct = await prisma.loyaltyProduct.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            reference: true,
          },
        },
      },
    });

    if (!loyaltyProduct) {
      return NextResponse.json(
        { error: 'Loyalty product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(loyaltyProduct);
  } catch (error) {
    console.error('Error fetching loyalty product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty product' },
      { status: 500 }
    );
  }
}

// PUT - Update loyalty product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, imageUrl, pointsCost, isActive } = body;

    const loyaltyProduct = await prisma.loyaltyProduct.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(pointsCost && { pointsCost: parseInt(pointsCost) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(loyaltyProduct);
  } catch (error) {
    console.error('Error updating loyalty product:', error);
    return NextResponse.json(
      { error: 'Failed to update loyalty product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete loyalty product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.loyaltyProduct.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Loyalty product deleted' });
  } catch (error) {
    console.error('Error deleting loyalty product:', error);
    return NextResponse.json(
      { error: 'Failed to delete loyalty product' },
      { status: 500 }
    );
  }
}
