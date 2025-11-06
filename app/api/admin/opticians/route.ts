import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const opticians = await prisma.optician.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedOpticians = opticians.map((optician) => ({
      id: optician.id,
      businessName: optician.businessName,
      firstName: optician.firstName,
      lastName: optician.lastName,
      phone: optician.phone,
      email: optician.user.email,
      status: optician.status,
      createdAt: optician.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedOpticians);
  } catch (error) {
    console.error('Error fetching opticians:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des opticiens' },
      { status: 500 }
    );
  }
}
