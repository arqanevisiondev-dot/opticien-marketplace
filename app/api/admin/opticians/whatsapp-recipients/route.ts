import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const opticians = await prisma.optician.findMany({
      where: {
        AND: [
          { whatsapp: { not: null } },
          { whatsapp: { not: '' } },
        ],
      },
      select: {
        id: true,
        businessName: true,
        firstName: true,
        lastName: true,
        whatsapp: true,
        status: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(opticians);
  } catch (error) {
    console.error('Error fetching WhatsApp recipients:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des destinataires WhatsApp" },
      { status: 500 }
    );
  }
}
