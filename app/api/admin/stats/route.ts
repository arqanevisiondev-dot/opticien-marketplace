import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [totalOpticians, pendingOpticians, totalProducts, totalSuppliers] = await Promise.all([
      prisma.optician.count(),
      prisma.optician.count({ where: { status: 'PENDING' } }),
      prisma.product.count(),
      prisma.supplier.count(),
    ]);

    return NextResponse.json({
      totalOpticians,
      pendingOpticians,
      totalProducts,
      totalSuppliers,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
