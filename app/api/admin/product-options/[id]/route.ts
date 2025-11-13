import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE option
export async function DELETE(
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

    await prisma.productOption.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Option supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting product option:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: `Erreur lors de la suppression de l'option: ${errorMessage}` },
      { status: 500 }
    );
  }
}
