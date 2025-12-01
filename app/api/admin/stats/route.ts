import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Vérifier que l'utilisateur est admin
    const session = await auth();
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const [totalOpticians, pendingOpticians, totalProducts, totalSuppliers, totalArticles] = await Promise.all([
      prisma.optician.count(),
      prisma.optician.count({ where: { status: 'PENDING' } }),
      prisma.product.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      // Calculate total articles (sum of quantities in all order items)
      prisma.orderItem.aggregate({
        _sum: {
          quantity: true,
        },
      }),
    ]);

    return NextResponse.json({
      totalOpticians,
      pendingOpticians,
      totalProducts,
      totalSuppliers,
      totalArticles: totalArticles._sum.quantity || 0,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
