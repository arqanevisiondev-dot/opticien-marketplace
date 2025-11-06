import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const opticians = await prisma.optician.findMany({
      where: {
        status: 'APPROVED',
      },
      select: {
        id: true,
        businessName: true,
        firstName: true,
        lastName: true,
        phone: true,
        whatsapp: true,
        address: true,
        city: true,
        postalCode: true,
        latitude: true,
        longitude: true,
      },
      orderBy: {
        businessName: 'asc',
      },
    });

    return NextResponse.json(opticians);
  } catch (error) {
    console.error('Error fetching opticians:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des opticiens' },
      { status: 500 }
    );
  }
}
