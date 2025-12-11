import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { points } = await request.json();

    if (typeof points !== 'number') {
      return NextResponse.json(
        { error: 'Points must be a number' },
        { status: 400 }
      );
    }

    // Get current optician to check points won't go negative
    const currentOptician = await prisma.optician.findUnique({
      where: { id },
      select: { loyaltyPoints: true },
    });

    if (!currentOptician) {
      return NextResponse.json(
        { error: 'Opticien introuvable' },
        { status: 404 }
      );
    }

    const newPoints = currentOptician.loyaltyPoints + points;

    if (newPoints < 0) {
      return NextResponse.json(
        { error: 'Les points ne peuvent pas être négatifs' },
        { status: 400 }
      );
    }

    const optician = await prisma.optician.update({
      where: { id },
      data: {
        loyaltyPoints: {
          increment: points,
        },
      },
    });

    return NextResponse.json({
      id: optician.id,
      loyaltyPoints: optician.loyaltyPoints,
    });
  } catch (error) {
    console.error('Error updating loyalty points:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des points' },
      { status: 500 }
    );
  }
}
