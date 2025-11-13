import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier que l'utilisateur est admin
    const session = await auth();
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      );
    }

    const optician = await prisma.optician.update({
      where: { id },
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
