import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    // Get recent optician registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentRegistrations = await prisma.optician.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        user: {
          select: {
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Limit to 10 most recent
    });

    return NextResponse.json({
      recentRegistrations: recentRegistrations.map(optician => ({
        id: optician.id,
        businessName: optician.businessName,
        firstName: optician.firstName,
        lastName: optician.lastName,
        email: optician.user.email,
        phone: optician.phone,
        city: optician.city,
        status: optician.status,
        createdAt: optician.createdAt,
      })),
      count: recentRegistrations.length,
    });
  } catch (error) {
    console.error('Error fetching recent registrations:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des inscriptions récentes' },
      { status: 500 }
    );
  }
}
