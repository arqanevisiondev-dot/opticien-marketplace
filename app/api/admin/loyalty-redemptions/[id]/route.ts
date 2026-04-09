import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { id } = await params;

    const redemption = await prisma.loyaltyRedemption.findUnique({ where: { id } });
    if (!redemption) {
      return NextResponse.json({ error: 'Échange introuvable' }, { status: 404 });
    }

    // LoyaltyRedemptionItems are cascade-deleted by Prisma schema (onDelete: Cascade)
    await prisma.loyaltyRedemption.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting loyalty redemption:', error);
    return NextResponse.json({ error: "Erreur lors de la suppression de l'échange" }, { status: 500 });
  }
}
