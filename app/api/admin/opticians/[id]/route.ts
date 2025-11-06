import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      );
    }

    const optician = await prisma.optician.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(optician);
  } catch (error) {
    console.error('Error updating optician:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'opticien' },
      { status: 500 }
    );
  }
}
